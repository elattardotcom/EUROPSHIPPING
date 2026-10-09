"use client"

// Abstract logistics-network illustration — a constellation of hub nodes
// connected by routing lines, not a literal geographic map (avoids any
// claim about which countries/cities are actually served).
const NODES = [
  { x: 120, y: 90,  r: 3.5 }, { x: 230, y: 60,  r: 3   }, { x: 310, y: 120, r: 4.5, hub: true },
  { x: 180, y: 180, r: 3   }, { x: 90,  y: 220, r: 3.5, hub: true }, { x: 260, y: 230, r: 3 },
  { x: 350, y: 210, r: 3.5 }, { x: 200, y: 300, r: 4.5, hub: true }, { x: 120, y: 330, r: 3 },
  { x: 300, y: 320, r: 3   }, { x: 380, y: 290, r: 3   }, { x: 40,  y: 150, r: 3 },
]

const LINKS = [
  [0, 1], [1, 2], [0, 3], [3, 4], [1, 5], [2, 6], [3, 5], [5, 6],
  [4, 8], [5, 7], [7, 8], [7, 9], [6, 10], [9, 10], [11, 0], [11, 4],
]

export function EuropeMap({ className }: { className?: string }) {
  return (
    <div className={className}>
      <style>{`
        @keyframes mapPulse { 0%, 100% { opacity: 0.9; r: var(--r); } 50% { opacity: 0.35; r: calc(var(--r) * 1.8); } }
        .map-hub { animation: mapPulse 2.8s ease-in-out infinite; }
        @keyframes mapFlow { to { stroke-dashoffset: -24; } }
        .map-link { animation: mapFlow 3.5s linear infinite; }
      `}</style>
      <svg viewBox="0 0 420 380" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>
        {LINKS.map(([a, b], i) => (
          <line key={i} className="map-link"
            x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
            stroke="rgba(249,115,22,0.22)" strokeWidth="1" strokeDasharray="2 6" />
        ))}
        {NODES.map((n, i) => (
          <g key={i}>
            {n.hub && <circle cx={n.x} cy={n.y} r={n.r * 4} fill="url(#nodeGlow)" />}
            <circle
              className={n.hub ? "map-hub" : ""}
              style={n.hub ? ({ "--r": n.r } as React.CSSProperties) : undefined}
              cx={n.x} cy={n.y} r={n.r}
              fill={n.hub ? "#f97316" : "rgba(255,255,255,0.4)"}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
