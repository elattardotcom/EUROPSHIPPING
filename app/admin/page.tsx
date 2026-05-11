"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Users, ShoppingCart, DollarSign, UserCheck, ArrowUpRight, CheckCircle, Clock, AlertCircle, RefreshCw, Radio, Store, TrendingUp } from "lucide-react"
import type { Client, AdminOrder, AdminLead } from "@/lib/db"
import { useI18n } from "@/lib/admin-i18n"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳", DZ:"🇩🇿", AE:"🇦🇪" }
const PLAN_COLORS: Record<string, string> = {
  enterprise: "bg-orange-500/20 text-orange-400 border-orange-500/20",
  pro:        "bg-amber-500/20  text-amber-400  border-amber-500/20",
  starter:    "bg-neutral-500/20 text-neutral-400 border-neutral-500/20",
}
const STATUS_COLORS: Record<string, string> = {
  active:"bg-emerald-500/15 text-emerald-400", trial:"bg-amber-500/15 text-amber-400",
  suspended:"bg-red-500/15 text-red-400",      cancelled:"bg-neutral-500/15 text-neutral-400",
}
function initials(a: string, b: string) { return `${(a[0]??"").toUpperCase()}${(b[0]??"").toUpperCase()}` || "?" }

export default function AdminDashboard() {
  const { t } = useI18n()
  const [clients, setClients] = useState<Client[]>([])
  const [orders,  setOrders]  = useState<AdminOrder[]>([])
  const [leads,   setLeads]   = useState<AdminLead[]>([])
  const [stores,  setStores]  = useState<{ id: string }[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => { load(); const t = setInterval(load, 5_000); return () => clearInterval(t) }, [load])

  const active       = clients.filter(c => c.status === "active")
  const mrr          = active.reduce((s, c) => s + c.monthlyRevenue, 0)
  const delivered    = orders.filter(o => o.status === "DELIVERED").length
  const confirmed    = leads.filter(l => l.status === "CONFIRMED").length
  const pendingLeads = leads.filter(l => l.status === "PENDING").length
  const deliveryRate = orders.length ? Math.round(delivered / orders.length * 100) : 0
  const confirmRate  = leads.length  ? Math.round(confirmed  / leads.length  * 100) : 0

  const LEAD_CFG: Record<string, { color: string; bg: string; label: string }> = {
    CONFIRMED: { color:"text-emerald-400", bg:"bg-emerald-500/10", label:t("status_confirmed") },
    PENDING:   { color:"text-amber-400",   bg:"bg-amber-500/10",   label:t("status_pending")   },
    UNREACHED: { color:"text-blue-400",    bg:"bg-blue-500/10",    label:t("status_unreached") },
    CANCELED:  { color:"text-red-400",     bg:"bg-red-500/10",     label:t("status_canceled")  },
    ERROR:     { color:"text-rose-400",    bg:"bg-rose-500/10",    label:t("status_error")     },
  }
  const CLIENT_STATUS_LABELS: Record<string, string> = {
    active:t("status_active"), trial:t("status_trial"),
    suspended:t("status_suspended"), cancelled:t("status_cancelled"),
  }
  const fmt = (d: Date) => [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2,"0")).join(":")

  if (loading) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-neutral-500 text-sm">{t("loading")}</p>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{t("dash_title")}</h1>
          <p className="text-neutral-500 text-xs md:text-sm mt-0.5">{t("updated_at")} {fmt(lastRefresh)}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400"><Radio className="w-3 h-3 animate-pulse"/>{t("live")}</span>
          <button onClick={load} className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5"/><span className="hidden sm:inline">{t("refresh")}</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:t("dash_active_clients"), value:active.length,  icon:Users,        color:"from-orange-500 to-red-600",   sub:`${clients.filter(c=>c.status==="trial").length} ${t("dash_in_trial")}` },
          { label:t("dash_mrr"),            value:`€${mrr}`,      icon:DollarSign,   color:"from-emerald-500 to-teal-600", sub:`${t("dash_arr")} €${mrr*12}` },
          { label:t("dash_orders"),         value:orders.length,  icon:ShoppingCart, color:"from-amber-500 to-orange-600", sub:`${deliveryRate}% ${t("dash_delivery")}` },
          { label:t("dash_leads_total"),    value:leads.length,   icon:UserCheck,    color:"from-blue-500 to-cyan-600",    sub:`${confirmRate}% ${t("dash_confirmed")}` },
        ].map(k => (
          <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}>
              <k.icon className="w-5 h-5 text-white"/>
            </div>
            <div className="text-3xl font-extrabold text-white mb-0.5">{k.value}</div>
            <p className="text-xs text-neutral-500">{k.label}</p>
            <p className="text-xs text-neutral-600 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:t("dash_stores_conn"), value:stores.length,                                    icon:Store,       color:"text-emerald-400", bg:"bg-emerald-500/10" },
          { label:t("dash_leads_pend"),  value:pendingLeads,                                     icon:Clock,       color:"text-amber-400",   bg:"bg-amber-500/10"   },
          { label:t("dash_trial"),       value:clients.filter(c=>c.status==="trial").length,     icon:TrendingUp,  color:"text-blue-400",    bg:"bg-blue-500/10"    },
          { label:t("dash_suspended"),   value:clients.filter(c=>c.status==="suspended").length, icon:AlertCircle, color:"text-red-400",     bg:"bg-red-500/10"     },
        ].map(h => (
          <div key={h.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${h.bg} flex items-center justify-center flex-shrink-0`}>
              <h.icon className={`w-4 h-4 ${h.color}`}/>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{h.value}</div>
              <p className="text-xs text-neutral-500 leading-tight">{h.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">{t("dash_recent_leads")}</h2>
            <Link href="/admin/leads" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">{t("see_all")} <ArrowUpRight className="w-3 h-3"/></Link>
          </div>
          <div className="divide-y divide-neutral-800">
            {leads.slice(0,6).map(l => {
              const s = LEAD_CFG[l.status] ?? LEAD_CFG.PENDING
              return (
                <div key={l.id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-800/40 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{l.customerName||"—"}</p>
                    <p className="text-xs text-neutral-500">{l.clientName} · {l.product||"—"}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-sm font-semibold text-white">€{(l.value??0).toFixed(2)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.color}`}>{s.label}</span>
                  </div>
                </div>
              )
            })}
            {leads.length===0 && <p className="p-5 text-neutral-500 text-sm">{t("dash_no_leads")}</p>}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">{t("dash_recent_clients")}</h2>
            <Link href="/admin/clients" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">{t("see_all")} <ArrowUpRight className="w-3 h-3"/></Link>
          </div>
          <div className="divide-y divide-neutral-800">
            {clients.slice(0,6).map(c => (
              <Link key={c.id} href={`/admin/clients/${c.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-neutral-800/40 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {initials(c.firstName, c.lastName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium group-hover:text-orange-400 transition-colors truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-neutral-500 truncate">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span className="text-base">{FLAGS[c.countryCode]??"🏳️"}</span>
                  <span className={`hidden sm:inline text-[10px] px-2 py-0.5 rounded-full font-medium border ${PLAN_COLORS[c.plan]??PLAN_COLORS.starter}`}>{c.plan}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]??""}`}>{CLIENT_STATUS_LABELS[c.status]??c.status}</span>
                </div>
              </Link>
            ))}
            {clients.length===0 && <p className="p-5 text-neutral-500 text-sm">{t("dash_no_clients")}</p>}
          </div>
        </div>
      </div>

      {/* Revenue by plan */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-5">{t("dash_revenue_plan")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { plan:"Enterprise", key:"enterprise", price:89, color:"from-orange-500 to-red-600",      bar:"bg-orange-500" },
            { plan:"Pro",        key:"pro",        price:59, color:"from-amber-500 to-orange-500",    bar:"bg-amber-500"  },
            { plan:"Starter",    key:"starter",    price:29, color:"from-neutral-500 to-neutral-600", bar:"bg-neutral-500" },
          ].map(r => {
            const count = active.filter(c => c.plan === r.key).length
            const rev   = count * r.price
            const pct   = mrr > 0 ? Math.round((rev / mrr) * 100) : 0
            return (
              <div key={r.plan} className="bg-neutral-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${r.color} text-white text-xs font-bold`}>{r.plan}</span>
                  <span className="text-neutral-500 text-xs">{count} client{count!==1?"s":""}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">€{rev}<span className="text-sm text-neutral-500 font-normal">/mo</span></div>
                <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden mb-1">
                  <div className={`h-full ${r.bar} rounded-full transition-all duration-500`} style={{width:`${pct}%`}}/>
                </div>
                <p className="text-xs text-neutral-600">{pct}% {t("dash_of_mrr")}</p>
              </div>
            )
          })}
        </div>
      </div>

      {leads.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">{t("dash_leads_summary")}</h2>
            <span className="text-xs text-neutral-500">{leads.length} leads</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label:t("dash_confirmed"),   value:confirmed,                                       color:"text-emerald-400", bg:"bg-emerald-500/10" },
              { label:t("status_pending"),   value:pendingLeads,                                    color:"text-amber-400",   bg:"bg-amber-500/10"   },
              { label:t("dash_unreached"),   value:leads.filter(l=>l.status==="UNREACHED").length,  color:"text-blue-400",    bg:"bg-blue-500/10"    },
              { label:t("dash_canceled"),    value:leads.filter(l=>l.status==="CANCELED").length,   color:"text-red-400",     bg:"bg-red-500/10"     },
              { label:t("dash_confirm_rate"),value:`${confirmRate}%`,                               color:"text-orange-400",  bg:"bg-orange-500/10"  },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
