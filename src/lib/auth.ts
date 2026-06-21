import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "./db";

// Resolve the signed-in user from the Auth.js session (JWT cookie), or null.
export async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.user.findUnique({ where: { id: session.user.id } });
}

// Returns the user, or a 401 NextResponse to return directly. Usage:
//   const user = await requireUser();
//   if (user instanceof NextResponse) return user;
export async function requireUser() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return user;
}
