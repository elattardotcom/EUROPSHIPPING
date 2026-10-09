"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import {
  ChevronDown,
  CheckCircle, Clock, Truck, XCircle, AlertCircle,
  ShoppingCart, RefreshCw, Radio, Pencil, X, Save, Loader2, Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AdminOrder, OrderStatus } from "@/lib/db"
import { useI18n } from "@/lib/admin-i18n"
import { exportToCSV } from "@/lib/mock-data"
import { PageHeader } from "@/components/admin/page-header"
import { KpiCard } from "@/components/admin/kpi-card"
import { StatusBadge, type StatusTone } from "@/components/admin/status-badge"
import {
  TableCard, TableToolbar, TablePagination,
  TableShell, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/admin/data-table"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  PENDING:   Clock,
  SHIPPED:   Truck,
  DELIVERED: CheckCircle,
  RETURNED:  XCircle,
  ERROR:     AlertCircle,
}
const STATUS_TONE: Record<OrderStatus, StatusTone> = {
  PENDING:   "neutral",
  SHIPPED:   "info",
  DELIVERED: "success",
  RETURNED:  "warning",
  ERROR:     "danger",
}

const ALL_STATUSES: OrderStatus[] = ["PENDING", "SHIPPED", "DELIVERED", "RETURNED", "ERROR"]
const PER_PAGE = 10

/* ── Edit modal ─────────────────────────────────────────────── */

