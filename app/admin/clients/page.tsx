"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { Search, ChevronDown, ArrowUpRight, Users, TrendingUp, DollarSign, Shield, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Client, Plan, UserStatus } from "@/lib/db"
import { useI18n } from "@/lib/admin-i18n"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

const PLAN_COLORS: Record<Plan, string> = {
  enterprise: "bg-orange-500/20 text-orange-400 border-orange-500/25",
  pro:        "bg-amber-500/20  text-amber-400  border-amber-500/25",
  starter:    "bg-neutral-500/20 text-neutral-400 border-neutral-500/25",
}

const STATUS_DOTS: Record<UserStatus, string> = {
  active:    "bg-emerald-400",
  trial:     "bg-amber-400",
  suspended: "bg-red-400",
  cancelled: "bg-neutral-500",
}

const STATUS_BG: Record<UserStatus, string> = {
  active:    "bg-emerald-500/15 text-emerald-400",
  trial:     "bg-amber-500/15   text-amber-400",
  suspended: "bg-red-500/15     text-red-400",
  cancelled: "bg-neutral-500/15 text-neutral-400",
}

const PER_PAGE = 8

export default function AdminClients() {
  const { t } = useI18n()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [planF,   setPlan]    = useState<Plan | "ALL">("ALL")
  const [statF,   setStat]    = useState<UserStatus | "ALL">("ALL")
  const [page,    setPage]    = useState(1)

  const STATUS_LABELS: Record<UserStatus, string> = {
    active:    t("status_active"),
    trial:     t("status_trial"),
    suspended: t("status_suspended"),
    cancelled: t("status_cancelled"),
  }

  const load = useCallback(async () => {
    const d = await fetch("/api/admin/clients").then(r => r.json()).catch(() => [])
    setClients(Array.isArray(d) ? d : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const i = setInterval(load, 30_000)
    return () => clearInterval(i)
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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{t("clients_title")}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{t("clients_sub")}</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />{t("refresh")}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:t("clients_total"),    value: clients.length,                                icon: Users,      color:"border-l-orange-500"  },
          { label:t("clients_active"),   value: clients.filter(c=>c.status==="active").length, icon: Shield,     color:"border-l-emerald-500" },
          { label:t("clients_trial"),    value: clients.filter(c=>c.status==="trial").length,  icon: TrendingUp, color:"border-l-amber-500"   },
          { label:t("dash_mrr"),         value: `€${totalMRR}`,                                icon: DollarSign, color:"border-l-orange-400"  },
        ].map(k => (
          <div key={k.label} className={`bg-neutral-900 border border-neutral-800 border-l-4 ${k.color} rounded-xl p-4`}>
            <k.icon className="w-4 h-4 text-neutral-500 mb-3" />
            <div className="text-2xl font-bold text-white mb-0.5">{loading ? "…" : k.value}</div>
            <p className="text-xs text-neutral-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder={t("clients_search")}
            className="w-full sm:w-64 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:flex-none">
            <select value={planF} onChange={e=>{setPlan(e.target.value as Plan|"ALL");setPage(1)}}
              className="w-full appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
              <option value="ALL">{t("clients_all_plans")}</option>
              <option value="enterprise">Enterprise</option>
              <option value="pro">Pro</option>
              <option value="starter">Starter</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
          </div>
          <div className="relative flex-1 sm:flex-none">
            <select value={statF} onChange={e=>{setStat(e.target.value as UserStatus|"ALL");setPage(1)}}
              className="w-full appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
              <option value="ALL">{t("clients_all_status")}</option>
              {(Object.entries(STATUS_LABELS) as [UserStatus, string][]).map(([k,v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{loading ? t("loading") : `${filtered.length} clients`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {[t("clients_th_client"),"",t("clients_th_plan"),t("clients_th_status"),t("clients_th_stores"),t("clients_th_orders"),t("clients_th_leads"),t("clients_th_mrr"),t("clients_th_joined"),""].map((h,i) => (
                  <th key={i} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={10} className="py-12 text-center text-neutral-500 text-sm">{t("loading")}</td></tr>
                : rows.length === 0
                  ? <tr><td colSpan={10} className="py-12 text-center text-neutral-500 text-sm">{t("clients_none")}</td></tr>
                  : rows.map(c => (
                    <tr key={c.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {(c.firstName[0]??"")}{ (c.lastName[0]??"")}
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
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${PLAN_COLORS[c.plan]??PLAN_COLORS.starter}`}>
                          {c.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BG[c.status]??""}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[c.status]??""}`} />
                          {STATUS_LABELS[c.status]??c.status}
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
                            View <ArrowUpRight className="w-3 h-3" />
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
            {filtered.length===0?0:(cur-1)*PER_PAGE+1}–{Math.min(cur*PER_PAGE,filtered.length)} / {filtered.length}
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
