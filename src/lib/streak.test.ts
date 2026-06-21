import { describe, it, expect } from "vitest";
import { computeStreak, streakAtRisk } from "./streak";

const T = "2026-06-21";

describe("computeStreak", () => {
  it("is zero for no activity", () => {
    expect(computeStreak([], T)).toMatchObject({ current: 0, longest: 0, consistency: 0 });
  });
  it("counts consecutive days up to today", () => {
    const r = computeStreak(["2026-06-21", "2026-06-20", "2026-06-19"], T);
    expect(r.current).toBe(3);
    expect(r.longest).toBe(3);
  });
  it("keeps the streak alive if yesterday was logged but today isn't yet", () => {
    expect(computeStreak(["2026-06-20", "2026-06-19"], T).current).toBe(2);
  });
  it("breaks the current streak after a missed day, but remembers the longest", () => {
    const r = computeStreak(["2026-06-21", "2026-06-15", "2026-06-14", "2026-06-13", "2026-06-12"], T);
    expect(r.current).toBe(1);
    expect(r.longest).toBe(4);
  });
  it("dedupes repeated dates", () => {
    expect(computeStreak(["2026-06-21", "2026-06-21", "2026-06-20"], T).current).toBe(2);
  });
  it("computes rolling consistency", () => {
    // 3 active days in the last 30 -> 10%
    expect(computeStreak(["2026-06-21", "2026-06-20", "2026-06-19"], T, 30).consistency).toBe(10);
  });
});

describe("streakAtRisk", () => {
  it("is true when yesterday was active but today isn't", () => {
    expect(streakAtRisk(["2026-06-20"], T)).toBe(true);
  });
  it("is false once today is logged", () => {
    expect(streakAtRisk(["2026-06-21", "2026-06-20"], T)).toBe(false);
  });
  it("is false with no recent activity", () => {
    expect(streakAtRisk(["2026-06-10"], T)).toBe(false);
  });
});
