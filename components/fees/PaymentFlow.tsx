"use client"

import { useState, useEffect, Fragment } from "react"
import { User, Building2, Landmark } from "lucide-react"

type Lang = "fr" | "en"

const NODES = [
  {
    Icon: User,
    label: { fr: "Client",          en: "Customer"          },
    sub:   { fr: "Cash à la porte", en: "Cash at the door"  },
    color: "#818cf8",
    glow:  "rgba(129,140,248,0.18)",
    border:"rgba(129,140,248,0.28)",
    bg:    "rgba(99,102,241,0.07)",
  },
  {
    Icon: Building2,
    label: { fr: "CODShipEurope",   en: "CODShipEurope"     },
    sub:   { fr: "Collecte & gère", en: "Collects & manages"},
    color: "#fb923c",
    glow:  "rgba(249,115,22,0.18)",
    border:"rgba(249,115,22,0.30)",
    bg:    "rgba(249,115,22,0.07)",
  },
  {
    Icon: Landmark,
    label: { fr: "Votre banque",    en: "Your bank"         },
    sub:   { fr: "Chaque lundi",    en: "Every Monday"      },
    color: "#34d399",
    glow:  "rgba(52,211,153,0.18)",
    border:"rgba(52,211,153,0.28)",
    bg:    "rgba(16,185,129,0.07)",
  },
]

const CONNS = [
  { cA:"#818cf8", cB:"#fb923c", labelFr:"COD collecté",   labelEn:"COD collected",  subFr:"À la livraison", subEn:"On delivery"   },
  { cA:"#fb923c", cB:"#34d399", labelFr:"Virement hebdo", labelEn:"Weekly payout",  subFr:"Chaque lundi",   subEn:"Every Monday"  },
]

