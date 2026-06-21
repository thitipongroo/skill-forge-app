import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const skills = await db.skill.findMany({
    where: { userId: user.id, archived: false },
    orderBy: { createdAt: "asc" },
    include: { sessions: { select: { minutes: true } } },
  });
  return NextResponse.json(skills);
}

export async function POST(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const body = await req.json();
  if (!body?.name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  const skill = await db.skill.create({
    data: {
      userId: user.id,
      name: body.name.trim(),
      why: body.why ?? "",
      target: body.target ?? "",
      targetHours: body.targetHours ?? 20,
    },
  });
  return NextResponse.json(skill, { status: 201 });
}
