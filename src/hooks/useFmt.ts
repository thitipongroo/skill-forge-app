"use client";
import { useTranslation } from "react-i18next";
import { makeFormatters } from "@/i18n/format";
import type { Lang } from "@/types";

// Locale-aware date/number formatters bound to the active language.
export function useFmt() {
  const { i18n } = useTranslation();
  return makeFormatters((i18n.language as Lang) || "en");
}
