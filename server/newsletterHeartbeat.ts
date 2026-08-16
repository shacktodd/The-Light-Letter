import type { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { newsletterEditions, newsletterPublicationRuns, newsletterSchedules } from "../drizzle/schema";
import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { sdk } from "./_core/sdk";
import { publishEdition, publishEditionSchema, type PublishEditionInput } from "./newsletterPublication";

const editionJsonSchema = {
  type: "object",
  properties: {
    slug: { type: "string" },
    title: { type: "string" },
    standfirst: { type: "string" },
    editorNote: { type: "string" },
    issueType: { type: "string", enum: ["regular", "current"] },
    currentRelevance: { type: "string" },
    currentSourceUrls: { type: "array", items: { type: "string" } },
    insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" }, domains: { type: "string" }, tier: { type: "string", enum: ["E", "C", "F", "S"] },
          mainClaim: { type: "string" }, soWhat: { type: "string" }, evidenceNote: { type: "string" }, auditNote: { type: "string" },
          denominatorNote: { type: "string" }, intentNote: { type: "string" }, falsifier: { type: "string" },
          sources: { type: "array", items: { type: "object", properties: { label: { type: "string" }, url: { type: "string" }, sourceType: { type: "string" } }, required: ["label", "url", "sourceType"], additionalProperties: false } },
        },
        required: ["title", "domains", "tier", "mainClaim", "soWhat", "evidenceNote", "auditNote", "denominatorNote", "intentNote", "falsifier", "sources"],
        additionalProperties: false,
      },
    },
  },
  required: ["slug", "title", "standfirst", "issueType", "insights"],
  additionalProperties: false,
} as const;

const VERIFIED_SOURCE_LIBRARY = `
Use only these verified source entries; preserve their URLs exactly and do not invent additional sources.
1. F. A. Hassan, Historical Nile Floods and Their Implications for Climatic Change — https://www.science.org/doi/10.1126/science.212.4499.1142 — historical Nile flood stages, AD 640–1921, and hydroclimate interpretation.
2. Lorrey et al., The dirty weather diaries of Reverend Richard Davis — https://cp.copernicus.org/articles/12/553/2016/ — missionary weather diary measurements in nineteenth-century New Zealand cross-checked with ship logs, tree rings, and coral evidence.
3. Niall Boyce, Bills of Mortality: tracking disease in early modern London — https://pmc.ncbi.nlm.nih.gov/articles/PMC7154511/ — parish clerks, mortality reporting, classification, printing, and public circulation.
4. Aono and Kazui, Phenological data series of cherry tree flowering in Kyoto — https://doi.org/10.1002/joc.1594 — historical flowering records and calibrated spring-temperature reconstruction.
5. CLIWOC historical ship logbook project — https://epic.awi.de/id/eprint/17061/ — digitised European ship log observations for climate reconstruction and their coverage limits.
6. David A. King, The role of the muwaqqit in Mamluk society — https://doi.org/10.1086/353360 — mosque timekeepers, religious observance, mathematics, instruments, and urban institutions.
7. NOAA National Centers for Environmental Information, July 2026 national climate assessment — https://www.ncei.noaa.gov/news/national-climate-202607 — current July 2026 U.S. temperature and precipitation context.
8. Berkeley Earth, July 2026 temperature update — https://berkeleyearth.org/july-2026-temperature-update/ — current July 2026 global-temperature context.
`;

export function extractModelJson(content: unknown): unknown {
  if (typeof content !== "string") throw new Error("The research model returned no text content.");
  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(trimmed);
}

