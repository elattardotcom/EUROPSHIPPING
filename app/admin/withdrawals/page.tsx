"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Clock, CheckCircle, XCircle, DollarSign, ArrowDownLeft,
  RefreshCw, ChevronDown, Search, AlertCircle, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Withdrawal, WithdrawalStatus } from "@/lib/db"
import { useRealtime, type RealtimeEvent } from "@/hooks/useSse"

const STATUS_CFG: Record<WithdrawalStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  pending:  { label: "En attente", color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/25",   Icon: Clock },
  approved: { label: "Approuvé",   color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25", Icon: CheckCircle },
  rejected: { label: "Rejeté",     color: "text-red-400",     bg: "bg-red-500/15 border-red-500/25",        Icon: XCircle },
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState<WithdrawalStatus | "ALL">("ALL")
  const [search, setSearch]           = useState("")
  const [processing, setProcessing]   = useState<string | null>(null)
  const [noteModal, setNoteModal]     = useState<{ id: string; action: "approved" | "rejected" } | null>(null)
  const [note, setNote]               = useState("")
  const [live, setLive]               = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/withdrawals")
    const data = await res.json()
    setWithdrawals(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const onEvent = useCallback((e: RealtimeEvent) => {
    setLive(true)
    setTimeout(() => setLive(false), 2000)
    if (e.type === "withdrawal_inserted" || e.type === "withdrawal_updated") {
      load()
    }
  }, [load])

  useRealtime(onEvent)

  const process = async (id: string, status: "approved" | "rejected", adminNote?: string) => {
    setProcessing(id)
    await fetch(`/api/withdrawals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    })
    setProcessing(null)
    setNoteModal(null)
    setNote("")
    load()
  }

  const filtered = withdrawals.filter(w => {
    const ms = `${w.clientName} ${w.clientEmail} ${w.iban}`.toLowerCase().includes(search.toLowerCase())
    return ms && (filter === "ALL" || w.status === filter)
  })

  const pending  = withdrawals.filter(w => w.status === "pending").length
  const approved = withdrawals.filter(w => w.status === "approved").length
  const rejected = withdrawals.filter(w => w.status === "rejected").length
  const totalPending = withdrawals.filter(w => w.status === "pending").reduce((s, w) => s + w.amount, 0)
  const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Retraits</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-neutral-500">Gérer les demandes de retrait des clients</p>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all duration-500 ${
              live
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "bg-neutral-800 text-neutral-600 border border-neutral-700"
            }`}>
              <Zap className="w-2.5 h-2.5" />
              {live ? "Mis à jour" : "Temps réel"}
            </span>
          </div>
        </div>
        <Button onClick={load} variant="ghost" size="icon"
          className="text-neutral-400 hover:text-white hover:bg-white/5">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "En attente",       value: pending,  border: "border-l-amber-500",   icon: Clock,        action: "pending"  as const },
          { label: "Approuvés",        value: approved, border: "border-l-emerald-500", icon: CheckCircle,  action: "approved" as const },
          { label: "Rejetés",          value: rejected, border: "border-l-red-500",     icon: XCircle,      action: "rejected" as const },
          { label: "Montant en attente", value: `€${fmt(totalPending)}`, border: "border-l-indigo-500", icon: DollarSign, action: "ALL" as const },
        ].map(k => (
          <button key={k.label} onClick={() => setFilter(k.action)}
            className={`bg-neutral-900 border border-neutral-800 border-l-4 ${k.border} rounded-xl p-4 text-left hover:border-neutral-700 transition-colors`}>
            <k.icon className="w-4 h-4 text-neutral-500 mb-2" />
            <div className="text-2xl font-bold text-white mb-0.5">{k.value}</div>
            <p className="text-xs text-neutral-500">{k.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            className="w-64 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="relative">
          <select value={filter} onChange={e => setFilter(e.target.value as WithdrawalStatus | "ALL")}
            className="appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-indigo-500 cursor-pointer">
            <option value="ALL">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{filtered.length} demande{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Client", "Montant", "IBAN", "Statut", "Demandé le", "Traité le", "Note admin", "Actions"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-neutral-500 text-sm">Chargement…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-neutral-500 text-sm">Aucune demande trouvée.</td></tr>
              ) : filtered.map(w => {
                const cfg  = STATUS_CFG[w.status]
                const Icon = cfg.Icon
                return (
                  <tr key={w.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                    <td className="p-4">
                      <p className="text-white text-sm font-medium">{w.clientName}</p>
                      <p className="text-neutral-500 text-xs">{w.clientEmail}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-bold text-sm">€{fmt(w.amount)}</span>
                      <span className="text-neutral-500 text-xs ml-1">{w.currency}</span>
                    </td>
                    <td className="p-4">
                      <code className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{w.iban}</code>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-neutral-500 whitespace-nowrap">{w.requestedAt}</td>
                    <td className="p-4 text-sm text-neutral-500 whitespace-nowrap">{w.processedAt ?? "—"}</td>
                    <td className="p-4 text-sm text-neutral-400 max-w-[180px]">
                      {w.adminNote
                        ? <span className="italic text-xs">{w.adminNote}</span>
                        : <span className="text-neutral-700">—</span>
                      }
                    </td>
                    <td className="p-4">
                      {w.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button size="sm"
                            onClick={() => setNoteModal({ id: w.id, action: "approved" })}
                            disabled={processing === w.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3">
                            Approuver
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => setNoteModal({ id: w.id, action: "rejected" })}
                            disabled={processing === w.id}
                            className="border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-7 px-3">
                            Rejeter
                          </Button>
                        </div>
                      ) : (
                        <span className="text-neutral-600 text-xs">Traité</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              {noteModal.action === "approved"
                ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                : <AlertCircle className="w-5 h-5 text-red-400" />
              }
              <h3 className="text-white font-semibold text-lg">
                {noteModal.action === "approved" ? "Approuver le retrait" : "Rejeter le retrait"}
              </h3>
            </div>
            <p className="text-neutral-400 text-sm mb-4">
              {noteModal.action === "approved"
                ? "Le solde du client sera débité du montant correspondant."
                : "Le client sera notifié du refus de sa demande."
              }
            </p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Note admin (optionnelle)…"
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => { setNoteModal(null); setNote("") }}
                className="text-neutral-400 hover:text-white hover:bg-white/5">
                Annuler
              </Button>
              <Button
                onClick={() => process(noteModal.id, noteModal.action, note || undefined)}
                disabled={processing === noteModal.id}
                className={noteModal.action === "approved"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
                }>
                {processing === noteModal.id ? "Traitement…" : noteModal.action === "approved" ? "Confirmer l'approbation" : "Confirmer le rejet"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
