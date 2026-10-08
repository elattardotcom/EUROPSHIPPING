"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { getClientIdFromCookie } from "@/lib/client-cookie"
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2,
  XCircle, RefreshCw, Zap, TrendingUp, TrendingDown, Download, Filter, Search,
  Calendar, FileText, Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Withdrawal, BalanceAdjustment } from "@/lib/db"
import { useRealtime, type RealtimeEvent } from "@/hooks/useSse"
import { useCurrency } from "@/hooks/useCurrency"
import { GridBackground, CornerBrackets, GLOW_COLOR, SectionDot } from "@/components/dashboard/hud-accents"
import { getWithdrawalLabel } from "@/components/wallet/shared"
import Link from "next/link"

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
  grossAmount?:    number
  feeDelivery?:    number
  feeReturn?:      number
  feeCallCenter?:  number
  feeTotal?:       number
  deliveredCount?: number
  returnedCount?:  number
}

const MOCK_DEPOSITS: Transaction[] = [
  { id: "d1", type: "deposit", amount: 1250.00, status: "completed", date: "10 May 2025", description: "Order payout — Batch #1247", reference: "TXN-2025-001247" },
  { id: "d2", type: "deposit", amount: 890.50,  status: "completed", date: "8 May 2025",  description: "Order payout — Batch #1246", reference: "TXN-2025-001246" },
  { id: "d3", type: "deposit", amount: 2340.00, status: "completed", date: "7 May 2025",  description: "Order payout — Batch #1245", reference: "TXN-2025-001245" },
  { id: "d4", type: "deposit", amount: 1567.25, status: "completed", date: "5 May 2025",  description: "Order payout — Batch #1244", reference: "TXN-2025-001244" },
]

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
    id:             w.id,
    number:         `FAC-${w.id.slice(-6).toUpperCase()}`,
    amount:         w.amount,
    status:         "paid",
    date:           w.processedAt ?? w.requestedAt,
    dueDate:        w.processedAt ?? w.requestedAt,
    description:    `Withdrawal approved — ${getWithdrawalLabel(w)}`,
    grossAmount:    w.grossAmount,
    feeDelivery:    w.feeDelivery,
    feeReturn:      w.feeReturn,
    feeCallCenter:  w.feeCallCenter,
    feeTotal:       w.feeTotal,
    deliveredCount: w.deliveredCount,
    returnedCount:  w.returnedCount,
  }
}

function adjustmentToTx(a: BalanceAdjustment): Transaction {
  const isCredit = a.amount >= 0
  const dt = new Date(a.createdAt)
  const date = dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  return {
    id:          `adj-${a.id}`,
    type:        isCredit ? "deposit" : "withdrawal",
    amount:      Math.abs(a.amount),
    status:      "completed",
    date,
    description: `Admin adjustment${a.reason ? ` — ${a.reason}` : ""}`,
    reference:   `ADJ-${a.id.slice(-8).toUpperCase()}`,
  }
}

