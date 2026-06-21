import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownsReview } from "@/lib/owns";
import { advance } from "@/lib/review";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const existing = await ownsReview(user.id, params.id);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  const b = await req.json();

  // action: "got" | "again" runs the Leitner step; otherwise edit the topic.
  let data: Record<string, unknown> = {};
  if (b.action === "got" || b.action === "again") {
    data = advance(existing.box, b.action === "got");
  } else if (typeof b.topic === "string") {
    data = { topic: b.topic.trim() };
  }
  const review = await db.review.update({ where: { id: params.id }, data });
  return NextResponse.json(review);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  if (!(await ownsReview(user.id, params.id))) return NextResponse.json({ error: "not found" }, { status: 404 });
  await db.review.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
