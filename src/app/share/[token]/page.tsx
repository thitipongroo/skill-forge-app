import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { computeStreak } from "@/lib/streak";

export const dynamic = "force-dynamic";

export default async function SharePage({ params }: { params: { token: string } }) {
  const skill = await db.skill.findUnique({
    where: { shareToken: params.token },
    include: { subskills: { orderBy: { order: "asc" } }, sessions: true },
  });
  if (!skill) notFound();

  const totalMinutes = skill.sessions.reduce((a, s) => a + s.minutes, 0);
  const hours = totalMinutes / 60;
  const progress = Math.min(1, hours / (skill.targetHours || 20));
  const streak = computeStreak(skill.sessions.map((s) => s.date));

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div className="kicker">The Practice Ledger · shared progress</div>
      <h1 style={{ fontFamily: "var(--serif)" }}>{skill.name}</h1>
      {skill.why && <p className="muted" style={{ marginTop: -8 }}>{skill.why}</p>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 13, marginBottom: 8 }}>
          <span>{hours.toFixed(1)} / {skill.targetHours} hours</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div style={{ height: 10, background: "var(--track)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: "var(--forest)" }} />
        </div>
        <div className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12, marginTop: 10, display: "flex", gap: 16 }}>
          <span>🔥 {streak.current}-day streak</span>
          <span>{skill.sessions.length} sessions</span>
        </div>
      </div>

      {skill.subskills.length > 0 && (
        <div className="card">
          <div className="kicker" style={{ marginBottom: 8 }}>Working on</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {skill.subskills.map((s) => (
              <li key={s.id} style={{ marginBottom: 4 }}>{s.vital ? "★ " : ""}{s.text}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="muted" style={{ fontSize: 12, marginTop: 20 }}>A read-only snapshot. Build your own at the Practice Ledger.</p>
    </div>
  );
}
