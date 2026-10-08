"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import { getClientIdFromCookie } from "@/lib/client-cookie"
import {
  ArrowDownLeft, Clock, CheckCircle, CheckCircle2, XCircle, Plus, RefreshCw,
  AlertCircle, ChevronDown, Zap, Building2, ArrowRight, Receipt, Truck,
  RotateCcw, Phone, ChevronRight, Search, Filter, Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Withdrawal, PaymentMethod, InvoicePreview } from "@/lib/db"
import { useRealtime, type RealtimeEvent } from "@/hooks/useSse"
import { useCurrency } from "@/hooks/useCurrency"
import { GridBackground, CornerBrackets, GLOW_COLOR, SectionDot } from "@/components/dashboard/hud-accents"
import { STATUS_CFG, CURRENCIES, getWithdrawalLabel, WiseLogo, BinanceLogo, PaymentMethodIcon } from "@/components/wallet/shared"
import { PaymentMethodsManager } from "@/components/wallet/payment-methods-manager"
import { exportToCSV } from "@/lib/mock-data"

const fmt = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// "Wise •••• 4643" style — method name + a masked identifier.
function methodDetail(m: PaymentMethod): string {
  if (m.type === "wise") {
    const email = m.wiseEmail ?? ""
    const [local, domain] = email.split("@")
    const maskedLocal = local ? `${local[0]}${"•".repeat(Math.max(1, local.length - 1))}` : "----"
    return `Wise ${maskedLocal}${domain ? `@${domain}` : ""}`
  }
  const raw = m.type === "bank" ? m.iban : m.cryptoAddress
  const last4 = raw ? raw.replace(/\s/g, "").slice(-4) : "----"
  const name  = m.type === "bank" ? "Bank" : "Crypto"
  return `${name} •••• ${last4}`
}

