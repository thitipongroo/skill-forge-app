import { todayISO, addDays } from "./review";

export interface StreakInfo { current: number; longest: number; consistency: number; }

// Streak from a list of active ISO days. `current` counts back from today (or
// yesterday if today isn't logged yet, so a streak stays "alive" until midnight).
// `consistency` is the rolling-window completion % — a forgiving signal that one
// missed day doesn't reset, addressing the streak-reset churn problem.
export function computeStreak(dates: string[], today = todayISO(), windowDays = 30): StreakInfo {
  const set = new Set(dates);
  const uniq = [...set].sort();

  let longest = 0, run = 0, prev: string | null = null;
  for (const d of uniq) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = d;
  }

  let cursor: string | null = set.has(today) ? today : set.has(addDays(today, -1)) ? addDays(today, -1) : null;
  let current = 0;
  while (cursor && set.has(cursor)) { current++; cursor = addDays(cursor, -1); }

  let active = 0;
  for (let i = 0; i < windowDays; i++) if (set.has(addDays(today, -i))) active++;
  const consistency = Math.round((active / windowDays) * 100);

  return { current, longest, consistency };
}

// "At risk" = there's a live streak that will break unless the user practices
// today. Used by the reminder cron to nudge before midnight.
export function streakAtRisk(dates: string[], today = todayISO()): boolean {
  const set = new Set(dates);
  return !set.has(today) && set.has(addDays(today, -1));
}
