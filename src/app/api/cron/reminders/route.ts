import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { todayISO } from "@/lib/review";
import { computeStreak, streakAtRisk } from "@/lib/streak";
import { sendPush } from "@/lib/push-server";
import { withApi } from "@/lib/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// Daily reminders. For each user with a push subscription we send the most
// motivating nudge: a streak-at-risk warning (highest priority — streaks break
// because people forget) or a due-review reminder.
export const GET = withApi("cron/reminders", async (req: Request) => {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const today = todayISO();

  // Only users who can actually receive a push.
  const subs = await db.pushSubscription.findMany();
  const byUser = new Map<string, typeof subs>();
  for (const s of subs) (byUser.get(s.userId) ?? byUser.set(s.userId, []).get(s.userId)!).push(s);

  logger.info("cron_reminders_start", { users: byUser.size });
  let sent = 0, pruned = 0, failed = 0, streakNudges = 0, reviewNudges = 0;

  for (const [userId, userSubs] of byUser) {
    const u = await db.user.findUnique({ where: { id: userId }, select: { remindersOptIn: true } });
    if (!u?.remindersOptIn) continue; // respect opt-out
    const skills = await db.skill.findMany({
      where: { userId },
      select: { sessions: { select: { date: true } }, reviews: { select: { due: true } } },
    });
    const dates = skills.flatMap((s) => s.sessions.map((x) => x.date));
    const dueCount = skills.flatMap((s) => s.reviews).filter((r) => r.due <= today).length;

    let payload: { title: string; body: string; url: string } | null = null;
    if (streakAtRisk(dates, today)) {
      const { current } = computeStreak(dates, today);
      payload = { title: "Keep your streak", body: `Practice today to keep your ${current}-day streak alive.`, url: "/dashboard" };
      streakNudges++;
    } else if (dueCount > 0) {
      payload = { title: "Time to review", body: `${dueCount} item${dueCount === 1 ? "" : "s"} due in your practice ledger.`, url: "/dashboard" };
      reviewNudges++;
    }
    if (!payload) continue;

    for (const sub of userSubs) {
      try { await sendPush(sub, payload); sent++; }
      catch (e: unknown) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) { await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {}); pruned++; }
        else { failed++; logger.warn("push_send_failed", { userId, status }); }
      }
    }
  }

  logger.info("cron_reminders_done", { sent, pruned, failed, streakNudges, reviewNudges });
  return NextResponse.json({ users: byUser.size, sent, pruned, failed, streakNudges, reviewNudges });
});
