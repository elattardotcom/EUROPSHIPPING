import type { CSSProperties } from "react"

export const GLOW_COLOR: Record<string, string> = {
  blue:    "rgba(59,130,246,0.22)",
  emerald: "rgba(16,185,129,0.22)",
  green:   "rgba(16,185,129,0.22)",
  teal:    "rgba(20,184,166,0.22)",
  amber:   "rgba(245,158,11,0.22)",
  yellow:  "rgba(234,179,8,0.22)",
  red:     "rgba(239,68,68,0.22)",
  orange:  "rgba(249,115,22,0.22)",
  purple:  "rgba(168,85,247,0.22)",
}

export const GRID_BG_STYLE: CSSProperties = {
  backgroundImage: "linear-gradient(rgba(249,115,22,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.035) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
  maskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, #000 0%, transparent 75%)",
  WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, #000 0%, transparent 75%)",
}

export function GridBackground() {
  return <div className="fixed inset-0 pointer-events-none -z-10" style={GRID_BG_STYLE} />
}

export function CornerBrackets({ color }: { color: string }) {
  const style = { borderColor: color }
  return (
    <>
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-md opacity-70" style={style} />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-md opacity-70" style={style} />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-md opacity-70" style={style} />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-md opacity-70" style={style} />
    </>
  )
}

export function SectionDot({ color = "#f97316" }: { color?: string }) {
  return <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px 1px ${color}b3` }} />
}
