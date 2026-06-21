"use client";
import { useTranslation } from "react-i18next";
import { getList } from "@/i18n/I18nProvider";

interface Stage { at: number; label: string; }

// Semicircular mastery gauge — ported from the artifact's header arc.
export default function MasteryArc({ progress }: { progress: number }) {
  const { t } = useTranslation();
  const stages = getList<Stage>("stages");
  let stage = stages[0];
  for (const s of stages) if (progress >= s.at) stage = s;

  const W = 320, H = 176, cx = W / 2, cy = 158, r = 132;
  const polar = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
  };
  const start = polar(180), end = polar(180 - 180 * progress);
  const bg = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${polar(0).x} ${polar(0).y}`;
  const fg = `M ${start.x} ${start.y} A ${r} ${r} 0 ${progress > 0.5 ? 1 : 0} 1 ${end.x} ${end.y}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 360 }} role="img"
      aria-label={`${Math.round(progress * 100)}% — ${stage?.label ?? ""}`}>
      <defs>
        <linearGradient id="arc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7fd3b8" /><stop offset="60%" stopColor="#e7b24a" /><stop offset="100%" stopColor="#e0682f" />
        </linearGradient>
      </defs>
      <path d={bg} fill="none" stroke="var(--track)" strokeWidth="14" strokeLinecap="round" />
      <path d={fg} fill="none" stroke="url(#arc)" strokeWidth="14" strokeLinecap="round" />
      <text x={cx} y={cy - 44} textAnchor="middle" style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 34, fill: "var(--ink)" }}>
        {Math.round(progress * 100)}%
      </text>
      <text x={cx} y={cy - 18} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 12, fill: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
        {stage?.label ?? t("skillPlaceholder")}
      </text>
    </svg>
  );
}
