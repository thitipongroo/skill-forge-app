"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFmt } from "@/hooks/useFmt";
import { todayISO, addDays } from "@/lib/review";
import type { Session } from "@/types";

export default function ActivityChart({ sessions }: { sessions: Session[] }) {
  const { t } = useTranslation();
  const { fmtNum, fmtWeekday } = useFmt();
  const [range, setRange] = useState(14);

  if (sessions.length === 0) {
    return <div className="card" style={{ marginBottom: 20 }}><p className="muted" style={{ fontSize: 13 }}>{t("chartEmpty")}</p></div>;
  }

  // bucket minutes per day for the last `range` days
  const today = todayISO();
  const days: { date: string; mins: number }[] = [];
  for (let i = range - 1; i >= 0; i--) days.push({ date: addDays(today, -i), mins: 0 });
  const idx: Record<string, number> = {};
  days.forEach((d, i) => (idx[d.date] = i));
  for (const s of sessions) if (idx[s.date] !== undefined) days[idx[s.date]].mins += s.minutes;
  const max = Math.max(1, ...days.map((d) => d.mins));

  const W = 100, gap = 1.5, bw = (W - gap * (days.length - 1)) / days.length;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span className="kicker">{t("chartTitle", { days: fmtNum(range) })}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {[14, 30, 90].map((r) => (
            <button key={r} onClick={() => setRange(r)} className="btn-ghost"
              style={{ padding: "5px 10px", fontSize: 12, ...(range === r ? { borderColor: "var(--forest)", color: "var(--forest)" } : {}) }}>
              {fmtNum(r)}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} 34`} width="100%" preserveAspectRatio="none" role="img" aria-label={`${t("chartTitle", { days: fmtNum(range) })}: ${fmtNum(days.reduce((a, d) => a + d.mins, 0) / 60, 1)} ${t("unitH")}`} style={{ display: "block" }}>
        {days.map((d, i) => {
          const h = (d.mins / max) * 30;
          return <rect key={d.date} x={i * (bw + gap)} y={32 - h} width={bw} height={Math.max(d.mins > 0 ? 1 : 0, h)}
            rx={0.6} fill={d.mins > 0 ? "var(--forest)" : "var(--track)"} />;
        })}
      </svg>
      <div className="muted" style={{ fontFamily: "var(--mono)", fontSize: 11, marginTop: 6, textAlign: "right" }}>
        {fmtNum(days.reduce((a, d) => a + d.mins, 0) / 60, 1)} {t("unitH")}
      </div>
    </div>
  );
}
