import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Full data export (data portability). Returns everything the user owns as JSON,
// shaped so /api/import can restore it.
export async function GET() {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const skills = await db.skill.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      subskills: { orderBy: { order: "asc" } },
      sessions: true,
      reviews: true,
      principles: true,
    },
  });
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    prefs: { lang: user.lang, theme: user.theme, weeklyGoal: user.weeklyGoal },
    skills: skills.map((s) => ({
      name: s.name, why: s.why, target: s.target, targetHours: s.targetHours,
      celebrated: s.celebrated, archived: s.archived,
      subskills: s.subskills.map((x) => ({ id: x.id, text: x.text, vital: x.vital, order: x.order })),
      sessions: s.sessions.map((x) => ({ date: x.date, minutes: x.minutes, what: x.what, reflection: x.reflection, subskillId: x.subskillId })),
      reviews: s.reviews.map((x) => ({ topic: x.topic, box: x.box, due: x.due, last: x.last })),
      principles: s.principles.map((x) => ({ key: x.key, done: x.done, note: x.note })),
    })),
  };
  return NextResponse.json(payload, {
    headers: { "Content-Disposition": 'attachment; filename="practice-ledger-export.json"' },
  });
}
