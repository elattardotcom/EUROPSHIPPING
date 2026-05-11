"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search, Download, ChevronLeft, ChevronRight,
  MoreHorizontal, Truck, CheckCircle, XCircle, Clock,
  AlertCircle, Package, ShoppingCart, ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCSV } from "@/lib/mock-data"
import type { Order, OrderStatus } from "@/lib/mock-data"

const FLAGS: Record<string, string> = { PT: "🇵🇹", ES: "🇪🇸", FR: "🇫🇷", MA: "🇲🇦" }

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  PENDING:   { label: "En attente",  color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/25",     Icon: Clock },
  SHIPPED:   { label: "Expédié",     color: "text-blue-400",    bg: "bg-blue-500/15 border-blue-500/25",       Icon: Truck },
  DELIVERED: { label: "Livré",       color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25", Icon: CheckCircle },
  RETURNED:  { label: "Retourné",    color: "text-red-400",     bg: "bg-red-500/15 border-red-500/25",         Icon: XCircle },
  ERROR:     { label: "Erreur",      color: "text-rose-400",    bg: "bg-rose-600/15 border-rose-600/25",       Icon: AlertCircle },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const c = STATUS_CONFIG[status]
  const Icon = c.Icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.color}`}>
      <Icon className="w-3 h-3" />{c.label}
    </span>
  )
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
}

const AVATAR_COLORS = [
  "from-orange-500 to-red-600", "from-teal-500 to-emerald-600",
  "from-blue-500 to-cyan-600",  "from-purple-500 to-violet-600",
  "from-pink-500 to-rose-600",
]

const PER_PAGE = 10

export default function OrdersPage() {
  const [search, setSearch]       = useState("")
  const [statusFilter, setStatus] = useState<OrderStatus | "ALL">("ALL")
  const [countryFilter, setCt]    = useState("ALL")
  const [page, setPage]           = useState(1)
  const [selected, setSelected]   = useState<string[]>([])
  const [orders, setOrders]       = useState<Order[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch("/api/client/orders")
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => orders.filter(o => {
    const ms  = o.name.toLowerCase().includes(search.toLowerCase()) ||
                o.product.toLowerCase().includes(search.toLowerCase()) ||
                (o.trackingNumber ?? "").includes(search)
    const mst = statusFilter === "ALL" || o.status === statusFilter
    const mc  = countryFilter === "ALL" || o.countryCode === countryFilter
    return ms && mst && mc
  }), [orders, search, statusFilter, countryFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const cur        = Math.min(page, totalPages)
  const paginated  = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE)

  const counts = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === "PENDING").length,
    shipped:   orders.filter(o => o.status === "SHIPPED").length,
    delivered: orders.filter(o => o.status === "DELIVERED").length,
    returned:  orders.filter(o => o.status === "RETURNED").length,
  }

  const toggleAll = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(o => o.id))
  const toggleOne = (id: string) => setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id])

  const handleExport = (rows = orders) => {
    exportToCSV(
      rows.map(o => ({
        ID: o.id, Nom: o.name, Téléphone: o.phone, Pays: o.country,
        Statut: STATUS_CONFIG[o.status].label, Produit: o.product,
        "N° Suivi": o.trackingNumber ?? "",
        "Valeur (EUR)": o.orderValue.toFixed(2), Boutique: o.store,
        Date: o.createdAt, Heure: o.createdTime,
      })),
      "commandes_codship.csv"
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Commandes</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Suivez toutes vos commandes en cours et leur statut de livraison</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleExport(selected.length ? orders.filter(o => selected.includes(o.id)) : orders)}
            className="bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 gap-2">
            <Package className="w-4 h-4" />Actions groupées
          </Button>
          <Button onClick={() => handleExport()} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
            <Download className="w-4 h-4" />Exporter Excel
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total",      value: counts.total,     Icon: ShoppingCart, border: "border-l-blue-500",    status: "ALL"       },
          { label: "En attente", value: counts.pending,   Icon: Clock,        border: "border-l-amber-500",   status: "PENDING"   },
          { label: "Expédiés",   value: counts.shipped,   Icon: Truck,        border: "border-l-blue-400",    status: "SHIPPED"   },
          { label: "Livrés",     value: counts.delivered, Icon: CheckCircle,  border: "border-l-emerald-500", status: "DELIVERED" },
          { label: "Retournés",  value: counts.returned,  Icon: XCircle,      border: "border-l-red-500",     status: "RETURNED"  },
        ].map(c => (
          <button key={c.label}
            onClick={() => { setStatus(c.status as OrderStatus | "ALL"); setPage(1) }}
            className={`bg-neutral-900 border border-neutral-800 border-l-4 ${c.border} rounded-xl p-4 text-left hover:border-neutral-700 transition-colors`}
          >
            <c.Icon className="w-4 h-4 text-neutral-500 mb-3" />
            <div className="text-2xl font-bold text-white mb-0.5">{c.value}</div>
            <p className="text-xs text-neutral-500">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Rechercher une commande..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => { setStatus(e.target.value as OrderStatus | "ALL"); setPage(1) }}
            className="appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="SHIPPED">Expédié</option>
            <option value="DELIVERED">Livré</option>
            <option value="RETURNED">Retourné</option>
            <option value="ERROR">Erreur</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={countryFilter} onChange={e => { setCt(e.target.value); setPage(1) }}
            className="appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
            <option value="ALL">Tous les pays</option>
            <option value="PT">🇵🇹 Portugal</option>
            <option value="ES">🇪🇸 Espagne</option>
            <option value="FR">🇫🇷 France</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl ml-auto">
            <span className="text-sm text-orange-400 font-medium">{selected.length} sélectionné(s)</span>
            <Button size="sm" variant="outline" onClick={() => handleExport(orders.filter(o => selected.includes(o.id)))}
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20 h-7 text-xs">
              Exporter sélection
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <h2 className="text-base font-semibold text-white">Toutes les commandes</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{filtered.length} résultats</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="w-12 p-4">
                  <input type="checkbox" checked={paginated.length > 0 && selected.length === paginated.length}
                    onChange={toggleAll} className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 accent-orange-500 cursor-pointer" />
                </th>
                {["Client", "Pays", "Statut", "Produit", "N° Suivi", "Valeur", "Date"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                ))}
                <th className="w-12 p-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-16 text-center text-neutral-500 text-sm">Chargement…</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center text-neutral-500 text-sm">Aucune commande trouvée.</td></tr>
              ) : paginated.map((order, i) => (
                <tr key={order.id} className={`border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/30 transition-colors ${selected.includes(order.id) ? "bg-orange-500/5" : ""}`}>
                  <td className="p-4">
                    <input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggleOne(order.id)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 accent-orange-500 cursor-pointer" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {initials(order.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate max-w-[150px]">{order.name}</p>
                        <p className="text-neutral-500 text-xs">{order.store}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{FLAGS[order.countryCode] ?? "🏳️"}</span>
                      <span className="text-sm text-neutral-300">{order.country}</span>
                    </div>
                  </td>
                  <td className="p-4"><StatusBadge status={order.status} /></td>
                  <td className="p-4"><span className="text-sm text-neutral-300 truncate block max-w-[130px]">{order.product}</span></td>
                  <td className="p-4">
                    {order.trackingNumber
                      ? <code className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">{order.trackingNumber}</code>
                      : <span className="text-xs text-neutral-600">—</span>
                    }
                  </td>
                  <td className="p-4"><span className="text-sm font-semibold text-white">€{order.orderValue.toFixed(2)}</span></td>
                  <td className="p-4">
                    <p className="text-sm text-neutral-300">{order.createdAt}</p>
                    <p className="text-xs text-neutral-600">{order.createdTime}</p>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-5 py-4 border-t border-neutral-800 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            {filtered.length === 0 ? 0 : (cur - 1) * PER_PAGE + 1}–{Math.min(cur * PER_PAGE, filtered.length)} sur {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
              disabled={cur === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${cur === p ? "bg-orange-500 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}>
                {p}
              </button>
            ))}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
              disabled={cur === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
