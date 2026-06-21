import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// One request returns everything the client needs to render — the cross-device
// sync primitive. Each device polls this (or calls refresh() after a mutation).
export async function GET() {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const skills = await db.skill.findMany({
    where: { userId: user.id, archived: false },
    orderBy: { createdAt: "asc" },
    include: { subskills: true, sessions: true, reviews: true, principles: true },
  });
  return NextResponse.json({
    lang: user.lang,
    theme: user.theme,
    weeklyGoal: user.weeklyGoal,
    remindersOptIn: user.remindersOptIn,
    skills,
  });
}

// Update user-level preferences (lang/theme/weeklyGoal).
export async function PATCH(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const body = await req.json();
  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      lang: body.lang ?? undefined,
      theme: body.theme ?? undefined,
      weeklyGoal: typeof body.weeklyGoal === "number" ? body.weeklyGoal : undefined,
      remindersOptIn: typeof body.remindersOptIn === "boolean" ? body.remindersOptIn : undefined,
    },
  });
  return NextResponse.json({ lang: updated.lang, theme: updated.theme, weeklyGoal: updated.weeklyGoal, remindersOptIn: updated.remindersOptIn });
}
