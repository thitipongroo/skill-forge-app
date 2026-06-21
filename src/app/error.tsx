"use client";
import { useEffect } from "react";

// Route-level error boundary (client component, per Next.js convention).
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <div className="card" style={{ textAlign: "center" }}>
        <div className="kicker">Something went wrong</div>
        <p className="muted" style={{ fontSize: 14, margin: "10px 0 16px" }}>
          An unexpected error occurred. You can try again.
        </p>
        <button className="btn" onClick={reset}>Try again</button>
        <div style={{ marginTop: 12 }}>
          <a className="muted" href="/dashboard" style={{ fontFamily: "var(--mono)", fontSize: 13 }}>← Back to dashboard</a>
        </div>
      </div>
    </div>
  );
}
