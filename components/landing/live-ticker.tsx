"use client"

import { useEffect, useState } from "react"
import { T, Lang } from "@/lib/landing-translations"

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildTicker(lang: Lang) {
  const t      = T[lang]
  const orders  = rnd(150, 280)
  const colis   = rnd(60, 120)
  const encaisse = rnd(8000, 18000).toLocaleString(lang === "fr" ? "fr-FR" : "en-US")
  const num1    = `COD-${rnd(7800, 7900)}`
  const num2    = `COD-${rnd(7800, 7900)}`
  const amt1    = rnd(25, 95)
  const amt2    = rnd(25, 95)
  const cities  = ["Madrid", "Milan", "Porto", "Bucharest", "Sofia", "Athens", "Budapest", "Prague", "Barcelona"]
  const city    = cities[rnd(0, cities.length - 1)]

  return [
    t.ticker_delivered(num1, amt1),
    t.ticker_confirmed(orders),
    t.ticker_collected(encaisse),
    t.ticker_transit(colis),
    t.ticker_delivered(num2, amt2),
    t.ticker_rate(rnd(91, 97)),
    t.ticker_transfer(),
    t.ticker_route(num1, city),
  ]
}

export function LiveTicker({ lang }: { lang: Lang }) {
  const [items, setItems] = useState<string[]>(() => buildTicker(lang))

  useEffect(() => {
    setItems(buildTicker(lang))
    const id = setInterval(() => setItems(buildTicker(lang)), 25_000)
    return () => clearInterval(id)
  }, [lang])

  const doubled = [...items, ...items]

  return (
    <div className="border-b border-white/[0.04] overflow-hidden py-2.5" style={{ background: "rgba(16,185,129,0.04)" }}>
      <div className="marquee-track flex items-center whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-xs text-neutral-500 px-6 flex items-center gap-3">
            {item}
            <span className="text-white/10">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
