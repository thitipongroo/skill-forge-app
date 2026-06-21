"use client";
import { useTranslation } from "react-i18next";
import { useFmt } from "@/hooks/useFmt";
import type { Achievement } from "@/lib/achievements";

export default function Achievements({ list }: { list: Achievement[] }) {
  const { t } = useTranslation();
  const { fmtNum } = useFmt();
  const earned = list.filter((a) => a.earned).length;
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="kicker">{t("achTitle")}</span>
        <span className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{t("achLockedHint", { n: fmtNum(earned), total: fmtNum(list.length) })}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {list.map((a) => (
          <span key={a.id} style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 99,
            fontSize: 12, fontWeight: 600,
            background: a.earned ? "var(--forest)" : "var(--track)",
            color: a.earned ? "#fff" : "var(--muted)", opacity: a.earned ? 1 : 0.75,
          }}>
            <span aria-hidden="true">{a.earned ? "★" : "☆"}</span> {t("ach_" + a.id)}
          </span>
        ))}
      </div>
    </div>
  );
}
