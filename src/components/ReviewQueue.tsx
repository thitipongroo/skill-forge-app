"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/hooks/useApi";
import { useFmt } from "@/hooks/useFmt";
import { REVIEW_STEPS, todayISO } from "@/lib/review";
import type { Review } from "@/types";

export default function ReviewQueue({ skillId, reviews, onChange }: {
  skillId: string; reviews: Review[]; onChange: () => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const { fmtDate } = useFmt();
  const [draft, setDraft] = useState("");
  const [edit, setEdit] = useState<{ id: string | null; text: string }>({ id: null, text: "" });

  const today = todayISO();
  const due = reviews.filter((r) => r.due <= today);
  const later = reviews.filter((r) => r.due > today).sort((a, b) => a.due.localeCompare(b.due));

  const add = async () => {
    if (!draft.trim()) return;
    await apiFetch("/api/reviews", { method: "POST", body: JSON.stringify({ skillId, topic: draft }) });
    setDraft(""); await onChange();
  };
  const act = async (id: string, action: "got" | "again") => { await apiFetch(`/api/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ action }) }); await onChange(); };
  const saveEdit = async () => {
    if (edit.text.trim()) await apiFetch(`/api/reviews/${edit.id}`, { method: "PATCH", body: JSON.stringify({ topic: edit.text.trim() }) });
    setEdit({ id: null, text: "" }); await onChange();
  };
  const remove = async (id: string) => { await apiFetch(`/api/reviews/${id}`, { method: "DELETE" }); await onChange(); };

  const editRow = (r: Review) => (
    <>
      <input autoFocus className="input" value={edit.text} onChange={(e) => setEdit((p) => ({ ...p, text: e.target.value }))}
        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEdit({ id: null, text: "" }); }} />
      <button className="btn" onClick={saveEdit}>{t("save")}</button>
    </>
  );

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="kicker">{t("p5Title") || "Schedule spaced reviews"}</div>
      <div style={{ display: "flex", gap: 8, margin: "10px 0" }}>
        <input className="input" aria-label={t("reviewAdd")} value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder={t("reviewAddPh")} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className="btn" onClick={add}>{t("add")}</button>
      </div>

      {reviews.length === 0 && <p className="muted" style={{ fontSize: 13 }}>{t("reviewEmpty")}</p>}

      {due.length > 0 && <div className="kicker" style={{ marginTop: 6 }}>{t("reviewDueHead")}</div>}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {due.map((r) => (
          <li key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
            {edit.id === r.id ? editRow(r) : (
              <>
                <div style={{ flex: 1 }}>
                  <div>{r.topic}</div>
                  <div className="muted" style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{t("reviewLevel", { n: r.box + 1, total: REVIEW_STEPS.length })}</div>
                </div>
                <button className="btn" style={{ padding: "7px 12px" }} onClick={() => act(r.id, "got")}>{t("reviewGot")}</button>
                <button className="btn-ghost" style={{ padding: "7px 12px" }} onClick={() => act(r.id, "again")}>{t("reviewAgain")}</button>
                <button onClick={() => setEdit({ id: r.id, text: r.topic })} style={iconBtn} aria-label={t("editBtn")}>✎</button>
                <button onClick={() => remove(r.id)} style={iconBtn} aria-label="remove">✕</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {later.length > 0 && (
        <>
          <div className="kicker" style={{ marginTop: 16 }}>{t("reviewLaterHead")}</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {later.map((r) => (
              <li key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
                {edit.id === r.id ? editRow(r) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <div>{r.topic}</div>
                      <div className="muted" style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
                        {t("reviewLevel", { n: r.box + 1, total: REVIEW_STEPS.length })} · {t("reviewNext", { date: fmtDate(r.due) })}
                      </div>
                    </div>
                    <button onClick={() => setEdit({ id: r.id, text: r.topic })} style={iconBtn} aria-label={t("editBtn")}>✎</button>
                    <button onClick={() => remove(r.id)} style={iconBtn} aria-label="remove">✕</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, padding: 4 };
