"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft, CheckCircle, Clock, Truck, XCircle, AlertCircle,
  Save, Loader2, ChevronDown, History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AdminOrder, OrderStatus } from "@/lib/db"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge, type StatusTone } from "@/components/admin/status-badge"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  PENDING: Clock, SHIPPED: Truck, DELIVERED: CheckCircle, RETURNED: XCircle, ERROR: AlertCircle,
}
const STATUS_TONE: Record<OrderStatus, StatusTone> = {
  PENDING: "neutral", SHIPPED: "info", DELIVERED: "success", RETURNED: "warning", ERROR: "danger",
}
const ALL_STATUSES: OrderStatus[] = ["PENDING", "SHIPPED", "DELIVERED", "RETURNED", "ERROR"]

interface HistoryEntry {
  id: string
  fromStatus: string | null
  toStatus: string
  changedBy: string
  createdAt: string
}

interface Provider { id: string; name: string }

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [order,     setOrder]     = useState<AdminOrder | null>(null)
  const [history,   setHistory]   = useState<HistoryEntry[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading,   setLoading]   = useState(true)
  const [notFound,  setNotFound]  = useState(false)

  const [status,         setStatus]         = useState<OrderStatus>("PENDING")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [providerId,     setProviderId]     = useState("")
  const [shipmentStatus, setShipmentStatus] = useState("")
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState("")
  const [savedMsg, setSavedMsg] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [orderRes, provRes] = await Promise.all([
      fetch(`/api/admin/orders/${id}`),
      fetch("/api/admin/providers").then(r => r.json()).catch(() => []),
    ])
    if (orderRes.status === 404) { setNotFound(true); setLoading(false); return }
    const data = await orderRes.json().catch(() => null)
    if (data?.order) {
      setOrder(data.order)
      setHistory(Array.isArray(data.history) ? data.history : [])
      setStatus(data.order.status)
      setTrackingNumber(data.order.trackingNumber ?? "")
      setProviderId(data.order.providerId ?? "")
      setShipmentStatus(data.order.shipmentStatus ?? "")
    }
    setProviders(Array.isArray(provRes) ? provRes : [])
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const save = async () => {
    setSaving(true)
    setError("")
    setSavedMsg(false)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber.trim() || undefined,
          providerId: providerId || null,
          shipmentStatus: shipmentStatus || null,
        }),
      })
      if (!res.ok) { setError("Update failed"); return }
      await load()
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
    } catch {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-neutral-500 text-sm">Loading…</p>
    </div>
  )

  if (notFound || !order) return (
    <div className="p-4 md:p-6">
      <Link href="/admin/orders" className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />Back to orders
      </Link>
      <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center text-neutral-500">Order not found</div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-5">
      <Link href="/admin/orders" className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700">
        <ArrowLeft className="w-3.5 h-3.5" />Back to orders
      </Link>

      <PageHeader
        title={order.customerName || "Order"}
        subtitle={`${order.product} · Ref #${order.id.slice(-8).toUpperCase()}`}
        actions={<StatusBadge label={order.status} tone={STATUS_TONE[order.status]} icon={STATUS_ICONS[order.status]} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Details */}
        <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-xl p-5 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-[#17191D]">Order details</h2>
          {[
            ["Merchant", <Link key="m" href={`/admin/clients`} className="text-orange-600 hover:text-orange-700">{order.clientName}</Link>],
            ["Customer", order.customerName || "—"],
            ["Phone", order.customerPhone || "—"],
            ["Destination", <span key="d" className="flex items-center gap-1.5">{FLAGS[order.countryCode] ?? "🏳️"} {order.country || "—"}</span>],
            ["COD amount", <span key="v" className="font-semibold">€{order.value.toFixed(2)} {order.currency}</span>],
            ["Store", order.store || "—"],
            ["Tracking #", order.trackingNumber ? <code key="t" className="text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">{order.trackingNumber}</code> : "—"],
            ["Created", new Date(order.createdAt).toLocaleString("en-GB")],
          ].map(([label, value], i) => (
            <div key={i} className="flex items-center justify-between text-sm gap-3">
              <span className="text-neutral-400">{label}</span>
              <span className="text-[#17191D] text-right">{value}</span>
            </div>
          ))}
        </div>

        {/* Update form */}
        <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-xl p-5 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-[#17191D]">Update order</h2>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STATUSES.map(s => {
                const Icon = STATUS_ICONS[s]
                const active = status === s
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      active ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                    }`}>
                    <Icon className="w-3.5 h-3.5" />{s}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Tracking number</label>
            <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="e.g. 1Z999AA10123456784"
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-[#17191D] placeholder:text-neutral-400 focus:outline-none focus:border-orange-400 font-mono" />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Provider</label>
            <div className="relative">
              <select value={providerId} onChange={e => setProviderId(e.target.value)}
                className="w-full appearance-none bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-sm text-[#17191D] focus:outline-none focus:border-orange-400 cursor-pointer">
                <option value="">Unassigned</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Shipment status</label>
            <input value={shipmentStatus} onChange={e => setShipmentStatus(e.target.value)} placeholder="e.g. in_transit"
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-[#17191D] placeholder:text-neutral-400 focus:outline-none focus:border-orange-400 font-mono" />
          </div>

          {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          {savedMsg && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Saved</p>}

          <Button onClick={save} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save changes
          </Button>
        </div>

        {/* Status history */}
        <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-xl p-5 space-y-3 h-fit">
          <h2 className="text-sm font-semibold text-[#17191D] flex items-center gap-2"><History className="w-4 h-4 text-neutral-400" />Status history</h2>
          {history.length === 0 ? (
            <p className="text-sm text-neutral-400">
              No recorded history yet. History is only tracked for status changes made after this feature was added — this order may predate it, or hasn't changed status since.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map(h => (
                <div key={h.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[#17191D]">
                      {h.fromStatus ? <>{h.fromStatus} → <strong>{h.toStatus}</strong></> : <>Set to <strong>{h.toStatus}</strong></>}
                    </p>
                    <p className="text-[11px] text-neutral-400">{h.changedBy} · {new Date(h.createdAt).toLocaleString("en-GB")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
