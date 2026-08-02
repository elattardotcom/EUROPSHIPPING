"use client"

import { useState, useEffect } from "react"

type Lang = "en" | "fr"

const COUNTRIES = [
  { code:"ES", flag:"🇪🇸", nameFr:"Espagne",   nameEn:"Spain",    cx:118, cy:268 },
  { code:"PT", flag:"🇵🇹", nameFr:"Portugal",  nameEn:"Portugal", cx:62,  cy:288 },
  { code:"IT", flag:"🇮🇹", nameFr:"Italie",    nameEn:"Italy",    cx:258, cy:278 },
  { code:"RO", flag:"🇷🇴", nameFr:"Roumanie",  nameEn:"Romania",  cx:392, cy:215 },
  { code:"BG", flag:"🇧🇬", nameFr:"Bulgarie",  nameEn:"Bulgaria", cx:372, cy:248 },
  { code:"GR", flag:"🇬🇷", nameFr:"Grèce",     nameEn:"Greece",   cx:362, cy:298 },
  { code:"HU", flag:"🇭🇺", nameFr:"Hongrie",   nameEn:"Hungary",  cx:330, cy:192 },
  { code:"CZ", flag:"🇨🇿", nameFr:"Tchéquie",  nameEn:"Czechia",  cx:282, cy:148 },
  { code:"SK", flag:"🇸🇰", nameFr:"Slovaquie", nameEn:"Slovakia", cx:318, cy:162 },
]

const POLYS: Record<string, string> = {
  PT: "M 58,265 L 70,252 L 76,258 L 78,282 L 73,300 L 60,296 L 56,278 Z",
  ES: "M 70,252 L 105,236 L 140,233 L 160,240 L 168,258 L 160,275 L 142,290 L 115,300 L 88,295 L 76,282 L 78,265 Z",
  IT: "M 190,222 L 215,218 L 238,228 L 244,248 L 238,272 L 228,295 L 234,318 L 246,342 L 252,358 L 242,368 L 232,352 L 222,328 L 218,305 L 220,285 L 210,265 L 195,245 Z",
  HU: "M 290,195 L 324,188 L 342,198 L 344,215 L 332,225 L 304,228 L 282,215 L 280,200 Z",
  CZ: "M 252,168 L 290,162 L 314,173 L 312,188 L 290,195 L 262,190 L 248,178 Z",
  SK: "M 290,162 L 324,158 L 344,170 L 342,188 L 324,188 L 304,178 L 284,173 Z",
  RO: "M 340,195 L 374,195 L 394,208 L 402,228 L 390,248 L 367,255 L 344,250 L 326,238 L 324,218 Z",
  BG: "M 325,250 L 367,255 L 387,262 L 384,280 L 360,290 L 330,285 L 317,270 Z",
  GR: "M 317,285 L 340,282 L 357,292 L 360,315 L 347,335 L 334,345 L 317,335 L 307,315 L 310,298 Z",
}

const HUB    = { x: 242, y: 228 }
const ORIGIN = { x: 872, y: 255 }

const AIR = `M ${ORIGIN.x},${ORIGIN.y} C 820,68 468,52 ${HUB.x},${HUB.y}`
const SEA = `M ${ORIGIN.x},${ORIGIN.y} C 825,368 535,370 ${HUB.x},${HUB.y}`

function bez(t: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number) {
  const m = 1 - t
  return {
    x: m*m*m*ax + 3*m*m*t*bx + 3*m*t*t*cx + t*t*t*dx,
    y: m*m*m*ay + 3*m*m*t*by + 3*m*t*t*cy + t*t*t*dy,
  }
}

