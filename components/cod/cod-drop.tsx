"use client"

import { useState, useEffect } from "react"
import { Boxes, Search, CheckCircle, Clock, XCircle, Package, Truck, TrendingUp, Star } from "lucide-react"

interface CodProduct {
  id: string
  name: string
  supplier: string | null
  cost_price: number
  selling_price: number
  stock: number
  category: string | null
  shipping_days: string | null
  image_url: string | null
  description: string | null
  status: "active" | "paused" | "ended"
}

const GRADIENT_COLORS = [
  "from-orange-500 to-red-600",
  "from-blue-500 to-cyan-600",
  "from-purple-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-yellow-500 to-amber-600",
  "from-rose-500 to-pink-600",
]

function StatusBadge({ status }: { status: CodProduct["status"] }) {
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

export default function CodDropPage() {
  const [products,    setProducts]    = useState<CodProduct[]>([])
  const [loading,     setLoading]     = useState(true)
  const [searchTerm,  setSearchTerm]  = useState("")

  useEffect(() => {
    fetch("/api/client/cod-products")
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeCount = products.filter(p => p.status === "active").length
  const avgMargin   = products.length
    ? (products.reduce((a, p) => a + (p.selling_price > 0 ? ((p.selling_price - p.cost_price) / p.selling_price) * 100 : 0), 0) / products.length).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">COD Drop</h1>
          <p className="text-sm text-neutral-500">Catalogue de produits disponibles pour le dropshipping COD</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Produits actifs",  val: loading ? "…" : activeCount,          icon: Boxes,      color: "text-orange-500", bg: "bg-orange-500/20" },
          { label: "Total catalogue",  val: loading ? "…" : products.length,       icon: Package,    color: "text-blue-500",   bg: "bg-blue-500/20"   },
          { label: "Marge moyenne",    val: loading ? "…" : `${avgMargin}%`,       icon: TrendingUp, color: "text-emerald-500",bg: "bg-emerald-500/20"},
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

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input type="text" placeholder="Rechercher un produit…" value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500" />
      </div>

      {/* Products */}
      {loading ? (
        <div className="py-20 text-center text-neutral-500 text-sm">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Boxes className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">
            {searchTerm ? "Aucun produit pour cette recherche." : "Aucun produit disponible pour le moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product, i) => {
            const margin = product.selling_price > 0
              ? (((product.selling_price - product.cost_price) / product.selling_price) * 100).toFixed(1)
              : "0"
            const gradient = GRADIENT_COLORS[i % GRADIENT_COLORS.length]
            return (
              <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors">
                <div className={`h-48 flex items-center justify-center relative overflow-hidden ${product.image_url ? "bg-neutral-800" : `bg-gradient-to-br ${gradient}`}`}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover object-center" />
                  ) : (
                    <Package className="w-14 h-14 text-white/30" />
                  )}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={product.status} />
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="text-white font-medium text-sm">{product.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {[product.supplier, product.category].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>

                  {product.description && (
                    <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{product.description}</p>
                  )}

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-neutral-500 mb-1">Coût</p>
                      <p className="text-sm font-semibold text-white">€{product.cost_price.toFixed(2)}</p>
                    </div>
                    <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-neutral-500 mb-1">Prix vente</p>
                      <p className="text-sm font-semibold text-orange-400">€{product.selling_price.toFixed(2)}</p>
                    </div>
                    <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
                      <p className="text-xs text-neutral-500 mb-1">Marge</p>
                      <p className="text-sm font-semibold text-emerald-400">{margin}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className={product.stock > 0 ? "text-neutral-400" : "text-red-400"}>
                      {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
                    </span>
                    {product.shipping_days && (
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />{product.shipping_days}
                      </span>
                    )}
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
