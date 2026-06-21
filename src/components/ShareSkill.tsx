"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/hooks/useApi";

// Social accountability: a public, read-only progress link for a skill.
export default function ShareSkill({ skillId, initialToken }: { skillId: string; initialToken?: string | null }) {
  const { t } = useTranslation();
  const [token, setToken] = useState<string | null>(initialToken ?? null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = token && typeof window !== "undefined" ? `${window.location.origin}/share/${token}` : "";

  const toggle = async (enabled: boolean) => {
    setBusy(true);
    try {
      const r = await apiFetch("/api/share", { method: "POST", body: JSON.stringify({ skillId, enabled }) });
      setToken(r.shareToken);
    } finally { setBusy(false); }
  };
  const copy = async () => {
    if (!url) return;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="kicker">{t("shareTitle")}</div>
      <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{t("shareNote")}</p>
      {token ? (
        <>
          <input className="input" readOnly value={url} aria-label={t("shareTitle")} style={{ marginTop: 8 }}
            onFocus={(e) => e.currentTarget.select()} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn" onClick={copy}>{copied ? t("shareCopied") : t("shareCopy")}</button>
            <button className="btn-ghost" onClick={() => toggle(false)} disabled={busy}>{t("shareDisable")}</button>
          </div>
        </>
      ) : (
        <button className="btn" style={{ marginTop: 8 }} onClick={() => toggle(true)} disabled={busy}>{t("shareEnable")}</button>
      )}
    </div>
  );
}
