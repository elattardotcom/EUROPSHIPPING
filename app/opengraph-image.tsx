import { ImageResponse } from "next/og"

export const runtime     = "edge"
export const alt         = "CODShipEurope — Plateforme COD Shopify en Europe"
export const size        = { width: 1200, height: 630 }
export const contentType = "image/png"

const COUNTRIES = [
  { flag: "🇪🇸", name: "Espagne",  accent: "#f97316" },
  { flag: "🇵🇹", name: "Portugal", accent: "#f97316" },
  { flag: "🇮🇹", name: "Italie",   accent: "#f97316" },
  { flag: "🇷🇴", name: "Roumanie", accent: "#10b981" },
  { flag: "🇧🇬", name: "Bulgarie", accent: "#10b981" },
  { flag: "🇬🇷", name: "Grèce",    accent: "#10b981" },
  { flag: "🇭🇺", name: "Hongrie",  accent: "#6366f1" },
  { flag: "🇨🇿", name: "Tchéquie", accent: "#6366f1" },
  { flag: "🇸🇰", name: "Slovaquie",accent: "#6366f1" },
]

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "row",
        background: "#040406",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* ── BG dot grid (simulated with repeated tiny divs — skip, use gradient instead) ── */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }} />

        {/* ── Glow top-left orange ── */}
        <div style={{
          position: "absolute", top: -140, left: -100,
          width: 550, height: 550,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 65%)",
          filter: "blur(60px)",
        }} />

        {/* ── Glow bottom-right indigo ── */}
        <div style={{
          position: "absolute", bottom: -120, right: 80,
          width: 420, height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)",
          filter: "blur(60px)",
        }} />

        {/* ══════════════════ LEFT PANEL ══════════════════ */}
        <div style={{
          display: "flex", flexDirection: "column",
          width: 480, height: "100%",
          padding: "52px 48px 52px 60px",
          justifyContent: "space-between",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
        }}>

          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="52" height="52" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="100" fill="#111113" />
              <path d="M 141 169 A 80 80 0 1 0 59 169"
                stroke="#f97316" strokeWidth="22" strokeLinecap="round" fill="none" />
              <polygon points="59,169 36,139 23,162" fill="#f97316" />
              <circle cx="141" cy="169" r="16" fill="#f97316" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
                CODShipEurope
              </span>
              <span style={{ fontSize: 11, color: "#404040", letterSpacing: 1.5, textTransform: "uppercase" }}>
                codshipeurope.com
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* "COD" big accent */}
            <div style={{
              display: "flex", alignItems: "center", gap: 0,
              fontSize: 100, fontWeight: 900, letterSpacing: "-4px", lineHeight: 0.9,
            }}>
              <span style={{ color: "#f97316" }}>C</span>
              <span style={{ color: "#fff" }}>O</span>
              <span style={{ color: "#fff" }}>D</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                Cash on Delivery
              </span>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#737373", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                Shopify → Europe
              </span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "✈", text: "17 jours par avion depuis la Chine", c: "#f59e0b" },
              { icon: "🚢", text: "30 jours par voie maritime",         c: "#6366f1" },
              { icon: "📦", text: "2 500+ marchands actifs",            c: "#10b981" },
            ].map(s => (
              <div key={s.text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36,
                  background: `rgba(255,255,255,0.04)`,
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: 15, color: "#737373" }}>{s.text}</span>
              </div>
            ))}
          </div>

          {/* LIVE badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", letterSpacing: 2, textTransform: "uppercase" }}>
              Réseau actif
            </span>
          </div>
        </div>

        {/* ══════════════════ RIGHT PANEL ══════════════════ */}
        <div style={{
          display: "flex", flexDirection: "column",
          flex: 1, padding: "44px 52px",
          gap: 20,
        }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#404040",
              textTransform: "uppercase", letterSpacing: 3,
            }}>
              9 PAYS COUVERTS
            </span>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(249,115,22,0.10)",
              border: "1px solid rgba(249,115,22,0.25)",
              borderRadius: 100, padding: "6px 16px",
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>
                1 seul abonnement · €31.99/mois
              </span>
            </div>
          </div>

          {/* 3×3 country grid */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 10, flex: 1,
          }}>
            {[0, 1, 2].map(row => (
              <div key={row} style={{ display: "flex", gap: 10, flex: 1 }}>
                {COUNTRIES.slice(row * 3, row * 3 + 3).map(c => (
                  <div key={c.name} style={{
                    flex: 1,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 8,
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${c.accent}28`,
                    borderRadius: 16,
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    {/* subtle glow behind flag */}
                    <div style={{
                      position: "absolute",
                      width: 60, height: 60,
                      borderRadius: "50%",
                      background: `${c.accent}18`,
                      filter: "blur(20px)",
                    }} />
                    <span style={{ fontSize: 36, lineHeight: 1 }}>{c.flag}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#858585" }}>
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Vertical orange divider glow ── */}
        <div style={{
          position: "absolute",
          left: 479, top: 60, bottom: 60,
          width: 1,
          background: "linear-gradient(180deg, transparent, rgba(249,115,22,0.4), transparent)",
        }} />

        {/* ── Top accent ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, #f97316, #dc2626, #6366f1, transparent)",
        }} />
      </div>
    ),
    { ...size }
  )
}
