"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import {
  Users, ShoppingCart, DollarSign, ArrowUpRight,
  Clock, AlertCircle, RefreshCw, Store, TrendingUp,
  Truck, PhoneCall, CheckCircle, Zap, Wallet, ClipboardList, ArrowRight, Activity,
  AlertTriangle, ChevronDown, Banknote,
} from "lucide-react"
import type { Client, AdminOrder, AdminLead, Withdrawal } from "@/lib/db"
import { useRealtime, type RealtimeEvent } from "@/hooks/useSse"
import { PageHeader } from "@/components/admin/page-header"
import { KpiCard } from "@/components/admin/kpi-card"
import { StatusBadge } from "@/components/admin/status-badge"

const FLAGS: Record<string, string> = {
  PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪",
  TN:"🇹🇳", DZ:"🇩🇿", AE:"🇦🇪", IT:"🇮🇹", DE:"🇩🇪",
}

const LEAD_STATUS: Record<string, { dot: string; label: string; tone: "success" | "warning" | "info" | "danger" }> = {
  CONFIRMED: { dot: "#059669", label: "Confirmed",   tone: "success" },
  PENDING:   { dot: "#d97706", label: "Pending",     tone: "warning" },
  UNREACHED: { dot: "#2563eb", label: "Unreachable", tone: "info"    },
  CANCELED:  { dot: "#dc2626", label: "Canceled",    tone: "danger"  },
  ERROR:     { dot: "#dc2626", label: "Error",       tone: "danger"  },
}

