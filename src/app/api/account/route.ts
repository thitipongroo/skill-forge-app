import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  return NextResponse.json({ email: user.email, name: user.name });
}

export async function PATCH(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const { name } = await req.json();
  const updated = await db.user.update({
    where: { id: user.id },
    data: { name: name ? String(name).trim() : null },
  });
  return NextResponse.json({ email: updated.email, name: updated.name });
}

// Delete the account and everything it owns (cascade).
export async function DELETE() {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  await db.user.delete({ where: { id: user.id } });
  return NextResponse.json({ ok: true });
}
