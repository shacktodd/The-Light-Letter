import { describe, expect, it } from "vitest";
import { publishEditionSchema, validateEdition } from "./newsletterPublication";

const threeInsights = Array.from({ length: 3 }, (_, index) => ({
  title: `Distinct insight headline ${index + 1}`,
  domains: "history · science · society",
  tier: "C" as const,
  mainClaim: "A plainly written claim that exceeds the minimum length and names a cross-domain relationship without pretending that evidence is automatic.",
  soWhat: "A clear practical implication that explains why a reader should care about this finding in ordinary language.",
  evidenceNote: "Named records and methods support the narrow claim, while the broader interpretation remains deliberately constrained.",
  auditNote: "The audit identifies the strongest alternative explanation and states exactly where evidence becomes more interpretive.",
  denominatorNote: "The archive excludes silent cases, missing records, and groups that did not produce preserved evidence.",
  intentNote: "Observed patterns do not demonstrate that their creators planned the later outcome.",
  falsifier: "A representative counterexample with contrary records would require the claim to be downgraded or withdrawn.",
  sources: [{ label: `Named source record ${index + 1}`, url: `https://example.org/source-${index + 1}`, sourceType: "Primary documentation" }],
}));

describe("newsletter publication quality gate", () => {
  it("accepts a regular edition with three distinct sourced insights", () => {
    const edition = publishEditionSchema.parse({
      slug: "quality-gated-regular-edition",
      title: "A quality-gated regular edition",
      standfirst: "A concise description long enough to explain the edition’s premise and its reader-friendly research value.",
      issueType: "regular",
      insights: threeInsights,
    });

    expect(validateEdition(edition)).toMatchObject({ totalSources: 3 });
  });

  it("rejects a current edition that lacks two independent current-source URLs", () => {
    expect(() => publishEditionSchema.parse({
      slug: "under-sourced-current-edition",
      title: "An under-sourced current edition",
      standfirst: "A concise description long enough to explain the edition’s premise and its reader-friendly research value.",
      issueType: "current",
      currentRelevance: "The edition connects a dated current event to a carefully bounded cross-domain question.",
      currentSourceUrls: ["https://example.org/current-source"],
      insights: threeInsights,
    })).toThrow("Current editions require relevance context and two independent current-source URLs.");
  });
});
