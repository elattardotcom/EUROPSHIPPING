"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users, ShoppingCart, DollarSign, TrendingUp, UserCheck,
  ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle, Clock,
} from "lucide-react"
import type { Client, AdminOrder } from "@/lib/db"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

const PLAN_COLORS: Record<string, string> = {
  enterprise: "bg-indigo-500/20 text-indigo-400",
  pro:        "bg-purple-500/20 text-purple-400",
  starter:    "bg-blue-500/20   text-blue-400",
}

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-emerald-500/15 text-emerald-400",
  trial:     "bg-amber-500/15   text-amber-400",
  suspended: "bg-red-500/15     text-red-400",
  cancelled: "bg-neutral-500/15 text-neutral-400",
}

const STATUS_LABELS: Record<string, string> = {
  active:"Actif", trial:"Essai", suspended:"Suspendu", cancelled:"Annulé",
}

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label:"En attente", color:"text-amber-400",   bg:"bg-amber-500/10"   },
  SHIPPED:   { label:"Expédié",    color:"text-blue-400",    bg:"bg-blue-500/10"    },
  DELIVERED: { label:"Livré",      color:"text-emerald-400", bg:"bg-emerald-500/10" },
  RETURNED:  { label:"Retourné",   color:"text-red-400",     bg:"bg-red-500/10"     },
  ERROR:     { label:"Erreur",     color:"text-rose-400",    bg:"bg-rose-500/10"    },
}

export default function AdminDashboard() {
  const [clients, setClients]   = useState<Client[]>([])
  const [orders,  setOrders]    = useState<AdminOrder[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/clients").then(r => r.json()).catch(() => []),
      fetch("/api/admin/orders").then(r => r.json()).catch(() => []),
    ]).then(([c, o]) => { setClients(c); setOrders(o); setLoading(false) })
  }, [])

  const active    = clients.filter(c => c.status === "active")
  const mrr       = active.reduce((s, c) => s + c.monthlyRevenue, 0)
  const delivered = orders.filter(o => o.status === "DELIVERED").length
  const leads     = 0 // loaded separately if needed

  const kpis = [
    { label:"Clients actifs",  value: active.length,    icon: Users,       color:"from-indigo-500 to-purple-600", sub:`${clients.filter(c=>c.status==="trial").length} en essai`,       trend:+12 },
    { label:"MRR",             value: `€${mrr}`,        icon: DollarSign,  color:"from-emerald-500 to-teal-600",  sub:`ARR €${mrr * 12}`,                                               trend:+8.3 },
    { label:"Total commandes", value: orders.length,    icon: ShoppingCart,color:"from-orange-500 to-red-600",    sub:`${orders.length ? Math.round(delivered/orders.length*100) : 0}% livraison`, trend:+5.1 },
    { label:"Total clients",   value: clients.length,   icon: UserCheck,   color:"from-blue-500 to-cyan-600",     sub:`${clients.filter(c=>c.plan==="enterprise").length} enterprise`,   trend:+14.2 },
  ]

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <p className="text-neutral-500 text-sm">Chargement…</p>
    </div>
  )

  const recent  = clients.slice(0, 5)
  const recentO = orders.slice(0, 6)

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Vue d'ensemble</h1>
        <p className="text-neutral-500 text-sm mt-1">Statistiques globales de la plateforme CODShip</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center shadow-lg`}>
                <k.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${k.trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {k.trend >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                {Math.abs(k.trend)}%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">{k.value}</div>
            <p className="text-xs text-neutral-500">{k.label}</p>
            <p className="text-xs text-neutral-600 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label:"Boutiques connectées", value: clients.reduce((s,c)=>s+c.storesCount,0), total: clients.reduce((s,c)=>s+c.storesCount,0), color:"text-emerald-400", icon: CheckCircle },
          { label:"Clients en essai",     value: clients.filter(c=>c.status==="trial").length,     total: clients.length, color:"text-amber-400",   icon: Clock },
          { label:"Comptes suspendus",    value: clients.filter(c=>c.status==="suspended").length,  total: clients.length, color:"text-red-400",     icon: AlertCircle },
        ].map(h => (
          <div key={h.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
            <h.icon className={`w-8 h-8 ${h.color} flex-shrink-0`} />
            <div>
              <div className="text-2xl font-bold text-white">{h.value} <span className="text-sm text-neutral-600">/ {h.total}</span></div>
              <p className="text-xs text-neutral-500">{h.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">Derniers clients</h2>
            <Link href="/admin/clients" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Voir tous <ArrowUpRight className="w-3 h-3"/></Link>
          </div>
          <div className="divide-y divide-neutral-800">
            {recent.map(c => (
              <Link key={c.id} href={`/admin/clients/${c.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-800/40 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium group-hover:text-indigo-300 transition-colors">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-neutral-500">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{FLAGS[c.countryCode] ?? "🏳️"}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[c.plan]}`}>{c.plan}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                </div>
              </Link>
            ))}
            {recent.length === 0 && <p className="p-5 text-neutral-500 text-sm">Aucun client.</p>}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">Dernières commandes</h2>
            <Link href="/admin/orders" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Voir toutes <ArrowUpRight className="w-3 h-3"/></Link>
          </div>
          <div className="divide-y divide-neutral-800">
            {recentO.map(o => {
              const s = ORDER_STATUS[o.status] ?? ORDER_STATUS.ERROR
              return (
                <div key={o.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-800/40 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{o.customerName}</p>
                    <p className="text-xs text-neutral-500">{o.clientName} · {FLAGS[o.countryCode]} {o.country}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-sm font-semibold text-white">€{o.value.toFixed(2)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.color}`}>{s.label}</span>
                  </div>
                </div>
              )
            })}
            {recentO.length === 0 && <p className="p-5 text-neutral-500 text-sm">Aucune commande.</p>}
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-5">Revenus par plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { plan:"Enterprise", price:89, color:"from-indigo-500 to-purple-600", bar:"bg-indigo-500" },
            { plan:"Pro",        price:59, color:"from-purple-500 to-violet-600",  bar:"bg-purple-500" },
            { plan:"Starter",    price:29, color:"from-blue-500 to-cyan-600",      bar:"bg-blue-500"   },
          ].map(r => {
            const count = active.filter(c => c.plan === r.plan.toLowerCase()).length
            const rev   = count * r.price
            return (
              <div key={r.plan} className="bg-neutral-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${r.color} text-white text-xs font-bold`}>{r.plan}</div>
                  <span className="text-neutral-500 text-xs">{count} client{count > 1 ? "s" : ""}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">€{rev}<span className="text-sm text-neutral-500 font-normal">/mois</span></div>
                <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                  <div className={`h-full ${r.bar} rounded-full`} style={{ width: `${Math.min(100, (rev/400)*100)}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
