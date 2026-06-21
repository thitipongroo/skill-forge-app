import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownsSkill } from "@/lib/owns";

export const dynamic = "force-dynamic";

// Upsert a principle note (done / text) for a skill.
export async function PUT(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const b = await req.json();
  if (!(await ownsSkill(user.id, b.skillId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const note = await db.principleNote.upsert({
    where: { skillId_key: { skillId: b.skillId, key: b.key } },
    update: { done: b.done ?? undefined, note: b.note ?? undefined },
    create: { skillId: b.skillId, key: b.key, done: !!b.done, note: b.note ?? "" },
  });
  return NextResponse.json(note);
}
