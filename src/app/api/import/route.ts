import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { todayISO } from "@/lib/review";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// Restore from an exported file. mode "replace" wipes the user's existing skills
// first; "merge" (default) appends. All IDs are regenerated and scoped to the
// signed-in user — IDs from the file are never trusted, only used to re-link a
// session to its sub-skill.
export async function POST(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;

  const data = await req.json().catch(() => null);
  if (!data || !Array.isArray(data.skills)) return NextResponse.json({ error: "invalid file" }, { status: 400 });
  const replace = data.mode === "replace";

  let imported: number;
  try {
    imported = await db.$transaction(async (tx) => {
    if (replace) await tx.skill.deleteMany({ where: { userId: user.id } });
    let count = 0;
    for (const s of data.skills) {
      const skill = await tx.skill.create({
        data: {
          userId: user.id,
          name: String(s.name ?? "Untitled"),
          why: String(s.why ?? ""),
          target: String(s.target ?? ""),
          targetHours: Number(s.targetHours) || 20,
          celebrated: !!s.celebrated,
          archived: !!s.archived,
        },
      });
      const idMap: Record<string, string> = {};
      for (const ss of s.subskills ?? []) {
        const created = await tx.subSkill.create({
          data: { skillId: skill.id, text: String(ss.text ?? ""), vital: !!ss.vital, order: Number(ss.order) || 0 },
        });
        if (ss.id) idMap[ss.id] = created.id;
      }
      for (const se of s.sessions ?? []) {
        await tx.session.create({
          data: {
            skillId: skill.id, date: String(se.date ?? todayISO()), minutes: Number(se.minutes) || 0,
            what: String(se.what ?? ""), reflection: String(se.reflection ?? ""),
            subskillId: se.subskillId ? (idMap[se.subskillId] ?? null) : null,
          },
        });
      }
      for (const r of s.reviews ?? []) {
        await tx.review.create({
          data: { skillId: skill.id, topic: String(r.topic ?? ""), box: Number(r.box) || 0, due: String(r.due ?? todayISO()), last: r.last ?? null },
        });
      }
      for (const p of s.principles ?? []) {
        if (!p.key) continue;
        await tx.principleNote.create({ data: { skillId: skill.id, key: String(p.key), done: !!p.done, note: String(p.note ?? "") } });
      }
      count++;
    }
    return count;
    });
  } catch (err) {
    logger.error("import_failed", { userId: user.id, err: (err as Error).message });
    return NextResponse.json({ error: "import failed" }, { status: 500 });
  }

  if (data.prefs) {
    await db.user.update({
      where: { id: user.id },
      data: {
        lang: data.prefs.lang ?? undefined,
        theme: data.prefs.theme ?? undefined,
        weeklyGoal: typeof data.prefs.weeklyGoal === "number" ? data.prefs.weeklyGoal : undefined,
      },
    });
  }
  return NextResponse.json({ imported });
}
