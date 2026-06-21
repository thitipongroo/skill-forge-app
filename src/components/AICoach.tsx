"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/hooks/useApi";

// One-tap onboarding accelerator: asks the AI coach to break a skill down and
// writes the suggested sub-skills + review topics straight into the ledger.
export default function AICoach({ skillId, name, why, onChange }: {
  skillId: string; name: string; why: string; onChange: () => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [tip, setTip] = useState("");

  const run = async () => {
    setBusy(true); setMsg(""); setTip("");
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, why }),
      });
      if (res.status === 503) { setMsg(t("aiUnconfigured")); return; }
      if (!res.ok) { setMsg(t("aiUnavailable")); return; }
      const data = await res.json();
      for (const text of data.subskills ?? []) await apiFetch("/api/subskills", { method: "POST", body: JSON.stringify({ skillId, text }) });
      for (const topic of data.reviews ?? []) await apiFetch("/api/reviews", { method: "POST", body: JSON.stringify({ skillId, topic }) });
      setTip(data.tip ?? "");
      setMsg(t("aiAdded", { subs: (data.subskills ?? []).length, revs: (data.reviews ?? []).length }));
      await onChange();
    } catch { setMsg(t("aiUnavailable")); }
    finally { setBusy(false); }
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <button className="btn" onClick={run} disabled={busy} aria-busy={busy}>
        {busy ? t("aiThinking") : `✦ ${t("aiSuggest")}`}
      </button>
      {msg && <p role="status" className="muted" style={{ fontSize: 13, marginTop: 8 }}>{msg}</p>}
      {tip && <p style={{ fontSize: 13, marginTop: 6 }}><strong>{t("aiTip")}:</strong> {tip}</p>}
    </div>
  );
}
