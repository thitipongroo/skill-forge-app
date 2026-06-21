"use client";

// Catches errors thrown in the root layout itself; must render <html>/<body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 40, textAlign: "center" }}>
        <h2>Something went wrong</h2>
        <p style={{ color: "#6a766f" }}>Please reload the page.</p>
        <button onClick={reset} style={{ padding: "10px 18px", borderRadius: 9, border: "none", background: "#1d6b58", color: "#fff", cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
