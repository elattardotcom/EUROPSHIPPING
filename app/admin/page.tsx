"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import {
  Users, ShoppingCart, DollarSign, ArrowUpRight,
  Clock, AlertCircle, RefreshCw, Radio, Store, TrendingUp,
  Package, Truck, PhoneCall, CheckCircle, Zap, Wallet, ClipboardList, ArrowRight, Activity,
} from "lucide-react"
import type { Client, AdminOrder, AdminLead } from "@/lib/db"
import { useRealtime, type RealtimeEvent } from "@/hooks/useSse"
import { CornerBrackets, SectionDot } from "@/components/dashboard/hud-accents"

const FLAGS: Record<string, string> = {
  PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪",
  TN:"🇹🇳", DZ:"🇩🇿", AE:"🇦🇪", IT:"🇮🇹", DE:"🇩🇪",
}

const LEAD_STATUS: Record<string, { dot: string; label: string; ring: string }> = {
  CONFIRMED: { dot: "#10b981", label: "Confirmed",    ring: "rgba(16,185,129,0.2)"  },
  PENDING:   { dot: "#f59e0b", label: "Pending",      ring: "rgba(245,158,11,0.2)"  },
  UNREACHED: { dot: "#3b82f6", label: "Unreachable",  ring: "rgba(59,130,246,0.2)"  },
  CANCELED:  { dot: "#f43f5e", label: "Canceled",     ring: "rgba(244,63,94,0.2)"   },
  ERROR:     { dot: "#f43f5e", label: "Error",        ring: "rgba(244,63,94,0.2)"   },
}

const CLIENT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Active",     color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  trial:     { label: "Trial",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  suspended: { label: "Suspended",  color: "#f43f5e", bg: "rgba(244,63,94,0.12)"   },
  cancelled: { label: "Cancelled",  color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
}

function initials(a: string, b: string) {
  return `${(a[0] ?? "").toUpperCase()}${(b[0] ?? "").toUpperCase()}` || "?"
}

const RATE_PAIRS = [
  { currency: "EUR", flag: "🇪🇺", label: "Euro (base)",     color: "#f97316", fixed: 1 },
  { currency: "USD", flag: "🇺🇸", label: "US Dollar",       color: "#10b981", fixed: null },
  { currency: "GBP", flag: "🇬🇧", label: "British Pound",   color: "#6366f1", fixed: null },
  { currency: "CAD", flag: "🇨🇦", label: "Canadian Dollar", color: "#8b5cf6", fixed: null },
]

interface ActivityItem {
  id: string
  icon: typeof Zap
  color: string
  text: string
  time: number // Date.now()
}

