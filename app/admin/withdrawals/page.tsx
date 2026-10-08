"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Clock, CheckCircle, XCircle, DollarSign,
  RefreshCw, ChevronDown, Search, AlertCircle, Zap,
  Building2, Bitcoin, ArrowRight, Copy, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Withdrawal, WithdrawalStatus } from "@/lib/db"
import { useRealtime, type RealtimeEvent } from "@/hooks/useSse"
import { useI18n } from "@/lib/admin-i18n"

export default function AdminWithdrawals() {
  const { t } = useI18n()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState<WithdrawalStatus | "ALL">("ALL")
  const [search, setSearch]           = useState("")
  const [processing, setProcessing]   = useState<string | null>(null)
  const [noteModal, setNoteModal]     = useState<{ id: string; action: "approved" | "rejected" } | null>(null)
  const [note, setNote]               = useState("")
  const [live, setLive]               = useState(false)

  const STATUS_CFG: Record<WithdrawalStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
    pending:  { label: t("with_pending"),  color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/25",    Icon: Clock       },
    approved: { label: t("with_approved"), color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25", Icon: CheckCircle },
    rejected: { label: t("with_rejected"), color: "text-red-400",     bg: "bg-red-500/15 border-red-500/25",         Icon: XCircle     },
  }

  const hasLoadedRef = useRef(false)

  const load = useCallback(async () => {
    // Only show the loading placeholder on the very first fetch — background
    // refreshes (polling, realtime) should update data in place, not flicker.
    if (!hasLoadedRef.current) setLoading(true)
    const res = await fetch("/api/withdrawals")
    const data = await res.json()
    setWithdrawals(data)
    setLoading(false)
    hasLoadedRef.current = true
  }, [])

  useEffect(() => { load() }, [load])

  // Realtime relies on the anon client and is no longer guaranteed once RLS
  // denies anon SELECT on withdrawals/balances — poll as a fallback.
  useEffect(() => {
    const interval = setInterval(load, 15_000)
    return () => clearInterval(interval)
  }, [load])

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

  function parsePayDetails(w: Withdrawal): Record<string, string> {
    try { if (w.paymentDetails) return JSON.parse(w.paymentDetails) } catch {}
    // Legacy pipe-separated format
    if (w.paymentMethodType === "wise") {
      const [wiseEmail, wiseCurrency] = (w.paymentDetails ?? "").split("|")
      return { wiseEmail: wiseEmail ?? "", wiseCurrency: wiseCurrency ?? "EUR" }
    }
    if (w.paymentMethodType === "crypto") {
      const [cryptoNetwork, cryptoAddress] = (w.paymentDetails ?? "").split("|")
      return { cryptoNetwork: cryptoNetwork ?? "", cryptoAddress: cryptoAddress ?? "" }
    }
    return { iban: w.paymentDetails || w.iban }
  }

  function CopyBtn({ value }: { value: string }) {
    const [copied, setCopied] = useState(false)
    return (
      <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        className="ml-1 text-neutral-600 hover:text-orange-400 transition-colors flex-shrink-0" title="Copy">
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      </button>
    )
  }

  const filtered = withdrawals.filter(w => {
    const ms = `${w.clientName} ${w.clientEmail} ${w.iban} ${w.paymentDetails ?? ""}`.toLowerCase().includes(search.toLowerCase())
    return ms && (filter === "ALL" || w.status === filter)
  })

  const pending      = withdrawals.filter(w => w.status === "pending").length
  const approved     = withdrawals.filter(w => w.status === "approved").length
  const rejected     = withdrawals.filter(w => w.status === "rejected").length
  const totalPending = withdrawals.filter(w => w.status === "pending").reduce((s, w) => s + w.amount, 0)
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{t("with_title")}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-neutral-500">{t("with_sub")}</p>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all duration-500 ${
              live
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-neutral-800 text-neutral-600 border border-neutral-700"
            }`}>
              <Zap className="w-2.5 h-2.5" />
              {live ? t("live") : "Real-time"}
            </span>
          </div>
        </div>
        <Button onClick={load} variant="ghost" size="icon"
          className="text-neutral-400 hover:text-white hover:bg-white/5">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t("with_pending"),    value: pending,                 icon: Clock,       action: "pending"  as const, grad: "linear-gradient(135deg,#f59e0b,#d97706)", border: "rgba(245,158,11,0.25)", glow: "rgba(245,158,11,0.08)" },
          { label: t("with_approved"),   value: approved,                icon: CheckCircle, action: "approved" as const, grad: "linear-gradient(135deg,#10b981,#059669)", border: "rgba(16,185,129,0.25)", glow: "rgba(16,185,129,0.08)" },
          { label: t("with_rejected"),   value: rejected,                icon: XCircle,     action: "rejected" as const, grad: "linear-gradient(135deg,#ef4444,#b91c1c)", border: "rgba(239,68,68,0.25)",  glow: "rgba(239,68,68,0.08)"  },
          { label: t("with_total_pend"), value: `€${fmt(totalPending)}`, icon: DollarSign,  action: "ALL"      as const, grad: "linear-gradient(135deg,#f97316,#dc2626)", border: "rgba(249,115,22,0.25)", glow: "rgba(249,115,22,0.08)" },
        ].map(k => (
          <button key={k.label} onClick={() => setFilter(k.action)}
            className="relative rounded-2xl p-5 overflow-hidden text-left transition-all hover:-translate-y-0.5"
            style={{ background: "#111", border: `1px solid ${k.border}` }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ background: k.grad }} />
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: k.grad, opacity: 0.7 }} />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: k.glow, border: `1px solid ${k.border}` }}>
                <k.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-white mb-0.5">{k.value}</div>
              <p className="text-xs text-neutral-400 font-medium">{k.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("with_search")}
            className="w-full sm:w-64 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
        </div>
        <div className="relative">
          <select value={filter} onChange={e => setFilter(e.target.value as WithdrawalStatus | "ALL")}
            className="appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
            <option value="ALL">{t("with_all_status")}</option>
            <option value="pending">{t("with_pending")}</option>
            <option value="approved">{t("with_approved")}</option>
            <option value="rejected">{t("with_rejected")}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{filtered.length} request{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {[t("with_th_client"),t("with_th_amount"),"Payment method",t("with_th_status"),t("with_th_requested"),t("with_th_processed"),"Note",t("with_th_actions")].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-neutral-500 text-sm">{t("loading")}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-neutral-500 text-sm">{t("with_none")}</td></tr>
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
                    <td className="p-4 min-w-[220px]">
                      {(() => {
                        const p = parsePayDetails(w)
                        const type = w.paymentMethodType ?? "bank"
                        const Icon = type === "bank" ? Building2 : type === "wise" ? ArrowRight : Bitcoin
                        const iconColor = type === "bank" ? "text-blue-400" : type === "wise" ? "text-green-400" : "text-purple-400"
                        const bg       = type === "bank" ? "bg-blue-500/10" : type === "wise" ? "bg-green-500/10" : "bg-purple-500/10"
                        const fields: { label: string; value: string; mono?: boolean }[] =
                          type === "wise"   ? [{ label: "Email", value: p.wiseEmail ?? "—" }, { label: "Currency", value: p.wiseCurrency ?? "EUR" }]
                          : type === "crypto" ? [{ label: "Network", value: p.cryptoNetwork ?? "—" }, { label: "Address", value: p.cryptoAddress ?? "—", mono: true }]
                          : [
                              { label: "IBAN", value: p.iban ?? w.iban ?? "—", mono: true },
                              ...(p.bic ? [{ label: "BIC", value: p.bic, mono: true }] : []),
                              ...(p.accountHolder ? [{ label: "Holder", value: p.accountHolder }] : []),
                            ]
                        return (
                          <div className="flex items-start gap-2">
                            <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${bg}`}>
                              <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                            </div>
                            <div className="space-y-1">
                              {fields.map(f => (
                                <div key={f.label} className="flex items-center gap-0.5">
                                  <span className="text-neutral-600 text-xs w-14 flex-shrink-0">{f.label}</span>
                                  <span className={`text-xs text-white ${f.mono ? "font-mono" : ""} break-all`}>{f.value}</span>
                                  {f.value !== "—" && <CopyBtn value={f.value} />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
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
                            {t("with_approve")}
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => setNoteModal({ id: w.id, action: "rejected" })}
                            disabled={processing === w.id}
                            className="border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-7 px-3">
                            {t("with_reject")}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-neutral-600 text-xs">Done</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {noteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              {noteModal.action === "approved"
                ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                : <AlertCircle className="w-5 h-5 text-red-400" />
              }
              <h3 className="text-white font-semibold text-lg">
                {noteModal.action === "approved" ? t("with_approve") : t("with_reject")}
              </h3>
            </div>
            <p className="text-neutral-400 text-sm mb-4">
              {noteModal.action === "approved"
                ? "The client balance will be debited accordingly."
                : "The client will be notified of the rejection."
              }
            </p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={t("with_note")}
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => { setNoteModal(null); setNote("") }}
                className="text-neutral-400 hover:text-white hover:bg-white/5">
                Cancel
              </Button>
              <Button
                onClick={() => process(noteModal.id, noteModal.action, note || undefined)}
                disabled={processing === noteModal.id}
                className={noteModal.action === "approved"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
                }>
                {processing === noteModal.id ? "Processing…" : noteModal.action === "approved" ? "Confirm approval" : "Confirm rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
