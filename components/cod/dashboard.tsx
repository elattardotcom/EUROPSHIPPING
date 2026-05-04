"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  DollarSign, Users, ShoppingCart, CheckCircle, Clock,
  XCircle, Percent, TrendingUp, ArrowUpRight, ArrowDownRight,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from "recharts"
import type { Order, Lead } from "@/lib/mock-data"

/* ── helpers ─────────────────────────────────────────────── */

function parseFrDate(s: string): string {
  // "dd/mm/yyyy" → "yyyy-mm-dd"
  const p = s.split("/")
  if (p.length !== 3) return ""
  return `${p[2]}-${p[1].padStart(2,"0")}-${p[0].padStart(2,"0")}`
}

function last10Days(): { key: string; label: string }[] {
  const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]
  const today = new Date()
  return Array.from({ length: 10 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 9 + i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
    const label = `${d.getDate()} ${MONTHS[d.getMonth()]}`
    return { key, label }
  })
}

/* ── sub-components ─────────────────────────────────────── */

function StatCard({
  title, subtitle, value, unit, description, icon: Icon, color, trend,
}: {
  title: string; subtitle: string; value: string | number; unit: string
  description: string; icon: React.ElementType
  color: "green" | "teal" | "purple" | "orange" | "red" | "yellow"
  trend?: { value: number; positive: boolean }
}) {
  const border = { green:"border-l-emerald-500 bg-emerald-500/5", teal:"border-l-teal-500 bg-teal-500/5", purple:"border-l-purple-500 bg-purple-500/5", orange:"border-l-orange-500 bg-orange-500/5", red:"border-l-red-500 bg-red-500/5", yellow:"border-l-yellow-500 bg-yellow-500/5" }[color]
  const ico    = { green:"text-emerald-500", teal:"text-teal-500", purple:"text-purple-500", orange:"text-orange-500", red:"text-red-500", yellow:"text-yellow-500" }[color]
  return (
    <div className={`bg-neutral-900 border border-neutral-800 rounded-xl p-5 border-l-4 ${border}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <p className="text-xs text-neutral-500">{subtitle}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center ${ico}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-sm text-neutral-500">{unit}</span>
        {trend && (
          <span className={`flex items-center gap-1 text-xs ml-auto ${trend.positive ? "text-emerald-500" : "text-red-500"}`}>
            {trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="text-xs text-neutral-500">{description}</p>
    </div>
  )
}

function SmallStatCard({
  title, subtitle, value, unit, icon: Icon, color,
}: {
  title: string; subtitle: string; value: string | number; unit: string
  icon: React.ElementType; color: "blue" | "green" | "yellow" | "red" | "orange"
}) {
  const border = { blue:"border-l-blue-500 bg-blue-500/5", green:"border-l-emerald-500 bg-emerald-500/5", yellow:"border-l-yellow-500 bg-yellow-500/5", red:"border-l-red-500 bg-red-500/5", orange:"border-l-orange-500 bg-orange-500/5" }[color]
  const ico    = { blue:"text-blue-500", green:"text-emerald-500", yellow:"text-yellow-500", red:"text-red-500", orange:"text-orange-500" }[color]
  return (
    <div className={`bg-neutral-900 border border-neutral-800 rounded-xl p-4 border-l-4 ${border}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xs font-medium text-white">{title}</h3>
          <p className="text-xs text-neutral-500">{subtitle}</p>
        </div>
        <div className={`w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center ${ico}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-sm text-neutral-500">{unit}</span>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-0.5">{title}</h3>
      {subtitle && <p className="text-xs text-neutral-500 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  )
}

const TICK  = "#737373"
const GRID  = "#262626"
const TT_BG = "#171717"

/* ── page ───────────────────────────────────────────────── */

export default function DashboardPage({
  clientId = "c1",
  refreshKey = 0,
}: {
  clientId?: string
  refreshKey?: number
}) {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [leads,   setLeads]   = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [o, l] = await Promise.all([
      fetch("/api/client/orders").then(r => r.json()).catch(() => []),
      fetch("/api/client/leads").then(r => r.json()).catch(() => []),
    ])
    setOrders(Array.isArray(o) ? o : [])
    setLeads(Array.isArray(l) ? l : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    setLoading(true)
    load()
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [load, refreshKey])

  /* ── stats ── */
  const totalLeads      = leads.length
  const confirmedLeads  = leads.filter(l => l.status === "CONFIRMED").length
  const pendingLeads    = leads.filter(l => l.status === "PENDING").length
  const canceledLeads   = leads.filter(l => l.status === "CANCELED").length
  const unreachedLeads  = leads.filter(l => l.status === "UNREACHED").length
  const confirmRate     = totalLeads ? Math.round((confirmedLeads / totalLeads) * 100) : 0

  const totalOrders     = orders.length
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length
  const pendingOrders   = orders.filter(o => o.status === "PENDING").length
  const shippedOrders   = orders.filter(o => o.status === "SHIPPED").length
  const returnedOrders  = orders.filter(o => o.status === "RETURNED").length
  const deliveryRate    = totalOrders ? Math.round((deliveredOrders / totalOrders) * 100) : 0
  const totalRevenue    = orders.filter(o => o.status === "DELIVERED").reduce((s, o) => s + o.orderValue, 0)

  /* ── chart data ── */
  const leadsChartData = [
    { name: "Confirmés",   value: confirmedLeads,  fill: "#10b981" },
    { name: "En attente",  value: pendingLeads,    fill: "#f59e0b" },
    { name: "Pas répondu", value: unreachedLeads,  fill: "#3b82f6" },
    { name: "Annulés",     value: canceledLeads,   fill: "#ef4444" },
  ]

  const ordersChartData = [
    { name: "Livrés",     value: deliveredOrders, fill: "#10b981" },
    { name: "Expédiés",   value: shippedOrders,   fill: "#3b82f6" },
    { name: "En attente", value: pendingOrders,   fill: "#f59e0b" },
    { name: "Retournés",  value: returnedOrders,  fill: "#ef4444" },
  ]

  const revenueByDay = useMemo(() => {
    const days = last10Days()
    const orderMap = new Map<string, { orders: number; revenue: number }>()
    const leadMap  = new Map<string, number>()

    orders.forEach(o => {
      const key = parseFrDate(o.createdAt)
      if (!key) return
      const cur = orderMap.get(key) ?? { orders: 0, revenue: 0 }
      cur.orders++
      if (o.status === "DELIVERED") cur.revenue += o.orderValue
      orderMap.set(key, cur)
    })

    leads.forEach(l => {
      const key = parseFrDate(l.createdAt)
      if (!key) return
      leadMap.set(key, (leadMap.get(key) ?? 0) + 1)
    })

    return days.map(d => ({
      day:     d.label,
      leads:   leadMap.get(d.key) ?? 0,
      orders:  orderMap.get(d.key)?.orders ?? 0,
      revenue: orderMap.get(d.key)?.revenue ?? 0,
    }))
  }, [orders, leads])

  const revenueByStore = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number }>()
    orders.filter(o => o.status === "DELIVERED").forEach(o => {
      const s = o.store || "Boutique"
      const cur = map.get(s) ?? { revenue: 0, orders: 0 }
      cur.revenue += o.orderValue
      cur.orders++
      map.set(s, cur)
    })
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
  }, [orders])

  const hasActivity = revenueByDay.some(d => d.leads > 0 || d.orders > 0)

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-neutral-500 text-sm">Chargement des données…</p>
    </div>
  )

  return (
    <div className="space-y-8">

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="REVENUS LIVRÉS" subtitle="Commandes livrées" value={totalRevenue.toFixed(0)} unit="EUR"
          description={`${deliveredOrders} commandes livrées avec succès`} icon={DollarSign} color="green" />
        <StatCard title="TOTAL LEADS" subtitle="Prospects qualifiés" value={totalLeads} unit="LEADS"
          description={`${confirmedLeads} confirmés — taux ${confirmRate}%`} icon={Users} color="teal" />
        <StatCard title="TOTAL COMMANDES" subtitle="Commandes traitées" value={totalOrders} unit="ORDERS"
          description={`${deliveredOrders} livrées — taux ${deliveryRate}%`} icon={ShoppingCart} color="purple" />
      </div>

      {/* Activity line chart */}
      <ChartCard title="Activité — 10 derniers jours" subtitle="Leads, commandes et revenus">
        {!hasActivity ? (
          <div className="h-[220px] flex flex-col items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-neutral-700" />
            <p className="text-neutral-500 text-sm">
              {totalOrders === 0 && totalLeads === 0
                ? "Connectez votre boutique pour voir l'activité"
                : "Aucune activité sur les 10 derniers jours"}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueByDay} margin={{ top: 4, right: 40, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="day" tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="revenue" tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="count" orientation="right" tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: TT_BG, border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: TICK }} />
              <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={false} name="Revenus (€)" />
              <Line yAxisId="count"   type="monotone" dataKey="leads"   stroke="#14b8a6" strokeWidth={2} dot={false} name="Leads" />
              <Line yAxisId="count"   type="monotone" dataKey="orders"  stroke="#8b5cf6" strokeWidth={2} dot={false} name="Commandes" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Leads Performance */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Performance Leads</h2>
          <p className="text-sm text-neutral-500">Génération et conversion des prospects</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SmallStatCard title="TOTAL LEADS"   subtitle="Toutes sources"     value={totalLeads}     unit="LEADS" icon={Users}       color="blue" />
          <SmallStatCard title="CONFIRMÉS"     subtitle="Leads convertis"    value={confirmedLeads} unit="LEADS" icon={CheckCircle} color="green" />
          <SmallStatCard title="EN ATTENTE"    subtitle="En cours"           value={pendingLeads}   unit="LEADS" icon={Clock}       color="yellow" />
          <SmallStatCard title="ANNULÉS"       subtitle="Non convertis"      value={canceledLeads}  unit="LEADS" icon={XCircle}     color="red" />
          <SmallStatCard title="TAUX CONFIRM." subtitle="Taux de conversion" value={`${confirmRate}`} unit="%" icon={Percent}    color="orange" />
        </div>
        <div className="mt-4">
          <ChartCard title="Répartition des leads par statut">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={leadsChartData} margin={{ top: 0, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="name" tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: TT_BG, border: "1px solid #333", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="value" name="Leads" radius={[4, 4, 0, 0]}>
                  {leadsChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Orders Performance */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Performance Commandes</h2>
          <p className="text-sm text-neutral-500">Traitement et livraison des commandes</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SmallStatCard title="TOTAL ORDERS"   subtitle="Toutes sources"      value={totalOrders}    unit="ORDERS" icon={ShoppingCart} color="blue" />
          <SmallStatCard title="LIVRÉS"         subtitle="Livraisons réussies" value={deliveredOrders} unit="ORDERS" icon={CheckCircle} color="green" />
          <SmallStatCard title="EN TRANSIT"     subtitle="Expédiés"            value={shippedOrders}  unit="ORDERS" icon={Clock}       color="yellow" />
          <SmallStatCard title="RETOURNÉS"      subtitle="Échecs livraison"    value={returnedOrders} unit="ORDERS" icon={XCircle}     color="red" />
          <SmallStatCard title="TAUX LIVRAISON" subtitle="Taux de succès"      value={`${deliveryRate}`} unit="%"  icon={TrendingUp}  color="orange" />
        </div>
        <div className="mt-4">
          <ChartCard title="Répartition des commandes par statut">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ordersChartData} margin={{ top: 0, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="name" tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: TT_BG, border: "1px solid #333", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="value" name="Commandes" radius={[4, 4, 0, 0]}>
                  {ordersChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Revenue by Store */}
      {revenueByStore.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Revenus par boutique</h2>
            <p className="text-sm text-neutral-500">Performance des boutiques connectées</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revenueByStore.map(store => (
              <div key={store.name} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-4 truncate">{store.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-white">{store.revenue.toFixed(0)}</span>
                  <span className="text-sm text-neutral-500">EUR</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1.5 mb-2">
                  <div className="bg-orange-500 h-1.5 rounded-full"
                    style={{ width: totalRevenue > 0 ? `${(store.revenue / totalRevenue) * 100}%` : "0%" }} />
                </div>
                <p className="text-xs text-neutral-500">{store.orders} commandes livrées</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
