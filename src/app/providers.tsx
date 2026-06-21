"use client";
import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from "react";
import I18nProvider from "@/i18n/I18nProvider";
import { apiFetch } from "@/hooks/useApi";
import type { Lang, Theme, UserPrefs } from "@/types";

interface PrefsCtx extends UserPrefs {
  email: string;
  setPrefs: (p: Partial<UserPrefs>) => Promise<void>;
}
const Ctx = createContext<PrefsCtx | null>(null);
export const usePrefs = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePrefs must be used inside <AppProviders>");
  return c;
};

// Initial prefs come from the server (layout), so language and theme are correct
// on the very first paint — no flash. setPrefs persists changes via /api/sync.
export default function AppProviders({
  initialLang, initialTheme, initialWeeklyGoal, initialRemindersOptIn, email, children,
}: {
  initialLang: Lang; initialTheme: Theme; initialWeeklyGoal: number; initialRemindersOptIn: boolean; email: string; children: ReactNode;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [weeklyGoal, setWeeklyGoal] = useState(initialWeeklyGoal);
  const [remindersOptIn, setRemindersOptIn] = useState(initialRemindersOptIn);

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  const setPrefs = useCallback(async (p: Partial<UserPrefs>) => {
    if (p.lang !== undefined) setLang(p.lang);
    if (p.theme !== undefined) setTheme(p.theme);
    if (p.weeklyGoal !== undefined) setWeeklyGoal(p.weeklyGoal);
    if (p.remindersOptIn !== undefined) setRemindersOptIn(p.remindersOptIn);
    await apiFetch("/api/sync", { method: "PATCH", body: JSON.stringify(p) });
  }, []);

  return (
    <Ctx.Provider value={{ lang, theme, weeklyGoal, remindersOptIn, email, setPrefs }}>
      <I18nProvider lang={lang}>{children}</I18nProvider>
    </Ctx.Provider>
  );
}
