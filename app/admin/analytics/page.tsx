"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { TrendingUp, DollarSign, Users, ShoppingCart, ArrowUpRight, RefreshCw } from "lucide-react"
import type { Client, AdminOrder, AdminLead } from "@/lib/db"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

function getLast5Months() {
  const now = new Date()
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 4 + i, 1)
    return {
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      year:  d.getFullYear(),
      month: d.getMonth(),
    }
  })
}

export default function AdminAnalytics() {
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
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [load])

  const mrr       = clients.filter(c=>c.status==="active").reduce((s,c)=>s+c.monthlyRevenue,0)
  const arr       = mrr * 12
  const churn     = clients.filter(c=>c.status==="cancelled").length
  const churnRate = clients.length ? Math.round((churn / clients.length) * 100) : 0

  const months = useMemo(() => getLast5Months(), [])

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
      <p className="text-neutral-500 text-sm">Chargement des analytiques…</p>
    </div>
  )

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytiques</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Performance globale de la plateforme CODShip</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"MRR",           value:`€${mrr}`,      sub:"Revenu mensuel récurrent",   icon:DollarSign,  trend:null, color:"from-orange-500 to-red-600"     },
          { label:"ARR",           value:`€${arr}`,      sub:"Revenu annuel récurrent",     icon:TrendingUp,  trend:null, color:"from-emerald-500 to-teal-600"   },
          { label:"Total clients", value:clients.length, sub:`${churnRate}% churn rate`,    icon:Users,       trend:null, color:"from-orange-500 to-red-600"     },
          { label:"Taux livraison",value:`${orders.length ? Math.round(orders.filter(o=>o.status==="DELIVERED").length/orders.length*100) : 0}%`,
                                               sub:"Sur toutes les commandes",  icon:ShoppingCart,trend:null, color:"from-blue-500 to-cyan-600"      },
        ].map(k=>(
          <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center`}>
                <k.icon className="w-5 h-5 text-white"/>
              </div>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <ArrowUpRight className="w-3 h-3"/>Live
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
            <h2 className="font-semibold text-white">Évolution MRR</h2>
            <span className="text-xs text-orange-400 font-medium">5 derniers mois</span>
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
            <h2 className="font-semibold text-white">Croissance clients</h2>
            <span className="text-xs text-amber-400 font-medium">5 derniers mois</span>
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
          <h2 className="font-semibold text-white mb-5">Revenus par plan</h2>
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
          <h2 className="font-semibold text-white mb-5">Clients par pays</h2>
          <div className="space-y-3">
            {byCountry.length === 0
              ? <p className="text-neutral-500 text-sm">Aucune donnée.</p>
              : byCountry.map(([country, data])=>(
                <div key={country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{FLAGS[data.cc]??"🏳️"}</span>
                    <span className="text-sm text-neutral-300">{country}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{data.count} client{data.count>1?"s":""}</p>
                    {data.mrr > 0 && <p className="text-xs text-emerald-400">€{data.mrr}/mois</p>}
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">Top clients</h2>
          <div className="space-y-4">
            {topClients.length === 0
              ? <p className="text-neutral-500 text-sm">Aucune donnée.</p>
              : topClients.map((c,i)=>(
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-neutral-600 text-sm font-mono w-4">{i+1}</span>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-neutral-500">{c.ordersCount} commandes</p>
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
          <h2 className="font-semibold text-white mb-5">Résumé des leads</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label:"Total",       value: leads.length,                                  color:"text-white"         },
              { label:"Confirmés",   value: leads.filter(l=>l.status==="CONFIRMED").length, color:"text-emerald-400"  },
              { label:"En attente",  value: leads.filter(l=>l.status==="PENDING").length,   color:"text-amber-400"    },
              { label:"Pas répondu", value: leads.filter(l=>l.status==="UNREACHED").length, color:"text-blue-400"     },
              { label:"Taux confir.",value: `${leads.length ? Math.round(leads.filter(l=>l.status==="CONFIRMED").length/leads.length*100) : 0}%`, color:"text-orange-400" },
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
