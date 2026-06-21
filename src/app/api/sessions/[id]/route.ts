import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownsSession } from "@/lib/owns";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  if (!(await ownsSession(user.id, params.id))) return NextResponse.json({ error: "not found" }, { status: 404 });
  const b = await req.json();
  const session = await db.session.update({
    where: { id: params.id },
    data: {
      date: b.date ?? undefined,
      minutes: b.minutes != null ? Number(b.minutes) : undefined,
      what: b.what ?? undefined,
      reflection: b.reflection ?? undefined,
      subskillId: b.subskillId === undefined ? undefined : (b.subskillId || null),
    },
  });
  return NextResponse.json(session);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  if (!(await ownsSession(user.id, params.id))) return NextResponse.json({ error: "not found" }, { status: 404 });
  await db.session.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
