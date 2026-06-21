import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { buildCoachPrompt, parseCoachResponse } from "@/lib/ai";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// AI coach: turns a skill into a starter breakdown (sub-skills + review topics +
// a first-session tip) via the Anthropic API. Requires ANTHROPIC_API_KEY.
export async function POST(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;

  const { name, why } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "ai_unconfigured" }, { status: 503 });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: buildCoachPrompt({ name: String(name), why: why ? String(why) : undefined }) }],
      }),
    });
    if (!res.ok) {
      logger.warn("ai_upstream_error", { status: res.status });
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
    const data = await res.json();
    const text = (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n");
    return NextResponse.json(parseCoachResponse(text));
  } catch (e) {
    logger.error("ai_coach_error", { err: (e as Error).message });
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
