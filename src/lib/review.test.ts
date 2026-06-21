import { describe, it, expect } from "vitest";
import { addDays, todayISO, advance, REVIEW_STEPS } from "./review";

describe("todayISO", () => {
  it("formats yyyy-mm-dd, zero-padded", () => {
    expect(todayISO(new Date(2024, 0, 5))).toBe("2024-01-05");
    expect(todayISO(new Date(2024, 10, 30))).toBe("2024-11-30");
  });
});

describe("addDays", () => {
  it("adds within a month", () => expect(addDays("2024-01-01", 3)).toBe("2024-01-04"));
  it("rolls over month and year", () => {
    expect(addDays("2024-01-31", 1)).toBe("2024-02-01");
    expect(addDays("2024-12-31", 1)).toBe("2025-01-01");
  });
  it("subtracts across a leap day", () => expect(addDays("2024-03-01", -1)).toBe("2024-02-29"));
});

describe("advance (Leitner)", () => {
  it("promotes a remembered card and schedules by the ladder", () => {
    const r = advance(0, true);
    expect(r.box).toBe(1);
    expect(r.due).toBe(addDays(todayISO(), REVIEW_STEPS[1]));
    expect(r.last).toBe(todayISO());
  });
  it("caps at the final box", () => {
    expect(advance(REVIEW_STEPS.length - 1, true).box).toBe(REVIEW_STEPS.length - 1);
  });
  it("resets a forgotten card to box 0", () => {
    const r = advance(3, false);
    expect(r.box).toBe(0);
    expect(r.due).toBe(addDays(todayISO(), REVIEW_STEPS[0]));
  });
});
