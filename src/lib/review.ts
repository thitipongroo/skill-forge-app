// Leitner spaced-repetition ladder — shared by client and server (cron).
export const REVIEW_STEPS = [1, 3, 7, 16, 35];

export function todayISO(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return todayISO(dt);
}

// Advance ("got it") or reset ("again") a review, returning its next state.
export function advance(box: number, remembered: boolean) {
  const nextBox = remembered ? Math.min(box + 1, REVIEW_STEPS.length - 1) : 0;
  return { box: nextBox, due: addDays(todayISO(), REVIEW_STEPS[nextBox]), last: todayISO() };
}
