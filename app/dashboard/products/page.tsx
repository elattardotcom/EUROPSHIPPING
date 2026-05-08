"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Search, RefreshCw, ShoppingBag, Plus, Loader2, Package, AlertCircle,
  BarChart2, TrendingUp, TrendingDown, ArrowLeft, ShoppingCart,
  CheckCircle, XCircle, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shopify/ProductCard"
import type { ProductStat } from "@/app/api/client/products/analytics/route"

interface Product {
  id:        string
  shopifyId: string
  title:     string
  imageUrl:  string | null
  price:     number
  currency:  string
  stock:     number | null
  storeId:   string
  storeName: string
  domain:    string
  updatedAt: string
}

const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function RateBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-neutral-400 w-8 text-right">{value}%</span>
    </div>
  )
}

function ProductDetail({ stat, onBack }: { stat: ProductStat; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour aux produits
      </button>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{stat.product}</h2>
            <p className="text-sm text-neutral-500 mt-0.5">{stat.totalOrders} commandes · {stat.totalLeads} leads</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Chiffre d'affaires", value: `€${fmt(stat.revenue)}`,   color: "text-emerald-400", border: "border-l-emerald-500" },
          { label: "Commandes livrées",  value: stat.deliveredOrders,        color: "text-blue-400",    border: "border-l-blue-500"    },
          { label: "Retours",            value: stat.returnedOrders,         color: "text-red-400",     border: "border-l-red-500"     },
          { label: "Leads confirmés",    value: stat.confirmedLeads,         color: "text-amber-400",   border: "border-l-amber-500"   },
        ].map(s => (
          <div key={s.label} className={`bg-neutral-900 border border-neutral-800 border-l-4 ${s.border} rounded-xl p-4`}>
            <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-orange-400" /> Commandes
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Taux de livraison</span><span>{stat.deliveryRate}%</span>
              </div>
              <RateBar value={stat.deliveryRate} color="bg-emerald-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Taux de retour</span><span>{stat.returnRate}%</span>
              </div>
              <RateBar value={stat.returnRate} color="bg-red-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800">
            {[
              { label: "Total",   value: stat.totalOrders,     color: "text-white"        },
              { label: "Livrés",  value: stat.deliveredOrders, color: "text-emerald-400"  },
              { label: "Retours", value: stat.returnedOrders,  color: "text-red-400"      },
            ].map(r => (
              <div key={r.label} className="text-center">
                <p className={`text-xl font-bold ${r.color}`}>{r.value}</p>
                <p className="text-xs text-neutral-500">{r.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-400" /> Leads
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Taux de confirmation</span><span>{stat.confirmationRate}%</span>
              </div>
              <RateBar value={stat.confirmationRate} color="bg-amber-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800">
            {[
              { label: "Total",     value: stat.totalLeads,     color: "text-white"       },
              { label: "Confirmés", value: stat.confirmedLeads, color: "text-amber-400"   },
              { label: "Annulés",   value: stat.canceledLeads,  color: "text-neutral-500" },
            ].map(r => (
              <div key={r.label} className="text-center">
                <p className={`text-xl font-bold ${r.color}`}>{r.value}</p>
                <p className="text-xs text-neutral-500">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsTab() {
  const [stats,   setStats]   = useState<ProductStat[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [selected, setSelected] = useState<ProductStat | null>(null)

  useEffect(() => {
    fetch("/api/client/products/analytics")
      .then(r => r.json())
      .then(d => { setStats(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
    </div>
  )

  if (selected) return <ProductDetail stat={selected} onBack={() => setSelected(null)} />

  const filtered = stats.filter(s => s.product.toLowerCase().includes(search.toLowerCase()))

  const totalRevenue = stats.reduce((s, p) => s + p.revenue, 0)
  const totalOrders  = stats.reduce((s, p) => s + p.totalOrders, 0)
  const bestProduct  = stats[0]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 border-l-4 border-l-emerald-500 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">CA total</p>
          <p className="text-2xl font-bold text-emerald-400">€{fmt(totalRevenue)}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 border-l-4 border-l-blue-500 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Total commandes</p>
          <p className="text-2xl font-bold text-white">{totalOrders}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 border-l-4 border-l-orange-500 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Meilleur produit</p>
          <p className="text-lg font-bold text-orange-400 truncate">{bestProduct?.product ?? "—"}</p>
          {bestProduct && <p className="text-xs text-neutral-500">€{fmt(bestProduct.revenue)}</p>}
        </div>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un produit…"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <BarChart2 className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">Aucune donnée produit disponible.</p>
          <p className="text-neutral-600 text-xs mt-1">Les statistiques apparaissent dès que des commandes ou leads sont enregistrés.</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  {["Produit", "CA (€)", "Commandes", "Livraison", "Retours", "Leads", "Confirmation", ""].map(h => (
                    <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.product}
                    className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelected(s)}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
                          <Package className="w-3.5 h-3.5 text-orange-400" />
                        </div>
                        <span className="text-sm text-white font-medium max-w-[160px] truncate">{s.product}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-emerald-400 whitespace-nowrap">€{fmt(s.revenue)}</td>
                    <td className="p-4 text-sm text-white">{s.totalOrders}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-sm text-emerald-400">{s.deliveryRate}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span className="text-sm text-red-400">{s.returnRate}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white">{s.totalLeads}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="text-sm text-amber-400">{s.confirmationRate}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <ChevronRight className="w-4 h-4 text-neutral-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  const [tab,       setTab]       = useState<"catalogue" | "stats">("catalogue")
  const [products,  setProducts]  = useState<Product[]>([])
  const [search,    setSearch]    = useState("")
  const [status,    setStatus]    = useState<"loading" | "ready" | "notauth" | "nostore">("loading")
  const [syncing,   setSyncing]   = useState(false)
  const [syncError, setSyncError] = useState("")
  const [storeId,   setStoreId]   = useState<string | null>(null)
  const [storeName, setStoreName] = useState("")

  const load = useCallback(async () => {
    setStatus("loading")
    setSyncError("")
    try {
      const res = await fetch("/api/client/products")
      if (res.status === 401) { setStatus("notauth"); return }
      const data = await res.json()
      if (!data.hasStore) { setStatus("nostore"); return }
      if (data.stores?.[0]) { setStoreId(data.stores[0].id); setStoreName(data.stores[0].name) }
      setProducts(data.products ?? [])
      setStatus("ready")
    } catch {
      setSyncError("Erreur réseau. Veuillez réessayer.")
      setStatus("ready")
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (status === "ready" && products.length === 0 && storeId && !syncing) handleSync()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, storeId])

  const handleSync = useCallback(async () => {
    if (!storeId) return
    setSyncing(true)
    setSyncError("")
    try {
      const res = await fetch("/api/shopify/sync-store", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setSyncError(err?.error ?? "Erreur lors de la synchronisation")
      }
    } catch { setSyncError("Erreur réseau. Veuillez réessayer.") }
    await load()
    setSyncing(false)
  }, [storeId, load])

  const filtered = products.filter(p => (p.title ?? "").toLowerCase().includes(search.toLowerCase()))

  if (status === "loading") return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      <p className="text-neutral-500 text-sm">Chargement…</p>
    </div>
  )

  if (status === "notauth") return (
    <div className="p-6 flex flex-col items-center justify-center py-32 text-center">
      <ShoppingBag className="w-12 h-12 text-neutral-700 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Session expirée</h2>
      <p className="text-neutral-500 text-sm mb-6">Veuillez vous reconnecter.</p>
      <Link href="/login"><Button className="bg-orange-500 hover:bg-orange-600 text-white">Se connecter</Button></Link>
    </div>
  )

  if (status === "nostore") return (
    <div className="p-6 flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-5">
        <ShoppingBag className="w-10 h-10 text-orange-500" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Aucune boutique connectée</h2>
      <p className="text-neutral-500 text-sm max-w-sm mb-6">Connectez votre boutique Shopify pour synchroniser vos produits.</p>
      <Link href="/dashboard/stores">
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Connecter Shopify
        </Button>
      </Link>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Produits</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {storeName || products[0]?.storeName} · {products.length} produit{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {tab === "catalogue" && (
            <>
              <Button onClick={handleSync} disabled={syncing} variant="ghost" size="sm"
                className="text-neutral-400 hover:text-white hover:bg-white/5 border border-neutral-800">
                {syncing
                  ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Sync…</>
                  : <><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Synchroniser</>
                }
              </Button>
              <Link href="/dashboard/stores">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Nouvelle boutique
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl w-fit">
        {([
          { key: "catalogue", label: "Catalogue",     Icon: Package   },
          { key: "stats",     label: "Statistiques",  Icon: BarChart2 },
        ] as const).map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? "bg-orange-500 text-white"
                : "text-neutral-400 hover:text-white"
            }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === "stats" ? <StatsTab /> : (
        <>
          {syncError && (
            <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{syncError}
            </div>
          )}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit…"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">Aucun produit ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(p => (
                <ProductCard key={p.id} product={{
                  id: p.id, title: p.title, image_url: p.imageUrl,
                  price: p.price, currency: p.currency, stock: p.stock, storeName: p.storeName,
                }} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
