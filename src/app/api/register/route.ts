import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = rateLimit(`register:${clientIp(req)}`, 5, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "too many attempts" }, {
      status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
    });
  }

  const { email, password, name } = await req.json();
  const e = String(email ?? "").toLowerCase().trim();
  if (!e || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return NextResponse.json({ error: "invalid email" }, { status: 400 });
  if (String(password ?? "").length < 8) return NextResponse.json({ error: "password too short" }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email: e } });
  if (existing) return NextResponse.json({ error: "email already registered" }, { status: 409 });

  const passwordHash = await bcrypt.hash(String(password), 10);
  await db.user.create({ data: { email: e, passwordHash, name: name ? String(name).trim() : null } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