export function MapRoute({ lang }: { lang: Lang }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 48)
    return () => clearInterval(id)
  }, [])

  const airP = [0, 0.28, 0.55, 0.80].map(o =>
    bez((tick * 0.0052 + o) % 1, ORIGIN.x, ORIGIN.y, 820, 68, 468, 52, HUB.x, HUB.y)
  )
  const seaP = [0, 0.38, 0.72].map(o =>
    bez((tick * 0.0032 + o) % 1, ORIGIN.x, ORIGIN.y, 825, 368, 535, 370, HUB.x, HUB.y)
  )

  const pulse = Math.sin(tick * 0.055) * 0.5 + 0.5

  return (
    <div className="relative w-full select-none overflow-hidden"
      style={{ background: "linear-gradient(145deg,#03060a 0%,#050c12 45%,#030709 100%)" }}>

      {/* Fine dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(rgba(148,163,184,0.08) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }} />

      {/* Ambient glows */}
      <div className="absolute pointer-events-none" style={{
        top: "28%", left: "18%", width: 380, height: 260,
        background: "radial-gradient(ellipse, rgba(249,115,22,0.09) 0%, transparent 68%)",
        filter: "blur(28px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        top: "10%", right: "12%", width: 260, height: 240,
        background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 68%)",
        filter: "blur(24px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "20%", left: "35%", width: 300, height: 200,
        background: "radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 68%)",
        filter: "blur(24px)",
      }} />

      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-16 pointer-events-none"
        style={{ background: "linear-gradient(to right,#03060a,transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-16 pointer-events-none"
        style={{ background: "linear-gradient(to left,#030709,transparent)" }} />

      <svg viewBox="0 0 1000 480" className="w-full" style={{ minHeight: 340 }}>
        <defs>
          {/* Route gradients */}
          <linearGradient id="airGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%"   stopColor="#f97316" stopOpacity="0.95" />
            <stop offset="55%"  stopColor="#f59e0b" stopOpacity="0.50" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="seaGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.90" />
            <stop offset="55%"  stopColor="#3b82f6" stopOpacity="0.50" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
          </linearGradient>
          {/* Country fill gradient */}
          <radialGradient id="cFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#f97316" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.08" />
          </radialGradient>
          {/* Glow filters */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glowStr" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glowHub" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── EUROPE LANDMASS ── */}
        <path d={`
          M 148,78 C 172,70 210,72 242,82
          C 270,92 294,104 314,118
          C 332,130 350,140 356,154
          C 342,157 320,153 298,159
          C 275,153 252,148 238,148
          C 218,148 198,142 178,138
          C 158,138 140,148 124,165
          C 108,182 92,205 80,228
          C 66,250 58,272 60,295
          C 64,310 80,318 105,318
          C 128,318 148,305 162,288
          C 174,272 192,262 212,262
          C 225,262 228,272 225,290
          C 222,308 228,330 238,350
          C 245,362 252,372 246,380
          C 238,374 230,356 220,333
          C 216,316 216,293 223,278
          C 246,276 268,276 282,288
          C 278,310 272,332 272,348
          C 285,348 298,345 312,348
          C 328,352 338,358 345,368
          C 352,375 358,377 362,369
          C 355,354 368,337 382,320
          C 396,306 413,296 426,276
          C 434,258 430,240 420,226
          C 407,212 392,208 374,203
          C 354,200 336,196 318,186
          C 300,176 284,166 268,156
          L 314,118
        `}
          fill="rgba(71,85,105,0.045)"
          stroke="rgba(100,116,139,0.16)"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        {/* Scandinavia */}
        <path d="M 242,82 C 258,74 275,72 288,80 C 298,88 300,104 287,112 C 274,120 260,118 250,108 C 240,98 237,89 242,82 Z"
          fill="rgba(71,85,105,0.04)" stroke="rgba(100,116,139,0.12)" strokeWidth="0.7" />
        {/* British Isles */}
        <path d="M 150,130 C 136,126 126,136 128,148 C 130,160 143,167 156,161 C 168,155 170,141 163,134 Z"
          fill="rgba(71,85,105,0.035)" stroke="rgba(100,116,139,0.10)" strokeWidth="0.6" />

        {/* ── COVERED COUNTRY FILLS ── */}
        {Object.entries(POLYS).map(([code, d]) => (
          <path key={code} d={d}
            fill="url(#cFill)"
            stroke="rgba(251,146,60,0.40)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        ))}

        {/* ── ASIA / CHINA ── */}
        <path d={`
          M 702,88 C 748,75 800,70 852,78
          C 895,86 930,108 955,140
          C 972,168 975,202 968,238
          C 960,268 945,292 922,312
          C 898,332 868,345 838,350
          C 812,352 790,342 772,325
          C 755,308 745,285 742,260
          C 738,235 742,210 738,188
          C 732,165 718,145 712,122
          C 706,105 700,95 702,88 Z
        `}
          fill="rgba(71,85,105,0.045)"
          stroke="rgba(100,116,139,0.14)"
          strokeWidth="0.8"
        />
        {/* N Africa */}
        <path d="M 78,398 C 138,391 220,388 300,391 C 380,393 422,398 444,404 L 56,404 Z"
          fill="rgba(71,85,105,0.04)" stroke="rgba(100,116,139,0.09)" strokeWidth="0.6" />

        {/* Ocean labels */}
        <text x="490" y="248" textAnchor="middle" fill="rgba(148,163,184,0.07)" fontSize="9.5" fontStyle="italic" letterSpacing="4">ATLANTIC OCEAN</text>
        <text x="476" y="380" textAnchor="middle" fill="rgba(148,163,184,0.06)" fontSize="8.5" fontStyle="italic" letterSpacing="2">MEDITERRANEAN SEA</text>
        <text x="800" y="400" textAnchor="middle" fill="rgba(148,163,184,0.06)" fontSize="8" fontStyle="italic" letterSpacing="1.5">SOUTH CHINA SEA</text>

        {/* Continent labels */}
        <text x="225" y="112" textAnchor="middle" fill="rgba(255,255,255,0.10)" fontSize="10" fontWeight="700" letterSpacing="3.5">EUROPE</text>
        <text x="820" y="110" textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="9.5" fontWeight="700" letterSpacing="3">CHINA</text>

        {/* ── SEA ROUTE ── */}
        <path d={SEA} fill="none" stroke="rgba(99,102,241,0.05)" strokeWidth="14" strokeLinecap="round" />
        <path d={SEA} fill="none" stroke="url(#seaGrad)" strokeWidth="1.2" opacity="0.50" />
        <path d={SEA} fill="none" stroke="rgba(99,102,241,0.60)" strokeWidth="1.2"
          strokeDasharray="6 14" strokeDashoffset={-(tick * 0.42) % 20} />

        {/* ── AIR ROUTE ── */}
        <path d={AIR} fill="none" stroke="rgba(249,115,22,0.05)" strokeWidth="14" strokeLinecap="round" />
        <path d={AIR} fill="none" stroke="url(#airGrad)" strokeWidth="1.6" opacity="0.60" />
        <path d={AIR} fill="none" stroke="rgba(249,115,22,0.75)" strokeWidth="1.6"
          strokeDasharray="8 14" strokeDashoffset={-(tick * 0.72) % 22} />

        {/* Route labels */}
        <rect x="528" y="58" width="128" height="22" rx="6" fill="rgba(0,0,0,0.82)" stroke="rgba(249,115,22,0.25)" strokeWidth="0.8" />
        <text x="592" y="73" textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontWeight="700" letterSpacing="0.5">
          ✈ {lang === "fr" ? "17j par avion" : "17d by air"}
        </text>
        <rect x="538" y="385" width="122" height="22" rx="6" fill="rgba(0,0,0,0.82)" stroke="rgba(99,102,241,0.25)" strokeWidth="0.8" />
        <text x="599" y="400" textAnchor="middle" fill="#818cf8" fontSize="8.5" fontWeight="700" letterSpacing="0.5">
          🚢 {lang === "fr" ? "30j par mer" : "30d by sea"}
        </text>

        {/* ── SEA PARTICLES ── */}
        {seaP.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5.5" fill="rgba(99,102,241,0.10)" />
            <circle cx={p.x} cy={p.y} r="2.2" fill="#6366f1" filter="url(#glow)" />
          </g>
        ))}

        {/* ── AIR PARTICLES ── */}
        {airP.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill="rgba(249,115,22,0.12)" />
            <circle cx={p.x} cy={p.y} r="2.5" fill="#f97316" filter="url(#glow)" />
          </g>
        ))}

        {/* ── HUB → COUNTRY branches ── */}
        {COUNTRIES.map((c, i) => (
          <g key={c.code}>
            <line x1={HUB.x} y1={HUB.y} x2={c.cx} y2={c.cy} stroke="rgba(16,185,129,0.08)" strokeWidth="1.5" />
            <line x1={HUB.x} y1={HUB.y} x2={c.cx} y2={c.cy}
              stroke="rgba(16,185,129,0.45)" strokeWidth="0.8"
              strokeDasharray="5 9"
              strokeDashoffset={-(tick * 0.36 + i * 6) % 14} />
          </g>
        ))}

        {/* ── HUB BEACON ── */}
        {/* Outer ring 3 */}
        <circle cx={HUB.x} cy={HUB.y} r={46 + pulse * 6}
          fill="none" stroke="rgba(249,115,22,0.07)" strokeWidth="1" />
        {/* Outer ring 2 */}
        <circle cx={HUB.x} cy={HUB.y} r={34 + pulse * 4}
          fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.14)" strokeWidth="0.8" />
        {/* Inner ring */}
        <circle cx={HUB.x} cy={HUB.y} r="22"
          fill="rgba(249,115,22,0.10)"
          stroke="rgba(249,115,22,0.50)"
          strokeWidth="1.5"
          filter="url(#glow)" />
        {/* Core dot */}
        <circle cx={HUB.x} cy={HUB.y} r="9" fill="#f97316" filter="url(#glowHub)" />
        <circle cx={HUB.x} cy={HUB.y} r="4.5" fill="#fde68a" />

        {/* Hub label — positioned just above, with clearance from CZ */}
        <rect x={HUB.x - 54} y={HUB.y - 52} width="108" height="24" rx="7"
          fill="rgba(2,5,8,0.90)" stroke="rgba(249,115,22,0.38)" strokeWidth="0.9" />
        <text x={HUB.x} y={HUB.y - 35} textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="800" letterSpacing="0.5">
          🏭 CODShipEurope Hub
        </text>

        {/* ── COUNTRY MARKERS ── */}
        {COUNTRIES.map((c, i) => {
          const p = Math.sin(tick * 0.058 + i * 1.1) * 0.5 + 0.5
          const goLeft = c.cx < HUB.x + 55
          const lx = goLeft ? c.cx - 66 : c.cx + 10
          return (
            <g key={c.code}>
              {/* Pulse ring */}
              <circle cx={c.cx} cy={c.cy} r={10 + p * 5}
                fill="none" stroke="rgba(16,185,129,0.18)" strokeWidth="0.9" />
              {/* Marker */}
              <circle cx={c.cx} cy={c.cy} r="5.5"
                fill="rgba(16,185,129,0.18)"
                stroke="rgba(16,185,129,0.72)"
                strokeWidth="1.4"
                filter="url(#glow)" />
              <circle cx={c.cx} cy={c.cy} r="2" fill="#10b981" />
              {/* Label badge */}
              <rect x={lx} y={c.cy - 11} width="56" height="20" rx="5"
                fill="rgba(2,6,10,0.88)" stroke="rgba(16,185,129,0.18)" strokeWidth="0.7" />
              <text x={lx + 28} y={c.cy + 2}
                textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="7" fontWeight="600">
                {c.flag} {lang === "fr" ? c.nameFr : c.nameEn}
              </text>
            </g>
          )
        })}

        {/* ── SHANGHAI ORIGIN ── */}
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r={26 + pulse * 3.5} fill="rgba(99,102,241,0.04)" />
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r="17"
          fill="rgba(99,102,241,0.13)"
          stroke="rgba(99,102,241,0.55)"
          strokeWidth="1.5"
          filter="url(#glow)" />
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r="7" fill="#6366f1" filter="url(#glowStr)" />
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r="3" fill="#c7d2fe" />
        <rect x={ORIGIN.x - 64} y={ORIGIN.y - 56} width="128" height="24" rx="7"
          fill="rgba(2,5,8,0.90)" stroke="rgba(99,102,241,0.35)" strokeWidth="0.9" />
        <text x={ORIGIN.x} y={ORIGIN.y - 39} textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="800" letterSpacing="0.5">
          🇨🇳 Shanghai · Origin
        </text>
        {/* Live counter */}
        <rect x={ORIGIN.x - 70} y={ORIGIN.y + 22} width="140" height="26" rx="7"
          fill="rgba(2,5,8,0.88)" stroke="rgba(99,102,241,0.20)" strokeWidth="0.7" />
        <circle cx={ORIGIN.x - 50} cy={ORIGIN.y + 35} r="3" fill="#6366f1">
          <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <text x={ORIGIN.x - 41} y={ORIGIN.y + 39} fill="rgba(255,255,255,0.72)" fontSize="8.5" fontWeight="600">
          {1284 + (tick % 4 === 0 ? 1 : 0)} {lang === "fr" ? "colis en transit" : "parcels in transit"}
        </text>
      </svg>

      {/* ── TOP-LEFT: Live badge ── */}
      <div className="absolute top-3 left-3">
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 backdrop-blur-sm"
          style={{ background: "rgba(2,6,10,0.88)", border: "1px solid rgba(16,185,129,0.20)" }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {lang === "fr" ? "Réseau actif" : "Network live"}
          </span>
        </div>
      </div>

      {/* ── TOP-RIGHT: Countries badge ── */}
      <div className="absolute top-3 right-3">
        <div className="rounded-lg px-3 py-1.5 backdrop-blur-sm text-right"
          style={{ background: "rgba(2,6,10,0.88)", border: "1px solid rgba(249,115,22,0.20)" }}>
          <p className="text-[9px] text-neutral-600 uppercase tracking-wider">
            {lang === "fr" ? "Pays couverts" : "Coverage"}
          </p>
          <p className="text-sm font-black text-orange-400 leading-tight">9 🌍</p>
        </div>
      </div>

      {/* ── LEGEND (bottom-right) ── */}
      <div className="absolute bottom-14 right-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 backdrop-blur-sm"
          style={{ background: "rgba(2,6,10,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
          <span className="text-[8.5px] text-amber-400 font-semibold">✈ {lang === "fr" ? "Aérien · 17j" : "Air · 17d"}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 backdrop-blur-sm"
          style={{ background: "rgba(2,6,10,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
          <span className="text-[8.5px] text-indigo-400 font-semibold">🚢 {lang === "fr" ? "Maritime · 30j" : "Sea · 30d"}</span>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="absolute bottom-0 inset-x-0 px-5 py-2.5 flex items-center justify-around"
        style={{ background: "rgba(2,5,8,0.94)", borderTop: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(16px)" }}>
        {([
          { v:"17j",   label: lang==="fr" ? "Aérien"       : "By air",        c:"#f59e0b" },
          { v:"30j",   label: lang==="fr" ? "Maritime"     : "By sea",        c:"#6366f1" },
          { v:"24-48h",label: lang==="fr" ? "Livraison"    : "Delivery",      c:"#f97316" },
          { v:"9",     label: lang==="fr" ? "Pays"         : "Countries",     c:"#10b981" },
          { v:"99%",   label: lang==="fr" ? "Tracking"     : "Tracking",      c:"#f59e0b" },
        ] as const).map(s => (
          <div key={s.label} className="text-center">
            <p className="text-sm sm:text-base font-black tabular-nums" style={{ color: s.c }}>{s.v}</p>
            <p className="text-[8px] text-neutral-600 mt-0.5 hidden sm:block">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
