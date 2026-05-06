"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ background: "#0a0a0a", color: "#fff", fontFamily: "monospace", padding: "40px" }}>
        <h2 style={{ color: "#f97316", marginBottom: "16px" }}>Erreur détectée</h2>
        <pre style={{ background: "#111", padding: "20px", borderRadius: "8px", color: "#f87171", overflow: "auto", fontSize: "13px" }}>
          {error.message}
          {"\n\n"}
          {error.stack}
        </pre>
        <button
          onClick={reset}
          style={{ marginTop: "20px", background: "#f97316", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}
        >
          Réessayer
        </button>
      </body>
    </html>
  )
}
