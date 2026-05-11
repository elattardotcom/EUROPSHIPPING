"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { getClientIdFromCookie } from "@/lib/client-cookie"
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, CheckCircle2,
  XCircle, Plus, RefreshCw, AlertCircle, ChevronDown, Zap,
  TrendingUp, TrendingDown, Download, Filter, Search,
  Building2, Euro, Calendar, FileText, Eye, Bitcoin, ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Withdrawal, WithdrawalStatus, BalanceAdjustment, PaymentMethod } from "@/lib/db"
import Link from "next/link"
import { useRealtime, type RealtimeEvent } from "@/hooks/useSse"

// CLIENT_ID is resolved dynamically from /api/auth/me

const STATUS_CFG: Record<WithdrawalStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  pending:  { label: "En attente", color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/25",    Icon: Clock },
  approved: { label: "Approuvé",   color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25", Icon: CheckCircle },
  rejected: { label: "Rejeté",     color: "text-red-400",     bg: "bg-red-500/15 border-red-500/25",         Icon: XCircle },
}

const CURRENCIES = ["EUR", "USD", "GBP", "MAD"]

interface WalletData {
  balance:      number
  grossRevenue: number
  approved:     number
  pending:      number
  withdrawals:  Withdrawal[]
}

interface Transaction {
  id: string; type: "deposit" | "withdrawal"
  amount: number; status: "completed" | "pending" | "failed"
  date: string; description: string; reference: string
}

interface Invoice {
  id: string; number: string; amount: number
  status: "paid" | "pending" | "overdue"
  date: string; dueDate: string; description: string
}

const MOCK_DEPOSITS: Transaction[] = [
  { id: "d1", type: "deposit", amount: 1250.00, status: "completed", date: "10 Mai 2025", description: "Paiement commandes — Lot #1247", reference: "TXN-2025-001247" },
  { id: "d2", type: "deposit", amount: 890.50,  status: "completed", date: "8 Mai 2025",  description: "Paiement commandes — Lot #1246", reference: "TXN-2025-001246" },
  { id: "d3", type: "deposit", amount: 2340.00, status: "completed", date: "7 Mai 2025",  description: "Paiement commandes — Lot #1245", reference: "TXN-2025-001245" },
  { id: "d4", type: "deposit", amount: 1567.25, status: "completed", date: "5 Mai 2025",  description: "Paiement commandes — Lot #1244", reference: "TXN-2025-001244" },
]

function getWithdrawalLabel(w: Withdrawal): string {
  if (w.paymentMethodType === "wise" && w.paymentDetails) {
    return `Retrait Wise — ${w.paymentDetails.split("|")[0]}`
  }
  if (w.paymentMethodType === "crypto" && w.paymentDetails) {
    const [network, addr] = w.paymentDetails.split("|")
    return `Retrait Crypto (${network ?? ""}) — ${addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ""}`
  }
  const raw = (w.paymentDetails || w.iban).replace(/\s/g, "")
  return `Virement bancaire — IBAN ***${raw.slice(-4)}`
}

function withdrawalToTx(w: Withdrawal): Transaction {
  return {
    id:          `w-${w.id}`,
    type:        "withdrawal",
    amount:      w.amount,
    status:      w.status === "approved" ? "completed" : w.status === "rejected" ? "failed" : "pending",
    date:        w.requestedAt,
    description: getWithdrawalLabel(w),
    reference:   `WTH-${w.id}`,
  }
}

function withdrawalToInvoice(w: Withdrawal): Invoice {
  return {
    id:          w.id,
    number:      `FAC-${w.id.slice(-6).toUpperCase()}`,
    amount:      w.amount,
    status:      "paid",
    date:        w.processedAt ?? w.requestedAt,
    dueDate:     w.processedAt ?? w.requestedAt,
    description: `Retrait approuvé — ${getWithdrawalLabel(w)}`,
  }
}

function adjustmentToTx(a: BalanceAdjustment): Transaction {
  const isCredit = a.amount >= 0
  const dt = new Date(a.createdAt)
  const date = dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
  return {
    id:          `adj-${a.id}`,
    type:        isCredit ? "deposit" : "withdrawal",
    amount:      Math.abs(a.amount),
    status:      "completed",
    date,
    description: `Ajustement admin${a.reason ? ` — ${a.reason}` : ""}`,
    reference:   `ADJ-${a.id.slice(-8).toUpperCase()}`,
  }
}

async function downloadInvoice(inv: Invoice, clientWithdrawals: Withdrawal[], invoiceClientName: string, invoiceClientEmail: string) {
  const withdrawal = clientWithdrawals.find(w => w.id === inv.id) ?? null
  const iban       = withdrawal?.iban ?? "—"
  const ibanMasked = iban.replace(/\s/g, "").length > 8
    ? `${iban.replace(/\s/g, "").slice(0, 4)} •••• •••• ${iban.replace(/\s/g, "").slice(-4)}`
    : iban

  const amtTTC = inv.amount
  const amtHT  = amtTTC / 1.20
  const amtTVA = amtTTC - amtHT
  const f = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const today       = new Date()
  const dateStr     = today.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
  const periodStart = withdrawal?.requestedAt ?? inv.date
  const periodEnd   = withdrawal?.processedAt  ?? inv.dueDate

  // A4 at 96dpi = 794 × 1123px
  const W = 794, H = 1123

  const container = document.createElement("div")
  container.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${W}px;height:${H}px;overflow:hidden;background:#fff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#111827`
  container.innerHTML = `
<style>
*{box-sizing:border-box;margin:0;padding:0}
.page{width:${W}px;height:${H}px;display:flex;flex-direction:column;background:#fff;overflow:hidden}
.hdr{background:linear-gradient(135deg,#f97316,#dc2626);padding:26px 36px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.hdr-logo{display:flex;align-items:center;gap:14px}
.hdr-icon{width:48px;height:48px;background:rgba(255,255,255,.22);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff}
.hdr-name{font-size:22px;font-weight:800;color:#fff;line-height:1}
.hdr-sub{font-size:11px;color:rgba(255,255,255,.65);letter-spacing:.5px;margin-top:3px}
.hdr-badge{font-size:10px;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,.75);text-transform:uppercase;text-align:right;margin-bottom:4px}
.hdr-num{font-size:20px;font-weight:800;color:#fff;font-family:monospace;text-align:right}
.body{padding:28px 36px;flex:1;display:flex;flex-direction:column;gap:20px}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.party-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 18px}
.party-label{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;margin-bottom:10px}
.party-name{font-size:15px;font-weight:700;color:#111827;margin-bottom:5px}
.party-detail{font-size:12px;color:#6b7280;line-height:1.7}
.date-row{display:flex;gap:32px}
.lbl{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;margin-bottom:4px}
.val{font-size:13px;font-weight:600;color:#374151}
.objet-box{background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 18px}
.objet-label{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#ea580c;margin-bottom:5px}
.objet-text{font-size:14px;color:#7c2d12;font-weight:600}
.tbl{width:100%;border-collapse:collapse}
.tbl thead tr{background:#f3f4f6}
.tbl th{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6b7280;padding:10px 14px;text-align:left;border-bottom:2px solid #e5e7eb}
.tbl th.r,.tbl td.r{text-align:right}
.tbl td{padding:12px 14px;color:#374151;font-size:13px;border-bottom:1px solid #f3f4f6}
.item-desc{font-weight:600;color:#111827;font-size:14px}
.item-ref{font-size:11px;color:#9ca3af;font-family:monospace;margin-top:3px}
.totals{margin-left:auto;width:280px;margin-top:14px}
.tot-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f3f4f6;font-size:13px}
.tot-row:last-child{border-bottom:none;padding-top:12px;margin-top:4px}
.tot-label{color:#6b7280}
.tot-val{color:#374151;font-weight:600}
.tot-tva{color:#dc2626}
.tot-total .tot-label{color:#111827;font-weight:700;font-size:15px}
.tot-total .tot-val{color:#f97316;font-weight:800;font-size:18px}
.pay-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:18px}
.pay-status{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:999px;background:#dcfce7;border:1px solid #86efac;font-size:12px;font-weight:700;color:#16a34a;letter-spacing:.5px;white-space:nowrap}
.pay-dot{width:8px;height:8px;border-radius:50%;background:#16a34a;display:inline-block}
.pay-detail{flex:1}
.pay-mode{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6b7280;margin-bottom:4px}
.pay-iban{font-size:13px;font-weight:600;color:#374151;font-family:monospace}
.ftr{background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 36px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.ftr-left{font-size:11px;color:#9ca3af}
.ftr-center{font-size:11px;color:#d1d5db;text-align:center}
.ftr-right{font-size:11px;color:#9ca3af;text-align:right}
</style>
<div class="page">
  <div class="hdr">
    <div class="hdr-logo">
      <div class="hdr-icon">CS</div>
      <div>
        <div class="hdr-name">CODShip</div>
        <div class="hdr-sub">PRO PLATFORM</div>
      </div>
    </div>
    <div>
      <div class="hdr-badge">Facture de payout</div>
      <div class="hdr-num">${inv.number}</div>
    </div>
  </div>
  <div class="body">
    <div class="parties">
      <div class="party-box">
        <div class="party-label">Émetteur</div>
        <div class="party-name">CODShip Pro Platform</div>
        <div class="party-detail">contact@codship.com<br>Plateforme de vente COD<br>N° TVA : FR00000000000</div>
      </div>
      <div class="party-box">
        <div class="party-label">Destinataire</div>
        <div class="party-name">${invoiceClientName || "—"}</div>
        <div class="party-detail">${invoiceClientEmail || "—"}<br>Vendeur partenaire CODShip<br>Réf. client : ${inv.id.slice(-8).toUpperCase()}</div>
      </div>
    </div>
    <div class="date-row">
      <div><div class="lbl">Date d'émission</div><div class="val">${dateStr}</div></div>
      <div><div class="lbl">Période couverte</div><div class="val">${periodStart} — ${periodEnd}</div></div>
      <div><div class="lbl">Statut</div><div class="val" style="color:#16a34a;font-weight:700">✓ PAYÉE</div></div>
    </div>
    <div class="objet-box">
      <div class="objet-label">Objet</div>
      <div class="objet-text">Payout — Revenus de ventes de produits COD traités par CODShip</div>
    </div>
    <div>
      <table class="tbl">
        <thead><tr><th>#</th><th>Description</th><th class="r">Qté</th><th class="r">Prix HT</th><th class="r">Montant HT</th></tr></thead>
        <tbody>
          <tr>
            <td style="color:#9ca3af;font-size:11px">01</td>
            <td><div class="item-desc">Payout — Revenus de ventes produits COD</div><div class="item-ref">Ref: ${inv.number} · Virement bancaire approuvé</div></td>
            <td class="r">1</td>
            <td class="r">${f(amtHT)} €</td>
            <td class="r" style="font-weight:700;color:#111827">${f(amtHT)} €</td>
          </tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end">
        <div class="totals">
          <div class="tot-row"><span class="tot-label">Sous-total HT</span><span class="tot-val">${f(amtHT)} €</span></div>
          <div class="tot-row"><span class="tot-label tot-tva">TVA 20 %</span><span class="tot-val tot-tva">${f(amtTVA)} €</span></div>
          <div class="tot-row tot-total"><span class="tot-label">Total TTC</span><span class="tot-val">${f(amtTTC)} €</span></div>
        </div>
      </div>
    </div>
    <div class="pay-box">
      <span class="pay-status"><span class="pay-dot"></span>PAIEMENT EFFECTUÉ</span>
      <div class="pay-detail">
        <div class="pay-mode">Virement bancaire SEPA</div>
        <div class="pay-iban">IBAN : ${ibanMasked}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:2px">Montant versé</div>
        <div style="font-size:18px;font-weight:800;color:#f97316">${f(amtTTC)} €</div>
      </div>
    </div>
  </div>
  <div class="ftr">
    <div class="ftr-left">© ${today.getFullYear()} CODShip Pro Platform · Tous droits réservés</div>
    <div class="ftr-center">Document officiel — Ne pas modifier</div>
    <div class="ftr-right">Généré le ${dateStr}</div>
  </div>
</div>`

  document.body.appendChild(container)
  try {
    const html2canvas = (await import("html2canvas")).default
    const { jsPDF }   = await import("jspdf")
    const canvas = await html2canvas(container.querySelector(".page") as HTMLElement, {
      scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff", width: W, height: H,
    })
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, 210, 297)
    pdf.save(`${inv.number}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}

const INVOICES: Invoice[] = [
  { id: "1", number: "FAC-2025-0047", amount: 89.00,  status: "paid",    date: "1 Mai 2025",  dueDate: "15 Mai 2025",  description: "Abonnement mensuel — Mai 2025" },
  { id: "2", number: "FAC-2025-0046", amount: 156.50, status: "paid",    date: "1 Avr 2025",  dueDate: "15 Avr 2025",  description: "Abonnement + Pack SMS — Avril 2025" },
  { id: "3", number: "FAC-2025-0045", amount: 89.00,  status: "paid",    date: "1 Mar 2025",  dueDate: "15 Mar 2025",  description: "Abonnement mensuel — Mars 2025" },
  { id: "4", number: "FAC-2025-0044", amount: 89.00,  status: "paid",    date: "1 Fév 2025",  dueDate: "15 Fév 2025",  description: "Abonnement mensuel — Février 2025" },
  { id: "5", number: "FAC-2025-0043", amount: 234.00, status: "paid",    date: "1 Jan 2025",  dueDate: "15 Jan 2025",  description: "Abonnement + Stockage Extra — Jan 2025" },
]

const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function StatusPill({ status }: { status: string }) {
  if (status === "completed" || status === "paid")
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" />{status === "paid" ? "Payée" : "Complété"}</span>
  if (status === "pending")
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium border border-amber-500/20"><Clock className="w-3 h-3" />En attente</span>
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium border border-red-500/20"><XCircle className="w-3 h-3" />{status === "overdue" ? "En retard" : "Échoué"}</span>
}

export default function WalletPage() {
  const [tab, setTab] = useState<"overview" | "transactions" | "invoices">("overview")
  const [data,       setData]    = useState<WalletData | null>(null)
  const [loading,    setLoading] = useState(true)
  const [showForm,   setShowForm]= useState(false)
  const [submitting, setSub]     = useState(false)
  const [success,    setSuccess] = useState(false)
  const [error,      setError]   = useState("")
  const [live,       setLive]    = useState(false)
  const [form, setForm] = useState({ amount: "", currency: "EUR" })

  const [quickAmount,    setQuickAmount]    = useState("")
  const [quickError,     setQuickError]     = useState("")
  const [quickSub,       setQuickSub]       = useState(false)
  const [quickOk,        setQuickOk]        = useState(false)
  const [payMethods,     setPayMethods]     = useState<PaymentMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string>("")

  // Current client — resolved synchronously from cookie, supplemented async
  const [clientId,     setClientId]     = useState(getClientIdFromCookie)
  const [clientName,   setClientName]   = useState("")
  const [clientEmail,  setClientEmail]  = useState("")
  const [adjustments,  setAdjustments]  = useState<BalanceAdjustment[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const [walletRes, adjRes] = await Promise.all([
      fetch(`/api/wallet/${clientId}`),
      fetch("/api/client/balance"),
    ])
    const json   = await walletRes.json()
    const adjData = adjRes.ok ? await adjRes.json() : []
    setData({
      balance:      json.balance      ?? 0,
      grossRevenue: json.grossRevenue ?? json.balance ?? 0,
      approved:     json.approved     ?? 0,
      pending:      json.pending      ?? 0,
      withdrawals:  json.withdrawals  ?? [],
    })
    setAdjustments(Array.isArray(adjData) ? adjData : [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(c => {
        if (!c?.id) return
        const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()
        setClientId(c.id)
        setClientName(name || "Client")
        setClientEmail(c.email ?? "")
      })
      .catch(() => {})

    fetch("/api/client/payment-methods")
      .then(r => r.json())
      .then((methods: PaymentMethod[]) => {
        if (Array.isArray(methods)) {
          setPayMethods(methods)
          const def = methods.find(m => m.isDefault)
          if (def) setSelectedMethod(def.id)
          else if (methods.length > 0) setSelectedMethod(methods[0].id)
        }
      })
      .catch(() => {})
  }, [])

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0)        { setError("Montant invalide"); return }
    if (data && amount > data.balance) { setError(`Solde insuffisant — disponible : €${fmt(data.balance)}`); return }
    const method = payMethods.find(m => m.id === selectedMethod)
    if (!method) { setError("Veuillez sélectionner une méthode de paiement dans Paramètres"); return }
    const paymentDetails = method.type === "bank"
      ? (method.iban ?? "")
      : method.type === "wise"
      ? `${method.wiseEmail}|${method.wiseCurrency ?? "EUR"}`
      : `${method.cryptoNetwork}|${method.cryptoAddress}`
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
    if (!res.ok) { setError("Solde insuffisant ou erreur serveur"); return }
    setSuccess(true)
    setForm({ amount: "", currency: "EUR" })
    setShowForm(false)
    setTimeout(() => setSuccess(false), 4000)
    load()
    window.dispatchEvent(new CustomEvent("wallet:updated"))
  }

  const submitQuick = async () => {
    const amount = parseFloat(quickAmount)
    if (!amount || amount <= 0)        { setQuickError("Montant invalide"); return }
    if (data && amount > data.balance) { setQuickError(`Solde insuffisant — disponible : €${fmt(data.balance)}`); return }
    const method = payMethods.find(m => m.id === selectedMethod)
    if (!method) { setQuickError("Ajoutez une méthode de paiement dans Paramètres"); return }
    const paymentDetails = method.type === "bank"
      ? (method.iban ?? "")
      : method.type === "wise"
      ? `${method.wiseEmail}|${method.wiseCurrency ?? "EUR"}`
      : `${method.cryptoNetwork}|${method.cryptoAddress}`
    setQuickError("")
    setQuickSub(true)
    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId, clientName, clientEmail,
        amount, currency: "EUR",
        iban: method.iban ?? method.wiseEmail ?? method.cryptoAddress ?? "",
        paymentMethodType: method.type,
        paymentDetails,
      }),
    })
    setQuickSub(false)
    if (!res.ok) { setQuickError("Solde insuffisant ou erreur serveur"); return }
    setQuickOk(true)
    setQuickAmount("")
    setTimeout(() => setQuickOk(false), 4000)
    load()
    window.dispatchEvent(new CustomEvent("wallet:updated"))
  }

  const withdrawals = data?.withdrawals ?? []

  const isDemo = clientId === "c1"

  const allTransactions = useMemo<Transaction[]>(() => {
    const realWithdrawals  = withdrawals.map(withdrawalToTx)
    const realAdjustments  = adjustments.map(adjustmentToTx)
    const all = [...realWithdrawals, ...realAdjustments]
    if (isDemo) all.push(...MOCK_DEPOSITS)
    // Sort by date descending (adjustments have ISO dates, withdrawals have fr-FR strings — keep as-is)
    return all
  }, [withdrawals, adjustments, isDemo])

  const visibleInvoices = useMemo<Invoice[]>(() => {
    const fromWithdrawals = withdrawals
      .filter(w => w.status === "approved")
      .map(withdrawalToInvoice)
    return isDemo ? [...fromWithdrawals, ...INVOICES] : fromWithdrawals
  }, [withdrawals, isDemo])

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mon Portefeuille</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-neutral-500">Revenus des commandes livrées · Retraits en temps réel</p>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all duration-500 border ${
              live ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-neutral-800 text-neutral-600 border-neutral-700"
            }`}>
              <Zap className="w-2.5 h-2.5" />{live ? "Mis à jour" : "Temps réel"}
            </span>
          </div>
        </div>
        <Button onClick={() => load()} variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/5">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Success */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-300 text-sm">Demande de retrait soumise. Traitée sous 24h.</p>
        </div>
      )}

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Wallet className="w-8 h-8 text-white/60 mb-3" />
          <p className="text-white/70 text-sm font-medium mb-1">Solde disponible</p>
          <div className="text-4xl font-extrabold text-white">{loading ? "…" : `€${fmt(data?.balance ?? 0)}`}</div>
          <p className="text-white/60 text-xs mt-1">Prêt à retirer</p>
          <Button onClick={() => setShowForm(true)} disabled={!data || data.balance <= 0}
            className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0 text-sm font-medium w-full disabled:opacity-50">
            <ArrowDownLeft className="w-4 h-4 mr-2" />Demander un retrait
          </Button>
        </div>

        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 border-l-4 border-l-teal-500 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div><p className="text-xs font-medium text-white">Revenus livrés</p><p className="text-xs text-neutral-500">Commandes livrées</p></div>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-teal-400" /></div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{loading ? "…" : `€${fmt(data?.grossRevenue ?? 0)}`}</div>
            <div className="w-full bg-neutral-800 rounded-full h-1.5"><div className="bg-teal-500 h-1.5 rounded-full w-full" /></div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 border-l-4 border-l-emerald-500 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div><p className="text-xs font-medium text-white">Retiré</p><p className="text-xs text-neutral-500">Retraits approuvés</p></div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingDown className="w-4 h-4 text-emerald-400" /></div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{loading ? "…" : `€${fmt(data?.approved ?? 0)}`}</div>
            <div className="w-full bg-neutral-800 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${data?.grossRevenue ? Math.min(100, (data.approved / data.grossRevenue) * 100) : 0}%` }} />
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 border-l-4 border-l-amber-500 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div><p className="text-xs font-medium text-white">En traitement</p><p className="text-xs text-neutral-500">Retraits en attente</p></div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Clock className="w-4 h-4 text-amber-400" /></div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{loading ? "…" : `€${fmt(data?.pending ?? 0)}`}</div>
            <div className="w-full bg-neutral-800 rounded-full h-1.5">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${data?.grossRevenue ? Math.min(100, (data.pending / data.grossRevenue) * 100) : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal form */}
      {showForm && (
        <div className="bg-neutral-900 border border-orange-500/25 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-orange-400" />Nouvelle demande de retrait</h2>
            <button onClick={() => { setShowForm(false); setError("") }} className="text-neutral-500 hover:text-white text-xl leading-none">×</button>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" /><p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          {data && (
            <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
              <span className="text-neutral-400 text-sm">Solde disponible</span>
              <span className="text-orange-400 font-bold text-lg">€{fmt(data.balance)}</span>
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Montant (max €{fmt(data?.balance ?? 0)})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">€</span>
                  <input type="number" min="1" step="0.01" max={data?.balance ?? undefined}
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Devise</label>
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
              <label className="text-xs text-neutral-400 font-medium mb-2 block">Méthode de paiement</label>
              {payMethods.length === 0 ? (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="text-neutral-400 text-sm">Aucune méthode enregistrée</p>
                  </div>
                  <Link href="/dashboard/settings?tab=payment" className="text-orange-400 text-sm flex items-center gap-1 hover:text-orange-300">
                    Ajouter <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
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
                        m.type === "bank" ? "bg-blue-500/15" : m.type === "wise" ? "bg-green-500/15" : "bg-purple-500/15"
                      }`}>
                        {m.type === "bank" ? <Building2 className="w-4 h-4 text-blue-400" />
                          : m.type === "wise" ? <ArrowRight className="w-4 h-4 text-green-400" />
                          : <Bitcoin className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-white text-sm font-medium">{m.label}</p>
                        <p className="text-neutral-500 text-xs truncate">
                          {m.type === "bank" ? (m.iban ?? "") : m.type === "wise" ? `${m.wiseEmail ?? ""} · ${m.wiseCurrency ?? "EUR"}` : `${m.cryptoNetwork ?? ""} · ${m.cryptoAddress?.slice(0, 8) ?? ""}…`}
                        </p>
                      </div>
                      {selectedMethod === m.id && <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                    </button>
                  ))}
                  <Link href="/dashboard/settings?tab=payment" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-orange-400 transition-colors pt-1">
                    <Plus className="w-3 h-3" />Ajouter une méthode
                  </Link>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={submitting || !selectedMethod} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-50">
                {submitting ? "Envoi…" : "Soumettre la demande"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setError("") }}
                className="text-neutral-400 hover:text-white hover:bg-white/5">Annuler</Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-2">
        {[
          { id: "overview",      label: "Aperçu" },
          { id: "transactions",  label: "Transactions" },
          { id: "invoices",      label: "Factures" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.id ? "bg-orange-500/10 text-orange-400" : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}>{t.label}</button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────── */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent transactions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Transactions récentes</h3>
              <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300" onClick={() => setTab("transactions")}>Voir tout</Button>
            </div>
            <div className="space-y-3">
              {allTransactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tx.type === "deposit" ? "bg-emerald-500/10" : "bg-orange-500/10"}`}>
                      {tx.type === "deposit"
                        ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                        : <ArrowUpRight className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{tx.description}</p>
                      <p className="text-neutral-500 text-xs">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${tx.type === "deposit" ? "text-emerald-400" : "text-orange-400"}`}>
                      {tx.type === "deposit" ? "+" : "-"}{fmt(tx.amount)} EUR
                    </p>
                    <StatusPill status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick withdrawal */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Retrait rapide</h3>
            <div className="space-y-4">

              {quickOk && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-emerald-300 text-sm">Retrait soumis avec succès !</p>
                </div>
              )}
              {quickError && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{quickError}</p>
                </div>
              )}

              <div>
                <label className="text-neutral-400 text-xs font-medium mb-2 block">Méthode de paiement</label>
                {payMethods.length === 0 ? (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <p className="text-neutral-400 text-xs">Aucune méthode enregistrée</p>
                    </div>
                    <Link href="/dashboard/settings?tab=payment" className="text-orange-400 text-xs flex items-center gap-1 hover:text-orange-300">
                      Ajouter <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {payMethods.map(m => (
                      <button key={m.id} type="button" onClick={() => { setSelectedMethod(m.id); setQuickError("") }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                          selectedMethod === m.id
                            ? "bg-orange-500/10 border-orange-500/40"
                            : "bg-neutral-800 border-neutral-700 hover:border-neutral-600"
                        }`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          m.type === "bank" ? "bg-blue-500/15" : m.type === "wise" ? "bg-green-500/15" : "bg-purple-500/15"
                        }`}>
                          {m.type === "bank" ? <Building2 className="w-3.5 h-3.5 text-blue-400" />
                            : m.type === "wise" ? <ArrowRight className="w-3.5 h-3.5 text-green-400" />
                            : <Bitcoin className="w-3.5 h-3.5 text-purple-400" />}
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="text-white text-xs font-medium">{m.label}</p>
                          <p className="text-neutral-500 text-xs truncate">
                            {m.type === "bank" ? (m.iban ?? "") : m.type === "wise" ? `${m.wiseEmail ?? ""} · ${m.wiseCurrency ?? "EUR"}` : `${m.cryptoNetwork ?? ""} · ${m.cryptoAddress?.slice(0, 8) ?? ""}…`}
                          </p>
                        </div>
                        {selectedMethod === m.id && <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />}
                      </button>
                    ))}
                    <Link href="/dashboard/settings?tab=payment" className="flex items-center gap-1 text-xs text-neutral-600 hover:text-orange-400 transition-colors">
                      <Plus className="w-3 h-3" />Ajouter une méthode
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <label className="text-neutral-400 text-xs font-medium mb-1.5 block">Montant à retirer</label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="number" min="1" step="0.01" max={data?.balance ?? undefined}
                    value={quickAmount}
                    onChange={e => { setQuickAmount(e.target.value); setQuickError("") }}
                    placeholder="0.00"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-neutral-500 text-xs mt-1.5">
                  Disponible : <span className="text-orange-400 font-medium">{loading ? "…" : `€${fmt(data?.balance ?? 0)}`}</span>
                </p>
              </div>

              <div className="flex gap-2">
                {[100, 500, 1000].map(a => {
                  const disabled = data !== null && data.balance < a
                  return (
                    <button
                      key={a}
                      disabled={disabled}
                      onClick={() => { setQuickAmount(String(a)); setQuickError("") }}
                      className={`flex-1 py-2 rounded-lg text-sm transition-colors border ${
                        quickAmount === String(a)
                          ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                          : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >{a} EUR</button>
                  )
                })}
                <button
                  disabled={!data || !data.balance}
                  onClick={() => { setQuickAmount(String(data?.balance ?? 0)); setQuickError("") }}
                  className="flex-1 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >Max</button>
              </div>

              <Button
                onClick={submitQuick}
                disabled={quickSub || !quickAmount || parseFloat(quickAmount) <= 0 || !selectedMethod}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2 disabled:opacity-50"
              >
                <ArrowUpRight className="w-4 h-4" />
                {quickSub ? "Envoi…" : "Soumettre le retrait"}
              </Button>
              <p className="text-neutral-500 text-xs text-center">Les retraits sont traités sous 1-3 jours ouvrés</p>
            </div>
          </div>

          {/* Withdrawal history (real data) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl lg:col-span-2 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Historique des retraits</h3>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" />Nouveau retrait
                </Button>
              )}
            </div>
            {loading ? (
              <div className="py-10 text-center text-neutral-500 text-sm">Chargement…</div>
            ) : withdrawals.length === 0 ? (
              <div className="py-10 text-center">
                <ArrowDownLeft className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">Aucun retrait pour le moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {withdrawals.map(w => {
                  const cfg = STATUS_CFG[w.status]
                  return (
                    <div key={w.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-neutral-800/30 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${w.status === "approved" ? "bg-emerald-500/15" : w.status === "rejected" ? "bg-red-500/15" : "bg-amber-500/15"}`}>
                          <cfg.Icon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium">{getWithdrawalLabel(w)}</p>
                          <p className="text-neutral-500 text-xs mt-0.5">Demandé le {w.requestedAt}{w.processedAt && ` · Traité le ${w.processedAt}`}</p>
                          {w.adminNote && <p className="text-neutral-400 text-xs mt-1 italic">"{w.adminNote}"</p>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-bold text-base">€{fmt(w.amount)}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${cfg.bg} ${cfg.color}`}>
                          <cfg.Icon className="w-2.5 h-2.5" />{cfg.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Transactions ─────────────────────── */}
      {tab === "transactions" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-white font-semibold">Toutes les transactions</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input placeholder="Rechercher…" className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 w-60" />
              </div>
              <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 gap-2">
                <Filter className="w-4 h-4" />Filtres
              </Button>
            </div>
          </div>
          {allTransactions.length === 0 ? (
            <div className="py-16 text-center">
              <ArrowDownLeft className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
              <p className="text-neutral-400 font-medium text-sm">Aucune transaction pour le moment</p>
              <p className="text-neutral-600 text-xs mt-1">Vos transactions apparaîtront ici une fois votre boutique connectée</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-neutral-500 text-xs border-b border-neutral-800 uppercase tracking-wider">
                      {["Type", "Description", "Référence", "Date", "Montant", "Statut"].map(h => (
                        <th key={h} className="pb-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {allTransactions.map(tx => (
                      <tr key={tx.id} className="text-sm hover:bg-neutral-800/30 transition-colors">
                        <td className="py-4">
                          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${tx.type === "deposit" ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"}`}>
                            {tx.type === "deposit" ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                            <span className="text-xs font-medium capitalize">{tx.type === "deposit" ? "Dépôt" : "Retrait"}</span>
                          </div>
                        </td>
                        <td className="py-4 text-neutral-300">{tx.description}</td>
                        <td className="py-4 text-neutral-500 font-mono text-xs">{tx.reference}</td>
                        <td className="py-4 text-neutral-400">{tx.date}</td>
                        <td className="py-4">
                          <span className={`font-semibold ${tx.type === "deposit" ? "text-emerald-400" : "text-orange-400"}`}>
                            {tx.type === "deposit" ? "+" : "-"}{fmt(tx.amount)} EUR
                          </span>
                        </td>
                        <td className="py-4"><StatusPill status={tx.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-center pt-4 border-t border-neutral-800 mt-4">
                <p className="text-neutral-500 text-sm">{allTransactions.length} transaction{allTransactions.length > 1 ? "s" : ""}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Invoices ─────────────────────────── */}
      {tab === "invoices" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-white font-semibold">Toutes les factures</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input placeholder="Rechercher…" className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 w-60" />
              </div>
              <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 gap-2">
                <Calendar className="w-4 h-4" />Période
              </Button>
            </div>
          </div>
          {visibleInvoices.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
              <p className="text-neutral-400 font-medium text-sm">Aucune facture disponible</p>
              <p className="text-neutral-600 text-xs mt-1">Les factures apparaissent automatiquement lorsqu'un retrait est approuvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-neutral-500 text-xs border-b border-neutral-800 uppercase tracking-wider">
                      {["Facture", "Description", "Émise le", "Échéance", "Montant", "Statut", ""].map((h, i) => (
                        <th key={i} className="pb-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {visibleInvoices.map(inv => (
                      <tr key={inv.id} className="text-sm hover:bg-neutral-800/30 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-neutral-500" />
                            <span className="text-orange-400 font-medium">{inv.number}</span>
                          </div>
                        </td>
                        <td className="py-4 text-neutral-300">{inv.description}</td>
                        <td className="py-4 text-neutral-400">{inv.date}</td>
                        <td className="py-4 text-neutral-400">{inv.dueDate}</td>
                        <td className="py-4 text-white font-semibold">{fmt(inv.amount)} EUR</td>
                        <td className="py-4"><StatusPill status={inv.status} /></td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white h-8 w-8" title="Aperçu"><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-400 h-8 w-8" title="Télécharger" onClick={async () => {
                              const w = withdrawals.find(w => w.id === inv.id)
                              await downloadInvoice(inv, w ? [w] : withdrawals, clientName, clientEmail)
                            }}><Download className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-center pt-4 border-t border-neutral-800 mt-4">
                <p className="text-neutral-500 text-sm">{visibleInvoices.length} facture{visibleInvoices.length > 1 ? "s" : ""}</p>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  )
}