function EditModal({
  order,
  statusLabels,
  onClose,
  onSaved,
}: {
  order: AdminOrder
  statusLabels: Record<OrderStatus, string>
  onClose: () => void
  onSaved: (updated: AdminOrder) => void
}) {
  const [status,         setStatus]         = useState<OrderStatus>(order.status)
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "")
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState("")

  const save = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status, trackingNumber: trackingNumber.trim() || undefined }),
      })
      if (!res.ok) { setError("Update failed"); return }
      const updated: AdminOrder = await res.json()
      onSaved(updated)
    } catch {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-[#17191D]">Edit order</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{order.customerName} · {order.product}</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-[#17191D] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STATUSES.map(s => {
                const Icon = STATUS_ICONS[s]
                const active = status === s
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      active
                        ? "bg-orange-50 border-orange-300 text-orange-700"
                        : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-[#17191D]"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {statusLabels[s]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tracking number */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Tracking number
            </label>
            <input
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784"
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-[#17191D] placeholder:text-neutral-400 focus:outline-none focus:border-orange-400 font-mono"
            />
            <p className="text-xs text-neutral-400 mt-1.5">Leave blank to clear the existing number</p>
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-neutral-500 hover:text-[#17191D]">
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Page ───────────────────────────────────────────────────── */

export default function AdminOrders() {
  const { t } = useI18n()
  const [orders,  setOrders]  = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [statF,   setStat]    = useState<OrderStatus | "ALL">("ALL")
  const [page,    setPage]    = useState(1)
  const [live,    setLive]    = useState(false)
  const [editing, setEditing] = useState<AdminOrder | null>(null)

  const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING:   t("status_pending"),
    SHIPPED:   t("status_shipped"),
    DELIVERED: t("status_delivered"),
    RETURNED:  t("status_returned"),
    ERROR:     t("status_error"),
  }

  const load = useCallback(async () => {
    const d = await fetch("/api/admin/orders").then(r => r.json()).catch(() => [])
    setOrders(Array.isArray(d) ? d : [])
    setLoading(false)
    setLive(true)
  }, [])

  useEffect(() => {
    load()
    const i = setInterval(load, 5_000)
    return () => clearInterval(i)
  }, [load])

  const filtered = useMemo(() => orders.filter(o => {
    const ms  = `${o.customerName} ${o.clientName} ${o.product} ${o.trackingNumber??""}`
      .toLowerCase().includes(search.toLowerCase())
    const mst = statF === "ALL" || o.status === statF
    return ms && mst
  }), [orders, search, statF])

  const totalPages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const cur          = Math.min(page, totalPages)
  const rows         = filtered.slice((cur-1)*PER_PAGE, cur*PER_PAGE)
  const totalRevenue = orders.filter(o=>o.status==="DELIVERED").reduce((s,o)=>s+o.value,0)

  const handleExport = () => {
    exportToCSV(
      filtered.map(o => ({
        ID: o.id, Client: o.clientName, Customer: o.customerName, Phone: o.customerPhone,
        Country: o.country, Product: o.product, "Value (EUR)": o.value.toFixed(2),
        Currency: o.currency, Status: o.status, Store: o.store,
        Tracking: o.trackingNumber ?? "", "Created at": o.createdAt,
      })),
      "orders_codshipeurope.csv"
    )
  }

  const handleSaved = (updated: AdminOrder) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    setEditing(null)
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {editing && (
        <EditModal
          order={editing}
          statusLabels={STATUS_LABELS}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      <PageHeader
        title={t("orders_title")}
        subtitle={t("orders_sub")}
        actions={
          <>
            {live && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                <Radio className="w-3 h-3 animate-pulse" />{t("live")}
              </span>
            )}
            <button onClick={load}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#17191D] text-sm transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />{t("refresh")}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {([
          { label:t("orders_total"),    value: orders.length,                                   status:"ALL"       },
          { label:t("orders_pending"),  value: orders.filter(o=>o.status==="PENDING").length,   status:"PENDING"   },
          { label:t("orders_shipped"),  value: orders.filter(o=>o.status==="SHIPPED").length,   status:"SHIPPED"   },
          { label:t("orders_delivered"),value: orders.filter(o=>o.status==="DELIVERED").length, status:"DELIVERED" },
          { label:t("orders_returned"), value: orders.filter(o=>o.status==="RETURNED").length,  status:"RETURNED"  },
        ] as {label:string;value:number;status:string}[]).map(k => (
          <KpiCard key={k.label} label={k.label} value={loading ? "…" : k.value} icon={ShoppingCart}
            active={statF === k.status} onClick={() => { setStat(k.status as OrderStatus|"ALL"); setPage(1) }} />
        ))}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-emerald-700 text-sm font-medium">{t("orders_revenue")}</p>
          <p className="text-3xl font-bold text-[#17191D] mt-1">€{loading ? "…" : totalRevenue.toFixed(2)}</p>
        </div>
        <CheckCircle className="w-10 h-10 text-emerald-300" />
      </div>

      <TableToolbar
        search={search} onSearchChange={v => { setSearch(v); setPage(1) }} searchPlaceholder={t("orders_search")}
        filters={
          <div className="relative">
            <select value={statF} onChange={e=>{setStat(e.target.value as OrderStatus|"ALL");setPage(1)}}
              className="appearance-none bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2.5 text-sm text-neutral-600 focus:outline-none focus:border-orange-400 cursor-pointer">
              <option value="ALL">{t("orders_all_status")}</option>
              {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([k,v])=>(
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
        }
        actions={
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors">
            <Download className="w-3.5 h-3.5" />Export
          </button>
        }
      />

      <TableCard>
        <div className="px-5 py-3 border-b border-neutral-100">
          <p className="text-sm text-neutral-500">{loading ? t("loading") : `${filtered.length} orders`}</p>
        </div>
        <TableShell>
          <TableHeader>
            <TableRow>
              {[t("orders_th_customer"),t("orders_th_merchant"),t("orders_th_country"),t("orders_th_product"),t("orders_th_value"),t("orders_th_tracking"),t("orders_th_status"),t("orders_th_date"),""].map((h,i)=>(
                <TableHead key={i} className="whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? <TableRow><TableCell colSpan={9} className="py-12 text-center text-neutral-400">{t("loading")}</TableCell></TableRow>
              : rows.length === 0
                ? <TableRow><TableCell colSpan={9} className="py-12 text-center text-neutral-400">{t("orders_none")}</TableCell></TableRow>
                : rows.map(o=>(
                    <TableRow key={o.id}>
                      <TableCell className="whitespace-nowrap font-medium">{o.customerName}</TableCell>
                      <TableCell><span className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded-lg">{o.clientName}</span></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{FLAGS[o.countryCode]??"🏳️"}</span>
                          <span className="text-sm text-neutral-600">{o.country}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-600">{o.product}</TableCell>
                      <TableCell className="font-semibold">€{o.value.toFixed(2)}</TableCell>
                      <TableCell>
                        {o.trackingNumber
                          ? <code className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded">{o.trackingNumber}</code>
                          : <span className="text-neutral-300 text-xs">—</span>
                        }
                      </TableCell>
                      <TableCell><StatusBadge label={STATUS_LABELS[o.status]??o.status} tone={STATUS_TONE[o.status]??"danger"} icon={STATUS_ICONS[o.status]} /></TableCell>
                      <TableCell className="whitespace-nowrap text-neutral-500">{o.createdAt}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => setEditing(o)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold transition-colors border border-orange-200"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
            }
          </TableBody>
        </TableShell>
        <TablePagination page={cur} totalPages={totalPages} onChange={setPage}
          totalLabel={`${filtered.length===0?0:(cur-1)*PER_PAGE+1}–${Math.min(cur*PER_PAGE,filtered.length)} / ${filtered.length}`} />
      </TableCard>
    </div>
  )
}
