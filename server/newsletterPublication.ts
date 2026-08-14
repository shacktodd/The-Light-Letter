import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  newsletterEditions,
  newsletterInsights,
  newsletterPublicationRuns,
  newsletterSchedules,
  newsletterSources,
} from "../drizzle/schema";
import { getDb } from "./db";

const sourceSchema = z.object({
  label: z.string().min(6).max(360),
  url: z.string().url(),
  sourceType: z.string().min(3).max(100),
});

const insightSchema = z.object({
  title: z.string().min(12).max(240),
  domains: z.string().min(8).max(320),
  tier: z.enum(["E", "C", "F", "S"]),
  mainClaim: z.string().min(80),
  soWhat: z.string().min(55),
  evidenceNote: z.string().min(60),
  auditNote: z.string().min(60),
  denominatorNote: z.string().min(35),
  intentNote: z.string().min(35),
  falsifier: z.string().min(35),
  sources: z.array(sourceSchema).min(1).max(5),
});

export const publishEditionSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140),
    title: z.string().min(12).max(240),
    standfirst: z.string().min(80),
    editorNote: z.string().max(1200).optional(),
    issueType: z.enum(["regular", "current"]),
    currentRelevance: z.string().min(60).optional(),
    currentSourceUrls: z.array(z.string().url()).max(6).optional(),
    insights: z.array(insightSchema).length(3),
  })
  .superRefine((value, ctx) => {
    if (value.issueType === "current" && (!value.currentRelevance || (value.currentSourceUrls?.length ?? 0) < 2)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Current editions require relevance context and two independent current-source URLs." });
    }
  });

export type PublishEditionInput = z.infer<typeof publishEditionSchema>;

export function validateEdition(input: PublishEditionInput) {
  const totalSources = input.insights.reduce((total, insight) => total + insight.sources.length, 0);
  if (totalSources < 3) throw new Error("Quality gate failed: the edition needs at least three named source records.");
  if (new Set(input.insights.map(insight => insight.title.trim().toLowerCase())).size !== 3) {
    throw new Error("Quality gate failed: each insight requires a distinct headline.");
  }
  return { totalSources, notes: "Three distinct insights, named sources, falsifiers, denominator notes, and intent notes supplied." };
}

export async function listPublishedEditions(limit = 12) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(newsletterEditions)
    .where(eq(newsletterEditions.status, "published"))
    .orderBy(desc(newsletterEditions.publishedAt))
    .limit(limit);
}

export async function getPublishedEdition(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const edition = (await db
    .select()
    .from(newsletterEditions)
    .where(and(eq(newsletterEditions.slug, slug), eq(newsletterEditions.status, "published")))
    .limit(1))[0];
  if (!edition) return null;

  const insights = await db
    .select()
    .from(newsletterInsights)
    .where(eq(newsletterInsights.editionId, edition.id))
    .orderBy(asc(newsletterInsights.position));
  const sources = insights.length
    ? await db.select().from(newsletterSources).where(inArray(newsletterSources.insightId, insights.map(insight => insight.id)))
    : [];
  return {
    ...edition,
    insights: insights.map(insight => ({ ...insight, sources: sources.filter(source => source.insightId === insight.id) })),
  };
}

export async function publishEdition(input: PublishEditionInput, scheduleTaskUid: string) {
  const gate = validateEdition(input);
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const schedule = (await db
    .select()
    .from(newsletterSchedules)
    .where(and(eq(newsletterSchedules.scheduleCronTaskUid, scheduleTaskUid), eq(newsletterSchedules.enabled, true)))
    .limit(1))[0];
  if (!schedule) throw new Error("Scheduled publication route rejected an unknown or disabled task.");

  const existing = (await db.select().from(newsletterEditions).where(eq(newsletterEditions.slug, input.slug)).limit(1))[0];
  if (existing?.status === "published") return { editionId: existing.id, skipped: "already-published" as const };

  const now = new Date();
  const result = await db.transaction(async tx => {
    const editionValues = {
      slug: input.slug,
      title: input.title,
      standfirst: input.standfirst,
      editorNote: input.editorNote ?? null,
      issueType: input.issueType,
      status: "published" as const,
      currentRelevance: input.currentRelevance ?? null,
      currentSourceUrls: input.currentSourceUrls?.join("\n") ?? null,
      qualityGatePassed: true,
      qualityGateNotes: gate.notes,
      publishedAt: now,
    };

    let editionId = existing?.id;
    if (editionId) {
      await tx.update(newsletterEditions).set(editionValues).where(eq(newsletterEditions.id, editionId));
    } else {
      const inserted = await tx.insert(newsletterEditions).values(editionValues);
      editionId = Number(inserted[0].insertId);
    }

    await tx.delete(newsletterSources).where(inArray(newsletterSources.insightId, (await tx.select({ id: newsletterInsights.id }).from(newsletterInsights).where(eq(newsletterInsights.editionId, editionId))).map(row => row.id)));
    await tx.delete(newsletterInsights).where(eq(newsletterInsights.editionId, editionId));
    for (let index = 0; index < input.insights.length; index += 1) {
      const insight = input.insights[index]!;
      const insertedInsight = await tx.insert(newsletterInsights).values({
        editionId,
        position: index + 1,
        title: insight.title,
        domains: insight.domains,
        tier: insight.tier,
        mainClaim: insight.mainClaim,
        soWhat: insight.soWhat,
        evidenceNote: insight.evidenceNote,
        auditNote: insight.auditNote,
        denominatorNote: insight.denominatorNote,
        intentNote: insight.intentNote,
        falsifier: insight.falsifier,
      });
      const insightId = Number(insertedInsight[0].insertId);
      for (let sourceIndex = 0; sourceIndex < insight.sources.length; sourceIndex += 1) {
        const source = insight.sources[sourceIndex]!;
        await tx.insert(newsletterSources).values({
          insightId,
          label: source.label,
          url: source.url,
          sourceType: source.sourceType,
        });
      }
    }
    if (input.issueType === "current") {
      await tx.update(newsletterSchedules).set({ lastCurrentSignalAt: now }).where(eq(newsletterSchedules.id, schedule.id));
    }
    await tx.insert(newsletterPublicationRuns).values({ scheduleId: schedule.id, editionId, status: "published", detail: gate.notes });
    return editionId;
  });

  return { editionId: result, skipped: null };
}

export async function listEditionCards() {
  const editions = await listPublishedEditions(18);
  return editions.map(edition => ({
    id: edition.id,
    slug: edition.slug,
    title: edition.title,
    standfirst: edition.standfirst,
    issueType: edition.issueType,
    currentRelevance: edition.currentRelevance,
    publishedAt: edition.publishedAt,
  }));
}
