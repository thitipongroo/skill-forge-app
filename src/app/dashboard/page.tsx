"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePrefs } from "@/app/providers";
import { useSnapshot } from "@/hooks/useSnapshot";
import { useFmt } from "@/hooks/useFmt";
import { apiFetch } from "@/hooks/useApi";
import { todayISO, addDays } from "@/lib/review";
import { computeStreak } from "@/lib/streak";
import { computeAchievements } from "@/lib/achievements";
import SkillCard from "@/components/SkillCard";
import StreakCard from "@/components/StreakCard";
import Achievements from "@/components/Achievements";

function WeeklyGoal({ activeDays }: { activeDays: number }) {
  const { t } = useTranslation();
  const { fmtNum } = useFmt();
  const { weeklyGoal, setPrefs } = usePrefs();
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span className="kicker">{t("goalLabel")}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 3, 4, 5, 6, 7].map((g) => (
            <button key={g} className="btn-ghost" onClick={() => setPrefs({ weeklyGoal: g })}
              style={{ padding: "5px 10px", fontSize: 12, ...(weeklyGoal === g ? { borderColor: "var(--forest)", color: "var(--forest)" } : {}) }}>
              {g === 0 ? t("goalOff") : fmtNum(g)}
            </button>
          ))}
        </div>
      </div>
      {weeklyGoal > 0 && (
        <>
          <div style={{ height: 7, background: "var(--track)", borderRadius: 99, overflow: "hidden", marginTop: 12 }}>
            <div style={{ height: "100%", width: `${Math.min(100, (activeDays / weeklyGoal) * 100)}%`, background: activeDays >= weeklyGoal ? "var(--gold)" : "var(--forest)" }} />
          </div>
          <div className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12, marginTop: 8 }}>
            {activeDays >= weeklyGoal ? t("goalMet") : t("goalProgress", { count: fmtNum(activeDays), total: fmtNum(weeklyGoal) })}
          </div>
        </>
      )}
    </div>
  );
}

function Onboarding({ onSample }: { onSample: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="card" style={{ marginBottom: 20, borderColor: "var(--forest)" }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 600 }}>{t("onbTitle")}</div>
      <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>{t("onbBody")}</p>
      <button className="btn-ghost" style={{ marginTop: 8 }} onClick={onSample}>{t("onbSample")}</button>
    </div>
  );
}

function DashboardInner() {
  const { t } = useTranslation();
  const { data, loading, refresh } = useSnapshot();
  const [name, setName] = useState("");

  const createSkill = async (n: string, why = "") => {
    if (!n.trim()) return;
    await apiFetch("/api/skills", { method: "POST", body: JSON.stringify({ name: n, why }) });
    setName(""); await refresh();
  };

  const skills = data?.skills ?? [];
  const allSessions = skills.flatMap((s) => s.sessions);
  const allDates = allSessions.map((x) => x.date);
  const streak = computeStreak(allDates);
  const totalMinutes = allSessions.reduce((a, s) => a + s.minutes, 0);
  const reviewsStarted = skills.flatMap((s) => s.reviews).filter((r) => r.box > 0).length;
  const targetReached = skills.some((s) => s.sessions.reduce((a, x) => a + x.minutes, 0) / 60 >= (s.targetHours || 20));
  const achievements = computeAchievements({
    totalMinutes, sessionCount: allSessions.length, currentStreak: streak.current, reviewsStarted, targetReached,
  });

  const since = addDays(todayISO(), -6);
  const activeDays = new Set(allSessions.filter((x) => x.date >= since).map((x) => x.date)).size;

  return (
    <div className="container">
      <div className="kicker">{t("kicker")}</div>
      <h1 style={{ fontFamily: "var(--serif)" }}>{t("p1Title")}</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <input className="input" aria-label={t("fSkillPh")} value={name} onChange={(e) => setName(e.target.value)}
          placeholder={t("fSkillPh")} onKeyDown={(e) => e.key === "Enter" && createSkill(name)} />
        <button className="btn" style={{ marginTop: 10 }} onClick={() => createSkill(name)}>{t("add")}</button>
      </div>

      {loading && <p className="muted">{t("loading")}</p>}

      {!loading && skills.length === 0 && (
        <Onboarding onSample={() => createSkill(t("sampleSkillName"), t("sampleSkillWhy"))} />
      )}

      {skills.length > 0 && (
        <>
          <StreakCard info={streak} />
          <Achievements list={achievements} />
          <WeeklyGoal activeDays={activeDays} />
        </>
      )}

      {skills.map((s) => (
        <SkillCard key={s.id} skill={{ id: s.id, name: s.name, targetHours: s.targetHours, sessions: s.sessions }} />
      ))}

      <p style={{ marginTop: 24 }}>
        <a className="muted" href="/settings" style={{ fontFamily: "var(--mono)", fontSize: 13 }}>⚙ {t("settings")} →</a>
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardInner />;
}
