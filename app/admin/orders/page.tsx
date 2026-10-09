"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Truck, XCircle, AlertCircle,
  ShoppingCart, RefreshCw, Radio, Pencil, X, Save, Loader2, Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AdminOrder, OrderStatus } from "@/lib/db"
import { useI18n } from "@/lib/admin-i18n"
import { exportToCSV } from "@/lib/mock-data"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  PENDING:   Clock,
  SHIPPED:   Truck,
  DELIVERED: CheckCircle,
  RETURNED:  XCircle,
  ERROR:     AlertCircle,
}
const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:   "text-amber-400",
  SHIPPED:   "text-blue-400",
  DELIVERED: "text-emerald-400",
  RETURNED:  "text-red-400",
  ERROR:     "text-rose-400",
}
const STATUS_BG: Record<OrderStatus, string> = {
  PENDING:   "bg-amber-500/10 border-amber-500/20",
  SHIPPED:   "bg-blue-500/10 border-blue-500/20",
  DELIVERED: "bg-emerald-500/10 border-emerald-500/20",
  RETURNED:  "bg-red-500/10 border-red-500/20",
  ERROR:     "bg-rose-500/10 border-rose-500/20",
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-white">Edit order</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{order.customerName} · {order.product}</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
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
                        ? `${STATUS_BG[s]} ${STATUS_COLORS[s]} border-current`
                        : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600 hover:text-white"
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
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Tracking number
            </label>
            <input
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 font-mono"
            />
            <p className="text-xs text-neutral-600 mt-1.5">Leave blank to clear the existing number</p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-neutral-400 hover:text-white">
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{t("orders_title")}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{t("orders_sub")}</p>
        </div>
        <div className="flex items-center gap-3">
          {live && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Radio className="w-3 h-3 animate-pulse" />{t("live")}
            </span>
          )}
          <button onClick={load}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />{t("refresh")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {([
          { label:t("orders_total"),    value: orders.length,                                   status:"ALL",       grad: "linear-gradient(135deg,#f97316,#dc2626)", border: "rgba(249,115,22,0.25)", glow: "rgba(249,115,22,0.08)" },
          { label:t("orders_pending"),  value: orders.filter(o=>o.status==="PENDING").length,   status:"PENDING",   grad: "linear-gradient(135deg,#f59e0b,#d97706)", border: "rgba(245,158,11,0.25)", glow: "rgba(245,158,11,0.08)" },
          { label:t("orders_shipped"),  value: orders.filter(o=>o.status==="SHIPPED").length,   status:"SHIPPED",   grad: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "rgba(59,130,246,0.25)", glow: "rgba(59,130,246,0.08)" },
          { label:t("orders_delivered"),value: orders.filter(o=>o.status==="DELIVERED").length, status:"DELIVERED", grad: "linear-gradient(135deg,#10b981,#059669)", border: "rgba(16,185,129,0.25)", glow: "rgba(16,185,129,0.08)" },
          { label:t("orders_returned"), value: orders.filter(o=>o.status==="RETURNED").length,  status:"RETURNED",  grad: "linear-gradient(135deg,#ef4444,#b91c1c)", border: "rgba(239,68,68,0.25)",  glow: "rgba(239,68,68,0.08)"  },
        ] as {label:string;value:number;status:string;grad:string;border:string;glow:string}[]).map(k => (
          <button key={k.label} onClick={()=>{setStat(k.status as OrderStatus|"ALL");setPage(1)}}
            className={`relative rounded-2xl p-5 overflow-hidden text-left transition-all hover:-translate-y-0.5 ${statF === k.status ? "" : ""}`}
            style={{ background: "#111", border: `1px solid ${statF === k.status ? k.border.replace("0.25", "0.5") : k.border}` }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ background: k.grad }} />
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: k.grad, opacity: 0.7 }} />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: k.glow, border: `1px solid ${k.border}` }}>
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-white mb-0.5">{loading ? "…" : k.value}</div>
              <p className="text-xs text-neutral-400 font-medium">{k.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-emerald-400 text-sm font-medium">{t("orders_revenue")}</p>
          <p className="text-3xl font-extrabold text-white mt-1">€{loading ? "…" : totalRevenue.toFixed(2)}</p>
        </div>
        <CheckCircle className="w-12 h-12 text-emerald-500/30" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder={t("orders_search")}
            className="w-full sm:w-64 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
        </div>
        <div className="relative">
          <select value={statF} onChange={e=>{setStat(e.target.value as OrderStatus|"ALL");setPage(1)}}
            className="w-full sm:w-auto appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
            <option value="ALL">{t("orders_all_status")}</option>
            {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([k,v])=>(
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border border-neutral-800 text-neutral-300 hover:bg-neutral-800 transition-colors">
          <Download className="w-3.5 h-3.5" />Export
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{loading ? t("loading") : `${filtered.length} orders`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {[t("orders_th_customer"),t("orders_th_merchant"),t("orders_th_country"),t("orders_th_product"),t("orders_th_value"),t("orders_th_tracking"),t("orders_th_status"),t("orders_th_date"),""].map((h,i)=>(
                  <th key={i} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={9} className="py-12 text-center text-neutral-500 text-sm">{t("loading")}</td></tr>
                : rows.length === 0
                  ? <tr><td colSpan={9} className="py-12 text-center text-neutral-500 text-sm">{t("orders_none")}</td></tr>
                  : rows.map(o=>{
                      const Icon  = STATUS_ICONS[o.status] ?? AlertCircle
                      const color = STATUS_COLORS[o.status] ?? "text-rose-400"
                      return (
                        <tr key={o.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                          <td className="p-4 text-sm text-white whitespace-nowrap">{o.customerName}</td>
                          <td className="p-4"><span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">{o.clientName}</span></td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{FLAGS[o.countryCode]??"🏳️"}</span>
                              <span className="text-sm text-neutral-300">{o.country}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-neutral-300">{o.product}</td>
                          <td className="p-4 text-sm font-semibold text-white">€{o.value.toFixed(2)}</td>
                          <td className="p-4">
                            {o.trackingNumber
                              ? <code className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">{o.trackingNumber}</code>
                              : <span className="text-neutral-600 text-xs">—</span>
                            }
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${color}`}>
                              <Icon className="w-3 h-3"/>{STATUS_LABELS[o.status]??o.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-neutral-500 whitespace-nowrap">{o.createdAt}</td>
                          <td className="p-4">
                            <button
                              onClick={() => setEditing(o)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/30 text-orange-400 text-xs font-semibold transition-colors border border-orange-500/30"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      )
                    })
              }
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-neutral-800 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            {filtered.length===0?0:(cur-1)*PER_PAGE+1}–{Math.min(cur*PER_PAGE,filtered.length)} / {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
              disabled={cur===1} onClick={()=>setPage(p=>p-1)}><ChevronLeft className="w-4 h-4"/></Button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)}
                className={`h-8 w-8 rounded-lg text-sm font-medium ${cur===p?"bg-orange-500 text-white":"text-neutral-400 hover:text-white hover:bg-neutral-800"}`}>
                {p}
              </button>
            ))}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
              disabled={cur===totalPages} onClick={()=>setPage(p=>p+1)}><ChevronRight className="w-4 h-4"/></Button>
          </div>
        </div>
      </div>
    </div>
  )
}
