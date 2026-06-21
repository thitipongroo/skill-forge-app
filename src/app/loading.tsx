// Shown during route transitions / suspense.
export default function Loading() {
  return (
    <div className="container" style={{ textAlign: "center", paddingTop: 80 }}>
      <div className="muted" style={{ fontFamily: "var(--mono)", fontSize: 14 }}>…</div>
    </div>
  );
}
