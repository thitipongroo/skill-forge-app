"use client";
import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./config";
import type { Lang } from "@/types";

export default function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  // Set the language synchronously on first render (resources are bundled, so
  // this is immediate) to avoid a flash of the fallback language.
  if (i18n.language !== lang) void i18n.changeLanguage(lang);
  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
  }, [lang]);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

// Pull structured locale data (principles/stages) out of i18next.
export function getList<T = unknown>(key: "principles" | "stages"): T[] {
  return (i18n.getResource(i18n.language, "translation", key) as T[]) ?? [];
}
