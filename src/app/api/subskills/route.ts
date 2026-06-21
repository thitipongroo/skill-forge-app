import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownsSkill } from "@/lib/owns";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const b = await req.json();
  if (!(await ownsSkill(user.id, b.skillId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!b.text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
  const count = await db.subSkill.count({ where: { skillId: b.skillId } });
  const sub = await db.subSkill.create({ data: { skillId: b.skillId, text: b.text.trim(), order: count } });
  return NextResponse.json(sub, { status: 201 });
}
