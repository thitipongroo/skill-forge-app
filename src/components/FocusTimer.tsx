"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// Pomodoro focus timer — ported from the artifact, calls onLog(minutes) to
// persist a session through the API.
export default function FocusTimer({ onLog }: { onLog: (minutes: number, what: string) => void }) {
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);
  const [acc, setAcc] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [what, setWhat] = useState("");
  const [target, setTarget] = useState(25);
  const [, tick] = useState(0);
  const audio = useRef<AudioContext | null>(null);
  const chimed = useRef(false);

  const seconds = Math.floor(acc + (running ? (Date.now() - startedAt) / 1000 : 0));
  const reached = target > 0 && seconds >= target * 60;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (reached && running && !chimed.current) { chimed.current = true; chime(); }
  }, [reached, running]);

  const ensureAudio = () => {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audio.current) audio.current = new AC();
      if (audio.current.state === "suspended") void audio.current.resume();
    } catch { /* silent */ }
  };
  const chime = () => {
    const ctx = audio.current; if (!ctx) return;
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + i * 0.18;
      o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
      o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + 0.42);
    });
  };

  const startPause = () => { ensureAudio(); setRunning((r) => { if (r) setAcc((a) => a + (Date.now() - startedAt) / 1000); else setStartedAt(Date.now()); return !r; }); };
  const reset = () => { chimed.current = false; setRunning(false); setAcc(0); };
  const log = () => { onLog(Math.max(1, Math.round(seconds / 60)), what.trim() || t("focusDefault")); chimed.current = false; setRunning(false); setAcc(0); setWhat(""); };
  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="card" style={{ textAlign: "center", marginBottom: 20 }}>
      <div className="kicker">{t("focusTitle")}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 52, margin: "8px 0", color: reached ? "var(--gold)" : "var(--ink)" }}>{mmss}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
        {[15, 25, 50, 0].map((m) => (
          <button key={m} onClick={() => { chimed.current = false; setTarget(m); }}
            className="btn-ghost" aria-pressed={target === m}
            aria-label={m === 0 ? "No target" : `${m} minute target`}
            style={target === m ? { borderColor: "var(--forest)", color: "var(--forest)" } : {}}>
            {m === 0 ? "∞" : m}
          </button>
        ))}
      </div>
      {reached && <div role="status" style={{ color: "var(--gold)", fontFamily: "var(--mono)", fontSize: 12, marginBottom: 8 }}>{t("focusGoalReached")}</div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button className="btn" onClick={startPause}>{running ? t("focusPause") : seconds > 0 ? t("focusResume") : t("focusStart")}</button>
        {seconds > 0 && <button className="btn-ghost" onClick={reset}>{t("focusReset")}</button>}
      </div>
      <input className="input" style={{ marginTop: 12 }} aria-label={t("focusWhatPh")} value={what} onChange={(e) => setWhat(e.target.value)} placeholder={t("focusWhatPh")} />
      {seconds >= 1 && <button className="btn" style={{ width: "100%", marginTop: 10, background: "var(--ember)" }} onClick={log}>{t("focusLog")}</button>}
    </div>
  );
}
