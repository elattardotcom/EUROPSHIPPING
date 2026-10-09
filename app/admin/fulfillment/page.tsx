"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, RefreshCw, ChevronDown, Package, AlertCircle, Truck } from "lucide-react"

interface Order {
  id: string
  clientName: string
  customerName: string
  country: string
  countryCode: string
  product: string
  value: number
  currency: string
  status: string
  trackingNumber?: string
  providerId?: string
  shipmentStatus?: string
  shipmentError?: string
  createdAt: string
}

interface Provider {
  id: string
  name: string
  status: string
}

const SHIPMENT_STATUSES = ["", "booked", "in_transit", "out_for_delivery", "delivered", "exception", "returned"]

export default function AdminFulfillmentPage() {
  const [orders,    setOrders]    = useState<Order[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState("")
  const [savingId,  setSavingId]  = useState<string | null>(null)
  const [onlyUnassigned, setOnlyUnassigned] = useState(false)

  async function load() {
    setLoading(true)
    const [o, p] = await Promise.all([
      fetch("/api/admin/orders").then(r => r.json()).catch(() => []),
      fetch("/api/admin/providers").then(r => r.json()).catch(() => []),
    ])
    setOrders(Array.isArray(o) ? o : [])
    setProviders(Array.isArray(p) ? p : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => orders.filter(o => {
    const ms = !search ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (o.trackingNumber ?? "").toLowerCase().includes(search.toLowerCase())
    const mu = !onlyUnassigned || !o.providerId
    return ms && mu && ["PENDING", "SHIPPED"].includes(o.status)
  }), [orders, search, onlyUnassigned])

  async function assignProvider(id: string, providerId: string) {
    setSavingId(id)
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId: providerId || null }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, providerId: providerId || undefined } : o))
    setSavingId(null)
  }

  async function setShipmentStatus(id: string, shipmentStatus: string) {
    setSavingId(id)
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentStatus: shipmentStatus || null }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, shipmentStatus: shipmentStatus || undefined } : o))
    setSavingId(null)
  }

  const unassignedCount = orders.filter(o => ["PENDING", "SHIPPED"].includes(o.status) && !o.providerId).length

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-400" />Fulfillment & Tracking
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">Assign a provider and track shipments for in-progress orders</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />Refresh
        </button>
      </div>

      {providers.filter(p => p.status === "active").length === 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-neutral-400">
            No active provider is connected yet — tracking numbers and shipment statuses below are whatever has
            been recorded manually. Add and activate a provider on the <a href="/admin/providers" className="text-orange-400 hover:text-orange-300">Providers</a> page to start assigning shipments to it.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer, client, tracking…"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
        </div>
        <button onClick={() => setOnlyUnassigned(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            onlyUnassigned ? "bg-orange-500/10 border-orange-500/40 text-orange-400" : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
          }`}>
          <Package className="w-3.5 h-3.5" />Unassigned only ({unassignedCount})
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{loading ? "Loading…" : `${filtered.length} order${filtered.length !== 1 ? "s" : ""} in progress`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Order", "Client", "Country", "Status", "Provider", "Shipment status", "Tracking #"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">No in-progress orders{onlyUnassigned ? " without a provider" : ""}</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                  <td className="p-4">
                    <p className="text-white text-sm font-medium">{o.customerName || "—"}</p>
                    <p className="text-neutral-600 text-xs">{o.product}</p>
                  </td>
                  <td className="p-4 text-sm text-neutral-300">{o.clientName}</td>
                  <td className="p-4 text-sm text-neutral-400">{o.country || o.countryCode || "—"}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">{o.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <select value={o.providerId ?? ""} onChange={e => assignProvider(o.id, e.target.value)} disabled={savingId === o.id}
                        className="appearance-none bg-neutral-800 border border-neutral-700 rounded-lg pl-3 pr-7 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer disabled:opacity-50">
                        <option value="">Unassigned</option>
                        {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none" />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <select value={o.shipmentStatus ?? ""} onChange={e => setShipmentStatus(o.id, e.target.value)} disabled={savingId === o.id}
                        className="appearance-none bg-neutral-800 border border-neutral-700 rounded-lg pl-3 pr-7 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer disabled:opacity-50">
                        {SHIPMENT_STATUSES.map(s => <option key={s} value={s}>{s === "" ? "—" : s.replace(/_/g, " ")}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none" />
                    </div>
                    {o.shipmentError && <p className="text-[10px] text-red-400 mt-1">{o.shipmentError}</p>}
                  </td>
                  <td className="p-4 text-sm text-neutral-400 font-mono">{o.trackingNumber || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
