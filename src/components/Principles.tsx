"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getList } from "@/i18n/I18nProvider";
import { apiFetch } from "@/hooks/useApi";
import type { PrincipleNote } from "@/types";

interface Principle { key: string; name: string; tag: string; blurb: string; prompt: string; }

export default function Principles({ skillId, notes, onChange }: {
  skillId: string; notes: PrincipleNote[]; onChange: () => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const principles = getList<Principle>("principles");
  const byKey: Record<string, PrincipleNote> = {};
  for (const n of notes) byKey[n.key] = n;
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const save = async (key: string, patch: Partial<PrincipleNote>) => {
    const cur = byKey[key] || { key, done: false, note: "" };
    await apiFetch("/api/principles", { method: "PUT", body: JSON.stringify({ skillId, key, done: cur.done, note: cur.note, ...patch }) });
    await onChange();
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="kicker">{t("p3Title")}</div>
      <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{t("p3Cap")}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0" }}>
        {principles.map((p) => {
          const note = byKey[p.key];
          const done = note?.done ?? false;
          const draft = drafts[p.key] ?? note?.note ?? "";
          return (
            <li key={p.key} style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                <input type="checkbox" checked={done} onChange={() => save(p.key, { done: !done })} style={{ marginTop: 4 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {p.name} <span className="muted" style={{ fontFamily: "var(--mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>· {p.tag}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{p.blurb}</div>
                </div>
              </label>
              <input className="input" style={{ marginTop: 8 }} placeholder={p.prompt}
                value={draft}
                onChange={(e) => setDrafts((d) => ({ ...d, [p.key]: e.target.value }))}
                onBlur={(e) => { if ((e.target.value ?? "") !== (note?.note ?? "")) save(p.key, { note: e.target.value }); }} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
