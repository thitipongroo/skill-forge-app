import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Prisma / bcrypt) so it can power the middleware.
// The Credentials provider with its DB lookup is added in auth.ts (Node only).
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    // Used by the middleware to gate every page route.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const p = nextUrl.pathname;
      const isAuthPage = p === "/login" || p === "/register";
      if (p.startsWith("/share/")) return true; // public read-only progress links
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }
      return isLoggedIn; // false -> redirect to signIn page
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
