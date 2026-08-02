"use client"

import { useState, useMemo } from "react"
import { TrendingUp, Package, DollarSign, BarChart3 } from "lucide-react"

type Lang = "fr" | "en"

const SHIPPING: Record<string, { ship: number; ret: number; fr: string; en: string; flag: string }> = {
  IT: { ship: 5.50, ret: 3.20, fr: "Italie",    en: "Italy",    flag: "🇮🇹" },
  ES: { ship: 5.20, ret: 3.50, fr: "Espagne",   en: "Spain",    flag: "🇪🇸" },
  PT: { ship: 6.20, ret: 4.00, fr: "Portugal",  en: "Portugal", flag: "🇵🇹" },
  FR: { ship: 5.80, ret: 3.80, fr: "France",    en: "France",   flag: "🇫🇷" },
  RO: { ship: 4.20, ret: 2.80, fr: "Roumanie",  en: "Romania",  flag: "🇷🇴" },
  BG: { ship: 3.80, ret: 2.50, fr: "Bulgarie",  en: "Bulgaria", flag: "🇧🇬" },
  GR: { ship: 6.00, ret: 4.20, fr: "Grèce",     en: "Greece",   flag: "🇬🇷" },
  HU: { ship: 4.50, ret: 3.00, fr: "Hongrie",   en: "Hungary",  flag: "🇭🇺" },
  CZ: { ship: 4.80, ret: 3.20, fr: "Tchéquie",  en: "Czechia",  flag: "🇨🇿" },
  SK: { ship: 4.80, ret: 3.20, fr: "Slovaquie", en: "Slovakia", flag: "🇸🇰" },
}

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)
}

function SliderRow({
  label, value, min, max, step, suffix, onChange, color = "#f97316",
}: {
  label: string; value: number; min: number; max: number; step: number
  suffix?: string; onChange: (v: number) => void; color?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-neutral-400">{label}</span>
        <span className="text-sm font-bold text-white tabular-nums">
          {suffix === "€" ? `€${value}` : `${value}${suffix ?? ""}`}
        </span>
      </div>
      <div className="relative">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
          }}
        />
      </div>
    </div>
  )
}

