"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { TrendingUp, DollarSign, Users, ShoppingCart, ArrowUpRight, RefreshCw } from "lucide-react"
import type { Client, AdminOrder, AdminLead } from "@/lib/db"
import { useI18n } from "@/lib/admin-i18n"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

function getLast5Months(locale: string) {
  const now = new Date()
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 4 + i, 1)
    return {
      label: d.toLocaleDateString(locale, { month: "short" }),
      year:  d.getFullYear(),
      month: d.getMonth(),
    }
  })
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

  useEffect(() => {
    load()
    const i = setInterval(load, 30_000)
    return () => clearInterval(i)
  }, [load])

  const mrr       = clients.filter(c=>c.status==="active").reduce((s,c)=>s+c.monthlyRevenue,0)
  const arr       = mrr * 12
  const churn     = clients.filter(c=>c.status==="cancelled").length
  const churnRate = clients.length ? Math.round((churn / clients.length) * 100) : 0

  const locale = lang === "fr" ? "fr-FR" : "en-GB"
  const months = useMemo(() => getLast5Months(locale), [locale])

  const clientsByMonth = useMemo(() => months.map(m =>
    clients.filter(c => {
      if (!c.joinedAt) return false
      const d = new Date(c.joinedAt)
      return !isNaN(d.getTime()) && (
        d.getFullYear() < m.year ||
        (d.getFullYear() === m.year && d.getMonth() <= m.month)
      )
    }).length
  ), [clients, months])

  const mrrByMonth = useMemo(() => months.map(m =>
    clients
      .filter(c => {
        if (!c.joinedAt) return false
        const d = new Date(c.joinedAt)
        return c.status === "active" && !isNaN(d.getTime()) && (
          d.getFullYear() < m.year ||
          (d.getFullYear() === m.year && d.getMonth() <= m.month)
        )
      })
      .reduce((s, c) => s + c.monthlyRevenue, 0)
  ), [clients, months])

  const maxMRR     = Math.max(1, ...mrrByMonth)
  const maxClients = Math.max(1, ...clientsByMonth)

  const byCountry = Object.entries(
    clients.reduce<Record<string,{count:number;mrr:number;cc:string}>>((acc,c) => {
      if (!acc[c.country]) acc[c.country] = { count:0, mrr:0, cc:c.countryCode }
      acc[c.country].count++
      if (c.status==="active") acc[c.country].mrr += c.monthlyRevenue
      return acc
    }, {})
  ).sort((a,b) => b[1].mrr - a[1].mrr)

  const byPlan = [
    { plan:"Enterprise", clients:clients.filter(c=>c.plan==="enterprise").length, price:89, color:"bg-orange-500" },
    { plan:"Pro",        clients:clients.filter(c=>c.plan==="pro").length,        price:59, color:"bg-amber-500"  },
    { plan:"Starter",    clients:clients.filter(c=>c.plan==="starter").length,    price:29, color:"bg-neutral-400" },
  ]

  const topClients = [...clients].filter(c=>c.status==="active").sort((a,b)=>b.ordersCount-a.ordersCount).slice(0,5)

  if (loading) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-neutral-500 text-sm">{t("loading")}</p>
    </div>
  )

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("analytics_title")}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{t("analytics_sub")}</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />{t("refresh")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:t("analytics_mrr"),     value:`€${mrr}`,      sub:t("analytics_mrr_sub"),                                                                                       icon:DollarSign,  color:"from-orange-500 to-red-600"   },
          { label:t("analytics_arr"),     value:`€${arr}`,      sub:t("analytics_arr_sub"),                                                                                       icon:TrendingUp,  color:"from-emerald-500 to-teal-600" },
          { label:t("analytics_clients"), value:clients.length, sub:`${churnRate}% ${t("analytics_churn")}`,                                                                      icon:Users,       color:"from-orange-500 to-red-600"   },
          { label:t("analytics_delivery"),value:`${orders.length ? Math.round(orders.filter(o=>o.status==="DELIVERED").length/orders.length*100) : 0}%`,
                                                                sub:t("analytics_all_orders"),                                                                                    icon:ShoppingCart,color:"from-blue-500 to-cyan-600"    },
        ].map(k=>(
          <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center`}>
                <k.icon className="w-5 h-5 text-white"/>
              </div>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <ArrowUpRight className="w-3 h-3"/>{t("live")}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">{k.value}</div>
            <p className="text-xs text-neutral-500">{k.label}</p>
            <p className="text-xs text-neutral-600 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-white">{t("analytics_mrr_chart")}</h2>
            <span className="text-xs text-orange-400 font-medium">{t("analytics_last5")}</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {mrrByMonth.map((v,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-neutral-500">€{v}</span>
                <div className="w-full bg-orange-500 rounded-t-lg transition-all duration-500" style={{height:`${Math.max(4,(v/maxMRR)*100)}%`}} />
                <span className="text-xs text-neutral-600">{months[i].label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-white">{t("analytics_growth")}</h2>
            <span className="text-xs text-amber-400 font-medium">{t("analytics_last5")}</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {clientsByMonth.map((v,i)=>(
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-neutral-500">{v}</span>
                <div className="w-full bg-amber-500 rounded-t-lg transition-all duration-500" style={{height:`${Math.max(4,(v/maxClients)*100)}%`}} />
                <span className="text-xs text-neutral-600">{months[i].label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">{t("analytics_rev_plan")}</h2>
          <div className="space-y-4">
            {byPlan.map(p=>{
              const rev = p.clients * p.price
              const pct = mrr ? Math.round((rev / mrr) * 100) : 0
              return (
                <div key={p.plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-white">{p.plan}</span>
                    <span className="text-sm text-neutral-300">€{rev} <span className="text-neutral-600 text-xs">({pct}%)</span></span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} rounded-full transition-all duration-500`} style={{width:`${pct}%`}}/>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">{p.clients} client{p.clients>1?"s":""}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">{t("analytics_by_country")}</h2>
          <div className="space-y-3">
            {byCountry.length === 0
              ? <p className="text-neutral-500 text-sm">{t("no_data")}</p>
              : byCountry.map(([country, data])=>(
                <div key={country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{FLAGS[data.cc]??"🏳️"}</span>
                    <span className="text-sm text-neutral-300">{country}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{data.count} client{data.count>1?"s":""}</p>
                    {data.mrr > 0 && <p className="text-xs text-emerald-400">€{data.mrr}/mo</p>}
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">{t("analytics_top")}</h2>
          <div className="space-y-4">
            {topClients.length === 0
              ? <p className="text-neutral-500 text-sm">{t("no_data")}</p>
              : topClients.map((c,i)=>(
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-neutral-600 text-sm font-mono w-4">{i+1}</span>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {(c.firstName[0]??"")}{ (c.lastName[0]??"")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-neutral-500">{c.ordersCount} {t("analytics_orders_label")}</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">€{c.monthlyRevenue}/m</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {leads.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">{t("analytics_leads_sum")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label:t("leads_total"),       value: leads.length,                                  color:"text-white"        },
              { label:t("dash_confirmed"),     value: leads.filter(l=>l.status==="CONFIRMED").length, color:"text-emerald-400" },
              { label:t("status_pending"),     value: leads.filter(l=>l.status==="PENDING").length,   color:"text-amber-400"   },
              { label:t("dash_unreached"),     value: leads.filter(l=>l.status==="UNREACHED").length, color:"text-blue-400"    },
              { label:t("dash_confirm_rate"),  value: `${leads.length ? Math.round(leads.filter(l=>l.status==="CONFIRMED").length/leads.length*100) : 0}%`, color:"text-orange-400" },
            ].map(s=>(
              <div key={s.label} className="bg-neutral-800/50 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                <p className="text-xs text-neutral-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
