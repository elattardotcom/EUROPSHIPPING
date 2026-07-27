"use client"

import { useState, useEffect } from "react"
import { Gift, CheckCircle, Clock, XCircle, TrendingUp, DollarSign } from "lucide-react"

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
}

const GRADIENT_COLORS = [
  "from-purple-500 to-violet-600",
  "from-orange-500 to-red-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-yellow-500 to-amber-600",
]

function StatusBadge({ status }: { status: AffiliateOffer["status"] }) {
  const styles = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    ended:  "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
  }
  const icons  = { active: CheckCircle, paused: Clock, ended: XCircle }
  const labels = { active: "Actif", paused: "Pausé", ended: "Terminé" }
  const Icon = icons[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon className="w-3 h-3" />{labels[status]}
    </span>
  )
}

export default function AffiliatesPage() {
  const [offers,  setOffers]  = useState<AffiliateOffer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/client/affiliate-offers")
      .then(r => r.json())
      .then(d => setOffers(Array.isArray(d) ? d : []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false))
  }, [])

  const activeCount = offers.filter(o => o.status === "active").length
  const avgCommission = offers.length
    ? (offers.reduce((a, o) => a + o.commission, 0) / offers.length).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Affiliés</h1>
          <p className="text-sm text-neutral-500">Offres d'affiliation disponibles pour promouvoir des produits</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Offres actives",      val: loading ? "…" : activeCount,                                icon: Gift,       color: "text-purple-400", bg: "bg-purple-500/20" },
          { label: "Total offres",        val: loading ? "…" : offers.length,                              icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/20" },
          { label: "Commission moyenne",  val: loading ? "…" : `${avgCommission}%`,                        icon: DollarSign, color: "text-emerald-500",bg: "bg-emerald-500/20"},
        ].map(s => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{s.label}</p>
                <p className="text-2xl font-bold text-white">{s.val}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Offers */}
      {loading ? (
        <div className="py-20 text-center text-neutral-500 text-sm">Chargement…</div>
      ) : offers.length === 0 ? (
        <div className="py-20 text-center">
          <Gift className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">Aucune offre d'affiliation disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer, i) => {
            const gradient = GRADIENT_COLORS[i % GRADIENT_COLORS.length]
            return (
              <div key={offer.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors">
                <div className={`h-32 flex items-center justify-center relative overflow-hidden ${offer.image_url ? "" : `bg-gradient-to-br ${gradient}`}`}>
                  {offer.image_url ? (
                    <img src={offer.image_url} alt={offer.name} className="w-full h-full object-cover" />
                  ) : (
                    <Gift className="w-14 h-14 text-white/30" />
                  )}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={offer.status} />
                  </div>
                  <div className="absolute top-3 right-3 bg-black/40 px-2.5 py-1 rounded-full">
                    <span className="text-white text-xs font-bold">
                      {offer.commission}{offer.commission_type === "percent" ? "%" : "€"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-medium text-sm mb-1">{offer.name}</h3>
                  {offer.product && (
                    <p className="text-xs text-neutral-500 mb-2">Produit : {offer.product}</p>
                  )}
                  {offer.description && (
                    <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{offer.description}</p>
                  )}

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-neutral-500 mb-0.5">Commission</p>
                    <p className="text-lg font-bold text-orange-400">
                      {offer.commission}{offer.commission_type === "percent" ? "%" : "€"}
                      <span className="text-xs text-neutral-500 ml-1">
                        {offer.commission_type === "percent" ? "par vente" : "fixe"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
