"use client";
import { useTranslation } from "react-i18next";
import { useFmt } from "@/hooks/useFmt";
import type { StreakInfo } from "@/lib/streak";

export default function StreakCard({ info }: { info: StreakInfo }) {
  const { t } = useTranslation();
  const { fmtNum } = useFmt();
  return (
    <div className="card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ textAlign: "center", minWidth: 72 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 40, fontWeight: 700, color: info.current > 0 ? "var(--ember)" : "var(--muted)" }}>{fmtNum(info.current)}</div>
        <div className="kicker">{t("streakDays")}</div>
      </div>
      <div style={{ flex: 1 }}>
        {info.current > 0 ? (
          <>
            <div style={{ fontWeight: 600 }}>{t("streakLabel")}</div>
            <div className="muted" style={{ fontSize: 13 }}>{t("streakBest", { n: fmtNum(info.longest) })} · {t("streakConsistency", { pct: fmtNum(info.consistency) })}</div>
          </>
        ) : (
          <div className="muted" style={{ fontSize: 14 }}>{t("streakStart")}</div>
        )}
        <div style={{ height: 6, background: "var(--track)", borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
          <div style={{ height: "100%", width: `${info.consistency}%`, background: "var(--forest)" }} />
        </div>
      </div>
    </div>
  );
}
