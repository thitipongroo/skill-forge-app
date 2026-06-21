"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/hooks/useApi";
import { useFmt } from "@/hooks/useFmt";
import type { SubSkill, Session } from "@/types";

export default function Deconstruct({ skillId, subskills, sessions, onChange }: {
  skillId: string; subskills: SubSkill[]; sessions: Session[]; onChange: () => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const { fmtNum } = useFmt();
  const [draft, setDraft] = useState("");
  const [edit, setEdit] = useState<{ id: string | null; text: string }>({ id: null, text: "" });

  // minutes logged per sub-skill, to size the bars
  const mins: Record<string, number> = {};
  for (const s of sessions) if (s.subskillId) mins[s.subskillId] = (mins[s.subskillId] || 0) + s.minutes;
  const maxMin = Math.max(1, ...Object.values(mins));

  const add = async () => {
    if (!draft.trim()) return;
    await apiFetch("/api/subskills", { method: "POST", body: JSON.stringify({ skillId, text: draft }) });
    setDraft(""); await onChange();
  };
  const toggleVital = async (s: SubSkill) => { await apiFetch(`/api/subskills/${s.id}`, { method: "PATCH", body: JSON.stringify({ vital: !s.vital }) }); await onChange(); };
  const saveEdit = async () => {
    if (edit.text.trim()) await apiFetch(`/api/subskills/${edit.id}`, { method: "PATCH", body: JSON.stringify({ text: edit.text.trim() }) });
    setEdit({ id: null, text: "" }); await onChange();
  };
  const remove = async (id: string) => { await apiFetch(`/api/subskills/${id}`, { method: "DELETE" }); await onChange(); };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="kicker">{t("p2Title")}</div>
      <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{t("p2Cap")}</p>

      <div style={{ display: "flex", gap: 8, margin: "10px 0" }}>
        <input className="input" aria-label={t("fSub")} value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder={t("fSubPh")} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className="btn" onClick={add}>{t("add")}</button>
      </div>

      {subskills.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>{t("subEmpty")}</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {[...subskills].map((s) => {
            const m = mins[s.id] || 0;
            const editing = edit.id === s.id;
            return (
              <li key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <button onClick={() => toggleVital(s)} aria-label={s.vital ? "Unmark vital" : "Mark as vital"}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: s.vital ? "var(--gold)" : "var(--muted)" }}>
                  {s.vital ? "★" : "☆"}
                </button>
                {editing ? (
                  <>
                    <input autoFocus className="input" value={edit.text} onChange={(e) => setEdit((p) => ({ ...p, text: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEdit({ id: null, text: "" }); }} />
                    <button className="btn" onClick={saveEdit}>{t("save")}</button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <span>{s.text}</span>
                      {m > 0 && (
                        <div style={{ height: 5, background: "var(--track)", borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(m / maxMin) * 100}%`, background: s.vital ? "var(--gold)" : "var(--forest)" }} />
                        </div>
                      )}
                    </div>
                    {m > 0 && <span className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{fmtNum(m / 60, 1)}{t("unitH")}</span>}
                    <button onClick={() => setEdit({ id: s.id, text: s.text })} aria-label={t("editBtn")} style={iconBtn}>✎</button>
                    <button onClick={() => remove(s.id)} aria-label="remove" style={iconBtn}>✕</button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, padding: 4 };
