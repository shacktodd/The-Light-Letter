import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("The Light Letter site identity", () => {
  it("keeps the configured application title and public document title aligned", async () => {
    expect(process.env.VITE_APP_TITLE).toBe("The Light Letter");
    const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
    expect(html).toContain("<title>The Light Letter — Big Ideas, Clear Language</title>");
  });
});
