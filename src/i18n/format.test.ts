import { describe, it, expect } from "vitest";
import { makeFormatters } from "./format";

describe("makeFormatters", () => {
  it("formats numbers with fixed decimals (en)", () => {
    const { fmtNum } = makeFormatters("en");
    expect(fmtNum(1234.5, 1)).toBe("1,234.5");
    expect(fmtNum(3, 0)).toBe("3");
  });
  it("echoes invalid dates back unchanged", () => {
    expect(makeFormatters("en").fmtDate("not-a-date")).toBe("not-a-date");
  });
  it("renders a Gregorian year for en", () => {
    expect(makeFormatters("en").fmtDate("2024-01-15")).toContain("2024");
  });
  it("converts to the Buddhist era for th (no Gregorian year)", () => {
    expect(makeFormatters("th").fmtDate("2024-01-15")).not.toContain("2024");
  });
});
