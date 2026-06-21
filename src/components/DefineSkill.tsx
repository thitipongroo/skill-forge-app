"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/hooks/useApi";
import type { Skill } from "@/types";

export default function DefineSkill({ skill, onChange }: { skill: Skill; onChange: () => Promise<void> | void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: skill.name, why: skill.why, target: skill.target, targetHours: String(skill.targetHours),
  });
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await apiFetch(`/api/skills/${skill.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: form.name.trim() || skill.name,
        why: form.why,
        target: form.target,
        targetHours: Math.max(1, Number(form.targetHours) || skill.targetHours),
      }),
    });
    setSaved(true); setTimeout(() => setSaved(false), 1500);
    await onChange();
  };
  const remove = async () => {
    if (!confirm(t("confirmDelete"))) return;
    await apiFetch(`/api/skills/${skill.id}`, { method: "DELETE" });
    window.location.href = "/dashboard";
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t("p1Title")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", width: "100%", textAlign: "left" }}>
        <div className="kicker">{t("p1Title")} {open ? "▾" : "▸"}</div>
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>{t("p1Cap")}</p>

          <label className="muted" style={lab}>{t("fSkill")}</label>
          <input className="input" aria-label={t("fSkill")} value={form.name} onChange={set("name")} placeholder={t("fSkillPh")} />

          <label className="muted" style={lab}>{t("fWhy")}</label>
          <input className="input" aria-label={t("fWhy")} value={form.why} onChange={set("why")} placeholder={t("fWhyPh")} />

          <label className="muted" style={lab}>{t("fGood")}</label>
          <input className="input" aria-label={t("fGood")} value={form.target} onChange={set("target")} placeholder={t("fGoodPh")} />

          <label className="muted" style={lab}>{t("fHours")}</label>
          <input className="input" type="number" min="1" aria-label={t("fHours")} value={form.targetHours} onChange={set("targetHours")} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <button onClick={remove} style={{ background: "none", border: "none", color: "var(--ember)", cursor: "pointer", fontSize: 13 }}>{t("deleteSkill")}</button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {saved && <span className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--forest)" }}>{t("defineSaved")} ✓</span>}
              <button className="btn" onClick={save}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lab: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, margin: "12px 0 4px" };
