import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;

  const rl = rateLimit(`pwchange:${user.id}`, 5, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "too many attempts" }, { status: 429 });

  const { currentPassword, newPassword } = await req.json();
  if (String(newPassword ?? "").length < 8) return NextResponse.json({ error: "password too short" }, { status: 400 });

  const ok = await bcrypt.compare(String(currentPassword ?? ""), user.passwordHash);
  if (!ok) return NextResponse.json({ error: "wrong current password" }, { status: 403 });

  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });
  return NextResponse.json({ ok: true });
}
