"use client";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/hooks/useApi";
import { useFmt } from "@/hooks/useFmt";
import { todayISO } from "@/lib/review";
import MasteryArc from "@/components/MasteryArc";
import FocusTimer from "@/components/FocusTimer";
import DefineSkill from "@/components/DefineSkill";
import AICoach from "@/components/AICoach";
import Deconstruct from "@/components/Deconstruct";
import Principles from "@/components/Principles";
import ReviewQueue from "@/components/ReviewQueue";
import ActivityChart from "@/components/ActivityChart";
import HeatmapCalendar from "@/components/HeatmapCalendar";
import SessionLog from "@/components/SessionLog";
import ShareSkill from "@/components/ShareSkill";
import type { Skill } from "@/types";

function Ledger({ id }: { id: string }) {
  const { t } = useTranslation();
  const { fmtNum } = useFmt();
  const [skill, setSkill] = useState<Skill | null>(null);

  const load = useCallback(async () => setSkill(await apiFetch(`/api/skills/${id}`)), [id]);
  useEffect(() => { void load(); }, [load]);

  const logSession = async (minutes: number, what: string) => {
    await apiFetch("/api/sessions", { method: "POST", body: JSON.stringify({ skillId: id, date: todayISO(), minutes, what }) });
    await load();
  };

  if (!skill) return <div className="container"><p className="muted">{t("loading")}</p></div>;

  const totalHours = skill.sessions.reduce((a, s) => a + s.minutes, 0) / 60;
  const progress = Math.min(1, totalHours / (skill.targetHours || 20));
  const celebrate = totalHours >= (skill.targetHours || 20) && !skill.celebrated;

  const dismiss = async () => { await apiFetch(`/api/skills/${id}`, { method: "PATCH", body: JSON.stringify({ celebrated: true }) }); await load(); };
  const raise = async () => { await apiFetch(`/api/skills/${id}`, { method: "PATCH", body: JSON.stringify({ celebrated: true, targetHours: Math.round((skill.targetHours || 20) * 2) }) }); await load(); };

  return (
    <div className="container">
      <a className="muted" href="/dashboard" style={{ fontFamily: "var(--mono)", fontSize: 13 }}>← {t("kicker")}</a>
      <h1 style={{ fontFamily: "var(--serif)" }}>{skill.name}</h1>
      {skill.why && <p className="muted" style={{ marginTop: -8 }}>{skill.why}</p>}

      <div style={{ textAlign: "center" }}>
        <MasteryArc progress={progress} />
        <div className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
          {fmtNum(totalHours, 1)} / {fmtNum(skill.targetHours)} {t("unitH")}
        </div>
      </div>

      <FocusTimer onLog={logSession} />
      <DefineSkill skill={skill} onChange={load} />
      <AICoach skillId={id} name={skill.name} why={skill.why} onChange={load} />
      <Deconstruct skillId={id} subskills={skill.subskills} sessions={skill.sessions} onChange={load} />
      <Principles skillId={id} notes={skill.principles} onChange={load} />
      <ReviewQueue skillId={id} reviews={skill.reviews} onChange={load} />
      <ActivityChart sessions={skill.sessions} />
      <HeatmapCalendar sessions={skill.sessions} />
      <SessionLog sessions={skill.sessions} onChange={load} />
      <ShareSkill skillId={id} initialToken={skill.shareToken} />

      {celebrate && (
        <div style={overlay} role="dialog" aria-modal="true" aria-label={t("celebTitle")}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className="confettiPiece" style={{
                left: `${(i * 3.4) % 100}%`,
                background: ["#1d6b58", "#cf9b3a", "#e0682f", "#3b8ea5", "#7d5ba6"][i % 5],
                animationDelay: `${(i % 7) * 0.18}s`,
                animationDuration: `${2.4 + (i % 5) * 0.4}s`,
              } as React.CSSProperties} />
            ))}
          </div>
          <div className="card" style={{ position: "relative", textAlign: "center", maxWidth: 380 }}>
            <div style={{ fontSize: 38, color: "var(--gold)" }}>✦</div>
            <h3 style={{ fontFamily: "var(--serif)", margin: "6px 0" }}>{t("celebTitle")}</h3>
            <p className="muted">{t("celebBody", { hours: fmtNum(totalHours, 1), skill: skill.name })}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
              <button className="btn-ghost" onClick={dismiss}>{t("celebKeep")}</button>
              <button className="btn" onClick={raise}>{t("celebRaise")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50,
};

export default function SkillPage({ params }: { params: { id: string } }) {
  return <Ledger id={params.id} />;
}
