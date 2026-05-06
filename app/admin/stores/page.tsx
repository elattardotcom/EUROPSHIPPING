"use client"

import { useState, useEffect, useCallback } from "react"
import { Store, RefreshCw, ExternalLink, Radio, Search, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface AdminStore {
  id: string; name: string; domain: string; status: string
  lastSync: string | null; clientId: string; clientName: string
  clientEmail: string; ordersToday: number; totalOrders: number
}

export default function AdminStores() {
  const [stores,  setStores]  = useState<AdminStore[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [live,    setLive]    = useState(false)

  const load = useCallback(async () => {
    const d = await fetch("/api/admin/stores").then(r => r.json()).catch(() => [])
    setStores(Array.isArray(d) ? d : [])
    setLoading(false)
    setLive(true)
  }, [])

  useEffect(() => { load(); const t = setInterval(load, 5_000); return () => clearInterval(t) }, [load])

  const filtered = stores.filter(s =>
    `${s.name} ${s.domain} ${s.clientName}`.toLowerCase().includes(search.toLowerCase())
  )

  const connected = stores.filter(s => s.status === "connected").length
  const totalOrders = stores.reduce((a, s) => a + s.totalOrders, 0)
  const todayOrders = stores.reduce((a, s) => a + s.ordersToday, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Boutiques Shopify</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Toutes les boutiques connectées par les clients</p>
        </div>
        <div className="flex items-center gap-3">
          {live && <span className="flex items-center gap-1.5 text-xs text-emerald-400"><Radio className="w-3 h-3 animate-pulse" />Live</span>}
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />Actualiser
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total boutiques",    value: stores.length,  color: "from-orange-500 to-red-600",     icon: Store         },
          { label: "Connectées",         value: connected,       color: "from-emerald-500 to-teal-600",   icon: CheckCircle   },
          { label: "Commandes du jour",  value: todayOrders,    color: "from-blue-500 to-cyan-600",      icon: Clock         },
          { label: "Total commandes",    value: totalOrders,    color: "from-purple-500 to-violet-600",  icon: AlertCircle   },
        ].map(k => (
          <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}>
              <k.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{loading ? "…" : k.value}</div>
            <p className="text-xs text-neutral-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher boutique ou client…"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{loading ? "Chargement…" : `${filtered.length} boutique${filtered.length !== 1 ? "s" : ""}`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Boutique", "Client", "Domaine", "Statut", "Cmd du jour", "Total cmds", "Dernière sync"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">Chargement…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">Aucune boutique connectée.</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-lg flex-shrink-0">🛍️</div>
                      <span className="text-white text-sm font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-white font-medium">{s.clientName}</p>
                    <p className="text-xs text-neutral-500">{s.clientEmail}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs text-orange-400 font-mono">{s.domain}</code>
                      <a href={`https://${s.domain}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 text-neutral-600 hover:text-white" />
                      </a>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      s.status === "connected"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/25"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === "connected" ? "bg-emerald-400" : "bg-amber-400"}`} />
                      {s.status === "connected" ? "Connectée" : "En cours"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-white font-semibold">{s.ordersToday}</td>
                  <td className="p-4 text-sm text-neutral-300">{s.totalOrders}</td>
                  <td className="p-4 text-xs text-neutral-500">
                    {s.lastSync ? new Date(s.lastSync).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
