import type { Metadata, Viewport } from "next";
import "./globals.css";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import AppProviders from "./providers";
import RegisterSW from "./register-sw";
import type { Lang, Theme } from "@/types";

export const metadata: Metadata = {
  title: "The Practice Ledger",
  description: "Learn any skill — plan, practise, review, and track across devices.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Practice Ledger", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#1d6b58",
  width: "device-width",
  initialScale: 1,
};

// Server component: resolve the user's saved prefs and bake lang/theme into the
// first HTML response, so there's no language/theme flash on load.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  let lang: Lang = "en", theme: Theme = "light", weeklyGoal = 0, email = "", remindersOptIn = true;
  if (session?.user?.id) {
    const u = await db.user.findUnique({
      where: { id: session.user.id },
      select: { lang: true, theme: true, weeklyGoal: true, email: true, remindersOptIn: true },
    });
    if (u) { lang = u.lang as Lang; theme = u.theme as Theme; weeklyGoal = u.weeklyGoal; email = u.email; remindersOptIn = u.remindersOptIn; }
  }
  return (
    <html lang={lang} data-theme={theme}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <AppProviders initialLang={lang} initialTheme={theme} initialWeeklyGoal={weeklyGoal} initialRemindersOptIn={remindersOptIn} email={email}>
          <main id="main">{children}</main>
        </AppProviders>
        <RegisterSW />
      </body>
    </html>
  );
}
