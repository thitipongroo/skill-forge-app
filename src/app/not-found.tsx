import Link from "next/link";

// 404 page.
export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <div className="card" style={{ textAlign: "center" }}>
        <div className="kicker">Not found</div>
        <p className="muted" style={{ fontSize: 14, margin: "10px 0 16px" }}>
          That page doesn’t exist.
        </p>
        <Link className="btn" href="/dashboard">Go to dashboard</Link>
      </div>
    </div>
  );
}
