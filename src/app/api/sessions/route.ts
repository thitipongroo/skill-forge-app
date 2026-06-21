import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownsSkill } from "@/lib/owns";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const b = await req.json();
  if (!(await ownsSkill(user.id, b.skillId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!b.date || !Number(b.minutes)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const session = await db.session.create({
    data: {
      skillId: b.skillId,
      date: b.date,
      minutes: Number(b.minutes),
      what: b.what ?? "",
      reflection: b.reflection ?? "",
      subskillId: b.subskillId || null,
    },
  });
  return NextResponse.json(session, { status: 201 });
}
