import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function owned(userId: string, id: string) {
  const skill = await db.skill.findFirst({ where: { id, userId } });
  return skill;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const skill = await db.skill.findFirst({
    where: { id: params.id, userId: user.id },
    include: { subskills: { orderBy: { order: "asc" } }, sessions: true, reviews: true, principles: true },
  });
  if (!skill) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(skill);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  if (!(await owned(user.id, params.id))) return NextResponse.json({ error: "not found" }, { status: 404 });
  const b = await req.json();
  const skill = await db.skill.update({
    where: { id: params.id },
    data: {
      name: b.name ?? undefined,
      why: b.why ?? undefined,
      target: b.target ?? undefined,
      targetHours: b.targetHours ?? undefined,
      celebrated: typeof b.celebrated === "boolean" ? b.celebrated : undefined,
      archived: typeof b.archived === "boolean" ? b.archived : undefined,
    },
  });
  return NextResponse.json(skill);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  if (!(await owned(user.id, params.id))) return NextResponse.json({ error: "not found" }, { status: 404 });
  await db.skill.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
