"use client"

import {
  DollarSign, Users, ShoppingCart, CheckCircle, Clock,
  XCircle, Percent, TrendingUp, ArrowUpRight, ArrowDownRight,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from "recharts"
import { ALL_LEADS, ALL_ORDERS } from "@/lib/mock-data"

/* ── computed stats ─────────────────────────────────────── */
const totalLeads     = ALL_LEADS.length
const confirmedLeads = ALL_LEADS.filter(l => l.status === "CONFIRMED").length
const pendingLeads   = ALL_LEADS.filter(l => l.status === "PENDING").length
const canceledLeads  = ALL_LEADS.filter(l => l.status === "CANCELED").length
const unreachedLeads = ALL_LEADS.filter(l => l.status === "UNREACHED").length
const confirmRate    = Math.round((confirmedLeads / totalLeads) * 100)

const totalOrders    = ALL_ORDERS.length
const deliveredOrders = ALL_ORDERS.filter(o => o.status === "DELIVERED").length
const pendingOrders  = ALL_ORDERS.filter(o => o.status === "PENDING").length
const shippedOrders  = ALL_ORDERS.filter(o => o.status === "SHIPPED").length
const returnedOrders = ALL_ORDERS.filter(o => o.status === "RETURNED").length
const deliveryRate   = Math.round((deliveredOrders / totalOrders) * 100)

const totalRevenue   = ALL_ORDERS.filter(o => o.status === "DELIVERED")
  .reduce((sum, o) => sum + o.orderValue, 0)

/* ── chart data ─────────────────────────────────────────── */
const leadsChartData = [
  { name: "Confirmés",  value: confirmedLeads, fill: "#10b981" },
  { name: "En attente", value: pendingLeads,   fill: "#f59e0b" },
  { name: "Pas répondu",value: unreachedLeads, fill: "#3b82f6" },
  { name: "Annulés",    value: canceledLeads,  fill: "#ef4444" },
]

const ordersChartData = [
  { name: "Livrés",     value: deliveredOrders, fill: "#10b981" },
  { name: "Expédiés",   value: shippedOrders,   fill: "#3b82f6" },
  { name: "En attente", value: pendingOrders,   fill: "#f59e0b" },
  { name: "Retournés",  value: returnedOrders,  fill: "#ef4444" },
]

const revenueByDay = [
  { day: "1 Mai", leads: 2, orders: 1, revenue: 74.90 },
  { day: "2 Mai", leads: 1, orders: 1, revenue: 64.90 },
  { day: "3 Mai", leads: 1, orders: 0, revenue: 0 },
  { day: "4 Mai", leads: 2, orders: 1, revenue: 69.50 },
  { day: "5 Mai", leads: 2, orders: 2, revenue: 144.80 },
  { day: "6 Mai", leads: 3, orders: 3, revenue: 208.50 },
  { day: "7 Mai", leads: 3, orders: 2, revenue: 139 },
  { day: "8 Mai", leads: 3, orders: 0, revenue: 0 },
  { day: "9 Mai", leads: 3, orders: 1, revenue: 69.50 },
  { day: "10 Mai",leads: 2, orders: 0, revenue: 0 },
]

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
    <div className={`bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-5 border-l-4 ${border}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-500">{subtitle}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center ${ico}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
        <span className="text-sm text-gray-500 dark:text-neutral-500">{unit}</span>
        {trend && (
          <span className={`flex items-center gap-1 text-xs ml-auto ${trend.positive ? "text-emerald-500" : "text-red-500"}`}>
            {trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-neutral-500">{description}</p>
    </div>
  )
}

function SmallStatCard({
  title, subtitle, value, unit, icon: Icon, color, onClick, active,
}: {
  title: string; subtitle: string; value: string | number; unit: string
  icon: React.ElementType; color: "blue" | "green" | "yellow" | "red" | "orange"
  onClick?: () => void; active?: boolean
}) {
  const border = { blue:"border-l-blue-500 bg-blue-500/5", green:"border-l-emerald-500 bg-emerald-500/5", yellow:"border-l-yellow-500 bg-yellow-500/5", red:"border-l-red-500 bg-red-500/5", orange:"border-l-orange-500 bg-orange-500/5" }[color]
  const ico    = { blue:"text-blue-500", green:"text-emerald-500", yellow:"text-yellow-500", red:"text-red-500", orange:"text-orange-500" }[color]
  return (
    <button onClick={onClick}
      className={`bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 border-l-4 ${border} text-left w-full transition-all ${active ? "ring-1 ring-orange-500/50" : "hover:border-gray-300 dark:hover:border-neutral-700"}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xs font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-500">{subtitle}</p>
        </div>
        <div className={`w-8 h-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center ${ico}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        <span className="text-sm text-gray-500 dark:text-neutral-500">{unit}</span>
      </div>
    </button>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 dark:text-neutral-500 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  )
}

const TICK  = "#737373"
const GRID  = "#262626"
const TT_BG = "#171717"

/* ── page ───────────────────────────────────────────────── */

export default function DashboardPage({ clientId = "c1" }: { clientId?: string }) {
  const isDemo = clientId === "c1"

  const tLeads     = isDemo ? totalLeads      : 0
  const cLeads     = isDemo ? confirmedLeads  : 0
  const pLeads     = isDemo ? pendingLeads    : 0
  const cxLeads    = isDemo ? canceledLeads   : 0
  const uLeads     = isDemo ? unreachedLeads  : 0
  const cRate      = isDemo ? confirmRate     : 0
  const tOrders    = isDemo ? totalOrders     : 0
  const dOrders    = isDemo ? deliveredOrders : 0
  const pOrders    = isDemo ? pendingOrders   : 0
  const sOrders    = isDemo ? shippedOrders   : 0
  const rOrders    = isDemo ? returnedOrders  : 0
  const dRate      = isDemo ? deliveryRate    : 0
  const tRevenue   = isDemo ? totalRevenue    : 0

  const lChartData = isDemo ? leadsChartData  : [
    { name: "Confirmés",  value: 0, fill: "#10b981" },
    { name: "En attente", value: 0, fill: "#f59e0b" },
    { name: "Pas répondu",value: 0, fill: "#3b82f6" },
    { name: "Annulés",    value: 0, fill: "#ef4444" },
  ]
  const oChartData = isDemo ? ordersChartData : [
    { name: "Livrés",     value: 0, fill: "#10b981" },
    { name: "Expédiés",   value: 0, fill: "#3b82f6" },
    { name: "En attente", value: 0, fill: "#f59e0b" },
    { name: "Retournés",  value: 0, fill: "#ef4444" },
  ]
  const rByDay = isDemo ? revenueByDay : []

  return (
    <div className="space-y-8">

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="REVENUS LIVRÉS" subtitle="Commandes livrées" value={tRevenue.toFixed(0)} unit="EUR"
          description={`${dOrders} commandes livrées avec succès`} icon={DollarSign} color="green"
          trend={isDemo ? { value: 12.5, positive: true } : undefined} />
        <StatCard title="TOTAL LEADS" subtitle="Prospects qualifiés" value={tLeads} unit="LEADS"
          description={`${cLeads} confirmés — taux ${cRate}%`} icon={Users} color="teal"
          trend={isDemo ? { value: 8.3, positive: true } : undefined} />
        <StatCard title="TOTAL COMMANDES" subtitle="Commandes traitées" value={tOrders} unit="ORDERS"
          description={`${dOrders} livrées — taux ${dRate}%`} icon={ShoppingCart} color="purple"
          trend={isDemo ? { value: 5.2, positive: true } : undefined} />
      </div>

      {/* Revenue + Activity line chart */}
      <ChartCard title="Activité — 10 derniers jours" subtitle="Leads, commandes et revenus">
        {rByDay.length === 0 ? (
          <div className="h-[220px] flex flex-col items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-neutral-700" />
            <p className="text-neutral-500 text-sm">Connectez votre boutique pour voir l'activité</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={rByDay} margin={{ top: 4, right: 40, left: -10, bottom: 0 }}>
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Leads</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-500">Génération et conversion des prospects</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SmallStatCard title="TOTAL LEADS"   subtitle="Toutes sources"     value={tLeads}          unit="LEADS" icon={Users}       color="blue" />
          <SmallStatCard title="CONFIRMÉS"     subtitle="Leads convertis"    value={cLeads}          unit="LEADS" icon={CheckCircle} color="green" />
          <SmallStatCard title="EN ATTENTE"    subtitle="En cours"           value={pLeads}          unit="LEADS" icon={Clock}       color="yellow" />
          <SmallStatCard title="ANNULÉS"       subtitle="Non convertis"      value={cxLeads}         unit="LEADS" icon={XCircle}     color="red" />
          <SmallStatCard title="TAUX CONFIRM." subtitle="Taux de conversion" value={`${cRate}`}      unit="%"     icon={Percent}    color="orange" />
        </div>
        <div className="mt-4">
          <ChartCard title="Répartition des leads par statut">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={lChartData} margin={{ top: 0, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="name" tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: TT_BG, border: "1px solid #333", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="value" name="Leads" radius={[4, 4, 0, 0]}>
                  {lChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Orders Performance */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Commandes</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-500">Traitement et livraison des commandes</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SmallStatCard title="TOTAL ORDERS"   subtitle="Toutes sources"      value={tOrders}    unit="ORDERS" icon={ShoppingCart} color="blue" />
          <SmallStatCard title="LIVRÉS"         subtitle="Livraisons réussies" value={dOrders}    unit="ORDERS" icon={CheckCircle}  color="green" />
          <SmallStatCard title="EN TRANSIT"     subtitle="Expédiés"            value={sOrders}    unit="ORDERS" icon={Clock}        color="yellow" />
          <SmallStatCard title="RETOURNÉS"      subtitle="Échecs livraison"    value={rOrders}    unit="ORDERS" icon={XCircle}      color="red" />
          <SmallStatCard title="TAUX LIVRAISON" subtitle="Taux de succès"      value={`${dRate}`} unit="%"      icon={TrendingUp}   color="orange" />
        </div>
        <div className="mt-4">
          <ChartCard title="Répartition des commandes par statut">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={oChartData} margin={{ top: 0, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="name" tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: TT_BG, border: "1px solid #333", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="value" name="Commandes" radius={[4, 4, 0, 0]}>
                  {oChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Revenue by Store */}
      {isDemo && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Revenus par boutique</h2>
            <p className="text-sm text-gray-500 dark:text-neutral-500">Performance des boutiques Shopify connectées</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Main Store Portugal", revenue: tRevenue * 0.52, orders: 4, change: 15.2 },
              { name: "Store Spain",         revenue: tRevenue * 0.31, orders: 2, change: 8.7 },
              { name: "Store France",        revenue: tRevenue * 0.17, orders: 2, change: -2.3 },
            ].map((store) => (
              <div key={store.name} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{store.name}</h3>
                  <span className={`flex items-center gap-1 text-xs ${store.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {store.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(store.change)}%
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{store.revenue.toFixed(0)}</span>
                  <span className="text-sm text-gray-500 dark:text-neutral-500">EUR</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-1.5 mb-2">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: tRevenue > 0 ? `${(store.revenue / tRevenue) * 100}%` : "0%" }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-neutral-500">{store.orders} commandes livrées</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