export function createEditionPrompt(dateSlug: string, requiresCurrentSignal: boolean) {
  return `Create one source-grounded The Light Letter edition as a single JSON object. Today is ${dateSlug}.

Return exactly three distinct, reader-friendly cross-domain insights spanning at least three of spirituality/esoterica, hard science, history, politics, and sociology. Do not force a hidden thesis across the set. Every claim must be real, specific, counterintuitive, sourced, and clearly separate documented fact from interpretation. Do not search the web. Do not manufacture a source, quotation, finding, or URL.

For each insight: mainClaim is at least 80 characters; soWhat at least 55; evidenceNote and auditNote at least 60; denominatorNote, intentNote, and falsifier at least 35. Supply at least one named, direct HTTPS source URL per insight. Use a realistic confidence tier: E, C, F, or S.

Set slug to light-letter-${dateSlug}. ${requiresCurrentSignal ? "This must be a current issue: set issueType to current, give currentRelevance a dated, methodologically relevant explanation of at least 60 characters, and give two independent direct current-source URLs." : "Set issueType to regular unless a current source-grounded connection genuinely improves the edition."}

Required JSON keys are slug, title, standfirst, editorNote, issueType, currentRelevance, currentSourceUrls, and insights. Insights must be an array of exactly three objects with title, domains, tier, mainClaim, soWhat, evidenceNote, auditNote, denominatorNote, intentNote, falsifier, and sources. Every source needs label, url, and sourceType. For a regular issue, use an empty string for currentRelevance and an empty array for currentSourceUrls.

${VERIFIED_SOURCE_LIBRARY}

The newsletter is approachable but skeptical. Write only JSON; no markdown fences or commentary.`;
}

async function verifySourceUrls(candidate: PublishEditionInput) {
  const urls = candidate.insights.flatMap(insight => insight.sources.map(source => source.url));
  const distinct = Array.from(new Set(urls));
  const checks = await Promise.all(distinct.map(async url => {
    try {
      const response = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(12_000), headers: { Range: "bytes=0-512", "User-Agent": "TheLightLetterSourceCheck/1.0" } });
      return response.status >= 200 && response.status < 500;
    } catch {
      return false;
    }
  }));
  const reachable = checks.filter(Boolean).length;
  if (reachable < 3) throw new Error(`Source verification failed: only ${reachable} of ${distinct.length} distinct source URLs responded.`);
}

async function recordRun(scheduleId: number | null, status: "started" | "rejected" | "failed", detail: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(newsletterPublicationRuns).values({ scheduleId, editionId: null, status, detail: detail.slice(0, 4000) });
}

export async function generateScheduledNewsletter(req: Request, res: Response) {
  let scheduleId: number | null = null;
  try {
    const user = await sdk.authenticateRequest(req as never);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });

    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const schedule = (await db.select().from(newsletterSchedules).where(and(eq(newsletterSchedules.scheduleCronTaskUid, user.taskUid), eq(newsletterSchedules.enabled, true))).limit(1))[0];
    if (!schedule) return res.json({ ok: true, skipped: "orphan-or-disabled-schedule" });
    scheduleId = schedule.id;

    const dateSlug = new Date().toISOString().slice(0, 10);
    const slug = `light-letter-${dateSlug}`;
    const existing = (await db.select().from(newsletterEditions).where(and(eq(newsletterEditions.slug, slug), eq(newsletterEditions.status, "published"))).limit(1))[0];
    if (existing) return res.json({ ok: true, skipped: "already-published", editionId: existing.id });

    await recordRun(scheduleId, "started", `Beginning site-owned generated edition for ${dateSlug}.`);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const requiresCurrentSignal = !schedule.lastCurrentSignalAt || schedule.lastCurrentSignalAt.getTime() < sevenDaysAgo;
    const generated = await invokeLLM({
      model: "gpt-5-nano",
      messages: [{ role: "system", content: "You are a meticulous research editor. Preserve uncertainty and output only valid JSON." }, { role: "user", content: createEditionPrompt(dateSlug, requiresCurrentSignal) }],
      toolChoice: "none",
      maxCompletionTokens: 2_400,
    });
    const content = generated.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`Research model returned no readable choices: ${JSON.stringify(generated).slice(0, 600)}`);
    }
    const candidate = publishEditionSchema.parse(extractModelJson(content));
    await verifySourceUrls(candidate);
    const result = await publishEdition(candidate, user.taskUid);
    return res.json({ ok: true, mode: "site-owned-heartbeat", ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scheduled generation error";
    await recordRun(scheduleId, "failed", message).catch(() => undefined);
    console.error("[Newsletter heartbeat]", error);
    return res.status(500).json({ error: message, timestamp: new Date().toISOString(), scheduleId });
  }
}
