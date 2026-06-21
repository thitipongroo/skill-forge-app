import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge middleware built from the DB-free config; the `authorized` callback
// decides access. API routes guard themselves (requireUser), so skip them here.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|sw.js).*)"],
};
