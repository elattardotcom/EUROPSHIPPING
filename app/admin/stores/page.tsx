"use client"

import { useState, useEffect, useCallback } from "react"
import { Store, RefreshCw, Radio, Search, CheckCircle, AlertCircle, Clock, AlertTriangle } from "lucide-react"
import { useI18n } from "@/lib/admin-i18n"

interface AdminStore {
  id: string; name: string; domain: string; status: string
  lastSync: string | null; clientId: string; clientName: string
  clientEmail: string; ordersToday: number; totalOrders: number
  lastSyncStatus: string | null; lastError: string | null
}

export default function AdminStores() {
  const { t } = useI18n()
  const [stores,  setStores]  = useState<AdminStore[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [live,    setLive]    = useState(false)
  const [retrying, setRetrying] = useState<string | null>(null)

  const load = useCallback(async () => {
    const d = await fetch("/api/admin/stores").then(r => r.json()).catch(() => [])
    setStores(Array.isArray(d) ? d : [])
    setLoading(false)
    setLive(true)
  }, [])

  const retry = useCallback(async (storeId: string) => {
    setRetrying(storeId)
    await fetch(`/api/admin/stores/${storeId}/sync`, { method: "POST" }).catch(() => {})
    await load()
    setRetrying(null)
  }, [load])

  useEffect(() => { load(); const i = setInterval(load, 5_000); return () => clearInterval(i) }, [load])

  const filtered = stores.filter(s =>
    `${s.name} ${s.domain} ${s.clientName}`.toLowerCase().includes(search.toLowerCase())
  )

  const connected   = stores.filter(s => s.status === "connected").length
  const syncErrors  = stores.filter(s => s.lastSyncStatus === "error").length
  const totalOrders = stores.reduce((a, s) => a + s.totalOrders, 0)
  const todayOrders = stores.reduce((a, s) => a + s.ordersToday, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("stores_title")}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{t("stores_sub")}</p>
        </div>
        <div className="flex items-center gap-3">
          {live && <span className="flex items-center gap-1.5 text-xs text-emerald-400"><Radio className="w-3 h-3 animate-pulse" />{t("live")}</span>}
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />{t("refresh")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: t("stores_total"),     value: stores.length, icon: Store,       grad: "linear-gradient(135deg,#f97316,#dc2626)", border: "rgba(249,115,22,0.25)", glow: "rgba(249,115,22,0.08)" },
          { label: t("stores_connected"), value: connected,     icon: CheckCircle, grad: "linear-gradient(135deg,#10b981,#059669)", border: "rgba(16,185,129,0.25)", glow: "rgba(16,185,129,0.08)" },
          { label: "Sync errors",         value: syncErrors,    icon: AlertTriangle, grad: "linear-gradient(135deg,#ef4444,#dc2626)", border: "rgba(239,68,68,0.25)",  glow: "rgba(239,68,68,0.08)" },
          { label: t("stores_today"),     value: todayOrders,   icon: Clock,       grad: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "rgba(59,130,246,0.25)", glow: "rgba(59,130,246,0.08)" },
          { label: t("stores_total_ord"), value: totalOrders,   icon: AlertCircle, grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)", border: "rgba(139,92,246,0.25)", glow: "rgba(139,92,246,0.08)" },
        ].map(k => (
          <div key={k.label} className="relative rounded-2xl p-5 overflow-hidden transition-all hover:-translate-y-0.5"
            style={{ background: "#111", border: `1px solid ${k.border}` }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ background: k.grad }} />
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: k.grad, opacity: 0.7 }} />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: k.glow, border: `1px solid ${k.border}` }}>
                <k.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-white mb-0.5">{loading ? "…" : k.value}</div>
              <p className="text-xs text-neutral-400 font-medium">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t("stores_search")}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{loading ? t("loading") : `${filtered.length} store${filtered.length !== 1 ? "s" : ""}`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {[t("stores_th_store"),t("stores_th_client"),t("stores_th_domain"),t("stores_th_status"),t("stores_th_today"),t("stores_th_total"),t("stores_th_sync"),"Last error",""].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-12 text-center text-neutral-500 text-sm">{t("loading")}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-neutral-500 text-sm">{t("stores_none")}</td></tr>
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
                    <code className="text-xs text-orange-400 font-mono">{s.domain}</code>
                  </td>
                  <td className="p-4">
                    {s.lastSyncStatus === "error" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-500/15 text-red-400 border-red-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Sync error
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        s.status === "connected"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/25"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === "connected" ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {s.status === "connected" ? t("status_connected") : t("status_syncing")}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-white font-semibold">{s.ordersToday}</td>
                  <td className="p-4 text-sm text-neutral-300">{s.totalOrders}</td>
                  <td className="p-4 text-xs text-neutral-500">
                    {s.lastSync ? new Date(s.lastSync).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td className="p-4 max-w-[220px]">
                    {s.lastSyncStatus === "error" && s.lastError ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-400" title={s.lastError}>
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{s.lastError}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button onClick={() => retry(s.id)} disabled={retrying === s.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs transition-colors disabled:opacity-50">
                      <RefreshCw className={`w-3.5 h-3.5 ${retrying === s.id ? "animate-spin" : ""}`} />
                      Retry
                    </button>
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
