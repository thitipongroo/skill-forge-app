import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Lightweight liveness probe for containers / uptime checks.
export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}
