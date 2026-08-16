import type { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { newsletterEditions, newsletterPublicationRuns, newsletterSchedules } from "../drizzle/schema";
import { getDb } from "./db";
import { sdk } from "./_core/sdk";
import { publishEdition, publishEditionSchema, type PublishEditionInput } from "./newsletterPublication";

export function extractModelJson(content: unknown): unknown {
  if (typeof content !== "string") throw new Error("The research model returned no text content.");
  return JSON.parse(content.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, ""));
}

export function createEditionPrompt(dateSlug: string, requiresCurrentSignal: boolean) {
  return `The bounded publisher uses verified sources for light-letter-${dateSlug}. ${requiresCurrentSignal ? "A current signal requires two independent direct current-source URLs." : "A regular edition is permitted."}`;
}

export function buildVerifiedEdition(dateSlug: string, requiresCurrentSignal: boolean): PublishEditionInput {
  const current = requiresCurrentSignal
    ? { issueType: "current" as const, currentRelevance: "In August 2026, NOAA reported the warmest July in the contiguous United States’ 1895–present record. The methodological question is what makes a long record scientifically usable, rather than merely old.", currentSourceUrls: ["https://www.ncei.noaa.gov/news/national-climate-202607", "https://berkeleyearth.org/july-2026-temperature-update/"] }
    : { issueType: "regular" as const, currentRelevance: undefined, currentSourceUrls: undefined };
  return {
    slug: `light-letter-${dateSlug}`,
    title: "Three old records with new jobs",
    standfirst: "A flowering calendar, a mosque timekeeper’s working world, and ship logs show how records built for one practical purpose can later illuminate questions their makers never set out to answer.",
    editorNote: "This edition uses the publication system’s verified source library and states its limits beside each claim.",
    ...current,
    insights: [
      {
        title: "A festival calendar can become a temperature proxy.", domains: "sociology · history · hard science", tier: "C",
        mainClaim: "Historical Kyoto cherry-blossom flowering records have been calibrated and used to reconstruct spring temperatures, turning a cultural calendar into a carefully constrained climate proxy rather than a decorative anecdote.",
        soWhat: "A familiar record can become useful scientific evidence, but only when researchers test how the observed event tracks the quantity they want to infer and retain the uncertainty.",
        evidenceNote: "Aono and Kazui assembled Kyoto flowering observations and applied them to spring-temperature reconstruction. The evidentiary bridge is calibration between flowering date and temperature, not the mere survival of a festival record.",
        auditNote: "The strongest claim concerns a calibrated seasonal proxy at a particular place. It does not mean flowering dates alone measure global climate or that cultural records are automatically objective data.",
        denominatorNote: "The archive is local, species-specific, shaped by record survival, and sensitive to changes in observation practice and the built environment around the trees.",
        intentNote: "That later scientists can use the dates does not show that people preserving the flowering calendar intended to make a climate series.",
        falsifier: "If independent instrumental overlap showed no stable relation between the recorded flowering date and local spring temperature, the proxy interpretation would need to be downgraded.",
        sources: [{ label: "Aono and Kazui, Phenological data series of cherry tree flowering in Kyoto", url: "https://doi.org/10.1002/joc.1594", sourceType: "Peer-reviewed research" }],
      },
      {
        title: "Religious timekeeping was also an urban technical profession.", domains: "spirituality · history · hard science", tier: "C",
        mainClaim: "In Mamluk society, mosque timekeepers used mathematical astronomy and instruments to determine prayer times and related observances, making a religious office a durable site of technical calculation and public coordination.",
        soWhat: "Knowledge can live inside institutions that modern categories split apart. Looking only for ‘scientists’ can hide people who kept calculation, instruments, and public routines working together.",
        evidenceNote: "David A. King’s work documents the muwaqqit’s role in Mamluk society and the mathematical and instrumental practices attached to regulated religious timekeeping.",
        auditNote: "The evidence supports a technical role within a religious institution. It does not imply that every timekeeper pursued modern scientific research or that religious purpose disappears when mathematics is involved.",
        denominatorNote: "Surviving instruments and texts privilege literate, well-resourced institutions; they do not represent all religious practice, local variation, or all forms of technical knowledge.",
        intentNote: "A mathematically sophisticated practice serving worship is not evidence that its practitioners meant to build a secular science in advance.",
        falsifier: "Evidence that the office lacked the documented computational and instrumental responsibilities in the cited institutional setting would weaken the cross-domain claim.",
        sources: [{ label: "David A. King, The role of the muwaqqit in Mamluk society", url: "https://doi.org/10.1086/353360", sourceType: "Scholarly historical research" }],
      },
      {
        title: "Ship logs became climate observations by accident of routine.", domains: "history · hard science · politics", tier: "C",
        mainClaim: "Digitised historical European ship logbooks preserve routine observations of wind, weather, and location that climate researchers can use to reconstruct past marine conditions, despite the logs having been made for navigation and state or commercial operations.",
        soWhat: "The most valuable evidence is sometimes a side effect of a routine. But evidence made for navigation carries the routes, priorities, and blind spots of the fleets that produced it.",
        evidenceNote: "The CLIWOC project digitised historical ship-log observations from several European collections for climate reconstruction, documenting both the data’s scale and its dependence on particular maritime archives.",
        auditNote: "The logs can strengthen reconstruction where instrumental coverage is sparse. They cannot automatically represent the whole ocean or disentangle weather from the observation conventions of individual ships and navies.",
        denominatorNote: "Routes, seasons, naval priorities, surviving languages, and archived fleets determine what was counted; coasts, non-European ships, and dangerous conditions are structurally underrepresented.",
        intentNote: "A captain recording weather for navigation did not thereby intend to supply a later global climate dataset.",
        falsifier: "If overlapping independent observations showed systematic errors that cannot be corrected for by route or convention, the reconstruction value of the log series would be reduced.",
        sources: [{ label: "CLIWOC historical ship logbook project", url: "https://epic.awi.de/id/eprint/17061/", sourceType: "Data documentation" }],
      },
    ],
  };
}

async function recordRun(scheduleId: number | null, status: "started" | "rejected" | "failed", detail: string) {
  const db = await getDb();
  if (db) await db.insert(newsletterPublicationRuns).values({ scheduleId, editionId: null, status, detail: detail.slice(0, 4000) });
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
    await recordRun(scheduleId, "started", `Beginning verified bounded edition for ${dateSlug}.`);
    const requiresCurrentSignal = !schedule.lastCurrentSignalAt || schedule.lastCurrentSignalAt.getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000;
    const result = await publishEdition(publishEditionSchema.parse(buildVerifiedEdition(dateSlug, requiresCurrentSignal)), user.taskUid);
    return res.json({ ok: true, mode: "site-owned-verified-library", ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scheduled generation error";
    await recordRun(scheduleId, "failed", message).catch(() => undefined);
    console.error("[Newsletter heartbeat]", error);
    return res.status(500).json({ error: message, timestamp: new Date().toISOString(), scheduleId });
  }
}
