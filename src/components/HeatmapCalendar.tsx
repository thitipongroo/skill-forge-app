"use client";
import { useTranslation } from "react-i18next";
import { useFmt } from "@/hooks/useFmt";
import { todayISO, addDays } from "@/lib/review";
import type { Session } from "@/types";

const SHADES = ["var(--track)", "#a8d5c5", "#5cbfa0", "#2f9d7d", "#1d6b58"];
function bucket(mins: number) {
  if (mins <= 0) return 0;
  if (mins < 15) return 1;
  if (mins < 30) return 2;
  if (mins < 60) return 3;
  return 4;
}

export default function HeatmapCalendar({ sessions }: { sessions: Session[] }) {
  const { t } = useTranslation();
  const { fmtMonth } = useFmt();

  // minutes per day
  const mins: Record<string, number> = {};
  for (const s of sessions) mins[s.date] = (mins[s.date] || 0) + s.minutes;

  // build a Sunday-aligned grid covering ~53 weeks up to today
  const today = todayISO();
  const [ty, tm, td] = today.split("-").map(Number);
  const dow = new Date(ty, tm - 1, td).getDay(); // 0=Sun
  const totalDays = 7 * 52 + dow + 1;
  const dates: string[] = [];
  for (let i = totalDays - 1; i >= 0; i--) dates.push(addDays(today, -i));

  const weeks: string[][] = [];
  for (let i = 0; i < dates.length; i += 7) weeks.push(dates.slice(i, i + 7));

  const cell = 11, gap = 2, W = weeks.length * cell, H = 7 * cell;

  // month label at the column where the month changes (top cell)
  const monthLabels: { x: number; label: string }[] = [];
  let lastMonth = "";
  weeks.forEach((w, wi) => {
    const top = w[0];
    if (!top) return;
    const m = top.slice(0, 7);
    if (m !== lastMonth) { monthLabels.push({ x: wi * cell, label: fmtMonth(top) }); lastMonth = m; }
  });

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="kicker" style={{ marginBottom: 10 }}>{t("heatmapTitle")}</div>
      <div style={{ overflowX: "auto" }}>
        <svg width={W} height={H + 16} role="img" aria-label={t("heatmapTitle")} style={{ display: "block" }}>
          {monthLabels.map((m, i) => (
            <text key={i} x={m.x} y={9} style={{ fontFamily: "var(--mono)", fontSize: 8, fill: "var(--muted)" }}>{m.label}</text>
          ))}
          {weeks.map((w, wi) =>
            w.map((d, di) => {
              if (d > today) return null;
              return (
                <rect key={d} x={wi * cell} y={14 + di * cell} width={cell - gap} height={cell - gap}
                  rx={2} fill={SHADES[bucket(mins[d] || 0)]}>
                  <title>{d}: {Math.round((mins[d] || 0))} min</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 8 }}>
        <span className="muted" style={{ fontSize: 11 }}>{t("heatLess")}</span>
        {SHADES.map((c, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }} />)}
        <span className="muted" style={{ fontSize: 11 }}>{t("heatMore")}</span>
      </div>
    </div>
  );
}
