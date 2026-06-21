"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { signOut } from "next-auth/react";
import { usePrefs } from "@/app/providers";
import { apiFetch } from "@/hooks/useApi";
import { enablePush } from "@/lib/push-client";
import type { Lang, Theme } from "@/types";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { lang, theme, email, remindersOptIn, setPrefs } = usePrefs();
  const [pushMsg, setPushMsg] = useState("");

  const [name, setName] = useState("");
  const [nameMsg, setNameMsg] = useState("");
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [dataMsg, setDataMsg] = useState("");

  useEffect(() => { apiFetch("/api/account").then((d) => setName(d?.name ?? "")).catch(() => { }); }, []);

  const saveName = async () => {
    setNameMsg("");
    await apiFetch("/api/account", { method: "PATCH", body: JSON.stringify({ name }) });
    setNameMsg(t("pwUpdated") + " ✓");
  };
  const changePw = async () => {
    setPwMsg("");
    const res = await fetch("/api/account/password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
    });
    if (res.ok) { setPwMsg("✓ " + t("pwUpdated")); setCurPw(""); setNewPw(""); }
    else if (res.status === 403) setPwMsg(t("pwWrong"));
    else if (res.status === 429) setPwMsg(t("tooMany"));
    else setPwMsg(t("pwTooShort"));
  };
  const exportData = async () => {
    const data = await apiFetch("/api/export");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "practice-ledger-export.json";
    a.click(); URL.revokeObjectURL(url);
  };
  const importData = async (file: File) => {
    setDataMsg("");
    try {
      const parsed = JSON.parse(await file.text());
      const res = await apiFetch("/api/import", { method: "POST", body: JSON.stringify(parsed) });
      setDataMsg(t("imported", { count: res.imported }));
    } catch { setDataMsg(t("importFailed")); }
  };
  const deleteAccount = async () => {
    if (!confirm(t("confirmDeleteAccount"))) return;
    await apiFetch("/api/account", { method: "DELETE" });
    signOut({ callbackUrl: "/login" });
  };
  const turnOnPush = async () => setPushMsg((await enablePush()) ? "✓" : "✕");

  return (
    <div className="container">
      <a className="muted" href="/dashboard" style={{ fontFamily: "var(--mono)", fontSize: 13 }}>← {t("kicker")}</a>
      <h1 style={{ fontFamily: "var(--serif)" }}>{t("settings")}</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="kicker">{t("secLanguage")}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {(["th", "en"] as Lang[]).map((l) => (
            <button key={l} className="btn-ghost" onClick={() => setPrefs({ lang: l })}
              style={lang === l ? { borderColor: "var(--forest)", color: "var(--forest)" } : {}}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="kicker">{t("secTheme")}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {(["light", "dark"] as Theme[]).map((tm) => (
            <button key={tm} className="btn-ghost" onClick={() => setPrefs({ theme: tm })}
              style={theme === tm ? { borderColor: "var(--forest)", color: "var(--forest)" } : {}}>
              {tm === "light" ? `☀ ${t("themeLight")}` : `☾ ${t("themeDark")}`}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="kicker">{t("secProfile")}</div>
        <p className="muted" style={{ fontSize: 13, margin: "8px 0 4px" }}>{email}</p>
        <input className="input" aria-label={t("displayName")} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("displayName")} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <button className="btn" onClick={saveName}>{t("save")}</button>
          {nameMsg && <span role="status" style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--forest)" }}>{nameMsg}</span>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="kicker">{t("secPassword")}</div>
        <input className="input" style={{ marginTop: 8 }} type="password" aria-label={t("currentPassword")} value={curPw} onChange={(e) => setCurPw(e.target.value)} placeholder={t("currentPassword")} />
        <input className="input" style={{ marginTop: 8 }} type="password" aria-label={t("newPassword")} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder={t("newPasswordPh")} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <button className="btn" onClick={changePw}>{t("updatePassword")}</button>
          {pwMsg && <span role="status" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{pwMsg}</span>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="kicker">{t("secReminders")}</div>
        <button className="btn" style={{ marginTop: 8 }} onClick={turnOnPush}>{t("enableNotif")} {pushMsg}</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <span style={{ fontSize: 14 }}>{t("remindersDaily")}</span>
          <button className="btn-ghost" aria-pressed={remindersOptIn} onClick={() => setPrefs({ remindersOptIn: !remindersOptIn })}
            style={remindersOptIn ? { borderColor: "var(--forest)", color: "var(--forest)" } : {}}>
            {remindersOptIn ? t("optOn") : t("optOff")}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="kicker">{t("secData")}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button className="btn-ghost" onClick={exportData}>{t("exportJson")}</button>
          <label className="btn-ghost" style={{ cursor: "pointer" }}>
            {t("importLabel")}
            <input type="file" accept="application/json" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = ""; }} />
          </label>
        </div>
        {dataMsg && <p role="status" className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12, marginTop: 8 }}>{dataMsg}</p>}
      </div>

      <div className="card">
        <div className="kicker">{t("secAccount")}</div>
        <p className="muted" style={{ fontSize: 13, margin: "8px 0" }}>{t("syncNote")}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn-ghost" onClick={() => signOut({ callbackUrl: "/login" })}>{t("signOut")}</button>
          <button className="btn-ghost" style={{ color: "var(--ember)", borderColor: "var(--ember)" }} onClick={deleteAccount}>{t("deleteAccount")}</button>
        </div>
      </div>
    </div>
  );
}
