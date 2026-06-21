"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/hooks/useApi";
import { useFmt } from "@/hooks/useFmt";
import type { Session } from "@/types";

type Edit = { id: string | null; date: string; minutes: string; what: string; reflection: string };
const EMPTY: Edit = { id: null, date: "", minutes: "", what: "", reflection: "" };

export default function SessionLog({ sessions, onChange }: { sessions: Session[]; onChange: () => Promise<void> | void }) {
  const { t } = useTranslation();
  const { fmtDate } = useFmt();
  const [edit, setEdit] = useState<Edit>(EMPTY);

  const ordered = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  const save = async () => {
    if (edit.what.trim() && Number(edit.minutes)) {
      await apiFetch(`/api/sessions/${edit.id}`, { method: "PATCH", body: JSON.stringify({ date: edit.date, minutes: Number(edit.minutes), what: edit.what.trim(), reflection: edit.reflection.trim() }) });
    }
    setEdit(EMPTY); await onChange();
  };
  const remove = async (id: string) => { await apiFetch(`/api/sessions/${id}`, { method: "DELETE" }); await onChange(); };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="kicker">{t("p4Title")}</div>
      {ordered.length === 0 ? (
        <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>{t("sessEmpty")}</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
          {ordered.map((s) => (
            <li key={s.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
              {edit.id === s.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="date" className="input" value={edit.date} onChange={(e) => setEdit((p) => ({ ...p, date: e.target.value }))} />
                    <input type="number" min="1" className="input" value={edit.minutes} onChange={(e) => setEdit((p) => ({ ...p, minutes: e.target.value }))} />
                  </div>
                  <input className="input" value={edit.what} onChange={(e) => setEdit((p) => ({ ...p, what: e.target.value }))} placeholder={t("fWhatPh")} />
                  <input className="input" value={edit.reflection} onChange={(e) => setEdit((p) => ({ ...p, reflection: e.target.value }))} placeholder={t("fNoticedPh")} />
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button className="btn-ghost" onClick={() => setEdit(EMPTY)}>{t("cancel")}</button>
                    <button className="btn" onClick={save}>{t("save")}</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 92 }}>
                    <div className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{fmtDate(s.date)}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--forest)" }}>{s.minutes}{t("unitMin")}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div>{s.what}</div>
                    {s.reflection && <div className="muted" style={{ fontSize: 13, fontStyle: "italic", marginTop: 2 }}>“{s.reflection}”</div>}
                  </div>
                  <button onClick={() => setEdit({ id: s.id, date: s.date, minutes: String(s.minutes), what: s.what, reflection: s.reflection || "" })} style={iconBtn} aria-label={t("editBtn")}>✎</button>
                  <button onClick={() => remove(s.id)} style={iconBtn} aria-label="remove">✕</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, padding: 4 };