export default function WithdrawalsPage() {
  const [data,        setData]        = useState<{ balance: number; approved: number; pending: number; withdrawals: Withdrawal[] } | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [live,        setLive]        = useState(false)
  const [showForm,    setShowForm]    = useState(false)
  const [submitting,  setSub]         = useState(false)
  const [success,     setSuccess]     = useState(false)
  const [error,       setError]       = useState("")
  const [form,        setForm]        = useState({ amount: "", currency: "EUR" })
  const [payMethods,     setPayMethods]     = useState<PaymentMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [methodMenuOpen, setMethodMenuOpen] = useState(false)
  const [methodMenuPos, setMethodMenuPos]   = useState({ top: 0, left: 0, width: 288 })
  const methodTriggerRef = useRef<HTMLButtonElement>(null)
  const methodMenuRef    = useRef<HTMLDivElement>(null)
  const [preview,        setPreview]        = useState<InvoicePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const [search,       setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "pending" | "approved" | "rejected">("ALL")

  const { fmt: fmtMoney } = useCurrency()
  const [clientId,    setClientId]    = useState(getClientIdFromCookie)
  const [clientName,  setClientName]  = useState("")
  const [clientEmail, setClientEmail] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch(`/api/wallet/${clientId}`)
    const json = await res.json()
    setData({
      balance:     json.balance    ?? 0,
      approved:    json.approved   ?? 0,
      pending:     json.pending    ?? 0,
      withdrawals: json.withdrawals ?? [],
    })
    setLoading(false)
  }, [clientId])

  useEffect(() => { load() }, [load])

  // Realtime relies on the anon client and is no longer guaranteed once RLS
  // denies anon SELECT on withdrawals/balances — poll as a fallback.
  useEffect(() => {
    const interval = setInterval(load, 15_000)
    return () => clearInterval(interval)
  }, [load])

  const loadPayMethods = useCallback(async () => {
    try {
      const methods: PaymentMethod[] = await fetch("/api/client/payment-methods").then(r => r.json())
      if (Array.isArray(methods)) {
        setPayMethods(methods)
        const def = methods.find(m => m.isDefault)
        if (def) setSelectedMethod(def.id)
        else if (methods.length > 0) setSelectedMethod(methods[0].id)
        else setSelectedMethod("")
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(c => {
      if (!c?.id) return
      setClientId(c.id)
      setClientName(`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Client")
      setClientEmail(c.email ?? "")
    }).catch(() => {})

    loadPayMethods()
  }, [loadPayMethods])

  const onEvent = useCallback((e: RealtimeEvent) => {
    setLive(true)
    setTimeout(() => setLive(false), 2000)
    if (
      (e.type === "balance_updated"     && e.row.client_id === clientId) ||
      (e.type === "withdrawal_updated"  && e.row.client_id === clientId) ||
      (e.type === "withdrawal_inserted" && e.row.client_id === clientId)
    ) { load() }
  }, [load, clientId])

  useRealtime(onEvent)

  useEffect(() => {
    if (!methodMenuOpen) return
    const onClickAway = (e: MouseEvent) => {
      const target = e.target as Node
      if (methodTriggerRef.current?.contains(target)) return
      if (methodMenuRef.current?.contains(target)) return
      setMethodMenuOpen(false)
    }
    document.addEventListener("mousedown", onClickAway)
    return () => document.removeEventListener("mousedown", onClickAway)
  }, [methodMenuOpen])

  const toggleMethodMenu = useCallback(() => {
    if (!methodMenuOpen && methodTriggerRef.current) {
      const r = methodTriggerRef.current.getBoundingClientRect()
      setMethodMenuPos({ top: r.bottom + 8, left: r.left, width: Math.max(288, r.width) })
    }
    setMethodMenuOpen(o => !o)
  }, [methodMenuOpen])

  const openWithdrawalForm = useCallback(async () => {
    setShowForm(true)
    setPreviewLoading(true)
    try {
      const res = await fetch("/api/client/invoice-preview")
      if (res.ok) setPreview(await res.json())
    } catch { /* no-op */ }
    setPreviewLoading(false)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0)        { setError("Invalid amount"); return }
    if (data && amount > data.balance) { setError(`Insufficient balance — available: ${fmtMoney(data.balance)}`); return }
    const method = payMethods.find(m => m.id === selectedMethod)
    if (!method) { setError("Please select a payment method in Settings"); return }
    const paymentDetails = JSON.stringify(
      method.type === "bank"
        ? { iban: method.iban, bic: method.bic ?? null, accountHolder: method.accountHolder ?? null }
        : method.type === "wise"
        ? { wiseEmail: method.wiseEmail, wiseCurrency: method.wiseCurrency ?? "EUR" }
        : { cryptoNetwork: method.cryptoNetwork, cryptoAddress: method.cryptoAddress }
    )
    setError("")
    setSub(true)
    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId, clientName, clientEmail,
        amount, currency: form.currency,
        iban: method.iban ?? method.wiseEmail ?? method.cryptoAddress ?? "",
        paymentMethodType: method.type,
        paymentDetails,
      }),
    })
    setSub(false)
    if (!res.ok) { setError("Insufficient balance or server error"); return }
    setSuccess(true)
    setForm({ amount: "", currency: "EUR" })
    setShowForm(false)
    setTimeout(() => setSuccess(false), 4000)
    load()
    window.dispatchEvent(new CustomEvent("wallet:updated"))
  }

  const withdrawals = data?.withdrawals ?? []
  const defaultMethod = payMethods.find(m => m.id === selectedMethod) ?? payMethods[0]

  const filtered = useMemo(() => withdrawals.filter(w => {
    const matchStatus = statusFilter === "ALL" || w.status === statusFilter
    const matchSearch = !search ||
      getWithdrawalLabel(w).toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  }), [withdrawals, statusFilter, search])

  const handleExport = () => {
    exportToCSV(
      withdrawals.map(w => ({
        ID: w.id, "Paid to": getWithdrawalLabel(w), "Amount (EUR)": w.amount.toFixed(2),
        Status: STATUS_CFG[w.status].label, Requested: w.requestedAt, Processed: w.processedAt ?? "",
      })),
      "withdrawals_codshipeurope.csv"
    )
  }

  return (
    <div className="relative p-4 md:p-6 space-y-4 md:space-y-6">
      <GridBackground />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-neutral-500">Move your balance to your bank or wallet</p>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all duration-500 border ${
              live ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-neutral-800 text-neutral-600 border-neutral-700"
            }`}>
              <Zap className="w-2.5 h-2.5" />{live ? "Updated" : "Live"}
            </span>
          </div>
        </div>
        <Button onClick={() => load()} variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/5">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-300 text-sm">Withdrawal request submitted. Processed within 24h.</p>
        </div>
      )}

      {/* Hero */}
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-6 overflow-hidden"
        style={{ boxShadow: "0 0 32px -12px rgba(249,115,22,0.2)" }}>
        <CornerBrackets color="rgba(249,115,22,0.5)" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px 1px rgba(16,185,129,0.7)" }} />
              Available to withdraw
            </p>
            <div className="text-4xl font-extrabold text-white font-mono tracking-tight">{loading ? "…" : fmtMoney(data?.balance ?? 0)}</div>
            <p className="text-neutral-500 text-sm mt-1.5 font-mono">
              {fmtMoney(data?.pending ?? 0)} <span className="font-sans text-neutral-600">on its way</span> · {fmtMoney(data?.approved ?? 0)} <span className="font-sans text-neutral-600">paid out</span>
            </p>
          </div>
          <Button onClick={openWithdrawalForm} disabled={!data || data.balance <= 0}
            className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 disabled:opacity-50">
            <ArrowDownLeft className="w-4 h-4 mr-2" />Withdraw
          </Button>
        </div>

        {defaultMethod && (
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-neutral-800">
            <span className="text-neutral-500 text-xs flex-shrink-0">Paid to</span>

            <button type="button" ref={methodTriggerRef} onClick={toggleMethodMenu}
              className="flex items-center gap-2 px-2 py-1 -mx-2 -my-1 rounded-lg hover:bg-neutral-800 transition-colors">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-neutral-800 flex-shrink-0">
                {defaultMethod.type === "bank"
                  ? <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  : <PaymentMethodIcon type={defaultMethod.type} size={22} />}
              </div>
              <span className="text-white text-sm font-medium">{defaultMethod.label}</span>
              <span className="text-neutral-500 text-xs font-mono">{methodDetail(defaultMethod)}</span>
              {payMethods.length > 1 && <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${methodMenuOpen ? "rotate-180" : ""}`} />}
            </button>

            {methodMenuOpen && payMethods.length > 1 && typeof document !== "undefined" && createPortal(
              <div ref={methodMenuRef} style={{ position: "fixed", top: methodMenuPos.top, left: methodMenuPos.left, width: methodMenuPos.width }}
                className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                {payMethods.map(m => (
                  <button key={m.id} type="button"
                    onClick={() => { setSelectedMethod(m.id); setMethodMenuOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      m.id === selectedMethod ? "bg-orange-500/10" : "hover:bg-neutral-800"
                    }`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-neutral-800 flex-shrink-0">
                      {m.type === "bank" ? <Building2 className="w-3.5 h-3.5 text-blue-400" /> : <PaymentMethodIcon type={m.type} size={22} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{m.label}</p>
                      <p className="text-neutral-500 text-xs font-mono">{methodDetail(m)}</p>
                    </div>
                    {m.id === selectedMethod && <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                  </button>
                ))}
                <a href="#payment-methods" onClick={() => setMethodMenuOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-neutral-400 hover:text-orange-400 hover:bg-neutral-800 border-t border-neutral-800 transition-colors">
                  <Plus className="w-3 h-3" />Add a method
                </a>
              </div>,
              document.body
            )}

            <a href="#payment-methods" className="ml-auto text-orange-400 text-xs hover:text-orange-300 transition-colors flex-shrink-0">
              Payout accounts
            </a>
          </div>
        )}
      </div>

      {/* Payment method */}
      <div id="payment-methods" className="scroll-mt-6">
        <PaymentMethodsManager onChanged={loadPayMethods} />
      </div>

      {/* Withdrawal form */}
      {showForm && (
        <div className="bg-neutral-900 border border-orange-500/25 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold flex items-center gap-2"><Receipt className="w-4 h-4 text-orange-400" />New withdrawal request</h2>
            <button onClick={() => { setShowForm(false); setError(""); setPreview(null) }} className="text-neutral-500 hover:text-white text-xl leading-none">×</button>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" /><p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {previewLoading ? (
            <div className="bg-neutral-800 rounded-xl p-4 mb-5 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-neutral-500 animate-spin" />
              <span className="text-neutral-500 text-sm">Calculating service fees…</span>
            </div>
          ) : preview && preview.orders.length > 0 ? (
            <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4 mb-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-white text-sm font-semibold">Service fee breakdown</span>
                <span className="ml-auto text-neutral-500 text-xs">{preview.deliveredCount} delivered{preview.returnedCount > 0 ? ` · ${preview.returnedCount} return${preview.returnedCount > 1 ? "s" : ""}` : ""}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-neutral-400"><Truck className="w-3.5 h-3.5" />Delivery fee</span>
                  <span className="text-neutral-300 font-medium font-mono">- €{fmt(preview.deliveryFees)}</span>
                </div>
                {preview.returnFees > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-neutral-400"><RotateCcw className="w-3.5 h-3.5" />Return fee</span>
                    <span className="text-neutral-300 font-medium font-mono">- €{fmt(preview.returnFees)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-neutral-400"><Phone className="w-3.5 h-3.5" />Call center fee</span>
                  <span className="text-neutral-300 font-medium font-mono">- €{fmt(preview.callCenterFees)}</span>
                </div>
                <div className="h-px bg-neutral-700" />
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300 text-sm font-medium">Gross revenue</span>
                  <span className="text-white font-semibold font-mono">€{fmt(preview.grossAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-sm">Total service fees</span>
                  <span className="text-red-400 font-semibold font-mono">- €{fmt(preview.totalFees)}</span>
                </div>
                <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 mt-1">
                  <span className="text-orange-300 text-sm font-semibold flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" />Net available
                  </span>
                  <span className="text-orange-400 font-bold text-base font-mono">{fmtMoney(data?.balance ?? 0)}</span>
                </div>
              </div>
            </div>
          ) : preview && preview.orders.length === 0 ? (
            <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-neutral-400 text-sm">All orders have already been invoiced — no additional fees.</span>
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Amount (max {fmtMoney(data?.balance ?? 0)})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">€</span>
                  <input type="number" min="1" step="0.01" max={data?.balance ?? undefined}
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 font-mono" />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Currency</label>
                <div className="relative">
                  <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full appearance-none bg-neutral-800 border border-neutral-700 rounded-xl pl-4 pr-9 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 cursor-pointer">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-400 font-medium mb-2 block">Payment method</label>
              {payMethods.length === 0 ? (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="text-neutral-400 text-sm">No payment method saved</p>
                  </div>
                  <a href="#payment-methods" className="text-orange-400 text-sm flex items-center gap-1 hover:text-orange-300">
                    Add <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {payMethods.map(m => (
                    <button key={m.id} type="button" onClick={() => setSelectedMethod(m.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        selectedMethod === m.id
                          ? "bg-orange-500/10 border-orange-500/40"
                          : "bg-neutral-800 border-neutral-700 hover:border-neutral-600"
                      }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        m.type === "bank" ? "bg-blue-500/15" : "bg-transparent"
                      }`}>
                        {m.type === "bank" ? <Building2 className="w-4 h-4 text-blue-400" /> : <PaymentMethodIcon type={m.type} size={28} />}
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-white text-sm font-medium">{m.label}</p>
                        <p className="text-neutral-500 text-xs truncate font-mono">
                          {m.type === "bank" ? (m.iban ?? "") : m.type === "wise" ? `${m.wiseEmail ?? ""} · ${m.wiseCurrency ?? "EUR"}` : `${m.cryptoNetwork ?? ""} · ${m.cryptoAddress?.slice(0, 8) ?? ""}…`}
                        </p>
                      </div>
                      {selectedMethod === m.id && <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                    </button>
                  ))}
                  <a href="#payment-methods" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-orange-400 transition-colors pt-1">
                    <Plus className="w-3 h-3" />Add a method
                  </a>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={submitting || !selectedMethod} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-50">
                {submitting ? "Sending…" : "Submit request"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setError(""); setPreview(null) }}
                className="text-neutral-400 hover:text-white hover:bg-white/5">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2"><SectionDot />Withdrawal history</h2>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bank or ID"
                className="bg-neutral-800 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 w-48" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
                className="appearance-none bg-neutral-800 border border-neutral-700 rounded-xl pl-3 pr-8 py-2 text-xs text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
                <option value="ALL">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none" />
            </div>
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors">
              <Download className="w-3.5 h-3.5" />Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-neutral-500 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ArrowDownLeft className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
            <p className="text-neutral-400 font-medium text-sm">No withdrawals {withdrawals.length > 0 ? "match these filters" : "yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wider">
                  <th className="text-left font-medium px-5 py-3">Paid to</th>
                  <th className="text-right font-medium px-3 py-3">Amount</th>
                  <th className="text-left font-medium px-3 py-3">Status</th>
                  <th className="text-left font-medium px-3 py-3">Requested</th>
                  <th className="text-left font-medium px-5 py-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(w => {
                  const cfg = STATUS_CFG[w.status]
                  return (
                    <tr key={w.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-neutral-800">
                            {w.paymentMethodType === "wise" ? <WiseLogo size={26} />
                              : w.paymentMethodType === "crypto" ? <BinanceLogo size={26} />
                              : <Building2 className="w-4 h-4 text-blue-400" />}
                          </div>
                          <span className="text-white text-sm">{getWithdrawalLabel(w)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right text-white font-semibold font-mono">€{fmt(w.amount)}</td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                          <cfg.Icon className="w-2.5 h-2.5" />{cfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-neutral-400 font-mono text-xs">{w.requestedAt}</td>
                      <td className="px-5 py-3.5 text-neutral-500 font-mono text-xs">#{w.id.slice(-8).toUpperCase()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
