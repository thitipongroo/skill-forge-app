// Locale-aware formatters, ported 1:1 from the artifact's useI18n hook.
import type { Lang } from "@/types";

const tag = (lang: Lang) => (lang === "th" ? "th-TH" : "en-US");
const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
};

export function makeFormatters(lang: Lang) {
  const dateFmt = new Intl.DateTimeFormat(lang === "th" ? "th-TH-u-ca-buddhist" : tag(lang), {
    day: "numeric", month: "short", year: "numeric",
  });
  const wd = new Intl.DateTimeFormat(tag(lang), { weekday: "narrow" });
  const mo = new Intl.DateTimeFormat(tag(lang), { month: "short" });
  return {
    fmtDate: (iso: string) => { const d = parseISO(iso); return d ? dateFmt.format(d) : iso; },
    fmtNum: (n: number, decimals = 0) =>
      new Intl.NumberFormat(tag(lang), { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n || 0),
    fmtWeekday: (iso: string) => { const d = parseISO(iso); return d ? wd.format(d) : ""; },
    fmtMonth: (iso: string) => { const d = parseISO(iso); return d ? mo.format(d) : ""; },
  };
}