export default function ProfitCalc({ lang = "fr" }: { lang?: Lang }) {
  const [leads,        setLeads]        = useState(500)
  const [sellingPrice, setSellingPrice] = useState(55)
  const [productCost,  setProductCost]  = useState(12)
  const [adCost,       setAdCost]       = useState(5)
  const [confirmRate,  setConfirmRate]  = useState(60)
  const [deliveryRate, setDeliveryRate] = useState(72)
  const [country,      setCountry]      = useState("IT")

  const r = useMemo(() => {
    const rates     = SHIPPING[country]
    const confirmed = Math.round(leads * confirmRate / 100)
    const delivered = Math.round(confirmed * deliveryRate / 100)
    const returned  = confirmed - delivered

    const revenue    = delivered * sellingPrice
    const cAds       = leads * adCost
    const cCalls     = leads * 1.20
    const cShipping  = confirmed * rates.ship
    const cReturns   = returned * rates.ret
    const cProduct   = confirmed * productCost
    const cPlatform  = 31.99
    const totalCosts = cAds + cCalls + cShipping + cReturns + cProduct + cPlatform

    const profit         = revenue - totalCosts
    const profitPerOrder = delivered > 0 ? profit / delivered : 0
    const roi            = cAds > 0 ? (profit / cAds) * 100 : 0
    const margin         = revenue > 0 ? (profit / revenue) * 100 : 0

    return { confirmed, delivered, returned, revenue, cAds, cCalls, cShipping, cReturns, cProduct, cPlatform, totalCosts, profit, profitPerOrder, roi, margin }
  }, [leads, sellingPrice, productCost, adCost, confirmRate, deliveryRate, country])

  const profitColor = r.profit > 0 ? "#10b981" : r.profit > -200 ? "#f59e0b" : "#ef4444"
  const profitBg    = r.profit > 0 ? "rgba(16,185,129,0.08)" : r.profit > -200 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)"
  const profitBorder= r.profit > 0 ? "rgba(16,185,129,0.25)" : r.profit > -200 ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.07]" style={{ background: "rgba(8,8,10,0.9)" }}>

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/[0.06]" style={{ background: "rgba(249,115,22,0.04)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)" }}>
            <BarChart3 className="w-4.5 h-4.5 text-orange-400" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">{lang === "fr" ? "Simulateur de rentabilité" : "Profitability simulator"}</h3>
            <p className="text-neutral-500 text-xs">{lang === "fr" ? "Estimation mensuelle · Ajustez les curseurs" : "Monthly estimate · Adjust the sliders"}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_1px_1fr] gap-0">

        {/* ── LEFT: INPUTS ── */}
        <div className="p-6 space-y-5">

          {/* Country selector */}
          <div>
            <p className="text-sm text-neutral-400 mb-2">{lang === "fr" ? "Pays de livraison" : "Delivery country"}</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(SHIPPING).map(([code, s]) => (
                <button
                  key={code}
                  onClick={() => setCountry(code)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                  style={
                    country === code
                      ? { background: "rgba(249,115,22,0.18)", border: "1px solid rgba(249,115,22,0.45)", color: "#fb923c" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#6b7280" }
                  }
                >
                  {s.flag} {lang === "fr" ? s.fr : s.en}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <SliderRow label={lang === "fr" ? "Leads / mois" : "Leads / month"} value={leads} min={100} max={2000} step={50} onChange={setLeads} color="#f97316" />
          <SliderRow label={lang === "fr" ? "Prix de vente" : "Selling price"} value={sellingPrice} min={20} max={150} step={5} suffix="€" onChange={setSellingPrice} color="#f97316" />
          <SliderRow label={lang === "fr" ? "Coût produit + fret" : "Product cost + freight"} value={productCost} min={3} max={60} step={1} suffix="€" onChange={setProductCost} color="#6366f1" />
          <SliderRow label={lang === "fr" ? "Budget pub / lead" : "Ad budget / lead"} value={adCost} min={1} max={20} step={0.5} suffix="€" onChange={setAdCost} color="#6366f1" />
          <SliderRow label={lang === "fr" ? "Taux de confirmation" : "Confirmation rate"} value={confirmRate} min={30} max={85} step={5} suffix="%" onChange={setConfirmRate} color="#f59e0b" />
          <SliderRow label={lang === "fr" ? "Taux de livraison" : "Delivery rate"} value={deliveryRate} min={50} max={90} step={5} suffix="%" onChange={setDeliveryRate} color="#10b981" />

          {/* Volume summary */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: lang === "fr" ? "Confirmées" : "Confirmed", v: r.confirmed, color: "#f59e0b" },
              { label: lang === "fr" ? "Livrées"    : "Delivered", v: r.delivered, color: "#10b981" },
              { label: lang === "fr" ? "Retours"    : "Returns",   v: r.returned,  color: "#f43f5e" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-lg font-black tabular-nums" style={{ color: s.color }}>{s.v}</p>
                <p className="text-[10px] text-neutral-600 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block bg-white/[0.05]" />

        {/* ── RIGHT: RESULTS ── */}
        <div className="p-6 flex flex-col gap-4">

          {/* Main profit card */}
          <div className="rounded-2xl p-5 text-center" style={{ background: profitBg, border: `1px solid ${profitBorder}` }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: profitColor }}>
              {lang === "fr" ? "Profit net mensuel" : "Monthly net profit"}
            </p>
            <p className="text-4xl font-black tabular-nums" style={{ color: profitColor }}>
              {r.profit >= 0 ? "+" : ""}{fmt(r.profit)}
            </p>
            <p className="text-xs mt-1.5" style={{ color: profitColor, opacity: 0.7 }}>
              {lang === "fr" ? `soit ${fmt(r.profitPerOrder)} / commande livrée` : `i.e. ${fmt(r.profitPerOrder)} / delivered order`}
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: DollarSign, label: lang === "fr" ? "Revenus bruts" : "Gross revenue", v: fmt(r.revenue),              color: "#f97316" },
              { icon: TrendingUp, label: lang === "fr" ? "ROI pub"       : "Ad ROI",        v: `${Math.round(r.roi)}%`,     color: r.roi > 100 ? "#10b981" : r.roi > 50 ? "#f59e0b" : "#ef4444" },
              { icon: Package,    label: lang === "fr" ? "Marge nette"   : "Net margin",    v: `${Math.round(r.margin)}%`,  color: r.margin > 20 ? "#10b981" : r.margin > 10 ? "#f59e0b" : "#ef4444" },
              { icon: BarChart3,  label: lang === "fr" ? "Total coûts"   : "Total costs",   v: fmt(r.totalCosts),           color: "#94a3b8" },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] text-neutral-600 mb-1 uppercase tracking-wider">{k.label}</p>
                <p className="text-lg font-black tabular-nums" style={{ color: k.color }}>{k.v}</p>
              </div>
            ))}
          </div>

          {/* Cost breakdown */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-4 py-3 border-b border-white/[0.05]" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{lang === "fr" ? "Détail des coûts" : "Cost breakdown"}</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {[
                { l: lang === "fr" ? "Publicité"      : "Advertising",   v: r.cAds,      c: "#6366f1" },
                { l: lang === "fr" ? "Centre d'appel" : "Call centre",   v: r.cCalls,    c: "#f59e0b" },
                { l: lang === "fr" ? "Livraison"      : "Delivery",      v: r.cShipping, c: "#3b82f6" },
                { l: lang === "fr" ? "Retours"        : "Returns",       v: r.cReturns,  c: "#f43f5e" },
                { l: lang === "fr" ? "Produits"       : "Products",      v: r.cProduct,  c: "#94a3b8" },
                { l: lang === "fr" ? "Plateforme"     : "Platform",      v: r.cPlatform, c: "#64748b" },
              ].map(row => (
                <div key={row.l} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.c }} />
                    <span className="text-xs text-neutral-500">{row.l}</span>
                  </div>
                  <span className="text-xs font-semibold text-neutral-300 tabular-nums">{fmt(row.v)}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-neutral-700 text-center leading-relaxed">
            {lang === "fr"
              ? "Simulation indicative. Résultats réels variables selon produit, pays et campagnes publicitaires."
              : "Indicative simulation. Actual results vary by product, country and advertising campaigns."}
          </p>
        </div>
      </div>
    </div>
  )
}
