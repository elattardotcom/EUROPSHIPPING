"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Gift, CheckCircle, Clock, Package, TrendingUp,
  Truck, ShoppingBag, Star, Loader2, ChevronDown,
} from "lucide-react"

interface AffiliateOffer {
  id: string
  name: string
  product: string | null
  commission: number
  commission_type: "percent" | "fixed"
  description: string | null
  image_url: string | null
  status: "active" | "paused" | "ended"
  created_at: string
  cost_price: number | null
  cod_price: number | null
  category: string | null
  countries: string[] | null
  stock_status: "available" | "limited" | "out_of_stock" | null
  shipping_days: number | null
  activated: boolean
}

const COUNTRY_FLAGS: Record<string, string> = {
  ES:"🇪🇸", IT:"🇮🇹", PT:"🇵🇹", RO:"🇷🇴", BG:"🇧🇬",
  HU:"🇭🇺", GR:"🇬🇷", FR:"🇫🇷", DE:"🇩🇪", BE:"🇧🇪",
}

const STOCK_CFG = {
  available:    { label: "Disponible",   cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  limited:      { label: "Stock limité", cls: "bg-amber-500/20  text-amber-400  border-amber-500/30"  },
  out_of_stock: { label: "Rupture",      cls: "bg-red-500/20    text-red-400    border-red-500/30"    },
}

function margin(o: AffiliateOffer): number {
  const comm = o.commission_type === "fixed" ? o.commission : (o.cod_price ?? 0) * o.commission / 100
  return (o.cod_price ?? 0) - (o.cost_price ?? 0) - comm
}

function ProductCard({ offer, onToggle }: { offer: AffiliateOffer; onToggle: (id: string, activate: boolean) => Promise<void> }) {
  const [loading, setLoading] = useState(false)
  const m = margin(offer)
  const stock = STOCK_CFG[offer.stock_status ?? "available"]

  async function handleToggle() {
    setLoading(true)
    await onToggle(offer.id, !offer.activated)
    setLoading(false)
  }

  return (
    <div className={`bg-neutral-900 border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 ${
      offer.activated ? "border-orange-500/40 shadow-lg shadow-orange-500/5" : "border-neutral-800 hover:border-neutral-700"
    }`}>
      {/* Image */}
      <div className="relative h-44 bg-neutral-800 flex-shrink-0">
        {offer.image_url ? (
          <img src={offer.image_url} alt={offer.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gift className="w-12 h-12 text-neutral-700" />
          </div>
        )}
        {/* Badges row */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5">
          <div className="flex flex-wrap gap-1">
            {offer.category && (
              <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">{offer.category}</span>
            )}
            {offer.stock_status && offer.stock_status !== "available" && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${stock.cls}`}>{stock.label}</span>
            )}
          </div>
          {offer.activated && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
              <CheckCircle className="w-2.5 h-2.5" /> Activé
            </span>
          )}
        </div>
        {/* Shipping badge */}
        {offer.shipping_days && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm flex items-center gap-1 px-2 py-0.5 rounded-full">
            <Truck className="w-3 h-3 text-neutral-300" />
            <span className="text-[10px] text-neutral-200 font-medium">{offer.shipping_days}j</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="text-white font-semibold text-sm leading-snug mb-0.5">{offer.name}</h3>
          {offer.description && <p className="text-xs text-neutral-500 line-clamp-2">{offer.description}</p>}
        </div>

        {/* Countries */}
        {(offer.countries ?? []).length > 0 && (
          <div className="flex flex-wrap gap-0.5">
            {(offer.countries ?? []).map(c => (
              <span key={c} title={c} className="text-base">{COUNTRY_FLAGS[c] ?? c}</span>
            ))}
          </div>
        )}

        {/* Pricing grid */}
        <div className="grid grid-cols-3 gap-1.5 bg-neutral-800/60 rounded-xl p-2.5">
          <div className="text-center">
            <p className="text-[10px] text-neutral-500 mb-0.5">Prix COD</p>
            <p className="text-sm font-bold text-white">€{(offer.cod_price ?? 0).toFixed(0)}</p>
          </div>
          <div className="text-center border-x border-neutral-700">
            <p className="text-[10px] text-neutral-500 mb-0.5">Commission</p>
            <p className="text-sm font-bold text-orange-400">
              {offer.commission}{offer.commission_type === "percent" ? "%" : "€"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-neutral-500 mb-0.5">Votre marge</p>
            <p className={`text-sm font-bold ${m >= 0 ? "text-emerald-400" : "text-red-400"}`}>€{m.toFixed(0)}</p>
          </div>
        </div>

        {/* CTA */}
        <button onClick={handleToggle} disabled={loading || offer.stock_status === "out_of_stock"}
          className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${
            offer.activated
              ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
              : "text-white"
          }`}
          style={!offer.activated ? { background: "linear-gradient(135deg,#f97316,#dc2626)" } : undefined}
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : offer.activated
              ? <><CheckCircle className="w-4 h-4 text-emerald-400" /> Désactiver</>
              : <><ShoppingBag className="w-4 h-4" /> Activer ce produit</>
          }
        </button>
      </div>
    </div>
  )
}

export default function AffiliatesPage() {
  const [offers,   setOffers]   = useState<AffiliateOffer[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<"catalogue" | "activated">("catalogue")
  const [catFilter,setCatFilter]= useState<string>("all")
  const [cntFilter,setCntFilter]= useState<string>("all")

  useEffect(() => {
    fetch("/api/client/affiliate-offers")
      .then(r => r.json())
      .then(d => setOffers(Array.isArray(d) ? d : []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false))
  }, [])

  const toggle = useCallback(async (id: string, activate: boolean) => {
    const method = activate ? "POST" : "DELETE"
    const res = await fetch(`/api/client/affiliate-offers/${id}/activate`, { method })
    if (res.ok) {
      setOffers(prev => prev.map(o => o.id === id ? { ...o, activated: activate } : o))
    }
  }, [])

  const categories = ["all", ...Array.from(new Set(offers.map(o => o.category).filter(Boolean) as string[]))]
  const countries  = ["all", ...Array.from(new Set(offers.flatMap(o => o.countries ?? [])))]

  const displayed = offers
    .filter(o => tab === "activated" ? o.activated : o.status !== "ended")
    .filter(o => catFilter === "all" || o.category === catFilter)
    .filter(o => cntFilter === "all" || (o.countries ?? []).includes(cntFilter))

  const activatedCount = offers.filter(o => o.activated).length
  const avgMargin = offers.length ? offers.reduce((s, o) => s + margin(o), 0) / offers.length : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Marketplace produits</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Activez des produits pour les vendre en COD</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Produits dispo",   val: offers.filter(o => o.status === "active").length, icon: Gift,       color: "#f97316" },
          { label: "Mes activations",  val: activatedCount,                                    icon: Star,       color: "#8b5cf6" },
          { label: "Marge moy.",       val: `€${avgMargin.toFixed(0)}`,                        icon: TrendingUp, color: "#10b981" },
          { label: "En attente",       val: offers.filter(o => o.stock_status === "limited").length, icon: Clock, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}18` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{loading ? "…" : s.val}</p>
              <p className="text-[11px] text-neutral-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Tabs */}
        <div className="flex bg-neutral-800 rounded-xl p-1 gap-1">
          {(["catalogue", "activated"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? "bg-orange-500 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}>
              {t === "catalogue" ? "Catalogue" : `Mes produits${activatedCount > 0 ? ` (${activatedCount})` : ""}`}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="appearance-none bg-neutral-800 border border-neutral-700 rounded-xl pl-3 pr-8 py-1.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
              <option value="all">Toutes catégories</option>
              {categories.filter(c => c !== "all").map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={cntFilter} onChange={e => setCntFilter(e.target.value)}
              className="appearance-none bg-neutral-800 border border-neutral-700 rounded-xl pl-3 pr-8 py-1.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
              <option value="all">Tous les pays</option>
              {countries.filter(c => c !== "all").map(c => <option key={c} value={c}>{COUNTRY_FLAGS[c] ?? c} {c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-20 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
          <Package className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-400 font-medium">
            {tab === "activated" ? "Aucun produit activé" : "Aucun produit trouvé"}
          </p>
          <p className="text-neutral-600 text-sm mt-1">
            {tab === "activated" ? "Activez des produits depuis le Catalogue" : "Essayez d'autres filtres"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayed.map(offer => (
            <ProductCard key={offer.id} offer={offer} onToggle={toggle} />
          ))}
        </div>
      )}
    </div>
  )
}
