"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { Search, ChevronDown, ArrowUpRight, Users, TrendingUp, DollarSign, Shield, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Client, Plan, UserStatus } from "@/lib/db"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

const PLAN_CFG: Record<Plan, { label: string; color: string }> = {
  enterprise: { label:"Enterprise", color:"bg-orange-500/20 text-orange-400 border-orange-500/25" },
  pro:        { label:"Pro",        color:"bg-amber-500/20  text-amber-400  border-amber-500/25"  },
  starter:    { label:"Starter",    color:"bg-neutral-500/20 text-neutral-400 border-neutral-500/25" },
}

const STATUS_CFG: Record<UserStatus, { label: string; color: string; dot: string }> = {
  active:    { label:"Actif",    color:"bg-emerald-500/15 text-emerald-400", dot:"bg-emerald-400" },
  trial:     { label:"Essai",    color:"bg-amber-500/15   text-amber-400",   dot:"bg-amber-400"   },
  suspended: { label:"Suspendu", color:"bg-red-500/15     text-red-400",     dot:"bg-red-400"     },
  cancelled: { label:"Annulé",   color:"bg-neutral-500/15 text-neutral-400", dot:"bg-neutral-500" },
}

const PER_PAGE = 8

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [planF,   setPlan]    = useState<Plan | "ALL">("ALL")
  const [statF,   setStat]    = useState<UserStatus | "ALL">("ALL")
  const [page,    setPage]    = useState(1)

  const load = useCallback(async () => {
    const d = await fetch("/api/admin/clients").then(r => r.json()).catch(() => [])
    setClients(Array.isArray(d) ? d : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [load])

  const filtered = useMemo(() => clients.filter(c => {
    const ms  = `${c.firstName} ${c.lastName} ${c.email} ${c.company}`.toLowerCase().includes(search.toLowerCase())
    const mp  = planF === "ALL" || c.plan === planF
    const mst = statF === "ALL" || c.status === statF
    return ms && mp && mst
  }), [clients, search, planF, statF])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const cur        = Math.min(page, totalPages)
  const rows       = filtered.slice((cur-1)*PER_PAGE, cur*PER_PAGE)
  const totalMRR   = clients.filter(c => c.status === "active").reduce((s,c) => s + c.monthlyRevenue, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gestion de tous les comptes de la plateforme</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />Actualiser
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total clients", value: clients.length,                                      icon: Users,      color:"border-l-orange-500"  },
          { label:"Actifs",        value: clients.filter(c=>c.status==="active").length,        icon: Shield,     color:"border-l-emerald-500" },
          { label:"En essai",      value: clients.filter(c=>c.status==="trial").length,         icon: TrendingUp, color:"border-l-amber-500"   },
          { label:"MRR total",     value: `€${totalMRR}`,                                       icon: DollarSign, color:"border-l-orange-400"  },
        ].map(k => (
          <div key={k.label} className={`bg-neutral-900 border border-neutral-800 border-l-4 ${k.color} rounded-xl p-4`}>
            <k.icon className="w-4 h-4 text-neutral-500 mb-3" />
            <div className="text-2xl font-bold text-white mb-0.5">{loading ? "…" : k.value}</div>
            <p className="text-xs text-neutral-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder="Rechercher un client..."
            className="w-64 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
        </div>
        {[
          { value: planF, set: (v:string)=>{setPlan(v as Plan|"ALL");setPage(1)}, opts:[
            {v:"ALL",l:"Tous les plans"},{v:"enterprise",l:"Enterprise"},{v:"pro",l:"Pro"},{v:"starter",l:"Starter"}
          ]},
          { value: statF, set: (v:string)=>{setStat(v as UserStatus|"ALL");setPage(1)}, opts:[
            {v:"ALL",l:"Tous les statuts"},{v:"active",l:"Actif"},{v:"trial",l:"Essai"},{v:"suspended",l:"Suspendu"},{v:"cancelled",l:"Annulé"}
          ]},
        ].map((f,i) => (
          <div key={i} className="relative">
            <select value={f.value} onChange={e=>f.set(e.target.value)}
              className="appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
              {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{loading ? "Chargement…" : `${filtered.length} clients trouvés`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Client","Pays","Plan","Statut","Boutiques","Commandes","Leads","MRR","Membre depuis",""].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={10} className="py-12 text-center text-neutral-500 text-sm">Chargement…</td></tr>
                : rows.length === 0
                  ? <tr><td colSpan={10} className="py-12 text-center text-neutral-500 text-sm">Aucun client trouvé.</td></tr>
                  : rows.map(c => (
                    <tr key={c.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {c.firstName[0]}{c.lastName[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium whitespace-nowrap">{c.firstName} {c.lastName}</p>
                            <p className="text-neutral-500 text-xs">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{FLAGS[c.countryCode]??"🏳️"}</span>
                          <span className="text-sm text-neutral-300 whitespace-nowrap">{c.country}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${PLAN_CFG[c.plan].color}`}>
                          {PLAN_CFG[c.plan].label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_CFG[c.status].color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[c.status].dot}`} />
                          {STATUS_CFG[c.status].label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-neutral-300 text-center">{c.storesCount}</td>
                      <td className="p-4 text-sm text-neutral-300 text-center">{c.ordersCount}</td>
                      <td className="p-4 text-sm text-neutral-300 text-center">{c.leadsCount}</td>
                      <td className="p-4"><span className="text-sm font-semibold text-emerald-400">€{c.monthlyRevenue}</span></td>
                      <td className="p-4 text-sm text-neutral-500 whitespace-nowrap">{c.joinedAt}</td>
                      <td className="p-4">
                        <Link href={`/admin/clients/${c.id}`}>
                          <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 gap-1 h-7 text-xs">
                            Voir <ArrowUpRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-neutral-800 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            {filtered.length===0?0:(cur-1)*PER_PAGE+1}–{Math.min(cur*PER_PAGE,filtered.length)} sur {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
              disabled={cur===1} onClick={()=>setPage(p=>p-1)}><ChevronLeft className="w-4 h-4"/></Button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)}
                className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${cur===p?"bg-orange-500 text-white":"text-neutral-400 hover:text-white hover:bg-neutral-800"}`}>
                {p}
              </button>
            ))}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
              disabled={cur===totalPages} onClick={()=>setPage(p=>p+1)}><ChevronRight className="w-4 h-4"/></Button>
          </div>
        </div>
      </div>
    </div>
  )
}
