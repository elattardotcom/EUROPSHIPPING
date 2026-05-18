"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw, ExternalLink, Loader2, ChevronDown, X, Send, MessageSquare } from "lucide-react"

const STATUS_CFG = {
  PENDING:    { label: "En attente",    color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20"   },
  PROCESSING: { label: "En traitement", color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20"     },
  SHIPPED:    { label: "Expédié",       color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20" },
  RECEIVED:   { label: "Reçu",          color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20"},
  CANCELED:   { label: "Annulé",        color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20"       },
} as const

type Status = keyof typeof STATUS_CFG

interface SourcingRequest {
  id: string
  client_id: string
  client_name: string
  product_name: string
  reference_url: string | null
  quantity: number | null
  budget_eur: number | null
  notes: string | null
  admin_reply: string | null
  status: Status
  created_at: string
}

export default function AdminSourcingPage() {
  const [requests,  setRequests]  = useState<SourcingRequest[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState("")
  const [updating,  setUpdating]  = useState<string | null>(null)
  const [statusF,   setStatusF]   = useState<Status | "ALL">("ALL")
  const [selected,  setSelected]  = useState<SourcingRequest | null>(null)
  const [reply,     setReply]     = useState("")
  const [sending,   setSending]   = useState(false)

  async function load() {
    setLoading(true)
    const d = await fetch("/api/admin/sourcing").then(r => r.json()).catch(() => [])
    setRequests(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openDetail(r: SourcingRequest) {
    setSelected(r)
    setReply(r.admin_reply ?? "")
  }

  async function updateStatus(id: string, status: Status) {
    setUpdating(id)
    const res = await fetch(`/api/admin/sourcing/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      if (selected?.id === id) setSelected(s => s ? { ...s, status } : s)
    }
    setUpdating(null)
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return
    setSending(true)
    const res = await fetch(`/api/admin/sourcing/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_reply: reply.trim() }),
    })
    if (res.ok) {
      setRequests(prev => prev.map(r => r.id === selected.id ? { ...r, admin_reply: reply.trim() } : r))
      setSelected(s => s ? { ...s, admin_reply: reply.trim() } : s)
    }
    setSending(false)
  }

  const filtered = requests.filter(r => {
    const ms = `${r.product_name} ${r.client_name}`.toLowerCase().includes(search.toLowerCase())
    const mst = statusF === "ALL" || r.status === statusF
    return ms && mst
  })

  const counts = Object.fromEntries(
    (Object.keys(STATUS_CFG) as Status[]).map(s => [s, requests.filter(r => r.status === s).length])
  ) as Record<Status, number>

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Demandes Sourcing</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gérez les demandes de sourcing produit des clients</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {(Object.entries(STATUS_CFG) as [Status, typeof STATUS_CFG[Status]][]).map(([k, v]) => (
          <button key={k} onClick={() => setStatusF(statusF === k ? "ALL" : k)}
            className={`bg-neutral-900 border rounded-xl p-3 text-left transition-colors ${statusF === k ? "border-orange-500/50" : "border-neutral-800 hover:border-neutral-700"}`}>
            <div className={`text-xl font-bold ${v.color}`}>{loading ? "…" : counts[k]}</div>
            <p className="text-xs text-neutral-500 mt-0.5">{v.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
        </div>
        <div className="relative">
          <select value={statusF} onChange={e => setStatusF(e.target.value as Status | "ALL")}
            className="appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
            <option value="ALL">Tous les statuts</option>
            {(Object.entries(STATUS_CFG) as [Status, typeof STATUS_CFG[Status]][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      <div className={`flex gap-5 ${selected ? "items-start" : ""}`}>
        {/* Table */}
        <div className={`bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden ${selected ? "flex-1 min-w-0" : "w-full"}`}>
          <div className="px-5 py-3 border-b border-neutral-800">
            <p className="text-sm text-neutral-500">{loading ? "Chargement…" : `${filtered.length} demande${filtered.length !== 1 ? "s" : ""}`}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  {["Client", "Produit", "Qté", "Budget/u", "Statut", "Date", "Action"].map(h => (
                    <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">Chargement…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">Aucune demande</td></tr>
                ) : filtered.map(r => {
                  const cfg = STATUS_CFG[r.status]
                  const isSelected = selected?.id === r.id
                  return (
                    <tr key={r.id}
                      onClick={() => openDetail(r)}
                      className={`border-b border-neutral-800/60 last:border-0 cursor-pointer transition-colors ${isSelected ? "bg-orange-500/5 border-l-2 border-l-orange-500" : "hover:bg-neutral-800/20"}`}>
                      <td className="p-4">
                        <p className="text-white text-sm font-medium">{r.client_name || "—"}</p>
                        <p className="text-neutral-600 text-xs">{r.client_id}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm font-medium max-w-[140px] truncate">{r.product_name}</p>
                        {r.admin_reply && <p className="text-teal-500 text-[10px] mt-0.5">Répondu ✓</p>}
                      </td>
                      <td className="p-4 text-sm text-neutral-300">{r.quantity ?? "—"}</td>
                      <td className="p-4 text-sm text-neutral-300">{r.budget_eur != null ? `€${r.budget_eur}` : "—"}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-neutral-500 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-4" onClick={e => e.stopPropagation()}>
                        {updating === r.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                        ) : (
                          <div className="relative">
                            <select value={r.status} onChange={e => updateStatus(r.id, e.target.value as Status)}
                              className="appearance-none bg-neutral-800 border border-neutral-700 rounded-lg pl-3 pr-7 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer hover:border-neutral-600 transition-colors">
                              {(Object.entries(STATUS_CFG) as [Status, typeof STATUS_CFG[Status]][]).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none" />
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 flex-shrink-0 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            {/* Panel header */}
            <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
              <p className="text-white font-semibold text-sm truncate">{selected.product_name}</p>
              <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-white transition-colors ml-2 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Client info */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Client</p>
                <p className="text-white text-sm font-medium">{selected.client_name || "—"}</p>
                <p className="text-neutral-600 text-xs">{selected.client_id}</p>
              </div>

              {/* Product details */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Détails produit</p>
                <div className="space-y-2 text-sm">
                  {selected.quantity && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Quantité</span>
                      <span className="text-white font-medium">{selected.quantity} unités</span>
                    </div>
                  )}
                  {selected.budget_eur != null && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Budget/unité</span>
                      <span className="text-white font-medium">€{selected.budget_eur}</span>
                    </div>
                  )}
                  {selected.reference_url && (
                    <a href={selected.reference_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 transition-colors text-xs">
                      <ExternalLink className="w-3.5 h-3.5" />Voir la référence produit
                    </a>
                  )}
                </div>
              </div>

              {/* Full notes */}
              {selected.notes && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Notes du client</p>
                  <div className="bg-neutral-800 rounded-xl p-3 text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {selected.notes}
                  </div>
                </div>
              )}

              {/* Previous reply */}
              {selected.admin_reply && (
                <div>
                  <p className="text-xs font-semibold text-teal-500 uppercase tracking-wider mb-2">Réponse envoyée</p>
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-sm text-teal-300 leading-relaxed whitespace-pre-wrap">
                    {selected.admin_reply}
                  </div>
                </div>
              )}

              {/* Reply textarea */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {selected.admin_reply ? "Modifier la réponse" : "Répondre au client"}
                </p>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={5}
                  placeholder="Écrivez votre réponse ici — prix trouvé, délai, informations complémentaires…"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? "Envoi…" : "Envoyer la réponse"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
