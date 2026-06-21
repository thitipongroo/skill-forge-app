export interface Achievement { id: string; earned: boolean; }

export interface AchievementInput {
  totalMinutes: number;
  sessionCount: number;
  currentStreak: number;
  reviewsStarted: number; // reviews that have been recalled at least once
  targetReached: boolean;
}

// Milestone badges — gamification shown to be a strong retention driver. Pure
// and data-derived so they can't drift out of sync with the underlying records.
export function computeAchievements(i: AchievementInput): Achievement[] {
  const hours = i.totalMinutes / 60;
  return [
    { id: "first_session", earned: i.sessionCount >= 1 },
    { id: "streak_3", earned: i.currentStreak >= 3 },
    { id: "streak_7", earned: i.currentStreak >= 7 },
    { id: "hours_10", earned: hours >= 10 },
    { id: "hours_20", earned: hours >= 20 },
    { id: "reviews_10", earned: i.reviewsStarted >= 10 },
    { id: "target_reached", earned: i.targetReached },
  ];
}

export function earnedCount(list: Achievement[]): number {
  return list.filter((a) => a.earned).length;
}
