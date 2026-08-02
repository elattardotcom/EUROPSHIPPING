"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  TrendingUp, TrendingDown, Users, ShoppingCart, CheckCircle2,
  XCircle, Clock, Package, ArrowRight, Zap, Target,
} from "lucide-react"
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from "recharts"
import Link from "next/link"
import type { Order, Lead } from "@/lib/mock-data"

export type Period = "today" | "7d" | "30d" | "all"

/* ── helpers ────────────────────────────────────────────────── */

function parseFrDate(s: string): string {
  const p = s.split("/")
  if (p.length !== 3) return ""
  return `${p[2]}-${p[1].padStart(2,"0")}-${p[0].padStart(2,"0")}`
}

function filterByPeriod<T extends { createdAt: string }>(items: T[], period: Period): T[] {
  if (period === "all") return items
  const cutoff = new Date()
  if (period === "today") cutoff.setHours(0, 0, 0, 0)
  else if (period === "7d")  cutoff.setDate(cutoff.getDate() - 7)
  else if (period === "30d") cutoff.setDate(cutoff.getDate() - 30)
  return items.filter(item => {
    const iso = parseFrDate(item.createdAt)
    return iso ? new Date(iso) >= cutoff : true
  })
}

function lastNDays(n: number) {
  const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]
  const today = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (n - 1) + i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
    return { key, label: `${d.getDate()} ${MONTHS[d.getMonth()]}` }
  })
}

const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

