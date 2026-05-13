import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt     = "CODShipEurope — Plateforme COD Shopify en Europe"
export const size    = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#080808",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Orange glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Logo SVG */}
        <svg width="100" height="100" viewBox="0 0 200 200" style={{ marginBottom: 32 }}>
          <circle cx="100" cy="100" r="100" fill="#0a0a0a" />
          <path d="M 133 156 A 65 65 0 1 0 67 156" stroke="#f97316" strokeWidth="20" strokeLinecap="round" />
          <polygon points="67,156 48,132 38,150" fill="#f97316" />
          <circle cx="133" cy="156" r="13" fill="#f97316" />
        </svg>

        {/* Brand name */}
        <div style={{ fontSize: 72, fontWeight: 900, color: "#ffffff", letterSpacing: "-2px", marginBottom: 16 }}>
          CODShipEurope
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 28, color: "#737373", textAlign: "center", maxWidth: 700, lineHeight: 1.4 }}>
          Plateforme Cash on Delivery pour dropshippers Shopify en Europe
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 48, marginTop: 48 }}>
          {[
            { n: "2 500+", l: "marchands", c: "#f97316" },
            { n: "€1.2M",  l: "/ mois",   c: "#10b981" },
            { n: "94%",    l: "livraison", c: "#6366f1" },
            { n: "10",     l: "pays",      c: "#f59e0b" },
          ].map(s => (
            <div key={s.l} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: s.c }}>{s.n}</span>
              <span style={{ fontSize: 14, color: "#525252", textTransform: "uppercase", letterSpacing: "2px" }}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, transparent, #f97316, #dc2626, transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  )
}
