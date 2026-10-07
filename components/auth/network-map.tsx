"use client"

import { MAP_VIEWBOX, MAP_GRAY_DOTS, MAP_ORANGE_DOTS, MAP_CITIES } from "./europe-map-data"

const ARC_ORDER = ["Lisbon", "Madrid", "Rome", "Bucharest"]
const cityByName = Object.fromEntries(MAP_CITIES.map(c => [c.name, c]))

export function NetworkMap({ className }: { className?: string }) {
  const cx = MAP_VIEWBOX.w * 0.46
  const cy = MAP_VIEWBOX.h * 0.36

  return (
    <svg viewBox={`0 0 ${MAP_VIEWBOX.w} ${MAP_VIEWBOX.h}`} className={className}
      fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <style>{`
        @keyframes mapNodePulse { 0% { transform: scale(1); opacity: 0.85 } 70% { transform: scale(3.2); opacity: 0 } 100% { opacity: 0 } }
        .map-pulse { transform-origin: center; transform-box: fill-box; animation: mapNodePulse 2.8s ease-out infinite; }
        @keyframes mapDash { to { stroke-dashoffset: -80 } }
        .map-dash { animation: mapDash 4.5s linear infinite; }
      `}</style>
      <defs>
        <radialGradient id="mapFade" gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r="430">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="72%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="mapMask">
          <rect x="0" y="0" width={MAP_VIEWBOX.w} height={MAP_VIEWBOX.h} fill="url(#mapFade)" />
        </mask>
        <linearGradient id="mapArc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <g mask="url(#mapMask)">
        <circle cx={cx} cy={cy} r="420" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="300" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />

        {MAP_GRAY_DOTS.map(([x, y], i) => (
          <circle key={`g${i}`} cx={x} cy={y} r="1.3" fill="rgba(255,255,255,0.16)" />
        ))}
        {MAP_ORANGE_DOTS.map(([x, y], i) => (
          <circle key={`o${i}`} cx={x} cy={y} r="1.5" fill="#f97316" fillOpacity="0.55" />
        ))}

        {ARC_ORDER.slice(0, -1).map((name, i) => {
          const a = cityByName[name]
          const b = cityByName[ARC_ORDER[i + 1]]
          if (!a || !b) return null
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2 - 36
          return (
            <path key={`arc${i}`} d={`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`}
              stroke="url(#mapArc)" strokeWidth="1.2" strokeDasharray="3 6"
              className="map-dash" style={{ animationDelay: `${i * 0.4}s` }} />
          )
        })}

        {MAP_CITIES.map((c, i) => (
          <g key={c.name}>
            <circle cx={c.x} cy={c.y} r="2.6" fill="#fff" />
            <circle cx={c.x} cy={c.y} r="2.6" fill="#f97316" className="map-pulse" style={{ animationDelay: `${i * 0.35}s` }} />
            <text x={c.x} y={c.y - 10} fontSize="9.5" fontWeight={700} fill="rgba(255,255,255,0.65)"
              textAnchor="middle" letterSpacing="0.5">
              {c.name.toUpperCase()}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
