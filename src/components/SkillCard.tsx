"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface SkillSummary { id: string; name: string; targetHours: number; sessions: { minutes: number }[]; }

export default function SkillCard({ skill }: { skill: SkillSummary }) {
  const { t } = useTranslation();
  const mins = skill.sessions.reduce((a, s) => a + (s.minutes || 0), 0);
  const hours = mins / 60;
  const pct = Math.min(100, (hours / (skill.targetHours || 20)) * 100);
  return (
    <Link href={`/skill/${skill.id}`} className="card" style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: 19, fontWeight: 600 }}>{skill.name}</div>
      <div className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12, margin: "6px 0 8px" }}>
        {hours.toFixed(1)} / {skill.targetHours} {t("unitH")}
      </div>
      <div style={{ height: 6, background: "var(--track)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--forest)" }} />
      </div>
    </Link>
  );
}
