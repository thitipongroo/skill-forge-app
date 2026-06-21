import { describe, it, expect } from "vitest";
import { computeAchievements, earnedCount } from "./achievements";

const base = { totalMinutes: 0, sessionCount: 0, currentStreak: 0, reviewsStarted: 0, targetReached: false };
const get = (list: ReturnType<typeof computeAchievements>, id: string) => list.find((a) => a.id === id)!.earned;

describe("computeAchievements", () => {
  it("earns nothing at zero", () => {
    expect(earnedCount(computeAchievements(base))).toBe(0);
  });
  it("earns the first-session badge after one rep", () => {
    expect(get(computeAchievements({ ...base, sessionCount: 1 }), "first_session")).toBe(true);
  });
  it("unlocks hour milestones at thresholds", () => {
    const a = computeAchievements({ ...base, totalMinutes: 9 * 60 });
    expect(get(a, "hours_10")).toBe(false);
    const b = computeAchievements({ ...base, totalMinutes: 20 * 60 });
    expect(get(b, "hours_10")).toBe(true);
    expect(get(b, "hours_20")).toBe(true);
  });
  it("unlocks streak milestones", () => {
    const a = computeAchievements({ ...base, currentStreak: 7 });
    expect(get(a, "streak_3")).toBe(true);
    expect(get(a, "streak_7")).toBe(true);
  });
});
