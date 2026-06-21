import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function owned(userId: string, id: string) {
  const s = await db.subSkill.findUnique({ where: { id }, include: { skill: { select: { userId: true } } } });
  return s?.skill.userId === userId ? s : null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  if (!(await owned(user.id, params.id))) return NextResponse.json({ error: "not found" }, { status: 404 });
  const b = await req.json();
  const sub = await db.subSkill.update({
    where: { id: params.id },
    data: { text: b.text ?? undefined, vital: typeof b.vital === "boolean" ? b.vital : undefined },
  });
  return NextResponse.json(sub);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  if (!(await owned(user.id, params.id))) return NextResponse.json({ error: "not found" }, { status: 404 });
  await db.subSkill.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