const CLIENT_STATUS: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  active:    { label: "Active",    tone: "success" },
  trial:     { label: "Trial",     tone: "warning" },
  suspended: { label: "Suspended", tone: "danger"  },
  cancelled: { label: "Cancelled", tone: "neutral" },
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
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [payables,        setPayables]        = useState<number | null>(null)
  const [payablesLoading, setPayablesLoading] = useState(true)
  const [dateRange,       setDateRange]       = useState<"today" | "7d" | "30d" | "all">("all")
  const [providers,       setProviders]       = useState<{ id: string; name: string }[]>([])
  const [merchantF,       setMerchantF]       = useState<string>("ALL")
  const [providerF,       setProviderF]       = useState<string>("ALL")
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
    const [c, o, l, s, counts, w, p] = await Promise.all([
      fetch("/api/admin/clients").then(r => r.json()).catch(() => []),
      fetch("/api/admin/orders").then(r => r.json()).catch(() => []),
      fetch("/api/admin/leads").then(r => r.json()).catch(() => []),
      fetch("/api/admin/stores").then(r => r.json()).catch(() => []),
      fetch("/api/admin/counts").then(r => r.json()).catch(() => null),
      fetch("/api/withdrawals").then(r => r.json()).catch(() => []),
      fetch("/api/admin/providers").then(r => r.json()).catch(() => []),
    ])
    setClients(Array.isArray(c) ? c : [])
    setOrders(Array.isArray(o) ? o : [])
    setLeads(Array.isArray(l) ? l : [])
    setStores(Array.isArray(s) ? s : [])
    if (counts) setPending({ requests: counts.requests ?? 0, withdrawals: counts.withdrawals ?? 0 })
    setWithdrawals(Array.isArray(w) ? w : [])
    setProviders(Array.isArray(p) ? p : [])
    setLoading(false)
    setLastRefresh(new Date())
  }, [])

  useEffect(() => { load(); const i = setInterval(load, 30_000); return () => clearInterval(i) }, [load])

  // Sum of every merchant's current balance — O(clients) server-side, so
  // fetched once on mount rather than on the 30s poll. Manual refresh only.
  const loadPayables = useCallback(async () => {
    setPayablesLoading(true)
    const d = await fetch("/api/admin/payables").then(r => r.json()).catch(() => null)
    setPayables(typeof d?.total === "number" ? d.total : null)
    setPayablesLoading(false)
  }, [])

  useEffect(() => { loadPayables() }, [loadPayables])

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

  // Merchant counts/MRR are always current-state snapshots, never scoped
  // by the orders/leads filters below (the filter row's caption says so).
  const active        = clients.filter(c => c.status === "active")
  const trial          = clients.filter(c => c.status === "trial")
  const suspended     = clients.filter(c => c.status === "suspended")
  const mrr           = active.reduce((s, c) => s + c.monthlyRevenue, 0)
  const needsAttention = pending.requests + pending.withdrawals

  // ── Orders/leads filters (date, merchant, provider) ──────────────────────
  const RANGE_DAYS: Record<typeof dateRange, number | null> = { today: 1, "7d": 7, "30d": 30, all: null }
  const rangeStart = (() => {
    const days = RANGE_DAYS[dateRange]
    if (days === null) return null
    const d = new Date(); d.setDate(d.getDate() - days); d.setHours(0, 0, 0, 0)
    return d
  })()
  const inRange = (createdAt: string) => !rangeStart || new Date(createdAt) >= rangeStart
  const matchesMerchant = (clientId: string) => merchantF === "ALL" || clientId === merchantF
  const matchesProvider = (providerId: string | undefined) => providerF === "ALL" || providerId === providerF

  const rangedOrders = orders.filter(o => inRange(o.createdAt) && matchesMerchant(o.clientId) && matchesProvider(o.providerId))
  const rangedLeads  = leads.filter(l => inRange(l.createdAt) && matchesMerchant(l.clientId))

  // Every orders/leads figure below is derived from the filtered arrays
  // above, so every card on the page moves consistently when a filter
  // changes — no card silently stays global while its neighbor updates.
  const delivered     = rangedOrders.filter(o => o.status === "DELIVERED").length
  const returned      = rangedOrders.filter(o => o.status === "RETURNED").length
  const confirmed     = rangedLeads.filter(l => l.status === "CONFIRMED").length
  const pendingLeads  = rangedLeads.filter(l => l.status === "PENDING").length
  const unreachedL    = rangedLeads.filter(l => l.status === "UNREACHED").length
  const canceledL     = rangedLeads.filter(l => l.status === "CANCELED").length
  const deliveryRate  = rangedOrders.length ? Math.round(delivered / rangedOrders.length * 100) : 0
  const confirmRate   = rangedLeads.length  ? Math.round(confirmed  / rangedLeads.length  * 100) : 0

  const ordersByStatus = {
    PENDING:   rangedOrders.filter(o => o.status === "PENDING").length,
    SHIPPED:   rangedOrders.filter(o => o.status === "SHIPPED").length,
    DELIVERED: rangedOrders.filter(o => o.status === "DELIVERED").length,
    RETURNED:  rangedOrders.filter(o => o.status === "RETURNED").length,
    ERROR:     rangedOrders.filter(o => o.status === "ERROR").length,
  }
  // "Needs attention": orders stuck in an error state, or leads that have
  // been attempted repeatedly (3+) without reaching a final outcome.
  const UNREACHED_ATTEMPTS_THRESHOLD = 3
  const stuckLeads = rangedLeads.filter(l => l.status === "UNREACHED" && l.attempts >= UNREACHED_ATTEMPTS_THRESHOLD)
  const ordersNeedingAttention = ordersByStatus.ERROR + stuckLeads.length

  // Total COD collected = gross value of DELIVERED orders. Deliberately
  // distinct from MRR (subscription revenue) and from "amount owed to
  // merchants" (payables, below) — these are three different financial
  // concepts and must not be conflated.
  const totalCODCollected = rangedOrders.filter(o => o.status === "DELIVERED").reduce((s, o) => s + (o.value ?? 0), 0)

  // COD expected = value of orders still in flight (not yet delivered or
  // returned) — the pipeline that hasn't been collected yet. Distinct from
  // both COD collected (above) and amount owed to merchants (payables,
  // below): expected is gross order value in transit, not a merchant
  // payable, which only exists after fees/adjustments are applied.
  const totalCODExpected = rangedOrders.filter(o => o.status === "PENDING" || o.status === "SHIPPED").reduce((s, o) => s + (o.value ?? 0), 0)

  const pendingWithdrawals       = withdrawals.filter(w => w.status === "pending")
  const pendingWithdrawalsAmount = pendingWithdrawals.reduce((s, w) => s + w.amount, 0)

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
    <div className="p-4 md:p-6 space-y-5">

      <PageHeader
        title="Overview"
        subtitle={`Updated at ${fmt(lastRefresh)}${live ? " · live" : ""} · synced with client dashboards`}
        actions={
          <button onClick={load}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#17191D] text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />Refresh
          </button>
        }
      />

      {/* ── Needs attention */}
      {needsAttention > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pending.requests > 0 && (
            <Link href="/admin/requests" className="group flex items-center gap-4 rounded-xl p-4 bg-violet-50 border border-violet-200 hover:border-violet-300 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#17191D] font-semibold text-sm">{pending.requests} signup request{pending.requests > 1 ? "s" : ""} waiting</p>
                <p className="text-neutral-500 text-xs">Needs your approval</p>
              </div>
              <ArrowRight className="w-4 h-4 text-violet-500 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          {pending.withdrawals > 0 && (
            <Link href="/admin/withdrawals" className="group flex items-center gap-4 rounded-xl p-4 bg-amber-50 border border-amber-200 hover:border-amber-300 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#17191D] font-semibold text-sm">{pending.withdrawals} withdrawal{pending.withdrawals > 1 ? "s" : ""} to process</p>
                <p className="text-neutral-500 text-xs">Clients waiting on payout</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-500 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}

      {/* ── Filters (scope the flow metrics below) ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-neutral-500">Orders/leads figures are scoped to the filters below. Merchant counts and amount owed reflect current state.</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select value={merchantF} onChange={e => setMerchantF(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-neutral-600 focus:outline-none focus:border-orange-400 cursor-pointer max-w-[160px]">
              <option value="ALL">All merchants</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={providerF} onChange={e => setProviderF(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-neutral-600 focus:outline-none focus:border-orange-400 cursor-pointer max-w-[160px]">
              <option value="ALL">All providers</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={dateRange} onChange={e => setDateRange(e.target.value as typeof dateRange)}
              className="appearance-none bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-neutral-600 focus:outline-none focus:border-orange-400 cursor-pointer">
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── KPI grid — every figure from the spec's Overview list, each its own card ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total merchants" value={clients.length} icon={Users} sub={`${active.length} active · ${trial.length} trial`} />
        <KpiCard label="Platform revenue (MRR)" value={`€${mrr.toFixed(2)}`} icon={TrendingUp} sub="Monthly subscription revenue" />
        <KpiCard label="Total orders" value={rangedOrders.length} icon={ShoppingCart} sub={`${deliveryRate}% delivery rate`} />
        <KpiCard label="Delivered orders" value={delivered} icon={Truck} sub={`${returned} returned`} />
        <KpiCard label="COD collected" value={`€${totalCODCollected.toFixed(2)}`} icon={Banknote} sub={`${ordersByStatus.DELIVERED} delivered orders`} />
        <KpiCard label="COD expected" value={`€${totalCODExpected.toFixed(2)}`} icon={Clock} sub={`${ordersByStatus.PENDING + ordersByStatus.SHIPPED} orders in flight`} />
        <KpiCard label="Pending withdrawals" value={`€${pendingWithdrawalsAmount.toFixed(2)}`} icon={Wallet} sub={`${pendingWithdrawals.length} awaiting decision`} />
        <KpiCard label="Owed to merchants"
          value={payablesLoading ? "…" : payables !== null ? `€${payables.toFixed(2)}` : "—"}
          icon={DollarSign} sub="Sum of merchant wallet balances" onClick={loadPayables} />
        <KpiCard label="Operational exceptions" value={ordersNeedingAttention} icon={AlertTriangle}
          sub={`${ordersByStatus.ERROR} error orders · ${stuckLeads.length} stuck leads`} href="/admin/exceptions" />
        <KpiCard label="Connected stores" value={stores.length} icon={Store} sub={`${suspended.length} merchants suspended`} />
      </div>

      {/* ── Orders by status ── */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4">
        <p className="text-xs font-medium text-neutral-500 mb-3">Orders by status</p>
        <div className="grid grid-cols-5 gap-2">
          {([
            ["PENDING", "neutral"], ["SHIPPED", "info"], ["DELIVERED", "success"],
            ["RETURNED", "warning"], ["ERROR", "danger"],
          ] as const).map(([status, tone]) => (
            <div key={status} className="rounded-lg bg-neutral-50 border border-neutral-100 p-2.5 text-center">
              <p className="text-lg font-bold text-[#17191D]">{ordersByStatus[status]}</p>
              <div className="mt-1 flex justify-center"><StatusBadge label={status} tone={tone} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-neutral-400" />
            <h2 className="font-semibold text-[#17191D] text-sm">Recent activity</h2>
          </div>
          <span className="text-[11px] text-neutral-400">Live from client dashboards</span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Activity className="w-5 h-5 text-neutral-300" />
              <p className="text-neutral-400 text-sm">Watching for activity — nothing yet this session</p>
            </div>
          ) : activity.map((a, i) => (
            <div key={a.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors ${i < activity.length - 1 ? "border-b border-neutral-100" : ""}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}15` }}>
                <a.icon className="w-4 h-4" style={{ color: a.color }} />
              </div>
              <p className="flex-1 min-w-0 text-sm text-neutral-700 truncate">{a.text}</p>
              <span className="text-[11px] text-neutral-400 flex-shrink-0">{timeAgo(a.time)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Exchange rates */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <DollarSign className="w-4 h-4 text-neutral-400" />
            <span className="text-[#17191D] text-sm font-semibold">Exchange rates</span>
            <span className="text-neutral-400 text-xs">Base EUR</span>
          </div>
          {ratesDate && <span className="text-neutral-400 text-xs hidden sm:block">{ratesDate}</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-neutral-100">
          {ratesLoading ? (
            <div className="col-span-4 flex items-center justify-center py-8 gap-2">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-neutral-500 text-sm">Loading rates…</span>
            </div>
          ) : (
            RATE_PAIRS.map(({ currency, flag, label, fixed }) => {
              const rate = fixed !== null ? fixed : rates[currency]
              return (
                <div key={currency} className="flex flex-col gap-1.5 px-5 py-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg leading-none">{flag}</span>
                      <span className="text-xs font-bold tracking-wide text-[#17191D]">{currency}</span>
                    </div>
                    {fixed !== null && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600">BASE</span>}
                  </div>
                  <div className="text-xl font-bold text-[#17191D] leading-none mt-1">
                    {rate !== undefined ? rate.toFixed(4) : "—"}
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight">{label}</p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Leads + Clients tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent leads */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-100">
            <h2 className="font-semibold text-[#17191D] text-sm">Latest leads</h2>
            <Link href="/admin/leads" className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {rangedLeads.length === 0
              ? <p className="p-5 text-neutral-400 text-sm">No leads match the current filters</p>
              : rangedLeads.slice(0, 7).map((l, i) => {
                  const s = LEAD_STATUS[l.status] ?? LEAD_STATUS.PENDING
                  return (
                    <div key={l.id}
                      className={`flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors ${i < Math.min(rangedLeads.length, 7) - 1 ? "border-b border-neutral-100" : ""}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
                          style={{ background: s.dot }}>
                          {(l.customerName?.[0] ?? "?").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-[#17191D] font-medium truncate">{l.customerName || "—"}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{l.clientName} · {l.product || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                        <span className="text-sm font-semibold text-[#17191D]">€{(l.value ?? 0).toFixed(2)}</span>
                        <StatusBadge label={s.label} tone={s.tone} />
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>

        {/* Recent clients */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-100">
            <h2 className="font-semibold text-[#17191D] text-sm">Latest merchants</h2>
            <Link href="/admin/clients" className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {clients.length === 0
              ? <p className="p-5 text-neutral-400 text-sm">No merchants</p>
              : clients.slice(0, 7).map((c, i) => {
                  const st = CLIENT_STATUS[c.status] ?? CLIENT_STATUS.active
                  return (
                    <Link key={c.id} href={`/admin/clients/${c.id}`}
                      className={`flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors group ${i < Math.min(clients.length, 7) - 1 ? "border-b border-neutral-100" : ""}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {initials(c.firstName, c.lastName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-[#17191D] font-medium group-hover:text-orange-600 transition-colors truncate">{c.firstName} {c.lastName}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-base">{FLAGS[c.countryCode] ?? "🏳️"}</span>
                        <StatusBadge label={st.label} tone={st.tone} />
                        <span className="text-xs font-semibold text-emerald-600">€{c.monthlyRevenue}/m</span>
                      </div>
                    </Link>
                  )
                })
            }
          </div>
        </div>
      </div>

      {/* ── Leads breakdown ── */}
      {rangedLeads.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#17191D] text-sm">Leads breakdown</h2>
            <span className="text-xs text-neutral-400">{rangedLeads.length} leads total · {confirmRate}% confirmation rate</span>
          </div>

          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden mb-4">
            <div className="h-full rounded-full bg-orange-500 transition-all duration-700" style={{ width: `${confirmRate}%` }} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Confirmed",   value: confirmed,    tone: "success" as const, icon: CheckCircle },
              { label: "Pending",     value: pendingLeads, tone: "warning" as const, icon: Clock       },
              { label: "Unreachable", value: unreachedL,   tone: "info" as const,    icon: PhoneCall   },
              { label: "Canceled",    value: canceledL,    tone: "danger" as const,  icon: AlertCircle },
            ].map(s => (
              <KpiCard key={s.label} label={s.label} value={s.value} icon={s.icon}
                sub={rangedLeads.length ? `${Math.round(s.value / rangedLeads.length * 100)}%` : "0%"} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