export function PaymentFlow({ lang }: { lang: Lang }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 40)
    return () => clearInterval(id)
  }, [])

  const pulse  = Math.sin(tick * 0.045) * 0.5 + 0.5
  const offsets = [
    [0, 0.40, 0.75].map(o => (tick * 0.0068 + o) % 1),
    [0.20, 0.58, 0.90].map(o => (tick * 0.0052 + o) % 1),
  ]

  /* ── Node card (shared) ── */
  const NodeCard = ({ node }: { node: typeof NODES[0] }) => {
    const Icon = node.Icon
    return (
      <div className="relative flex flex-col items-center" style={{ zIndex: 2 }}>
        {/* Pulse halo */}
        <div className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{
            width: 130, height: 130,
            marginTop: -65, marginLeft: -65,
            background: node.glow,
            borderRadius: "50%",
            filter: "blur(16px)",
            opacity: 0.5 + pulse * 0.5,
            transition: "opacity 0.04s linear",
          }} />
        {/* Card */}
        <div className="relative flex flex-col items-center gap-3 text-center px-6 py-6 rounded-2xl"
          style={{
            width: 164, zIndex: 2,
            background: node.bg,
            border: `1px solid ${node.border}`,
            boxShadow: `0 8px 40px ${node.glow}`,
          }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `${node.color}18`, border: `1.5px solid ${node.border}` }}>
            <Icon style={{ width: 26, height: 26, color: node.color }} />
          </div>
          <div>
            <p className="font-black text-sm text-white leading-tight">{node.label[lang]}</p>
            <p className="text-xs text-neutral-500 mt-1">{node.sub[lang]}</p>
          </div>
          {/* Bottom glow line */}
          <div className="absolute bottom-0 inset-x-6 h-[1.5px] rounded-full"
            style={{ background: `linear-gradient(90deg,transparent,${node.color}55,transparent)` }} />
        </div>
      </div>
    )
  }

  /* ── Horizontal connector ── */
  const HConnector = ({ ci }: { ci: number }) => {
    const conn = CONNS[ci]
    const p    = offsets[ci]
    const W    = 180
    return (
      <div className="relative flex-1 flex items-center justify-center" style={{ minWidth: 120, maxWidth: 200, height: 100 }}>
        <svg width="100%" height="100" viewBox={`0 0 ${W} 100`} preserveAspectRatio="none" className="overflow-visible absolute inset-0">
          <defs>
            <linearGradient id={`hcg${ci}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor={conn.cA} stopOpacity="0.55" />
              <stop offset="100%" stopColor={conn.cB} stopOpacity="0.75" />
            </linearGradient>
          </defs>
          {/* Glow shadow */}
          <line x1="0" y1="50" x2={W} y2="50" stroke={`url(#hcg${ci})`} strokeWidth="8" strokeOpacity="0.07" />
          {/* Dashed line */}
          <line x1="0" y1="50" x2={W} y2="50"
            stroke={`url(#hcg${ci})`} strokeWidth="1.5"
            strokeDasharray="7 9" strokeDashoffset={-(tick * 0.65) % 16} />
          {/* Arrow */}
          <polygon points={`${W-8},44 ${W},50 ${W-8},56`} fill={conn.cB} opacity="0.8" />
          {/* Particles */}
          {p.map((t, i) => {
            const x     = t * (W - 8)
            const alpha = Math.min(1, Math.min(t, 1 - t) * 10)
            return (
              <g key={i} opacity={alpha}>
                <circle cx={x} cy={50} r={11} fill={conn.cB} opacity={0.10} />
                <circle cx={x} cy={50} r={6.5} fill={conn.cA}
                  style={{ filter: `drop-shadow(0 0 5px ${conn.cB})` }} />
                <text x={x} y={54} textAnchor="middle" fontSize="7.5" fontWeight="900" fill="white">€</text>
              </g>
            )
          })}
        </svg>
        {/* Label beneath */}
        <div className="absolute text-center pointer-events-none" style={{ bottom: 4, left: 0, right: 0 }}>
          <p className="text-[10px] font-bold" style={{ color: conn.cB }}>
            {lang === "fr" ? conn.labelFr : conn.labelEn}
          </p>
          <p className="text-[9px] text-neutral-700">
            {lang === "fr" ? conn.subFr : conn.subEn}
          </p>
        </div>
      </div>
    )
  }

  /* ── Vertical connector (mobile) ── */
  const VConnector = ({ ci }: { ci: number }) => {
    const conn = CONNS[ci]
    const p    = offsets[ci]
    return (
      <div className="relative flex justify-center" style={{ height: 72, width: "100%", maxWidth: 320 }}>
        <svg width="60" height="72" className="overflow-visible">
          <defs>
            <linearGradient id={`vcg${ci}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={conn.cA} stopOpacity="0.6" />
              <stop offset="100%" stopColor={conn.cB} stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <line x1="30" y1="0" x2="30" y2="68"
            stroke={`url(#vcg${ci})`} strokeWidth="1.5"
            strokeDasharray="6 8" strokeDashoffset={-(tick * 0.55) % 14} />
          <polygon points="25,62 30,72 35,62" fill={conn.cB} opacity="0.8" />
          {p.map((t, i) => {
            const y     = t * 60
            const alpha = Math.min(1, Math.min(t, 1 - t) * 10)
            return (
              <g key={i} opacity={alpha}>
                <circle cx={30} cy={y} r={9}   fill={conn.cB} opacity={0.10} />
                <circle cx={30} cy={y} r={5.5} fill={conn.cA} style={{ filter: `drop-shadow(0 0 4px ${conn.cB})` }} />
                <text x={30} y={y + 4} textAnchor="middle" fontSize="6.5" fontWeight="900" fill="white">€</text>
              </g>
            )
          })}
        </svg>
        <div className="absolute left-[calc(50%+38px)] top-1/2 -translate-y-1/2">
          <p className="text-[10px] font-bold whitespace-nowrap" style={{ color: conn.cB }}>
            {lang === "fr" ? conn.labelFr : conn.labelEn}
          </p>
          <p className="text-[9px] text-neutral-700 whitespace-nowrap">
            {lang === "fr" ? conn.subFr : conn.subEn}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── DESKTOP ─────────────────────────────────────────────── */}
      <div className="hidden md:flex items-center justify-center w-full select-none" style={{ gap: 0 }}>
        {NODES.map((node, ni) => (
          <Fragment key={ni}>
            <NodeCard node={node} />
            {ni < 2 && <HConnector ci={ni} />}
          </Fragment>
        ))}
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-col items-center w-full select-none" style={{ gap: 0 }}>
        {NODES.map((node, ni) => {
          const Icon = node.Icon
          return (
            <Fragment key={ni}>
              <div className="w-full max-w-xs">
                <div className="flex items-center gap-4 rounded-2xl px-5 py-4"
                  style={{ background: node.bg, border: `1px solid ${node.border}`, boxShadow: `0 4px 24px ${node.glow}` }}>
                  <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: `${node.color}18`, border: `1px solid ${node.border}` }}>
                    <Icon style={{ width: 20, height: 20, color: node.color }} />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">{node.label[lang]}</p>
                    <p className="text-neutral-500 text-xs">{node.sub[lang]}</p>
                  </div>
                </div>
              </div>
              {ni < 2 && <VConnector ci={ni} />}
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
