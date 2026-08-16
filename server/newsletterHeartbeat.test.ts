import { describe, expect, it } from "vitest";
import { createEditionPrompt, extractModelJson } from "./newsletterHeartbeat";

describe("site-owned newsletter publisher", () => {
  it("extracts a plain JSON model response", () => {
    expect(extractModelJson('{"title":"edition"}')).toEqual({ title: "edition" });
  });

  it("requires a dated current signal when the archive is due for one", () => {
    const prompt = createEditionPrompt("2026-08-16", true);
    expect(prompt).toContain("light-letter-2026-08-16");
    expect(prompt).toContain("two independent direct current-source URLs");
  });
});
