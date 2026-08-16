import { describe, expect, it } from "vitest";
import { buildVerifiedEdition, createEditionPrompt, extractModelJson } from "./newsletterHeartbeat";

describe("site-owned newsletter publisher", () => {
  it("extracts a plain JSON model response", () => {
    expect(extractModelJson('{"title":"edition"}')).toEqual({ title: "edition" });
  });

  it("requires a dated current signal when the archive is due for one", () => {
    const prompt = createEditionPrompt("2026-08-16", true);
    expect(prompt).toContain("light-letter-2026-08-16");
    expect(prompt).toContain("two independent direct current-source URLs");
  });

  it("builds a full quality-gate-ready issue from verified records", () => {
    const edition = buildVerifiedEdition("2026-08-19", true);
    expect(edition.insights).toHaveLength(3);
    expect(edition.issueType).toBe("current");
    expect(edition.currentSourceUrls).toHaveLength(2);
    expect(edition.insights.every(insight => insight.sources.length > 0 && insight.falsifier.length >= 35)).toBe(true);
  });
});