async function downloadInvoice(inv: Invoice, clientWithdrawals: Withdrawal[], invoiceClientName: string, invoiceClientEmail: string) {
  const withdrawal = clientWithdrawals.find(w => w.id === inv.id) ?? null
  const iban       = withdrawal?.iban ?? "—"
  const ibanMasked = iban.replace(/\s/g, "").length > 8
    ? `${iban.replace(/\s/g, "").slice(0, 4)} •••• •••• ${iban.replace(/\s/g, "").slice(-4)}`
    : iban

  const f = (n: number) => (n ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const today      = new Date()
  const dateStr    = today.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
  const periodStart = withdrawal?.requestedAt ?? inv.date
  const periodEnd   = withdrawal?.processedAt  ?? inv.dueDate

  // Fee breakdown — use stored values if available
  const gross        = inv.grossAmount  ?? inv.amount
  const feeDelivery  = inv.feeDelivery  ?? 0
  const feeReturn    = inv.feeReturn    ?? 0
  const feeCallCenter= inv.feeCallCenter ?? 0
  const feeTotal     = inv.feeTotal     ?? (feeDelivery + feeReturn + feeCallCenter)
  const netPayout    = inv.amount
  const hasFees      = feeTotal > 0
  const delivCount   = inv.deliveredCount ?? 0
  const retCount     = inv.returnedCount  ?? 0

  // Fee rows HTML (only shown when fee data exists)
  const feeRows = hasFees ? `
    <tr style="background:#fff7ed">
      <td style="color:#9ca3af;font-size:11px;padding:10px 14px">02</td>
      <td style="padding:10px 14px">
        <div style="font-weight:600;color:#ea580c;font-size:13px">— Delivery fee</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:2px">${delivCount} order${delivCount > 1 ? "s" : ""} delivered</div>
      </td>
      <td style="text-align:right;padding:10px 14px">${delivCount}</td>
      <td style="text-align:right;padding:10px 14px;color:#6b7280">— ${f(delivCount ? feeDelivery / delivCount : 0)} €</td>
      <td style="text-align:right;padding:10px 14px;font-weight:700;color:#dc2626">— ${f(feeDelivery)} €</td>
    </tr>
    ${feeReturn > 0 ? `<tr style="background:#fff7ed">
      <td style="color:#9ca3af;font-size:11px;padding:10px 14px">03</td>
      <td style="padding:10px 14px">
        <div style="font-weight:600;color:#ea580c;font-size:13px">— Return fee</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:2px">${retCount} return${retCount > 1 ? "s" : ""}</div>
      </td>
      <td style="text-align:right;padding:10px 14px">${retCount}</td>
      <td style="text-align:right;padding:10px 14px;color:#6b7280">— ${f(retCount ? feeReturn / retCount : 0)} €</td>
      <td style="text-align:right;padding:10px 14px;font-weight:700;color:#dc2626">— ${f(feeReturn)} €</td>
    </tr>` : ""}
    <tr style="background:#fff7ed">
      <td style="color:#9ca3af;font-size:11px;padding:10px 14px">${feeReturn > 0 ? "04" : "03"}</td>
      <td style="padding:10px 14px">
        <div style="font-weight:600;color:#ea580c;font-size:13px">— Call center fee</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:2px">Order confirmation</div>
      </td>
      <td style="text-align:right;padding:10px 14px">${delivCount}</td>
      <td style="text-align:right;padding:10px 14px;color:#6b7280">— ${f(delivCount ? feeCallCenter / delivCount : 0)} €</td>
      <td style="text-align:right;padding:10px 14px;font-weight:700;color:#dc2626">— ${f(feeCallCenter)} €</td>
    </tr>` : ""

  const W = 794, H = 1123
  const container = document.createElement("div")
  container.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${W}px;height:${H}px;overflow:hidden;background:#fff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#111827`
  container.innerHTML = `
<style>
*{box-sizing:border-box;margin:0;padding:0}
.page{width:${W}px;height:${H}px;display:flex;flex-direction:column;background:#fff;overflow:hidden}
.hdr{background:#0a0a0a;padding:26px 36px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.hdr-logo{display:flex;align-items:center;gap:14px}
.hdr-icon{height:48px;display:flex;align-items:center;justify-content:center}
.hdr-icon img{height:100%;width:auto;display:block}
.hdr-name{font-size:22px;font-weight:800;color:#fff;line-height:1}
.hdr-sub{font-size:11px;color:rgba(255,255,255,.65);letter-spacing:.5px;margin-top:3px}
.hdr-badge{font-size:10px;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,.75);text-transform:uppercase;text-align:right;margin-bottom:4px}
.hdr-num{font-size:20px;font-weight:800;color:#fff;font-family:monospace;text-align:right}
.body{padding:28px 36px;flex:1;display:flex;flex-direction:column;gap:18px}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.party-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 18px}
.party-label{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;margin-bottom:10px}
.party-name{font-size:15px;font-weight:700;color:#111827;margin-bottom:5px}
.party-detail{font-size:12px;color:#6b7280;line-height:1.7}
.date-row{display:flex;gap:32px}
.lbl{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;margin-bottom:4px}
.val{font-size:13px;font-weight:600;color:#374151}
.objet-box{background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:12px 18px}
.objet-label{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#ea580c;margin-bottom:4px}
.objet-text{font-size:13px;color:#7c2d12;font-weight:600}
.tbl{width:100%;border-collapse:collapse}
.tbl thead tr{background:#f3f4f6}
.tbl th{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6b7280;padding:10px 14px;text-align:left;border-bottom:2px solid #e5e7eb}
.tbl th.r,.tbl td.r{text-align:right}
.tbl td{color:#374151;font-size:13px;border-bottom:1px solid #f3f4f6}
.totals{margin-left:auto;width:300px;margin-top:12px}
.tot-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:13px}
.tot-label{color:#6b7280}
.tot-val{color:#374151;font-weight:600}
.tot-fee{color:#dc2626}
.tot-net{border-top:2px solid #e5e7eb;margin-top:6px;padding-top:10px!important;border-bottom:none!important}
.tot-net .tot-label{color:#111827;font-weight:700;font-size:15px}
.tot-net .tot-val{color:#f97316;font-weight:800;font-size:18px}
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
      <div class="hdr-icon"><img src="${window.location.origin}/logo.png" alt="CODShipEurope" /></div>
      <div>
        <div class="hdr-name">CODShipEurope</div>
        <div class="hdr-sub">PRO PLATFORM</div>
      </div>
    </div>
    <div>
      <div class="hdr-badge">Payout invoice</div>
      <div class="hdr-num">${inv.number}</div>
    </div>
  </div>
  <div class="body">
    <div class="parties">
      <div class="party-box">
        <div class="party-label">From</div>
        <div class="party-name">CODShipEurope Pro Platform</div>
        <div class="party-detail">contact@codshipeurope.com<br>COD selling platform<br>VAT No.: FR00000000000</div>
      </div>
      <div class="party-box">
        <div class="party-label">To</div>
        <div class="party-name">${invoiceClientName || "—"}</div>
        <div class="party-detail">${invoiceClientEmail || "—"}<br>CODShipEurope partner seller<br>Client ref.: ${inv.id.slice(-8).toUpperCase()}</div>
      </div>
    </div>
    <div class="date-row">
      <div><div class="lbl">Issue date</div><div class="val">${dateStr}</div></div>
      <div><div class="lbl">Period</div><div class="val">${periodStart} — ${periodEnd}</div></div>
      <div><div class="lbl">Status</div><div class="val" style="color:#16a34a;font-weight:700">✓ PAID</div></div>
    </div>
    <div class="objet-box">
      <div class="objet-label">Subject</div>
      <div class="objet-text">Net payout — COD revenue after CODShipEurope service fees</div>
    </div>
    <div>
      <table class="tbl">
        <thead><tr>
          <th style="width:36px">#</th>
          <th>Description</th>
          <th class="r" style="width:60px">Qty</th>
          <th class="r" style="width:110px">Unit price</th>
          <th class="r" style="width:110px">Amount</th>
        </tr></thead>
        <tbody>
          <tr>
            <td style="color:#9ca3af;font-size:11px;padding:10px 14px">01</td>
            <td style="padding:10px 14px">
              <div style="font-weight:600;color:#111827;font-size:14px">Gross revenue — delivered COD orders</div>
              <div style="font-size:11px;color:#9ca3af;font-family:monospace;margin-top:3px">Ref: ${inv.number} · ${delivCount} deliver${delivCount > 1 ? "ies" : "y"}${retCount > 0 ? ` · ${retCount} return${retCount > 1 ? "s" : ""}` : ""}</div>
            </td>
            <td style="text-align:right;padding:10px 14px">${delivCount || 1}</td>
            <td style="text-align:right;padding:10px 14px;color:#6b7280">— €</td>
            <td style="text-align:right;padding:10px 14px;font-weight:700;color:#111827">${f(gross)} €</td>
          </tr>
          ${feeRows}
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end">
        <div class="totals">
          <div class="tot-row"><span class="tot-label">Gross revenue</span><span class="tot-val">${f(gross)} €</span></div>
          ${hasFees ? `<div class="tot-row"><span class="tot-label tot-fee">Delivery fee</span><span class="tot-val tot-fee">— ${f(feeDelivery)} €</span></div>` : ""}
          ${hasFees && feeReturn > 0 ? `<div class="tot-row"><span class="tot-label tot-fee">Return fee</span><span class="tot-val tot-fee">— ${f(feeReturn)} €</span></div>` : ""}
          ${hasFees ? `<div class="tot-row"><span class="tot-label tot-fee">Call center fee</span><span class="tot-val tot-fee">— ${f(feeCallCenter)} €</span></div>` : ""}
          ${hasFees ? `<div class="tot-row"><span class="tot-label tot-fee">Total service fees</span><span class="tot-val tot-fee">— ${f(feeTotal)} €</span></div>` : ""}
          <div class="tot-row tot-net"><span class="tot-label">Net payout</span><span class="tot-val">${f(netPayout)} €</span></div>
        </div>
      </div>
    </div>
    <div class="pay-box">
      <span class="pay-status"><span class="pay-dot"></span>PAYMENT SENT</span>
      <div class="pay-detail">
        <div class="pay-mode">SEPA bank transfer</div>
        <div class="pay-iban">IBAN: ${ibanMasked}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:2px">Amount paid</div>
        <div style="font-size:18px;font-weight:800;color:#f97316">${f(netPayout)} €</div>
      </div>
    </div>
  </div>
  <div class="ftr">
    <div class="ftr-left">© ${today.getFullYear()} CODShipEurope Pro Platform · All rights reserved</div>
    <div class="ftr-center">Official document — Do not alter</div>
    <div class="ftr-right">Generated on ${dateStr}</div>
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
  { id: "1", number: "INV-2025-0047", amount: 89.00,  status: "paid",    date: "1 May 2025",  dueDate: "15 May 2025",  description: "Monthly subscription — May 2025" },
  { id: "2", number: "INV-2025-0046", amount: 156.50, status: "paid",    date: "1 Apr 2025",  dueDate: "15 Apr 2025",  description: "Subscription + SMS pack — April 2025" },
  { id: "3", number: "INV-2025-0045", amount: 89.00,  status: "paid",    date: "1 Mar 2025",  dueDate: "15 Mar 2025",  description: "Monthly subscription — March 2025" },
  { id: "4", number: "INV-2025-0044", amount: 89.00,  status: "paid",    date: "1 Feb 2025",  dueDate: "15 Feb 2025",  description: "Monthly subscription — February 2025" },
  { id: "5", number: "INV-2025-0043", amount: 234.00, status: "paid",    date: "1 Jan 2025",  dueDate: "15 Jan 2025",  description: "Subscription + Extra storage — Jan 2025" },
]

const fmt = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function StatusPill({ status }: { status: string }) {
  if (status === "completed" || status === "paid")
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" />{status === "paid" ? "Paid" : "Completed"}</span>
  if (status === "pending")
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium border border-amber-500/20"><Clock className="w-3 h-3" />Pending</span>
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium border border-red-500/20"><XCircle className="w-3 h-3" />{status === "overdue" ? "Overdue" : "Failed"}</span>
}

export default function WalletPage() {
  const [tab, setTab] = useState<"overview" | "transactions" | "invoices">("overview")
  const [data,       setData]    = useState<WalletData | null>(null)
  const [loading,    setLoading] = useState(true)
  const [live,       setLive]    = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const { fmt: fmtMoney } = useCurrency()

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

  // Realtime relies on the anon client and is no longer guaranteed once RLS
  // denies anon SELECT on withdrawals/balances — poll as a fallback.
  useEffect(() => {
    const interval = setInterval(load, 15_000)
    return () => clearInterval(interval)
  }, [load])

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

  const withdrawals = data?.withdrawals ?? []
  const isDemo = clientId === "c1"

  const allTransactions = useMemo<Transaction[]>(() => {
    const realWithdrawals  = withdrawals.map(withdrawalToTx)
    const realAdjustments  = adjustments.map(adjustmentToTx)
    const all = [...realWithdrawals, ...realAdjustments]
    if (isDemo) all.push(...MOCK_DEPOSITS)
    return all
  }, [withdrawals, adjustments, isDemo])

  const visibleInvoices = useMemo<Invoice[]>(() => {
    const fromWithdrawals = withdrawals
      .filter(w => w.status === "approved")
      .map(withdrawalToInvoice)
    return isDemo ? [...fromWithdrawals, ...INVOICES] : fromWithdrawals
  }, [withdrawals, isDemo])

  return (
    <>
    <div className="relative p-4 md:p-6 space-y-4 md:space-y-6">
      <GridBackground />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-neutral-500">Revenue from delivered orders · Real-time withdrawals</p>
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

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/dashboard/withdrawals"
          className="md:col-span-1 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 relative overflow-hidden block hover:brightness-105 transition-all"
          style={{ boxShadow: "0 0 40px -8px rgba(249,115,22,0.35)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Wallet className="w-8 h-8 text-white/60 mb-3" />
          <p className="text-white/70 text-sm font-medium mb-1">Available to withdraw</p>
          <div className="text-4xl font-extrabold text-white font-mono tracking-tight">{loading ? "…" : fmtMoney(data?.balance ?? 0)}</div>
          <p className="text-white/60 text-xs mt-1">Ready now</p>
          <div className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0 text-sm font-medium w-full rounded-md py-2 flex items-center justify-center gap-2 transition-colors">
            <ArrowDownLeft className="w-4 h-4" />Withdraw
          </div>
        </Link>

        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative bg-neutral-900 border border-neutral-800 border-l-4 border-l-teal-500 rounded-xl p-5"
            style={{ boxShadow: `0 0 24px -10px ${GLOW_COLOR.teal}` }}>
            <CornerBrackets color={GLOW_COLOR.teal.replace("0.22", "0.5")} />
            <div className="flex items-start justify-between mb-3">
              <div><p className="text-xs font-medium text-white">Delivered revenue</p><p className="text-xs text-neutral-500">Delivered orders</p></div>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-teal-400" /></div>
            </div>
            <div className="text-2xl font-bold text-white mb-1 font-mono tracking-tight">{loading ? "…" : fmtMoney(data?.grossRevenue ?? 0)}</div>
            <div className="w-full bg-neutral-800 rounded-full h-1.5"><div className="bg-teal-500 h-1.5 rounded-full w-full" /></div>
          </div>
          <div className="relative bg-neutral-900 border border-neutral-800 border-l-4 border-l-emerald-500 rounded-xl p-5"
            style={{ boxShadow: `0 0 24px -10px ${GLOW_COLOR.emerald}` }}>
            <CornerBrackets color={GLOW_COLOR.emerald.replace("0.22", "0.5")} />
            <div className="flex items-start justify-between mb-3">
              <div><p className="text-xs font-medium text-white">Withdrawn</p><p className="text-xs text-neutral-500">Approved withdrawals</p></div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingDown className="w-4 h-4 text-emerald-400" /></div>
            </div>
            <div className="text-2xl font-bold text-white mb-1 font-mono tracking-tight">{loading ? "…" : fmtMoney(data?.approved ?? 0)}</div>
            <div className="w-full bg-neutral-800 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${data?.grossRevenue ? Math.min(100, (data.approved / data.grossRevenue) * 100) : 0}%` }} />
            </div>
          </div>
          <div className="relative bg-neutral-900 border border-neutral-800 border-l-4 border-l-amber-500 rounded-xl p-5"
            style={{ boxShadow: `0 0 24px -10px ${GLOW_COLOR.amber}` }}>
            <CornerBrackets color={GLOW_COLOR.amber.replace("0.22", "0.5")} />
            <div className="flex items-start justify-between mb-3">
              <div><p className="text-xs font-medium text-white">Processing</p><p className="text-xs text-neutral-500">Pending withdrawals</p></div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Clock className="w-4 h-4 text-amber-400" /></div>
            </div>
            <div className="text-2xl font-bold text-white mb-1 font-mono tracking-tight">{loading ? "…" : fmtMoney(data?.pending ?? 0)}</div>
            <div className="w-full bg-neutral-800 rounded-full h-1.5">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${data?.grossRevenue ? Math.min(100, (data.pending / data.grossRevenue) * 100) : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-2">
        {[
          { id: "overview",      label: "Overview" },
          { id: "transactions",  label: "Transactions" },
          { id: "invoices",      label: "Invoices" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.id ? "bg-orange-500/10 text-orange-400" : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}>{t.label}</button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────── */}
      {tab === "overview" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2"><SectionDot />Recent transactions</h3>
            <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300" onClick={() => setTab("transactions")}>View all</Button>
          </div>
          <div className="space-y-3">
            {allTransactions.slice(0, 6).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tx.type === "deposit" ? "bg-emerald-500/10" : "bg-orange-500/10"}`}>
                    {tx.type === "deposit"
                      ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      : <ArrowUpRight className="w-4 h-4 text-orange-400" />}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{tx.description}</p>
                    <p className="text-neutral-500 text-xs font-mono">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm font-mono ${tx.type === "deposit" ? "text-emerald-400" : "text-orange-400"}`}>
                    {tx.type === "deposit" ? "+" : "-"}{fmtMoney(tx.amount)}
                  </p>
                  <StatusPill status={tx.status} />
                </div>
              </div>
            ))}
            {allTransactions.length === 0 && (
              <p className="text-neutral-500 text-sm text-center py-8">No transactions yet</p>
            )}
          </div>
        </div>
      )}

      {/* ── Transactions ─────────────────────── */}
      {tab === "transactions" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2"><SectionDot />All transactions</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input placeholder="Search…" className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 w-60" />
              </div>
              <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 gap-2">
                <Filter className="w-4 h-4" />Filters
              </Button>
            </div>
          </div>
          {allTransactions.length === 0 ? (
            <div className="py-16 text-center">
              <ArrowDownLeft className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
              <p className="text-neutral-400 font-medium text-sm">No transactions yet</p>
              <p className="text-neutral-600 text-xs mt-1">Your transactions will appear here once your store is connected</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-neutral-500 text-xs border-b border-neutral-800 uppercase tracking-wider">
                      {["Type", "Description", "Reference", "Date", "Amount", "Status"].map(h => (
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
                            <span className="text-xs font-medium capitalize">{tx.type === "deposit" ? "Deposit" : "Withdrawal"}</span>
                          </div>
                        </td>
                        <td className="py-4 text-neutral-300">{tx.description}</td>
                        <td className="py-4 text-neutral-500 font-mono text-xs">{tx.reference}</td>
                        <td className="py-4 text-neutral-400 font-mono text-xs">{tx.date}</td>
                        <td className="py-4">
                          <span className={`font-semibold font-mono ${tx.type === "deposit" ? "text-emerald-400" : "text-orange-400"}`}>
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
            <h3 className="text-white font-semibold flex items-center gap-2"><SectionDot />All invoices</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input placeholder="Search…" className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 w-60" />
              </div>
              <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 gap-2">
                <Calendar className="w-4 h-4" />Period
              </Button>
            </div>
          </div>
          {visibleInvoices.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
              <p className="text-neutral-400 font-medium text-sm">No invoices available</p>
              <p className="text-neutral-600 text-xs mt-1">Invoices appear automatically once a withdrawal is approved</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-neutral-500 text-xs border-b border-neutral-800 uppercase tracking-wider">
                      {["Invoice", "Description", "Issued", "Due", "Amount", "Status", ""].map((h, i) => (
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
                        <td className="py-4 text-neutral-400 font-mono text-xs">{inv.date}</td>
                        <td className="py-4 text-neutral-400 font-mono text-xs">{inv.dueDate}</td>
                        <td className="py-4 text-white font-semibold font-mono">{fmt(inv.amount)} EUR</td>
                        <td className="py-4"><StatusPill status={inv.status} /></td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white h-8 w-8" title="Preview" onClick={() => setSelectedInvoice(inv)}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-400 h-8 w-8" title="Download" onClick={async () => {
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
                <p className="text-neutral-500 text-sm">{visibleInvoices.length} invoice{visibleInvoices.length > 1 ? "s" : ""}</p>
              </div>
            </>
          )}
        </div>
      )}

    </div>

    {selectedInvoice && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvoice(null)}>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">{selectedInvoice.number}</p>
              <p className="text-neutral-500 text-xs mt-0.5">{selectedInvoice.description}</p>
            </div>
            <button onClick={() => setSelectedInvoice(null)} className="text-neutral-500 hover:text-white transition-colors text-xl leading-none">×</button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg">CODShipEurope</p>
                <p className="text-neutral-500 text-xs">support@codshipeurope.com</p>
              </div>
              <StatusPill status={selectedInvoice.status} />
            </div>
            <div className="h-px bg-neutral-800" />
            <div className="space-y-3">
              {[
                { label: "Number",      value: selectedInvoice.number },
                { label: "Issue date",  value: selectedInvoice.date },
                { label: "Due date",    value: selectedInvoice.dueDate },
                { label: "Description", value: selectedInvoice.description },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-4">
                  <span className="text-neutral-500 text-sm whitespace-nowrap">{row.label}</span>
                  <span className="text-white text-sm text-right">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-neutral-800" />
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 font-medium">Total</span>
              <span className="text-white font-bold text-xl font-mono">{fmt(selectedInvoice.amount)} EUR</span>
            </div>
            <button
              onClick={async () => {
                const w = withdrawals.find(w => w.id === selectedInvoice.id)
                await downloadInvoice(selectedInvoice, w ? [w] : withdrawals, clientName, clientEmail)
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}
            >
              <Download className="w-4 h-4" />
              Download invoice
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
