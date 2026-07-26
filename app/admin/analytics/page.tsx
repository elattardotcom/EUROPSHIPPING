"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  TrendingUp, DollarSign, Users, ShoppingCart, RefreshCw,
  Package, Truck, RotateCcw, UserCheck, UserX, Target,
  PhoneCall, Clock, Ban, BarChart3, Globe, Trophy,
} from "lucide-react"
import type { Client, AdminOrder, AdminLead } from "@/lib/db"
import { useI18n } from "@/lib/admin-i18n"

const FLAGS: Record<string, string> = {
  PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪",
  TN:"🇹🇳", DZ:"🇩🇿", IT:"🇮🇹", DE:"🇩🇪", GB:"🇬🇧",
  RO:"🇷🇴", NL:"🇳🇱", SN:"🇸🇳", CI:"🇨🇮",
}

const RANK_COLORS = ["#f97316","#94a3b8","#f59e0b","#6366f1","#10b981"]
const RANK_LABELS = ["1st","2nd","3rd","4th","5th"]

function getLast6Months(locale: string) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return { label: d.toLocaleDateString(locale, { month: "short" }), year: d.getFullYear(), month: d.getMonth() }
  })
}

function KpiCard({
  icon: Icon, label, value, sub, gradient, border, glow,
}: {
  icon: React.ElementType; label: string; value: string | number
  sub?: string; gradient: string; border: string; glow: string
}) {
  return (
    <div className="relative rounded-2xl p-5 overflow-hidden" style={{ background: "#111", border: `1px solid ${border}` }}>
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: gradient }} />
      <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60" style={{ background: gradient }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: glow }}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: glow.includes("orange") ? "#f97316" : glow.includes("emerald") ? "#10b981" : glow.includes("blue") ? "#3b82f6" : glow.includes("violet") ? "#8b5cf6" : glow.includes("amber") ? "#f59e0b" : glow.includes("rose") ? "#f43f5e" : glow.includes("cyan") ? "#06b6d4" : "#a78bfa" }} />
        </div>
        <div className="text-2xl font-black text-white mb-0.5">{value}</div>
        <p className="text-xs font-medium text-neutral-400">{label}</p>
        {sub && <p className="text-[10px] text-neutral-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminAnalytics() {
  const { t, lang } = useI18n()
  const [clients, setClients] = useState<Client[]>([])
  const [orders,  setOrders]  = useState<AdminOrder[]>([])
  const [leads,   setLeads]   = useState<AdminLead[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [c, o, l] = await Promise.all([
      fetch("/api/admin/clients").then(r => r.json()).catch(() => []),
      fetch("/api/admin/orders").then(r => r.json()).catch(() => []),
      fetch("/api/admin/leads").then(r => r.json()).catch(() => []),
    ])
    setClients(Array.isArray(c) ? c : [])
    setOrders(Array.isArray(o) ? o : [])
    setLeads(Array.isArray(l) ? l : [])
    setLoading(false)
  }, [])

  useEffect(() => { load(); const i = setInterval(load, 30_000); return () => clearInterval(i) }, [load])

  // ── Revenue metrics
  const active        = clients.filter(c => c.status === "active")
  const trial         = clients.filter(c => c.status === "trial")
  const cancelled     = clients.filter(c => c.status === "cancelled")
  const mrr           = active.reduce((s, c) => s + c.monthlyRevenue, 0)
  const arr           = mrr * 12
  const avgRev        = active.length ? Math.round(mrr / active.length * 100) / 100 : 0
  const churnRate     = clients.length ? Math.round((cancelled.length / clients.length) * 100) : 0

  // ── Order metrics
  const delivered     = orders.filter(o => o.status === "DELIVERED")
  const returned      = orders.filter(o => o.status === "RETURNED")
  const inTransit     = orders.filter(o => o.status === "SHIPPED")
  const pending       = orders.filter(o => o.status === "PENDING")
  const deliveryRate  = orders.length ? Math.round(delivered.length / orders.length * 100) : 0
  const returnRate    = orders.length ? Math.round(returned.length  / orders.length * 100) : 0

  // ── Lead metrics
  const confirmedL    = leads.filter(l => l.status === "CONFIRMED")
  const pendingL      = leads.filter(l => l.status === "PENDING")
  const unreachedL    = leads.filter(l => l.status === "UNREACHED")
  const refusedL      = leads.filter(l => l.status === "CANCELED")
  const confirmRate   = leads.length ? Math.round(confirmedL.length / leads.length * 100) : 0

  // ── Charts
  const locale    = lang === "fr" ? "fr-FR" : "en-GB"
  const months    = useMemo(() => getLast6Months(locale), [locale])

  const mrrByMonth = useMemo(() => months.map(m =>
    clients.filter(c => {
      if (!c.joinedAt) return false
      const d = new Date(c.joinedAt)
      return c.status === "active" && !isNaN(d.getTime()) && (
        d.getFullYear() < m.year || (d.getFullYear() === m.year && d.getMonth() <= m.month)
      )
    }).reduce((s, c) => s + c.monthlyRevenue, 0)
  ), [clients, months])

  const clientsByMonth = useMemo(() => months.map(m =>
    clients.filter(c => {
      if (!c.joinedAt) return false
      const d = new Date(c.joinedAt)
      return !isNaN(d.getTime()) && (
        d.getFullYear() < m.year || (d.getFullYear() === m.year && d.getMonth() <= m.month)
      )
    }).length
  ), [clients, months])

  const maxMRR     = Math.max(1, ...mrrByMonth)
  const maxClients = Math.max(1, ...clientsByMonth)

  // ── Country breakdown
  const byCountry = Object.entries(
    clients.reduce<Record<string, { count: number; mrr: number; cc: string }>>((acc, c) => {
      if (!acc[c.country]) acc[c.country] = { count: 0, mrr: 0, cc: c.countryCode }
      acc[c.country].count++
      if (c.status === "active") acc[c.country].mrr += c.monthlyRevenue
      return acc
    }, {})
  ).sort((a, b) => b[1].mrr - a[1].mrr).slice(0, 6)

  const maxCountryMrr = Math.max(1, ...byCountry.map(([, d]) => d.mrr))

  const topClients = [...active].sort((a, b) => b.ordersCount - a.ordersCount).slice(0, 5)

  if (loading) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-neutral-500 text-sm">{t("loading")}</p>
    </div>
  )

  return (
    <div className="p-6 space-y-6">

      {/* ── Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Analytique</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Vue en temps réel — toutes les métriques de la plateforme</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors border border-neutral-700">
          <RefreshCw className="w-3.5 h-3.5" />Actualiser
        </button>
      </div>

      {/* ── Section 1: Revenue KPIs */}
      <div>
        <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest mb-3 flex items-center gap-2">
          <DollarSign className="w-3 h-3" />Revenus
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={DollarSign}  label="MRR"              value={`€${mrr.toFixed(2)}`}  sub="Revenu mensuel récurrent"    gradient="linear-gradient(135deg,#f97316,#dc2626)" border="rgba(249,115,22,0.25)"  glow="linear-gradient(135deg,#f97316,#dc2626)" />
          <KpiCard icon={TrendingUp}  label="ARR"              value={`€${arr.toFixed(2)}`}  sub="Revenu annuel récurrent"     gradient="linear-gradient(135deg,#10b981,#0d9488)" border="rgba(16,185,129,0.25)"  glow="linear-gradient(135deg,#10b981,#0d9488)" />
          <KpiCard icon={BarChart3}   label="Rev. moy / client" value={`€${avgRev}`}          sub="Parmi les clients actifs"    gradient="linear-gradient(135deg,#8b5cf6,#6366f1)" border="rgba(139,92,246,0.25)"  glow="linear-gradient(135deg,#8b5cf6,#6366f1)" />
          <KpiCard icon={UserX}       label="Taux de churn"    value={`${churnRate}%`}        sub={`${cancelled.length} annulés`} gradient="linear-gradient(135deg,#f43f5e,#e11d48)" border="rgba(244,63,94,0.25)"   glow="linear-gradient(135deg,#f43f5e,#e11d48)" />
        </div>
      </div>

      {/* ── Section 2: Client KPIs */}
      <div>
        <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Users className="w-3 h-3" />Clients
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={Users}      label="Total clients"  value={clients.length}      sub="Tous statuts confondus"       gradient="linear-gradient(135deg,#3b82f6,#2563eb)" border="rgba(59,130,246,0.25)"  glow="linear-gradient(135deg,#3b82f6,#2563eb)" />
          <KpiCard icon={UserCheck}  label="Actifs"         value={active.length}        sub="Abonnés actifs ce mois"      gradient="linear-gradient(135deg,#10b981,#059669)" border="rgba(16,185,129,0.25)"  glow="linear-gradient(135deg,#10b981,#059669)" />
          <KpiCard icon={Clock}      label="En période d'essai" value={trial.length}     sub="14j gratuits en cours"       gradient="linear-gradient(135deg,#f59e0b,#d97706)" border="rgba(245,158,11,0.25)"  glow="linear-gradient(135deg,#f59e0b,#d97706)" />
          <KpiCard icon={Globe}      label="Pays couverts"  value={byCountry.length}     sub="Pays avec clients actifs"    gradient="linear-gradient(135deg,#06b6d4,#0891b2)" border="rgba(6,182,212,0.25)"   glow="linear-gradient(135deg,#06b6d4,#0891b2)" />
        </div>
      </div>

      {/* ── Section 3: Orders KPIs */}
      <div>
        <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Package className="w-3 h-3" />Commandes & Livraisons
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={ShoppingCart} label="Total commandes"  value={orders.length}        sub="Toutes périodes"            gradient="linear-gradient(135deg,#a78bfa,#7c3aed)" border="rgba(167,139,250,0.25)" glow="linear-gradient(135deg,#a78bfa,#7c3aed)" />
          <KpiCard icon={Truck}        label="Taux livraison"   value={`${deliveryRate}%`}   sub={`${delivered.length} livrées`}  gradient="linear-gradient(135deg,#10b981,#059669)" border="rgba(16,185,129,0.25)"  glow="linear-gradient(135deg,#10b981,#059669)" />
          <KpiCard icon={RotateCcw}    label="Taux de retour"   value={`${returnRate}%`}     sub={`${returned.length} retours`}   gradient="linear-gradient(135deg,#f43f5e,#be123c)" border="rgba(244,63,94,0.25)"   glow="linear-gradient(135deg,#f43f5e,#be123c)" />
          <KpiCard icon={Truck}        label="En transit"       value={inTransit.length}     sub={`${pending.length} en attente`} gradient="linear-gradient(135deg,#06b6d4,#0284c7)" border="rgba(6,182,212,0.25)"   glow="linear-gradient(135deg,#06b6d4,#0284c7)" />
        </div>
      </div>

      {/* ── Section 4: Leads KPIs */}
      <div>
        <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest mb-3 flex items-center gap-2">
          <PhoneCall className="w-3 h-3" />Leads
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard icon={Target}    label="Total leads"      value={leads.length}         sub="Tous les leads"              gradient="linear-gradient(135deg,#f97316,#dc2626)" border="rgba(249,115,22,0.2)"   glow="linear-gradient(135deg,#f97316,#dc2626)" />
          <KpiCard icon={UserCheck} label="Confirmés"        value={confirmedL.length}    sub={`${confirmRate}% du total`}  gradient="linear-gradient(135deg,#10b981,#059669)" border="rgba(16,185,129,0.2)"   glow="linear-gradient(135deg,#10b981,#059669)" />
          <KpiCard icon={Clock}     label="En attente"       value={pendingL.length}      sub="À traiter"                   gradient="linear-gradient(135deg,#f59e0b,#d97706)" border="rgba(245,158,11,0.2)"   glow="linear-gradient(135deg,#f59e0b,#d97706)" />
          <KpiCard icon={PhoneCall} label="Non joignables"   value={unreachedL.length}    sub="À rappeler"                  gradient="linear-gradient(135deg,#3b82f6,#2563eb)" border="rgba(59,130,246,0.2)"   glow="linear-gradient(135deg,#3b82f6,#2563eb)" />
          <KpiCard icon={Ban}       label="Refusés"          value={refusedL.length}      sub="Leads perdus"                gradient="linear-gradient(135deg,#f43f5e,#be123c)" border="rgba(244,63,94,0.2)"    glow="linear-gradient(135deg,#f43f5e,#be123c)" />
        </div>
      </div>

      {/* ── Confirmation rate hero bar */}
      {leads.length > 0 && (
        <div className="rounded-2xl p-5 border border-white/[0.06]" style={{ background: "#111" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-bold">Taux de confirmation leads</p>
              <p className="text-neutral-500 text-xs mt-0.5">{confirmedL.length} confirmés sur {leads.length} leads au total</p>
            </div>
            <span className="text-3xl font-black" style={{ background: "linear-gradient(90deg,#f97316,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {confirmRate}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-neutral-800 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${confirmRate}%`, background: "linear-gradient(90deg,#f97316,#10b981)" }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-600">
            <span>0%</span><span>Objectif 70%</span><span>100%</span>
          </div>
        </div>
      )}

      {/* ── Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* MRR Chart */}
        <div className="rounded-2xl p-6 border border-white/[0.06]" style={{ background: "#111" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white font-bold">Évolution MRR</p>
              <p className="text-neutral-500 text-xs mt-0.5">6 derniers mois</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400">€/mois</span>
          </div>
          <div className="flex items-end gap-2 h-44">
            {mrrByMonth.map((v, i) => {
              const pct = Math.max(4, (v / maxMRR) * 100)
              const isLast = i === mrrByMonth.length - 1
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-medium">€{v}</span>
                  <div className="w-full rounded-t-lg transition-all duration-700 relative overflow-hidden" style={{ height: `${pct}%`, background: isLast ? "linear-gradient(180deg,#f97316,#dc2626)" : "linear-gradient(180deg,rgba(249,115,22,0.5),rgba(220,38,38,0.3))" }}>
                    {isLast && <div className="absolute inset-0 animate-pulse opacity-30" style={{ background: "linear-gradient(180deg,#f97316,transparent)" }} />}
                  </div>
                  <span className="text-[10px] text-neutral-600">{months[i].label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Client Growth Chart */}
        <div className="rounded-2xl p-6 border border-white/[0.06]" style={{ background: "#111" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white font-bold">Croissance clients</p>
              <p className="text-neutral-500 text-xs mt-0.5">6 derniers mois</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-400">clients</span>
          </div>
          <div className="flex items-end gap-2 h-44">
            {clientsByMonth.map((v, i) => {
              const pct = Math.max(4, (v / maxClients) * 100)
              const isLast = i === clientsByMonth.length - 1
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-medium">{v}</span>
                  <div className="w-full rounded-t-lg transition-all duration-700 relative overflow-hidden" style={{ height: `${pct}%`, background: isLast ? "linear-gradient(180deg,#8b5cf6,#6366f1)" : "linear-gradient(180deg,rgba(139,92,246,0.5),rgba(99,102,241,0.3))" }}>
                    {isLast && <div className="absolute inset-0 animate-pulse opacity-30" style={{ background: "linear-gradient(180deg,#8b5cf6,transparent)" }} />}
                  </div>
                  <span className="text-[10px] text-neutral-600">{months[i].label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Countries */}
        <div className="rounded-2xl p-6 border border-white/[0.06]" style={{ background: "#111" }}>
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-cyan-400" />
            <p className="text-white font-bold">Top pays</p>
          </div>
          {byCountry.length === 0
            ? <p className="text-neutral-600 text-sm">Aucune donnée</p>
            : <div className="space-y-3.5">
                {byCountry.map(([country, data]) => {
                  const pct = maxCountryMrr > 0 ? Math.round((data.mrr / maxCountryMrr) * 100) : 0
                  return (
                    <div key={country}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{FLAGS[data.cc] ?? "🏳️"}</span>
                          <span className="text-sm text-neutral-300">{country}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-white">{data.count}</span>
                          {data.mrr > 0 && <span className="text-[10px] text-emerald-400 ml-1.5">€{data.mrr}/m</span>}
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#06b6d4,#0891b2)" }} />
                      </div>
                    </div>
                  )
                })}
              </div>
          }
        </div>

        {/* Top clients */}
        <div className="rounded-2xl p-6 border border-white/[0.06]" style={{ background: "#111" }}>
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <p className="text-white font-bold">Top clients actifs</p>
          </div>
          {topClients.length === 0
            ? <p className="text-neutral-600 text-sm">Aucun client actif</p>
            : <div className="space-y-3.5">
                {topClients.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{ background: RANK_COLORS[i], color: i === 0 ? "#000" : "#fff" }}>
                      {i + 1}
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {(c.firstName[0] ?? "")}{(c.lastName[0] ?? "")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{c.firstName} {c.lastName}</p>
                      <p className="text-[10px] text-neutral-500">{c.ordersCount} commandes · {c.country}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 flex-shrink-0">€{c.monthlyRevenue}/m</span>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Lead breakdown */}
        <div className="rounded-2xl p-6 border border-white/[0.06]" style={{ background: "#111" }}>
          <div className="flex items-center gap-2 mb-5">
            <PhoneCall className="w-4 h-4 text-orange-400" />
            <p className="text-white font-bold">Répartition leads</p>
          </div>
          {leads.length === 0
            ? <p className="text-neutral-600 text-sm">Aucun lead</p>
            : <div className="space-y-3">
                {[
                  { label: "Confirmés",     count: confirmedL.length,  color: "#10b981", bg: "rgba(16,185,129,0.15)" },
                  { label: "En attente",    count: pendingL.length,    color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
                  { label: "Non joignables",count: unreachedL.length,  color: "#3b82f6", bg: "rgba(59,130,246,0.15)"  },
                  { label: "Annulés",       count: refusedL.length,    color: "#f43f5e", bg: "rgba(244,63,94,0.15)"   },
                ].map(s => {
                  const pct = leads.length ? Math.round(s.count / leads.length * 100) : 0
                  return (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                          <span className="text-xs text-neutral-400">{s.label}</span>
                        </div>
                        <span className="text-xs font-bold text-white">{s.count} <span className="text-neutral-600 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: s.color }} />
                      </div>
                    </div>
                  )
                })}
                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Taux de confirmation</span>
                  <span className="text-sm font-black text-orange-400">{confirmRate}%</span>
                </div>
              </div>
          }
        </div>
      </div>

    </div>
  )
}
