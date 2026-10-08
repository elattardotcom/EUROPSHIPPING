"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, RefreshCw, ChevronDown, ShieldCheck } from "lucide-react"

interface AuditLog {
  id:          string
  admin_email: string
  action:      string
  target_type: string
  target_id:   string | null
  metadata:    Record<string, unknown> | null
  created_at:  string
}

const ACTION_COLOR: Record<string, string> = {
  balance_adjustment:   "text-orange-400 bg-orange-500/10 border-orange-500/20",
  client_update:        "text-blue-400   bg-blue-500/10   border-blue-500/20",
  registration_approve: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  registration_reject:  "text-red-400    bg-red-500/10    border-red-500/20",
  withdrawal_approved:  "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  withdrawal_rejected:  "text-red-400    bg-red-500/10    border-red-500/20",
}

function actionLabel(a: string): string {
  return a.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

export default function AdminAuditLogsPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [actionF, setActionF] = useState("ALL")

  async function load() {
    setLoading(true)
    const d = await fetch("/api/admin/audit-logs?limit=200").then(r => r.json()).catch(() => [])
    setLogs(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const actions = useMemo(() => Array.from(new Set(logs.map(l => l.action))).sort(), [logs])

  const filtered = useMemo(() => logs.filter(l => {
    const ms = !search ||
      l.admin_email.toLowerCase().includes(search.toLowerCase()) ||
      (l.target_id ?? "").toLowerCase().includes(search.toLowerCase()) ||
      l.target_type.toLowerCase().includes(search.toLowerCase())
    const ma = actionF === "ALL" || l.action === actionF
    return ms && ma
  }), [logs, search, actionF])

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />Audit Logs
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">Accountability trail for sensitive admin actions — read-only</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by admin, target…"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
        </div>
        <div className="relative">
          <select value={actionF} onChange={e => setActionF(e.target.value)}
            className="appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
            <option value="ALL">All actions</option>
            {actions.map(a => <option key={a} value={a}>{actionLabel(a)}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{loading ? "Loading…" : `${filtered.length} action${filtered.length !== 1 ? "s" : ""} (last 200 recorded)`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Admin", "Action", "Target", "Details", "When"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-neutral-500 text-sm">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-neutral-500 text-sm">No actions recorded yet</td></tr>
              ) : filtered.map(l => (
                <tr key={l.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                  <td className="p-4 text-sm text-white font-medium whitespace-nowrap">{l.admin_email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${ACTION_COLOR[l.action] ?? "text-neutral-400 bg-neutral-800 border-neutral-700"}`}>
                      {actionLabel(l.action)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-neutral-300 whitespace-nowrap">
                    {l.target_type}
                    {l.target_id && <span className="text-neutral-600 font-mono text-xs ml-1">#{l.target_id.slice(-8)}</span>}
                  </td>
                  <td className="p-4 text-xs text-neutral-500 max-w-xs truncate font-mono">
                    {l.metadata ? JSON.stringify(l.metadata) : "—"}
                  </td>
                  <td className="p-4 text-sm text-neutral-500 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString("en-GB")}
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
