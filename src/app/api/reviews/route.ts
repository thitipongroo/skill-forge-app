import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownsSkill } from "@/lib/owns";
import { todayISO } from "@/lib/review";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const b = await req.json();
  if (!(await ownsSkill(user.id, b.skillId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!b.topic?.trim()) return NextResponse.json({ error: "topic required" }, { status: 400 });
  const review = await db.review.create({
    data: { skillId: b.skillId, topic: b.topic.trim(), box: 0, due: todayISO(), last: null },
  });
  return NextResponse.json(review, { status: 201 });
}
