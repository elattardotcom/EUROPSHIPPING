"use client"

import { AnimatedCounter } from "./animated-counter"
import type { Lang } from "@/lib/landing-translations"

export function LiveHeroStats(_props: { lang: Lang }) {
  const stats = [
    { to: 10, suffix: "",  l: "European markets", color: "#f97316" },
    { to: 48, suffix: "h", l: "Delivery within",   color: "#10b981", decimals: 0 },
    { to: 7,  suffix: "d", l: "Payout cycle",      color: "#6366f1" },
  ]

  return (
    <div className="animate-slide-r d5">
      <div className="flex items-center gap-5 sm:gap-6 text-sm mb-4">
        {stats.map(s => (
          <div key={s.l} className="flex flex-col">
            <span className="text-xl font-black">
              <AnimatedCounter to={s.to} suffix={s.suffix} decimals={s.decimals} color={s.color} />
            </span>
            <span className="text-xs text-neutral-600 uppercase tracking-wide">{s.l}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["🇪🇸","🇮🇹","🇵🇹","🇫🇷","🇷🇴","🇧🇬","🇭🇺","🇬🇷","🇸🇰","🇨🇿"].map(f => (
          <span key={f} className="text-base">{f}</span>
        ))}
      </div>
    </div>
  )
}