/* ── mini sparkline ─────────────────────────────────────────── */
function Sparkline({ data, color = "#f97316" }: { data: number[]; color?: string }) {
  const pts = data.map((v, i) => ({ v }))
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sg-${color.replace("#","")})`} dot={false} />
        <Tooltip content={() => null} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ── progress bar ───────────────────────────────────────────── */
function ProgressBar({ value, color, label, sublabel }: { value: number; color: string; label: string; sublabel: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-neutral-300 font-medium">{label}</span>
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
      <p className="text-xs text-neutral-500 mt-1">{sublabel}</p>
    </div>
  )
}

/* ── activity item ──────────────────────────────────────────── */
function ActivityItem({ icon: Icon, color, bg, title, sub, time }: {
  icon: React.ElementType; color: string; bg: string; title: string; sub: string; time: string
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{title}</p>
        <p className="text-xs text-neutral-500 truncate">{sub}</p>
      </div>
      <span className="text-xs text-neutral-600 flex-shrink-0">{time}</span>
    </div>
  )
}

const STATUS_CFG = {
  DELIVERED: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Livré" },
  SHIPPED:   { icon: Package,      color: "text-blue-400",    bg: "bg-blue-500/10",    label: "Expédié" },
  PENDING:   { icon: Clock,        color: "text-amber-400",   bg: "bg-amber-500/10",   label: "En attente" },
  RETURNED:  { icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10",     label: "Retourné" },
  ERROR:     { icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10",     label: "Erreur" },
} as const

const LEAD_CFG = {
  CONFIRMED: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Lead confirmé" },
  PENDING:   { icon: Clock,        color: "text-amber-400",   bg: "bg-amber-500/10",   label: "Lead en attente" },
  UNREACHED: { icon: Clock,        color: "text-blue-400",    bg: "bg-blue-500/10",    label: "Non joignable" },
  CANCELED:  { icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10",     label: "Lead annulé" },
  ERROR:     { icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10",     label: "Erreur" },
} as const

/* ── main ───────────────────────────────────────────────────── */

export default function DashboardPage({
  clientId = "c1", refreshKey = 0, period = "all",
}: { clientId?: string; refreshKey?: number; period?: Period }) {

  const [orders,  setOrders]  = useState<Order[]>([])
  const [leads,   setLeads]   = useState<Lead[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [o, l, w] = await Promise.all([
      fetch("/api/client/orders").then(r => r.json()).catch(() => []),
      fetch("/api/client/leads").then(r => r.json()).catch(() => []),
      fetch(`/api/wallet/${clientId}`).then(r => r.json()).catch(() => null),
    ])
    setOrders(Array.isArray(o) ? o : [])
    setLeads(Array.isArray(l) ? l : [])
    if (w?.balance !== undefined) setBalance(w.balance)
    setLoading(false)
  }, [clientId])

  useEffect(() => { setLoading(true); load(); const t = setInterval(load, 30_000); return () => clearInterval(t) }, [load, refreshKey])

  const filteredOrders = useMemo(() => filterByPeriod(orders, period), [orders, period])
  const filteredLeads  = useMemo(() => filterByPeriod(leads,  period), [leads,  period])

  /* stats */
  const totalLeads      = filteredLeads.length
  const confirmedLeads  = filteredLeads.filter(l => l.status === "CONFIRMED").length
  const pendingLeads    = filteredLeads.filter(l => l.status === "PENDING").length
  const canceledLeads   = filteredLeads.filter(l => l.status === "CANCELED").length
  const confirmRate     = totalLeads ? Math.round((confirmedLeads / totalLeads) * 100) : 0

  const totalOrders     = filteredOrders.length
  const deliveredOrders = filteredOrders.filter(o => o.status === "DELIVERED").length
  const shippedOrders   = filteredOrders.filter(o => o.status === "SHIPPED").length
  const pendingOrders   = filteredOrders.filter(o => o.status === "PENDING").length
  const returnedOrders  = filteredOrders.filter(o => o.status === "RETURNED").length
  const deliveryRate    = totalOrders ? Math.round((deliveredOrders / totalOrders) * 100) : 0
  const returnRate      = totalOrders ? Math.round((returnedOrders  / totalOrders) * 100) : 0
  const totalRevenue    = filteredOrders.filter(o => o.status === "DELIVERED").reduce((s, o) => s + o.orderValue, 0)

  /* sparkline data (revenue per day, last 14 days) */
  const sparkData = useMemo(() => {
    const days = lastNDays(14)
    const map  = new Map<string, number>()
    filteredOrders.filter(o => o.status === "DELIVERED").forEach(o => {
      const k = parseFrDate(o.createdAt); if (k) map.set(k, (map.get(k) ?? 0) + o.orderValue)
    })
    return days.map(d => map.get(d.key) ?? 0)
  }, [filteredOrders])

  /* recent activity */
  const recentActivity = useMemo(() => {
    type Item = { ts: string; kind: "order" | "lead"; status: string; name: string; country: string; value: number; store: string }
    const items: Item[] = [
      ...orders.slice(0, 20).map(o => ({
        ts: parseFrDate(o.createdAt) || o.createdAt, kind: "order" as const,
        status: o.status, name: o.name, country: o.country,
        value: o.orderValue, store: o.store,
      })),
      ...leads.slice(0, 20).map(l => ({
        ts: parseFrDate(l.createdAt) || l.createdAt, kind: "lead" as const,
        status: l.status, name: l.name, country: l.country,
        value: l.orderValue, store: l.store,
      })),
    ]
    return items.sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 12)
  }, [orders, leads])

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-neutral-500 text-sm">Chargement…</span>
    </div>
  )

  const revenueUp = sparkData.length >= 2 && sparkData[sparkData.length - 1] >= (sparkData[sparkData.length - 2] ?? 0)

  return (
    <div className="space-y-5">

      {/* ── Row 1: Hero revenue + Performance + Balance ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Revenue hero */}
        <div className="flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/15 via-neutral-900 to-neutral-900 border border-orange-500/20 p-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="flex items-start justify-between mb-1">
            <p className="text-xs font-semibold text-orange-400/80 uppercase tracking-widest">Revenus livrés</p>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${revenueUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {revenueUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {revenueUp ? "En hausse" : "En baisse"}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-black text-white tracking-tight">{fmt(totalRevenue)}</span>
            <span className="text-xl text-neutral-500 font-medium">EUR</span>
          </div>
          <p className="text-neutral-500 text-sm mb-4">{deliveredOrders} commande{deliveredOrders > 1 ? "s" : ""} livrée{deliveredOrders > 1 ? "s" : ""}</p>
          <Sparkline data={sparkData} color="#f97316" />
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex gap-5">
              <div>
                <p className="text-xs text-neutral-500">Solde net</p>
                <p className="text-base font-bold text-white">{balance !== null ? `€${fmt(balance)}` : "…"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">En transit</p>
                <p className="text-base font-bold text-blue-400">{shippedOrders}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Retours</p>
                <p className="text-base font-bold text-red-400">{returnedOrders}</p>
              </div>
            </div>
            <Link href="/dashboard/wallet"
              className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium">
              Portefeuille <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Performance */}
        <div className="lg:w-72 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-semibold text-white">Performance</span>
          </div>
          <ProgressBar
            value={confirmRate}
            color="linear-gradient(90deg,#14b8a6,#10b981)"
            label="Leads confirmés"
            sublabel={`${confirmedLeads} confirmés sur ${totalLeads}`}
          />
          <ProgressBar
            value={deliveryRate}
            color="linear-gradient(90deg,#f97316,#f59e0b)"
            label="Taux de livraison"
            sublabel={`${deliveredOrders} livrées sur ${totalOrders}`}
          />
          <ProgressBar
            value={returnRate}
            color="linear-gradient(90deg,#ef4444,#dc2626)"
            label="Taux de retour"
            sublabel={`${returnedOrders} retour${returnedOrders > 1 ? "s" : ""} sur ${totalOrders}`}
          />
        </div>
      </div>

      {/* ── Row 2: 4 stat pills ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total leads",    value: totalLeads,     sub: `${pendingLeads} en attente`,  icon: Users,       color: "text-teal-400",    border: "border-teal-500/30",    bg: "bg-teal-500/8"    },
          { label: "Leads confirmés",value: confirmedLeads, sub: `${confirmRate}% de conversion`,icon: CheckCircle2,color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/8" },
          { label: "Total commandes",value: totalOrders,    sub: `${shippedOrders} en transit`, icon: ShoppingCart,color: "text-blue-400",    border: "border-blue-500/30",    bg: "bg-blue-500/8"    },
          { label: "Leads annulés",  value: canceledLeads,  sub: `${pendingOrders} en attente`, icon: XCircle,     color: "text-red-400",     border: "border-red-500/30",     bg: "bg-red-500/8"     },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl px-4 py-4 flex items-center gap-3`}>
            <div className={`w-9 h-9 rounded-xl bg-neutral-800/80 flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-white leading-none">{s.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5 truncate">{s.label}</p>
              <p className="text-xs text-neutral-600 truncate">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 3: Activity feed + Status breakdown ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Recent activity */}
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">Activité récente</span>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/orders" className="text-xs text-neutral-500 hover:text-orange-400 transition-colors">Commandes →</Link>
              <span className="text-neutral-700">·</span>
              <Link href="/dashboard/leads"  className="text-xs text-neutral-500 hover:text-orange-400 transition-colors">Leads →</Link>
            </div>
          </div>
          <div className="px-5 divide-y divide-neutral-800/60">
            {recentActivity.length === 0 ? (
              <div className="py-10 text-center text-neutral-600 text-sm">
                Aucune activité récente — connectez votre boutique
              </div>
            ) : recentActivity.map((item, i) => {
              const cfg = item.kind === "order"
                ? (STATUS_CFG[item.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.PENDING)
                : (LEAD_CFG[item.status  as keyof typeof LEAD_CFG]   ?? LEAD_CFG.PENDING)
              const sub = item.kind === "order"
                ? `${cfg.label} · ${item.country || "—"} · €${item.value.toFixed(0)}`
                : `${cfg.label} · ${item.country || "—"} · ${item.store || ""}`
              return (
                <ActivityItem
                  key={i}
                  icon={cfg.icon}
                  color={cfg.color}
                  bg={cfg.bg}
                  title={item.name || "—"}
                  sub={sub}
                  time={item.ts.slice(5).replace("-","/")}
                />
              )
            })}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="lg:w-64 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-white">Statuts commandes</p>
          {[
            { label: "Livrées",     value: deliveredOrders, total: totalOrders, color: "#10b981" },
            { label: "Expédiées",   value: shippedOrders,   total: totalOrders, color: "#3b82f6" },
            { label: "En attente",  value: pendingOrders,   total: totalOrders, color: "#f59e0b" },
            { label: "Retournées",  value: returnedOrders,  total: totalOrders, color: "#ef4444" },
          ].map(s => {
            const pct = totalOrders ? Math.round((s.value / totalOrders) * 100) : 0
            return (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-neutral-400">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{s.value}</span>
                    <span className="text-xs text-neutral-600 w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                </div>
              </div>
            )
          })}

          <div className="mt-2 pt-4 border-t border-neutral-800">
            <p className="text-sm font-semibold text-white mb-3">Statuts leads</p>
            {[
              { label: "Confirmés",    value: confirmedLeads,                                                    total: totalLeads, color: "#10b981" },
              { label: "En attente",   value: pendingLeads,                                                      total: totalLeads, color: "#f59e0b" },
              { label: "Annulés",      value: canceledLeads,                                                     total: totalLeads, color: "#ef4444" },
              { label: "Non joignables", value: filteredLeads.filter(l => l.status === "UNREACHED").length,       total: totalLeads, color: "#6b7280" },
            ].map(s => {
              const pct = totalLeads ? Math.round((s.value / totalLeads) * 100) : 0
              return (
                <div key={s.label} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-xs text-neutral-400">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{s.value}</span>
                      <span className="text-xs text-neutral-600 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}