export default function AdminDashboard() {
  const [clients,     setClients]     = useState<Client[]>([])
  const [orders,      setOrders]      = useState<AdminOrder[]>([])
  const [leads,       setLeads]       = useState<AdminLead[]>([])
  const [stores,      setStores]      = useState<{ id: string }[]>([])
  const [loading,     setLoading]     = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [rates,       setRates]       = useState<Record<string, number>>({})
  const [ratesDate,   setRatesDate]   = useState("")
  const [ratesLoading,setRatesLoading]= useState(true)
  const [pending,     setPending]     = useState({ requests: 0, withdrawals: 0 })
  const [live,        setLive]        = useState(false)
  const [activity,    setActivity]    = useState<ActivityItem[]>([])
  const clientsRef = useRef<Client[]>([])
  useEffect(() => { clientsRef.current = clients }, [clients])

  useEffect(() => {
    fetch("/api/rates")
      .then(r => r.json())
      .then((r: Record<string, number>) => {
        setRates(r)
        setRatesDate(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Casablanca" }))
      })
      .catch(() => {})
      .finally(() => setRatesLoading(false))
  }, [])

  const load = useCallback(async () => {
    const [c, o, l, s, counts] = await Promise.all([
      fetch("/api/admin/clients").then(r => r.json()).catch(() => []),
      fetch("/api/admin/orders").then(r => r.json()).catch(() => []),
      fetch("/api/admin/leads").then(r => r.json()).catch(() => []),
      fetch("/api/admin/stores").then(r => r.json()).catch(() => []),
      fetch("/api/admin/counts").then(r => r.json()).catch(() => null),
    ])
    setClients(Array.isArray(c) ? c : [])
    setOrders(Array.isArray(o) ? o : [])
    setLeads(Array.isArray(l) ? l : [])
    setStores(Array.isArray(s) ? s : [])
    if (counts) setPending({ requests: counts.requests ?? 0, withdrawals: counts.withdrawals ?? 0 })
    setLoading(false)
    setLastRefresh(new Date())
  }, [])

  useEffect(() => { load(); const i = setInterval(load, 30_000); return () => clearInterval(i) }, [load])

  // ── Live activity feed, synced with every client dashboard ────
  const onRealtimeEvent = useCallback((e: RealtimeEvent) => {
    setLive(true)
    setTimeout(() => setLive(false), 2000)

    const clientName = (id: string) => {
      const c = clientsRef.current.find(c => c.id === id)
      return c ? `${c.firstName} ${c.lastName}` : "A client"
    }

    let item: ActivityItem | null = null
    if (e.type === "lead_inserted") item = { id: `${e.type}-${e.row.id}`, icon: PhoneCall, color: "#3b82f6", text: `${clientName(e.row.client_id)} received a new lead${e.row.name ? ` — ${e.row.name}` : ""}`, time: Date.now() }
    if (e.type === "lead_updated" && e.row.status === "confirmed") item = { id: `${e.type}-${e.row.id}-${Date.now()}`, icon: CheckCircle, color: "#10b981", text: `Lead confirmed for ${clientName(e.row.client_id)}`, time: Date.now() }
    if (e.type === "order_inserted") item = { id: `${e.type}-${e.row.id}`, icon: ShoppingCart, color: "#f97316", text: `${clientName(e.row.client_id)} got a new order${e.row.product ? ` — ${e.row.product}` : ""}`, time: Date.now() }
    if (e.type === "order_updated" && e.row.status === "DELIVERED") item = { id: `${e.type}-${e.row.id}-${Date.now()}`, icon: Truck, color: "#10b981", text: `Order delivered for ${clientName(e.row.client_id)}`, time: Date.now() }
    if (e.type === "withdrawal_inserted") item = { id: `${e.type}-${e.row.id}`, icon: Wallet, color: "#f59e0b", text: `${clientName(e.row.client_id)} requested a withdrawal — €${Number(e.row.amount ?? 0).toFixed(2)}`, time: Date.now() }
    if (e.type === "withdrawal_updated" && e.row.status === "approved") item = { id: `${e.type}-${e.row.id}-${Date.now()}`, icon: CheckCircle, color: "#10b981", text: `Withdrawal approved for ${clientName(e.row.client_id)}`, time: Date.now() }

    if (item) setActivity(prev => [item!, ...prev].slice(0, 12))
    load()
  }, [load])

  useRealtime(onRealtimeEvent)

  const active        = clients.filter(c => c.status === "active")
  const trial          = clients.filter(c => c.status === "trial")
  const suspended     = clients.filter(c => c.status === "suspended")
  const mrr           = active.reduce((s, c) => s + c.monthlyRevenue, 0)
  const arr           = mrr * 12
  const delivered     = orders.filter(o => o.status === "DELIVERED").length
  const returned      = orders.filter(o => o.status === "RETURNED").length
  const confirmed     = leads.filter(l => l.status === "CONFIRMED").length
  const pendingLeads  = leads.filter(l => l.status === "PENDING").length
  const unreachedL    = leads.filter(l => l.status === "UNREACHED").length
  const canceledL     = leads.filter(l => l.status === "CANCELED").length
  const deliveryRate  = orders.length ? Math.round(delivered / orders.length * 100) : 0
  const confirmRate   = leads.length  ? Math.round(confirmed  / leads.length  * 100) : 0
  const needsAttention = pending.requests + pending.withdrawals

  const fmt = (d: Date) =>
    [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, "0")).join(":")

  const timeAgo = (t: number) => {
    const s = Math.max(0, Math.round((Date.now() - t) / 1000))
    if (s < 5) return "just now"
    if (s < 60) return `${s}s ago`
    return `${Math.round(s / 60)}m ago`
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-neutral-500 text-sm">Loading…</p>
    </div>
  )

  return (
    <div className="relative p-4 md:p-6 space-y-5">

      {/* ── Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white">Overview</h1>
          <p className="text-neutral-600 text-xs mt-0.5 flex items-center gap-1.5">
            <Radio className={`w-2.5 h-2.5 ${live ? "text-emerald-400" : "text-emerald-600"} animate-pulse`} />
            Updated at {fmt(lastRefresh)} · live-synced with client dashboards
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-all">
          <RefreshCw className="w-3.5 h-3.5" />Refresh
        </button>
      </div>

      {/* ── Needs attention */}
      {needsAttention > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pending.requests > 0 && (
            <Link href="/admin/requests" className="group relative rounded-2xl p-4 flex items-center gap-4 transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.15)" }}>
                <ClipboardList className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{pending.requests} signup request{pending.requests > 1 ? "s" : ""} waiting</p>
                <p className="text-neutral-500 text-xs">Needs your approval</p>
              </div>
              <ArrowRight className="w-4 h-4 text-violet-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          {pending.withdrawals > 0 && (
            <Link href="/admin/withdrawals" className="group relative rounded-2xl p-4 flex items-center gap-4 transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.15)" }}>
                <Wallet className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{pending.withdrawals} withdrawal{pending.withdrawals > 1 ? "s" : ""} to process</p>
                <p className="text-neutral-500 text-xs">Clients waiting on payout</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}

      {/* ── Hero MRR Banner */}
      <div className="relative rounded-2xl overflow-hidden p-6 md:p-8"
        style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.12) 0%,rgba(139,92,246,0.06) 50%,rgba(16,185,129,0.08) 100%)", border: "1px solid rgba(249,115,22,0.2)" }}>
        <CornerBrackets color="rgba(249,115,22,0.5)" />
        {/* Background shimmer */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.5),transparent)" }} />
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#f97316,transparent)" }} />
          <div className="absolute -bottom-16 right-0 w-48 h-48 rounded-full opacity-5" style={{ background: "radial-gradient(circle,#8b5cf6,transparent)" }} />
        </div>
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { label: "MRR",             value: `€${mrr.toFixed(2)}`,   sub: "Monthly revenue",  color: "#f97316" },
            { label: "ARR",             value: `€${arr.toFixed(2)}`,   sub: "Annual revenue",   color: "#10b981" },
            { label: "Active clients",  value: active.length,          sub: `${trial.length} on trial`, color: "#8b5cf6" },
            { label: "Connected stores",value: stores.length,          sub: "Shopify stores",   color: "#06b6d4" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: s.color }}>{s.label}</p>
              <p className="text-3xl md:text-4xl font-black text-white leading-none">{s.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total orders", value: orders.length, icon: ShoppingCart,
            sub1: `${delivered} delivered`, sub2: `${deliveryRate}% rate`,
            grad: "linear-gradient(135deg,#f97316,#dc2626)", border: "rgba(249,115,22,0.25)", glow: "rgba(249,115,22,0.08)",
          },
          {
            label: "Total leads", value: leads.length, icon: PhoneCall,
            sub1: `${confirmed} confirmed`, sub2: `${confirmRate}% rate`,
            grad: "linear-gradient(135deg,#10b981,#059669)", border: "rgba(16,185,129,0.25)", glow: "rgba(16,185,129,0.08)",
          },
          {
            label: "Successful deliveries", value: delivered, icon: Truck,
            sub1: `${returned} returns`, sub2: `of ${orders.length} orders`,
            grad: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "rgba(59,130,246,0.25)", glow: "rgba(59,130,246,0.08)",
          },
          {
            label: "Pending", value: pendingLeads, icon: Clock,
            sub1: `${unreachedL} unreachable`, sub2: "Needs priority",
            grad: "linear-gradient(135deg,#f59e0b,#d97706)", border: "rgba(245,158,11,0.25)", glow: "rgba(245,158,11,0.08)",
          },
        ].map(k => (
          <div key={k.label} className="relative rounded-2xl p-5 overflow-hidden transition-all hover:-translate-y-0.5"
            style={{ background: `#111`, border: `1px solid ${k.border}` }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ background: k.grad }} />
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: k.grad, opacity: 0.7 }} />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: k.glow, border: `1px solid ${k.border}` }}>
                <k.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl font-black text-white mb-1">{k.value}</div>
              <p className="text-xs text-neutral-400 font-medium mb-2">{k.label}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-neutral-500">{k.sub1}</span>
                <span className="text-[10px] text-neutral-700">·</span>
                <span className="text-[10px] text-neutral-500">{k.sub2}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Health strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Store,       label: "Stores",     value: stores.length,    color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)"  },
          { icon: TrendingUp,  label: "On trial",   value: trial.length,     color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)"  },
          { icon: AlertCircle, label: "Suspended",  value: suspended.length, color: "#f43f5e", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.2)"   },
          { icon: Package,     label: "Returns",    value: returned,         color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.2)"  },
        ].map(h => (
          <div key={h.label} className="flex items-center gap-3 rounded-xl p-4"
            style={{ background: h.bg, border: `1px solid ${h.border}` }}>
            <h.icon className="w-5 h-5 flex-shrink-0" style={{ color: h.color }} />
            <div>
              <div className="text-xl font-black text-white">{h.value}</div>
              <p className="text-xs font-medium" style={{ color: h.color }}>{h.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Live Activity Feed ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-white text-sm flex items-center gap-2"><SectionDot color="#10b981" />Live activity</h2>
          </div>
          <span className="text-[10px] text-neutral-600">Streams in real time from every client dashboard</span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Radio className="w-5 h-5 text-neutral-700" />
              <p className="text-neutral-600 text-sm">Watching for activity — nothing yet this session</p>
            </div>
          ) : activity.map((a, i) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
              style={{ borderBottom: i < activity.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}22` }}>
                <a.icon className="w-4 h-4" style={{ color: a.color }} />
              </div>
              <p className="flex-1 min-w-0 text-sm text-neutral-300 truncate">{a.text}</p>
              <span className="text-[10px] text-neutral-600 flex-shrink-0">{timeAgo(a.time)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Exchange rates */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0e0e12", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(249,115,22,0.12)" }}>
              <DollarSign className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div>
              <span className="text-white text-sm font-bold">Exchange rates</span>
              <span className="text-neutral-600 text-xs ml-2">Base EUR</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {ratesDate && <span className="text-neutral-600 text-xs hidden sm:block">{ratesDate}</span>}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ECB · Live
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/[0.04]">
          {ratesLoading ? (
            <div className="col-span-4 flex items-center justify-center py-8 gap-2">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-neutral-500 text-sm">Loading rates…</span>
            </div>
          ) : (
            RATE_PAIRS.map(({ currency, flag, label, color, fixed }) => {
              const rate = fixed !== null ? fixed : rates[currency]
              return (
                <div key={currency} className="flex flex-col gap-1.5 px-6 py-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg leading-none">{flag}</span>
                      <span className="text-xs font-black tracking-wide" style={{ color }}>{currency}</span>
                    </div>
                    {fixed !== null
                      ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}>BASE</span>
                      : <TrendingUp className="w-3 h-3 text-neutral-700" />
                    }
                  </div>
                  <div className="text-2xl font-black text-white leading-none mt-1">
                    {rate !== undefined ? rate.toFixed(4) : "—"}
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">
                    1 € = {rate !== undefined ? rate.toFixed(4) : "?"} {currency}
                  </p>
                  <p className="text-[10px] text-neutral-700 leading-tight">{label}</p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Leads + Clients tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent leads */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-orange-400" />
              <h2 className="font-bold text-white text-sm">Latest leads</h2>
            </div>
            <Link href="/admin/leads" className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {leads.length === 0
              ? <p className="p-5 text-neutral-600 text-sm">No leads</p>
              : leads.slice(0, 7).map((l, i) => {
                  const s = LEAD_STATUS[l.status] ?? LEAD_STATUS.PENDING
                  return (
                    <div key={l.id}
                      className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: i < Math.min(leads.length, 7) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black"
                          style={{ background: `linear-gradient(135deg,${s.dot},${s.dot}88)` }}>
                          {(l.customerName?.[0] ?? "?").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">{l.customerName || "—"}</p>
                          <p className="text-[10px] text-neutral-600 truncate">{l.clientName} · {l.product || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                        <span className="text-sm font-bold text-white">€{(l.value ?? 0).toFixed(2)}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: s.ring, color: s.dot }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                          {s.label}
                        </span>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>

        {/* Recent clients */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              <h2 className="font-bold text-white text-sm">Latest clients</h2>
            </div>
            <Link href="/admin/clients" className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {clients.length === 0
              ? <p className="p-5 text-neutral-600 text-sm">No clients</p>
              : clients.slice(0, 7).map((c, i) => {
                  const st = CLIENT_STATUS[c.status] ?? CLIENT_STATUS.active
                  return (
                    <Link key={c.id} href={`/admin/clients/${c.id}`}
                      className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/[0.02] group"
                      style={{ borderBottom: i < Math.min(clients.length, 7) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {initials(c.firstName, c.lastName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium group-hover:text-orange-400 transition-colors truncate">{c.firstName} {c.lastName}</p>
                          <p className="text-[10px] text-neutral-600 truncate">{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-base">{FLAGS[c.countryCode] ?? "🏳️"}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">€{c.monthlyRevenue}/m</span>
                      </div>
                    </Link>
                  )
                })
            }
          </div>
        </div>
      </div>

      {/* ── Leads breakdown */}
      {leads.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-white">Leads breakdown</h2>
            </div>
            <span className="text-xs text-neutral-600">{leads.length} leads total</span>
          </div>

          {/* Big confirmation rate */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-500">Overall confirmation rate</span>
              <span className="text-sm font-black text-white">{confirmRate}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-neutral-800 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${confirmRate}%`, background: "linear-gradient(90deg,#f97316,#10b981)" }} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Confirmed",    value: confirmed,    pct: leads.length ? Math.round(confirmed/leads.length*100)    : 0, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", icon: CheckCircle },
              { label: "Pending",      value: pendingLeads, pct: leads.length ? Math.round(pendingLeads/leads.length*100) : 0, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", icon: Clock       },
              { label: "Unreachable",  value: unreachedL,   pct: leads.length ? Math.round(unreachedL/leads.length*100)   : 0, color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", icon: PhoneCall   },
              { label: "Canceled",     value: canceledL,    pct: leads.length ? Math.round(canceledL/leads.length*100)    : 0, color: "#f43f5e", bg: "rgba(244,63,94,0.08)",  border: "rgba(244,63,94,0.2)",  icon: AlertCircle },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.pct}%</span>
                </div>
                <div className="text-2xl font-black text-white mb-0.5">{s.value}</div>
                <p className="text-xs text-neutral-500">{s.label}</p>
                <div className="mt-2 h-1 rounded-full bg-black/20 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Revenue summary */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.08),rgba(8,8,8,1) 70%)", border: "1px solid rgba(249,115,22,0.2)" }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,#f97316,transparent)" }} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">CODShipEurope Pro · €31.99/month</p>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-4xl font-black text-white">€{mrr.toFixed(2)}</span>
              <span className="text-neutral-500 text-sm">current MRR</span>
            </div>
            <p className="text-neutral-500 text-xs">{active.length} active client{active.length !== 1 ? "s" : ""} · projected ARR <span className="text-white font-bold">€{arr.toFixed(2)}</span></p>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "Delivery rate", value: `${deliveryRate}%`, color: "#10b981" },
              { label: "Confirmation rate", value: `${confirmRate}%`, color: "#f97316" },
              { label: "Active clients", value: `${active.length}`, color: "#8b5cf6" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
