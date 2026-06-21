"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setErr("");
    const res = await fetch("/api/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setBusy(false);
      setErr(body.error === "email already registered" ? t("emailTaken") : t("pwTooShort"));
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    window.location.href = "/dashboard";
  };

  return (
    <div className="container" style={{ maxWidth: 380 }}>
      <div className="kicker">{t("kicker")}</div>
      <h1 style={{ fontFamily: "var(--serif)" }}>{t("createAccount")}</h1>
      <div className="card">
        <input className="input" type="email" aria-label={t("emailLabel")} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" style={{ marginTop: 10 }} type="password" aria-label={t("passwordLabel")} placeholder={t("newPasswordPh")} value={password}
          onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        {err && <p role="alert" style={{ color: "var(--ember)", fontSize: 13 }}>{err}</p>}
        <button className="btn" style={{ width: "100%", marginTop: 12 }} onClick={submit} disabled={busy}>
          {busy ? "…" : t("createAccount")}
        </button>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>
        {t("haveAccount")} <a href="/login" style={{ color: "var(--forest)" }}>{t("signIn")}</a>
      </p>
    </div>
  );
}
