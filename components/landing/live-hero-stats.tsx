"use client"

import { useEffect, useState } from "react"
import { AnimatedCounter } from "./animated-counter"

function rnd(min: number, max: number, dec = 0) {
  const v = Math.random() * (max - min) + min
  return dec > 0 ? parseFloat(v.toFixed(dec)) : Math.floor(v)
}

export function LiveHeroStats() {
  const [stats, setStats] = useState({
    marchands: rnd(2480, 2600),
    volume:    rnd(1.1, 1.4, 1),
    livraison: rnd(91, 97),
  })

  useEffect(() => {
    const id = setInterval(() => {
      setStats({
        marchands: rnd(2480, 2600),
        volume:    rnd(1.1, 1.4, 1),
        livraison: rnd(91, 97),
      })
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="animate-slide-r d5">
      <div className="flex items-center gap-5 sm:gap-6 text-sm mb-4">
        {[
          { to: stats.marchands, suffix: "+",  l: "marchands",  color: "#f97316" },
          { to: stats.volume,    prefix: "€", suffix: "M", l: "/ mois", color: "#10b981", decimals: 1 },
          { to: stats.livraison, suffix: "%",  l: "livraison",  color: "#6366f1" },
        ].map(s => (
          <div key={s.l} className="flex flex-col">
            <span className="text-xl font-black">
              <AnimatedCounter to={s.to} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} color={s.color} />
            </span>
            <span className="text-xs text-neutral-600 uppercase tracking-wide">{s.l}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["🇪🇸","🇮🇹","🇵🇹","🇷🇴","🇧🇬","🇭🇺","🇬🇷","🇸🇰","🇸🇮","🇨🇿"].map(f => (
          <span key={f} className="text-base">{f}</span>
        ))}
      </div>
    </div>
  )
}
