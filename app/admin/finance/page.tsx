"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { RefreshCw, Download, Package, Clock, CheckCircle2, Landmark, Wallet, Receipt, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { KpiCard } from "@/components/admin/kpi-card"
import { exportToCSV } from "@/lib/mock-data"
import {
  TableCard, TableToolbar,
  TableShell, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/admin/data-table"
import type { FinanceLedger, FinanceLedgerRow } from "@/lib/db"

const eur = (n: number) => `€${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function AdminFinancePage() {
  const [ledger,  setLedger]  = useState<FinanceLedger | null>(null)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const d = await fetch("/api/admin/finance").then(r => r.json()).catch(() => null)
    setLedger(d)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const rows = ledger?.rows ?? []
  const filtered = useMemo(
    () => rows.filter(r => r.clientName.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  )

  const handleExport = () => {
    exportToCSV(
      filtered.map((r: FinanceLedgerRow) => ({
        Merchant: r.clientName,
        "Order value (EUR)":      r.orderValue.toFixed(2),
        "COD expected (EUR)":     r.codExpected.toFixed(2),
        "COD collected (EUR)":    r.codCollected.toFixed(2),
        "Reconciled (EUR)":       r.reconciled.toFixed(2),
        "Unreconciled (EUR)":     r.unreconciled.toFixed(2),
        "Service fees est. (EUR)": r.feesEstimated.toFixed(2),
        "Merchant payable (EUR)": r.merchantPayable.toFixed(2),
      })),
      "finance_ledger_codshipeurope.csv"
    )
  }

  const t = ledger?.totals

  return (
    <div className="p-4 md:p-6 space-y-5">
      <PageHeader
        title="Financial Control Tower"
        subtitle="Order value, COD flow and reconciliation per merchant — computed live from orders and wallets, nothing fabricated"
        actions={
          <>
            <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#17191D] text-sm transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />Refresh
            </button>
            <button onClick={handleExport} disabled={!filtered.length} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#17191D] text-sm transition-colors disabled:opacity-40">
              <Download className="w-3.5 h-3.5" />Export CSV
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total order value" value={loading ? "…" : eur(t?.orderValue ?? 0)} icon={Package}
          sub="All orders, any status" />
        <KpiCard label="COD expected" value={loading ? "…" : eur(t?.codExpected ?? 0)} icon={Clock}
          sub="Pending + shipped — not yet collected" />
        <KpiCard label="COD collected" value={loading ? "…" : eur(t?.codCollected ?? 0)} icon={CheckCircle2}
          sub="Delivered orders" />
        <KpiCard label="Merchant payables" value={loading ? "…" : eur(t?.merchantPayable ?? 0)} icon={Wallet}
          sub="Owed to merchants right now" />
        <KpiCard label="Reconciled" value={loading ? "…" : eur(t?.reconciled ?? 0)} icon={CheckCircle2}
          sub="Delivered/returned, already invoiced" />
        <KpiCard label="Unreconciled" value={loading ? "…" : eur(t?.unreconciled ?? 0)} icon={Clock}
          sub="Delivered/returned, pending invoice" />
        <KpiCard label="Service fees (est.)" value={loading ? "…" : eur(t?.feesEstimated ?? 0)} icon={Receipt}
          sub="At current rates — platform revenue from COD ops" />
        <KpiCard label="Platform revenue — MRR" value={loading ? "…" : eur(t?.platformRevenueMRR ?? 0)} icon={TrendingUp}
          sub="Active subscriptions — kept separate from COD figures" />
      </div>

      <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search merchant…" />

      <TableCard>
        <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-neutral-400" />
          <p className="text-sm text-neutral-500">{loading ? "Loading…" : `${filtered.length} merchant${filtered.length !== 1 ? "s" : ""}`}</p>
        </div>
        <TableShell>
          <TableHeader>
            <TableRow>
              {["Merchant", "Order value", "COD expected", "COD collected", "Reconciled", "Unreconciled", "Fees (est.)", "Payable"].map(h => (
                <TableHead key={h} className={h === "Merchant" ? "" : "text-right"}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="py-12 text-center text-neutral-400">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="py-12 text-center text-neutral-400">No merchants match this search</TableCell></TableRow>
            ) : filtered.map(r => (
              <TableRow key={r.clientId}>
                <TableCell className="font-medium">{r.clientName}</TableCell>
                <TableCell className="text-right">{eur(r.orderValue)}</TableCell>
                <TableCell className="text-right">{eur(r.codExpected)}</TableCell>
                <TableCell className="text-right">{eur(r.codCollected)}</TableCell>
                <TableCell className="text-right">{eur(r.reconciled)}</TableCell>
                <TableCell className="text-right">{eur(r.unreconciled)}</TableCell>
                <TableCell className="text-right">{eur(r.feesEstimated)}</TableCell>
                <TableCell className="text-right font-medium">{eur(r.merchantPayable)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableShell>
      </TableCard>
    </div>
  )
}
