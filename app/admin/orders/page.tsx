"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Search, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Clock, Truck, XCircle, AlertCircle, ShoppingCart, RefreshCw, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AdminOrder, OrderStatus } from "@/lib/db"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

const STATUS_CFG: Record<OrderStatus, { label:string; color:string; Icon: React.ElementType }> = {
  PENDING:   { label:"En attente", color:"text-amber-400",   Icon: Clock },
  SHIPPED:   { label:"Expédié",    color:"text-blue-400",    Icon: Truck },
  DELIVERED: { label:"Livré",      color:"text-emerald-400", Icon: CheckCircle },
  RETURNED:  { label:"Retourné",   color:"text-red-400",     Icon: XCircle },
  ERROR:     { label:"Erreur",     color:"text-rose-400",    Icon: AlertCircle },
}

const PER_PAGE = 10

export default function AdminOrders() {
  const [orders,  setOrders]  = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [statF,   setStat]    = useState<OrderStatus | "ALL">("ALL")
  const [page,    setPage]    = useState(1)
  const [live,    setLive]    = useState(false)

  const load = useCallback(async () => {
    const d = await fetch("/api/admin/orders").then(r => r.json()).catch(() => [])
    setOrders(Array.isArray(d) ? d : [])
    setLoading(false)
    setLive(true)
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 5_000)
    return () => clearInterval(t)
  }, [load])

  const filtered = useMemo(() => orders.filter(o => {
    const ms  = `${o.customerName} ${o.clientName} ${o.product} ${o.trackingNumber??""}`
      .toLowerCase().includes(search.toLowerCase())
    const mst = statF === "ALL" || o.status === statF
    return ms && mst
  }), [orders, search, statF])

  const totalPages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const cur          = Math.min(page, totalPages)
  const rows         = filtered.slice((cur-1)*PER_PAGE, cur*PER_PAGE)
  const totalRevenue = orders.filter(o=>o.status==="DELIVERED").reduce((s,o)=>s+o.value,0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Commandes globales</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Toutes les commandes de tous les clients</p>
        </div>
        <div className="flex items-center gap-3">
          {live && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Radio className="w-3 h-3 animate-pulse" />
              Live
            </span>
          )}
          <button onClick={load}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />Actualiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {([
          { label:"Total",      value: orders.length,                                     status:"ALL",       border:"border-l-orange-500"  },
          { label:"En attente", value: orders.filter(o=>o.status==="PENDING").length,     status:"PENDING",   border:"border-l-amber-500"   },
          { label:"Expédiés",   value: orders.filter(o=>o.status==="SHIPPED").length,     status:"SHIPPED",   border:"border-l-blue-500"    },
          { label:"Livrés",     value: orders.filter(o=>o.status==="DELIVERED").length,   status:"DELIVERED", border:"border-l-emerald-500" },
          { label:"Retournés",  value: orders.filter(o=>o.status==="RETURNED").length,    status:"RETURNED",  border:"border-l-red-500"     },
        ] as {label:string;value:number;status:string;border:string}[]).map(k => (
          <button key={k.label} onClick={()=>{setStat(k.status as OrderStatus|"ALL");setPage(1)}}
            className={`bg-neutral-900 border border-neutral-800 border-l-4 ${k.border} rounded-xl p-4 text-left hover:border-neutral-700 transition-colors`}>
            <ShoppingCart className="w-4 h-4 text-neutral-500 mb-2" />
            <div className="text-2xl font-bold text-white mb-0.5">{loading ? "…" : k.value}</div>
            <p className="text-xs text-neutral-500">{k.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-emerald-400 text-sm font-medium">Revenus totaux livrés</p>
          <p className="text-3xl font-extrabold text-white mt-1">€{loading ? "…" : totalRevenue.toFixed(2)}</p>
        </div>
        <CheckCircle className="w-12 h-12 text-emerald-500/30" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder="Rechercher..."
            className="w-64 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
        </div>
        <div className="relative">
          <select value={statF} onChange={e=>{setStat(e.target.value as OrderStatus|"ALL");setPage(1)}}
            className="appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
            <option value="ALL">Tous les statuts</option>
            {(Object.entries(STATUS_CFG) as [OrderStatus, typeof STATUS_CFG[OrderStatus]][]).map(([k,v])=>(
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{loading ? "Chargement…" : `${filtered.length} commandes trouvées`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Client final","Marchand","Pays","Produit","Valeur","N° Suivi","Statut","Date"].map(h=>(
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={8} className="py-12 text-center text-neutral-500 text-sm">Chargement…</td></tr>
                : rows.length === 0
                  ? <tr><td colSpan={8} className="py-12 text-center text-neutral-500 text-sm">Aucune commande trouvée.</td></tr>
                  : rows.map(o=>{
                      const cfg = STATUS_CFG[o.status] ?? STATUS_CFG.ERROR
                      const Icon = cfg.Icon
                      return (
                        <tr key={o.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                          <td className="p-4 text-sm text-white whitespace-nowrap">{o.customerName}</td>
                          <td className="p-4"><span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">{o.clientName}</span></td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{FLAGS[o.countryCode]??"🏳️"}</span>
                              <span className="text-sm text-neutral-300">{o.country}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-neutral-300">{o.product}</td>
                          <td className="p-4 text-sm font-semibold text-white">€{o.value.toFixed(2)}</td>
                          <td className="p-4">
                            {o.trackingNumber
                              ? <code className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">{o.trackingNumber}</code>
                              : <span className="text-neutral-600 text-xs">—</span>
                            }
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                              <Icon className="w-3 h-3"/>{cfg.label}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-neutral-500 whitespace-nowrap">{o.createdAt}</td>
                        </tr>
                      )
                    })
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
                className={`h-8 w-8 rounded-lg text-sm font-medium ${cur===p?"bg-orange-500 text-white":"text-neutral-400 hover:text-white hover:bg-neutral-800"}`}>
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
