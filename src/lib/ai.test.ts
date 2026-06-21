import { describe, it, expect } from "vitest";
import { buildCoachPrompt, parseCoachResponse } from "./ai";

describe("buildCoachPrompt", () => {
  it("includes the skill name and the reason when given", () => {
    const p = buildCoachPrompt({ name: "Guitar", why: "play at parties" });
    expect(p).toContain("Guitar");
    expect(p).toContain("play at parties");
    expect(p).toContain("subskills");
  });
  it("omits the reason clause when absent", () => {
    expect(buildCoachPrompt({ name: "Chess" })).not.toContain("Their reason");
  });
});

describe("parseCoachResponse", () => {
  it("parses a clean JSON object", () => {
    const r = parseCoachResponse('{"subskills":["a","b"],"reviews":["x"],"tip":"start small"}');
    expect(r.subskills).toEqual(["a", "b"]);
    expect(r.reviews).toEqual(["x"]);
    expect(r.tip).toBe("start small");
  });
  it("tolerates markdown fences and prose", () => {
    const r = parseCoachResponse('Sure:\n```json\n{"subskills":["a"],"reviews":[],"tip":""}\n```');
    expect(r.subskills).toEqual(["a"]);
  });
  it("filters non-strings, trims, and caps length", () => {
    const r = parseCoachResponse(JSON.stringify({ subskills: [" a ", 2, "b"], reviews: "no", tip: 9 }));
    expect(r.subskills).toEqual(["a", "b"]);
    expect(r.reviews).toEqual([]);
    expect(r.tip).toBe("");
  });
});
