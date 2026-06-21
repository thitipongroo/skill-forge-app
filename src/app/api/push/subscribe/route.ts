import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const b = await req.json();
  if (!b.endpoint || !b.p256dh || !b.auth) return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
  await db.pushSubscription.upsert({
    where: { endpoint: b.endpoint },
    update: { p256dh: b.p256dh, auth: b.auth, userId: user.id },
    create: { endpoint: b.endpoint, p256dh: b.p256dh, auth: b.auth, userId: user.id },
  });
  return NextResponse.json({ ok: true });
}
