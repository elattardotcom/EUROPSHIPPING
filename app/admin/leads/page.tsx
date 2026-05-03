"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, AlertCircle, PhoneMissed, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AdminLead, LeadStatus } from "@/lib/db"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

const STATUS_CFG: Record<LeadStatus, { label:string; color:string; bg:string; Icon: React.ElementType }> = {
  CONFIRMED: { label:"Confirmé",    color:"text-emerald-400", bg:"bg-emerald-500/15 border-emerald-500/25", Icon: CheckCircle },
  PENDING:   { label:"En attente",  color:"text-amber-400",   bg:"bg-amber-500/15 border-amber-500/25",    Icon: Clock },
  UNREACHED: { label:"Pas répondu", color:"text-blue-400",    bg:"bg-blue-500/15 border-blue-500/25",      Icon: PhoneMissed },
  CANCELED:  { label:"Annulé",      color:"text-red-400",     bg:"bg-red-500/15 border-red-500/25",        Icon: XCircle },
  ERROR:     { label:"Erreur",      color:"text-rose-400",    bg:"bg-rose-600/15 border-rose-600/25",      Icon: AlertCircle },
}

const PER_PAGE = 10

export default function AdminLeads() {
  const [leads,   setLeads]   = useState<AdminLead[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [statF,   setStat]    = useState<LeadStatus | "ALL">("ALL")
  const [page,    setPage]    = useState(1)

  useEffect(() => {
    fetch("/api/admin/leads").then(r => r.json()).catch(() => []).then(d => { setLeads(d); setLoading(false) })
  }, [])

  const filtered = useMemo(() => leads.filter(l => {
    const ms  = `${l.customerName} ${l.clientName} ${l.product}`.toLowerCase().includes(search.toLowerCase())
    const mst = statF === "ALL" || l.status === statF
    return ms && mst
  }), [leads, search, statF])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const cur        = Math.min(page, totalPages)
  const rows       = filtered.slice((cur-1)*PER_PAGE, cur*PER_PAGE)
  const confirmed  = leads.filter(l=>l.status==="CONFIRMED").length
  const rate       = leads.length ? Math.round((confirmed / leads.length) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leads globaux</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Tous les leads de tous les clients de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {([
          { label:"Total",         value: leads.length,                                    status:"ALL",       border:"border-l-indigo-500"  },
          { label:"Confirmés",     value: confirmed,                                        status:"CONFIRMED", border:"border-l-emerald-500" },
          { label:"En attente",    value: leads.filter(l=>l.status==="PENDING").length,     status:"PENDING",   border:"border-l-amber-500"   },
          { label:"Pas répondu",   value: leads.filter(l=>l.status==="UNREACHED").length,   status:"UNREACHED", border:"border-l-blue-500"    },
          { label:"Taux confirm.", value: `${rate}%`,                                       status:"ALL",       border:"border-l-purple-500"  },
        ] as {label:string;value:string|number;status:string;border:string}[]).map(k=>(
          <button key={k.label} onClick={()=>{setStat(k.status as LeadStatus|"ALL");setPage(1)}}
            className={`bg-neutral-900 border border-neutral-800 border-l-4 ${k.border} rounded-xl p-4 text-left hover:border-neutral-700 transition-colors`}>
            <Users className="w-4 h-4 text-neutral-500 mb-2"/>
            <div className="text-2xl font-bold text-white mb-0.5">{loading ? "…" : k.value}</div>
            <p className="text-xs text-neutral-500">{k.label}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder="Rechercher un lead..."
            className="w-64 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="relative">
          <select value={statF} onChange={e=>{setStat(e.target.value as LeadStatus|"ALL");setPage(1)}}
            className="appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-indigo-500 cursor-pointer">
            <option value="ALL">Tous les statuts</option>
            {(Object.entries(STATUS_CFG) as [LeadStatus, typeof STATUS_CFG[LeadStatus]][]).map(([k,v])=>(
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none"/>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{loading ? "Chargement…" : `${filtered.length} leads trouvés`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Client final","Marchand","Pays","Produit","Valeur","Statut","Date"].map(h=>(
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">Chargement…</td></tr>
                : rows.length===0
                  ? <tr><td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">Aucun lead trouvé.</td></tr>
                  : rows.map(l=>{
                      const cfg = STATUS_CFG[l.status] ?? STATUS_CFG.ERROR
                      const Icon = cfg.Icon
                      return (
                        <tr key={l.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                          <td className="p-4">
                            <p className="text-white text-sm font-medium">{l.customerName}</p>
                            <p className="text-neutral-500 text-xs">{l.customerPhone}</p>
                          </td>
                          <td className="p-4"><span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">{l.clientName}</span></td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{FLAGS[l.countryCode]??"🏳️"}</span>
                              <span className="text-sm text-neutral-300">{l.country}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-neutral-300">{l.product}</td>
                          <td className="p-4 text-sm font-semibold text-white">€{l.value.toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                              <Icon className="w-3 h-3"/>{cfg.label}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-neutral-500 whitespace-nowrap">{l.createdAt}</td>
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
                className={`h-8 w-8 rounded-lg text-sm font-medium ${cur===p?"bg-indigo-600 text-white":"text-neutral-400 hover:text-white hover:bg-neutral-800"}`}>
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
