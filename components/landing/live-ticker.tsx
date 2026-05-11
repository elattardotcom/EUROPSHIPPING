"use client"

import { useEffect, useState } from "react"

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildTicker() {
  const orders   = rnd(150, 280)
  const colis    = rnd(60, 120)
  const encaisse = rnd(8000, 18000).toLocaleString("fr-FR")
  const num1     = `COD-${rnd(7800, 7900)}`
  const num2     = `COD-${rnd(7800, 7900)}`
  const amt1     = rnd(25, 95)
  const amt2     = rnd(25, 95)
  const cities   = ["Madrid", "Milan", "Porto", "Bucarest", "Sofia", "Athènes", "Budapest", "Prague", "Barcelone"]
  const city     = cities[rnd(0, cities.length - 1)]

  return [
    `📦 ${num1} LIVRÉ · +€${amt1}`,
    `✅ ${orders} commandes confirmées aujourd'hui`,
    `💰 €${encaisse} encaissés ce mois`,
    `🚚 ${colis} colis en route maintenant`,
    `📦 ${num2} LIVRÉ · +€${amt2}`,
    `✅ Taux de livraison ${rnd(91, 97)}%`,
    `💰 Virement reçu en 48h`,
    `🚚 ${num1} EN ROUTE · ${city}`,
  ]
}

export function LiveTicker() {
  const [items, setItems] = useState<string[]>(() => buildTicker())

  useEffect(() => {
    const id = setInterval(() => setItems(buildTicker()), 25_000)
    return () => clearInterval(id)
  }, [])

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
