"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Search, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, AlertCircle, PhoneMissed, Users, RefreshCw, Radio, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AdminLead, LeadStatus } from "@/lib/db"
import { useI18n } from "@/lib/admin-i18n"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }
const STATUS_STYLE: Record<LeadStatus, { color:string; bg:string; Icon:React.ElementType }> = {
  CONFIRMED: { color:"text-emerald-400", bg:"bg-emerald-500/15 border-emerald-500/25", Icon:CheckCircle },
  PENDING:   { color:"text-amber-400",   bg:"bg-amber-500/15 border-amber-500/25",    Icon:Clock       },
  UNREACHED: { color:"text-blue-400",    bg:"bg-blue-500/15 border-blue-500/25",      Icon:PhoneMissed },
  CANCELED:  { color:"text-red-400",     bg:"bg-red-500/15 border-red-500/25",        Icon:XCircle     },
  ERROR:     { color:"text-rose-400",    bg:"bg-rose-600/15 border-rose-600/25",      Icon:AlertCircle },
}
const PER_PAGE = 10

export default function AdminLeads() {
  const { t } = useI18n()
  const [leads,    setLeads]   = useState<AdminLead[]>([])
  const [loading,  setLoading] = useState(true)
  const [search,   setSearch]  = useState("")
  const [statF,    setStat]    = useState<LeadStatus | "ALL">("ALL")
  const [page,     setPage]    = useState(1)
  const [live,     setLive]    = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  // Track recently locally-updated leads so auto-refresh doesn't overwrite them
  const localUpdates = useRef<Map<string, { status: LeadStatus; attempts: number; ts: number }>>(new Map())

  const updateStatus = useCallback(async (leadId: string, status: LeadStatus) => {
    setUpdating(leadId)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setLeads(prev => prev.map(l => {
          if (l.id !== leadId) return l
          const newAttempts = status === "UNREACHED" ? (l.attempts ?? 0) + 1 : l.attempts
          localUpdates.current.set(leadId, { status, attempts: newAttempts, ts: Date.now() })
          return { ...l, status, attempts: newAttempts }
        }))
      }
    } finally {
      setUpdating(null)
    }
  }, [])

  const STATUS_LABELS: Record<LeadStatus, string> = {
    CONFIRMED: t("status_confirmed"), PENDING: t("status_pending"),
    UNREACHED: t("status_unreached"), CANCELED: t("status_canceled"), ERROR: t("status_error"),
  }

  const load = useCallback(async () => {
    const d = await fetch("/api/admin/leads").then(r => r.json()).catch(() => [])
    if (!Array.isArray(d)) { setLoading(false); setLive(true); return }
    // Preserve local changes made within the last 15 seconds
    const now = Date.now()
    setLeads(d.map((l: AdminLead) => {
      const local = localUpdates.current.get(l.id)
      if (local && now - local.ts < 15_000) {
        return { ...l, status: local.status, attempts: local.attempts }
      }
      localUpdates.current.delete(l.id)
      return l
    }))
    setLoading(false)
    setLive(true)
  }, [])

  useEffect(() => { load(); const i = setInterval(load, 5_000); return () => clearInterval(i) }, [load])

  const filtered = useMemo(() => leads.filter(l => {
    const ms  = `${l.customerName} ${l.clientName} ${l.product}`.toLowerCase().includes(search.toLowerCase())
    const mst = statF === "ALL" || l.status === statF
    return ms && mst
  }), [leads, search, statF])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const cur        = Math.min(page, totalPages)
  const rows       = filtered.slice((cur-1)*PER_PAGE, cur*PER_PAGE)
  const confirmed  = leads.filter(l=>l.status==="CONFIRMED").length
  const rate       = leads.length ? Math.round((confirmed/leads.length)*100) : 0

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{t("leads_title")}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{t("leads_sub")}</p>
        </div>
        <div className="flex items-center gap-3">
          {live && <span className="flex items-center gap-1.5 text-xs text-emerald-400"><Radio className="w-3 h-3 animate-pulse"/>{t("live")}</span>}
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5"/>{t("refresh")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {([
          { label:t("leads_total"),        value:leads.length,                                  status:"ALL",       border:"border-l-orange-500"  },
          { label:t("leads_confirmed"),    value:confirmed,                                     status:"CONFIRMED", border:"border-l-emerald-500" },
          { label:t("leads_pending"),      value:leads.filter(l=>l.status==="PENDING").length,  status:"PENDING",   border:"border-l-amber-500"   },
          { label:t("leads_unreached"),    value:leads.filter(l=>l.status==="UNREACHED").length,status:"UNREACHED", border:"border-l-blue-500"    },
          { label:t("leads_confirm_rate"), value:`${rate}%`,                                    status:"ALL",       border:"border-l-orange-400"  },
        ] as {label:string;value:string|number;status:string;border:string}[]).map(k=>(
          <button key={k.label} onClick={()=>{setStat(k.status as LeadStatus|"ALL");setPage(1)}}
            className={`bg-neutral-900 border border-neutral-800 border-l-4 ${k.border} rounded-xl p-4 text-left hover:border-neutral-700 transition-colors`}>
            <Users className="w-4 h-4 text-neutral-500 mb-2"/>
            <div className="text-2xl font-bold text-white mb-0.5">{loading?"…":k.value}</div>
            <p className="text-xs text-neutral-500">{k.label}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder={t("leads_search")}
            className="w-full sm:w-64 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500"/>
        </div>
        <div className="relative">
          <select value={statF} onChange={e=>{setStat(e.target.value as LeadStatus|"ALL");setPage(1)}}
            className="w-full sm:w-auto appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer">
            <option value="ALL">{t("leads_all_status")}</option>
            {(Object.entries(STATUS_LABELS) as [LeadStatus,string][]).map(([k,v])=>(
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none"/>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{loading?t("loading"):`${filtered.length} leads`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {[t("leads_th_customer"),t("leads_th_merchant"),t("leads_th_country"),t("leads_th_product"),t("leads_th_value"),t("leads_th_status"),"Tentatives",t("leads_th_date"),"Action"].map(h=>(
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={9} className="py-12 text-center text-neutral-500 text-sm">{t("loading")}</td></tr>
                : rows.length===0
                  ? <tr><td colSpan={9} className="py-12 text-center text-neutral-500 text-sm">{t("leads_none")}</td></tr>
                  : rows.map(l=>{
                      const cfg = STATUS_STYLE[l.status] ?? STATUS_STYLE.ERROR
                      const Icon = cfg.Icon
                      const isUpdating = updating === l.id
                      return (
                        <tr key={l.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                          <td className="p-4">
                            <p className="text-white text-sm font-medium">{l.customerName||"—"}</p>
                            <p className="text-neutral-500 text-xs">{l.customerPhone}</p>
                          </td>
                          <td className="p-4"><span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">{l.clientName}</span></td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{FLAGS[l.countryCode]??"🏳️"}</span>
                              <span className="text-sm text-neutral-300">{l.country}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-neutral-300">{l.product||"—"}</td>
                          <td className="p-4 text-sm font-semibold text-white">€{(l.value??0).toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                              <Icon className="w-3 h-3"/>{STATUS_LABELS[l.status]??l.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              min={0}
                              value={l.attempts ?? 0}
                              onChange={e => {
                                const val = Math.max(0, parseInt(e.target.value) || 0)
                                setLeads(prev => prev.map(x => x.id === l.id ? { ...x, attempts: val } : x))
                              }}
                              onBlur={async e => {
                                const val = Math.max(0, parseInt(e.target.value) || 0)
                                await fetch(`/api/admin/leads/${l.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ attempts: val }),
                                })
                                localUpdates.current.set(l.id, { status: l.status, attempts: val, ts: Date.now() })
                              }}
                              className={`w-14 text-center text-xs font-semibold px-2 py-1.5 rounded-lg border focus:outline-none focus:border-orange-500 transition-colors bg-neutral-800 ${(l.attempts ?? 0) >= 3 ? "border-red-500/30 text-red-400" : "border-neutral-700 text-blue-400"}`}
                            />
                          </td>
                          <td className="p-4 text-sm text-neutral-500 whitespace-nowrap">{l.createdAt}</td>
                          <td className="p-4">
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin text-neutral-400"/>
                            ) : (
                              <div className="relative">
                                <select
                                  value={l.status}
                                  onChange={e => updateStatus(l.id, e.target.value as LeadStatus)}
                                  className="appearance-none bg-neutral-800 border border-neutral-700 rounded-lg pl-3 pr-7 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer hover:border-neutral-600 transition-colors"
                                >
                                  <option value="PENDING">{STATUS_LABELS.PENDING}</option>
                                  <option value="CONFIRMED">{STATUS_LABELS.CONFIRMED}</option>
                                  <option value="UNREACHED">{STATUS_LABELS.UNREACHED}</option>
                                  <option value="CANCELED">{STATUS_LABELS.CANCELED}</option>
                                  <option value="ERROR">{STATUS_LABELS.ERROR}</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none"/>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
              }
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-neutral-800 flex items-center justify-between">
          <p className="text-xs text-neutral-500">{filtered.length===0?0:(cur-1)*PER_PAGE+1}–{Math.min(cur*PER_PAGE,filtered.length)} / {filtered.length}</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800" disabled={cur===1} onClick={()=>setPage(p=>p-1)}><ChevronLeft className="w-4 h-4"/></Button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} className={`h-8 w-8 rounded-lg text-sm font-medium ${cur===p?"bg-orange-500 text-white":"text-neutral-400 hover:text-white hover:bg-neutral-800"}`}>{p}</button>
            ))}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800" disabled={cur===totalPages} onClick={()=>setPage(p=>p+1)}><ChevronRight className="w-4 h-4"/></Button>
          </div>
        </div>
      </div>
    </div>
  )
}
