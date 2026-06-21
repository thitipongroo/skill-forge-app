import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownsSkill } from "@/lib/owns";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await requireUser(); if (user instanceof NextResponse) return user;
  const { skillId, enabled } = await req.json();
  if (!(await ownsSkill(user.id, skillId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const shareToken = enabled ? randomBytes(12).toString("base64url") : null;
  const skill = await db.skill.update({ where: { id: skillId }, data: { shareToken } });
  return NextResponse.json({ shareToken: skill.shareToken });
}
