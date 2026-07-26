"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Users, ShoppingCart, DollarSign, UserCheck, ArrowUpRight,
  Clock, AlertCircle, RefreshCw, Radio, Store, TrendingUp,
  Package, Truck, PhoneCall, CheckCircle, Zap,
} from "lucide-react"
import type { Client, AdminOrder, AdminLead } from "@/lib/db"
import { useI18n } from "@/lib/admin-i18n"

const FLAGS: Record<string, string> = {
  PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪",
  TN:"🇹🇳", DZ:"🇩🇿", AE:"🇦🇪", IT:"🇮🇹", DE:"🇩🇪",
}

const LEAD_STATUS: Record<string, { dot: string; label: string; ring: string }> = {
  CONFIRMED: { dot: "#10b981", label: "Confirmé",   ring: "rgba(16,185,129,0.2)"  },
  PENDING:   { dot: "#f59e0b", label: "En attente", ring: "rgba(245,158,11,0.2)"  },
  UNREACHED: { dot: "#3b82f6", label: "Injoignable",ring: "rgba(59,130,246,0.2)"  },
  CANCELED:  { dot: "#f43f5e", label: "Annulé",     ring: "rgba(244,63,94,0.2)"   },
  ERROR:     { dot: "#f43f5e", label: "Erreur",     ring: "rgba(244,63,94,0.2)"   },
}

const CLIENT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Actif",     color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  trial:     { label: "Essai",     color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  suspended: { label: "Suspendu",  color: "#f43f5e", bg: "rgba(244,63,94,0.12)"   },
  cancelled: { label: "Annulé",    color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
}

function initials(a: string, b: string) {
  return `${(a[0] ?? "").toUpperCase()}${(b[0] ?? "").toUpperCase()}` || "?"
}

