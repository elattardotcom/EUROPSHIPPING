"use client"

import { useEffect, useState } from "react"
import { Banknote, CheckCircle, TrendingUp, Package } from "lucide-react"

const NOTIFS = [
  { icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.12)", flag: "🇪🇸", text: "Carlos (Madrid) vient de s'inscrire",     sub: "il y a 38 sec" },
  { icon: Banknote,    color: "#f97316", bg: "rgba(249,115,22,0.12)", flag: "🇵🇹", text: "Virement €3,240 envoyé · Porto",          sub: "il y a 1 min"  },
  { icon: TrendingUp,  color: "#6366f1", bg: "rgba(99,102,241,0.12)", flag: "🇮🇹", text: "Sara · 98 leads confirmés aujourd'hui",   sub: "il y a 2 min"  },
  { icon: Package,     color: "#f59e0b", bg: "rgba(245,158,11,0.12)", flag: "🇷🇴", text: "+€127 encaissé · Bucarest",               sub: "il y a 3 min"  },
  { icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.12)", flag: "🇬🇷", text: "Nikos a rejoint le plan Pro",             sub: "il y a 4 min"  },
  { icon: Banknote,    color: "#f97316", bg: "rgba(249,115,22,0.12)", flag: "🇧🇬", text: "Virement €1,890 reçu en 48h · Sofia",    sub: "il y a 5 min"  },
  { icon: TrendingUp,  color: "#6366f1", bg: "rgba(99,102,241,0.12)", flag: "🇭🇺", text: "Taux livraison 96% ce mois · Budapest",  sub: "il y a 6 min"  },
  { icon: Package,     color: "#f59e0b", bg: "rgba(245,158,11,0.12)", flag: "🇨🇿", text: "+€231 encaissé · Prague",                sub: "il y a 7 min"  },
]

export function LiveToast() {
  const [idx,     setIdx]     = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const cycle = (i: number) => {
      setIdx(i)
      setVisible(true)
      timer = setTimeout(() => {
        setVisible(false)
        timer = setTimeout(() => cycle((i + 1) % NOTIFS.length), 700)
      }, 4500)
    }

    timer = setTimeout(() => cycle(0), 2500)
    return () => clearTimeout(timer)
  }, [])

  const n = NOTIFS[idx]
  const Icon = n.icon

  return (
    <div
      className="fixed bottom-6 left-6 z-50 pointer-events-none"
      style={{
        transition: "opacity 0.45s ease, transform 0.45s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl max-w-[280px]"
        style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none">{n.flag}</span>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: n.bg }}>
            <Icon className="w-3.5 h-3.5" style={{ color: n.color }} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-white text-[11px] font-semibold leading-tight">{n.text}</p>
          <p className="text-neutral-600 text-[10px] mt-0.5">{n.sub}</p>
        </div>
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: n.color, boxShadow: `0 0 6px ${n.color}` }} />
      </div>
    </div>
  )
}