export default function AdminDashboard() {
  const { t } = useI18n()
  const [clients,     setClients]     = useState<Client[]>([])
  const [orders,      setOrders]      = useState<AdminOrder[]>([])
  const [leads,       setLeads]       = useState<AdminLead[]>([])
  const [stores,      setStores]      = useState<{ id: string }[]>([])
  const [loading,     setLoading]     = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const load = useCallback(async () => {
    const [c, o, l, s] = await Promise.all([
      fetch("/api/admin/clients").then(r => r.json()).catch(() => []),
      fetch("/api/admin/orders").then(r => r.json()).catch(() => []),
      fetch("/api/admin/leads").then(r => r.json()).catch(() => []),
      fetch("/api/admin/stores").then(r => r.json()).catch(() => []),
    ])
    setClients(Array.isArray(c) ? c : [])
    setOrders(Array.isArray(o) ? o : [])
    setLeads(Array.isArray(l) ? l : [])
    setStores(Array.isArray(s) ? s : [])
    setLoading(false)
    setLastRefresh(new Date())
  }, [])

  useEffect(() => { load(); const i = setInterval(load, 5_000); return () => clearInterval(i) }, [load])

  const active        = clients.filter(c => c.status === "active")
  const trial         = clients.filter(c => c.status === "trial")
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

  const fmt = (d: Date) =>
    [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, "0")).join(":")

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-neutral-500 text-sm">Chargement…</p>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* ── Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white">Vue d&apos;ensemble</h1>
          <p className="text-neutral-600 text-xs mt-0.5 flex items-center gap-1.5">
            <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            Mis à jour à {fmt(lastRefresh)} · refresh auto 5s
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-all">
          <RefreshCw className="w-3.5 h-3.5" />Actualiser
        </button>
      </div>

      {/* ── Hero MRR Banner */}
      <div className="relative rounded-2xl overflow-hidden p-6 md:p-8"
        style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.12) 0%,rgba(139,92,246,0.06) 50%,rgba(16,185,129,0.08) 100%)", border: "1px solid rgba(249,115,22,0.2)" }}>
        {/* Background shimmer */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.5),transparent)" }} />
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#f97316,transparent)" }} />
          <div className="absolute -bottom-16 right-0 w-48 h-48 rounded-full opacity-5" style={{ background: "radial-gradient(circle,#8b5cf6,transparent)" }} />
        </div>
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { label: "MRR",             value: `€${mrr.toFixed(2)}`,   sub: "Revenu mensuel",      color: "#f97316" },
            { label: "ARR",             value: `€${arr.toFixed(2)}`,   sub: "Revenu annuel",       color: "#10b981" },
            { label: "Clients actifs",  value: active.length,           sub: `${trial.length} en essai`, color: "#8b5cf6" },
            { label: "Stores connectés",value: stores.length,           sub: "Boutiques Shopify",   color: "#06b6d4" },
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
            label: "Commandes totales", value: orders.length, icon: ShoppingCart,
            sub1: `${delivered} livrées`, sub2: `${deliveryRate}% taux`,
            grad: "linear-gradient(135deg,#f97316,#dc2626)", border: "rgba(249,115,22,0.25)", glow: "rgba(249,115,22,0.08)",
          },
          {
            label: "Leads total", value: leads.length, icon: PhoneCall,
            sub1: `${confirmed} confirmés`, sub2: `${confirmRate}% taux`,
            grad: "linear-gradient(135deg,#10b981,#059669)", border: "rgba(16,185,129,0.25)", glow: "rgba(16,185,129,0.08)",
          },
          {
            label: "Livraisons réussies", value: delivered, icon: Truck,
            sub1: `${returned} retours`, sub2: `Sur ${orders.length} cmds`,
            grad: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "rgba(59,130,246,0.25)", glow: "rgba(59,130,246,0.08)",
          },
          {
            label: "En attente", value: pendingLeads, icon: Clock,
            sub1: `${unreachedL} injoignables`, sub2: "À traiter en priorité",
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
          { icon: Store,       label: "Boutiques",  value: stores.length,    color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)"  },
          { icon: TrendingUp,  label: "En essai",   value: trial.length,     color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)"  },
          { icon: AlertCircle, label: "Suspendus",  value: suspended.length, color: "#f43f5e", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.2)"   },
          { icon: Package,     label: "Retours",    value: returned,         color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.2)"  },
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

      {/* ── Leads + Clients tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent leads */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-orange-400" />
              <h2 className="font-bold text-white text-sm">Derniers leads</h2>
            </div>
            <Link href="/admin/leads" className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {leads.length === 0
              ? <p className="p-5 text-neutral-600 text-sm">Aucun lead</p>
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
              <h2 className="font-bold text-white text-sm">Derniers clients</h2>
            </div>
            <Link href="/admin/clients" className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {clients.length === 0
              ? <p className="p-5 text-neutral-600 text-sm">Aucun client</p>
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
              <h2 className="font-bold text-white">Répartition des leads</h2>
            </div>
            <span className="text-xs text-neutral-600">{leads.length} leads au total</span>
          </div>

          {/* Big confirmation rate */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-500">Taux de confirmation global</span>
              <span className="text-sm font-black text-white">{confirmRate}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-neutral-800 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${confirmRate}%`, background: "linear-gradient(90deg,#f97316,#10b981)" }} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Confirmés",     value: confirmed,    pct: leads.length ? Math.round(confirmed/leads.length*100)    : 0, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", icon: CheckCircle },
              { label: "En attente",    value: pendingLeads, pct: leads.length ? Math.round(pendingLeads/leads.length*100)  : 0, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", icon: Clock       },
              { label: "Injoignables",  value: unreachedL,   pct: leads.length ? Math.round(unreachedL/leads.length*100)   : 0, color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", icon: PhoneCall   },
              { label: "Annulés",       value: canceledL,    pct: leads.length ? Math.round(canceledL/leads.length*100)    : 0, color: "#f43f5e", bg: "rgba(244,63,94,0.08)",  border: "rgba(244,63,94,0.2)",  icon: AlertCircle },
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
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">CODShipEurope Pro · €31.99/mois</p>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-4xl font-black text-white">€{mrr.toFixed(2)}</span>
              <span className="text-neutral-500 text-sm">MRR actuel</span>
            </div>
            <p className="text-neutral-500 text-xs">{active.length} client{active.length !== 1 ? "s" : ""} actifs · ARR projeté <span className="text-white font-bold">€{arr.toFixed(2)}</span></p>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "Taux de livraison", value: `${deliveryRate}%`, color: "#10b981" },
              { label: "Taux de confirmation", value: `${confirmRate}%`, color: "#f97316" },
              { label: "Clients actifs", value: `${active.length}`, color: "#8b5cf6" },
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
