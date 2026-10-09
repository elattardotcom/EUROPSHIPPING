"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Search, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, AlertCircle, PhoneMissed, Users, RefreshCw, Radio, Loader2, PhoneCall } from "lucide-react"
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

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <PhoneCall className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-neutral-400">
          No telephony provider is connected — outcomes below are recorded manually by whoever calls each lead.
          Add a call-center provider on the <a href="/admin/providers" className="text-orange-400 hover:text-orange-300">Providers</a> page once one is ready to integrate.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {([
          { label:t("leads_total"),        value:leads.length,                                  status:"ALL",       grad: "linear-gradient(135deg,#f97316,#dc2626)", border: "rgba(249,115,22,0.25)", glow: "rgba(249,115,22,0.08)" },
          { label:t("leads_confirmed"),    value:confirmed,                                     status:"CONFIRMED", grad: "linear-gradient(135deg,#10b981,#059669)", border: "rgba(16,185,129,0.25)", glow: "rgba(16,185,129,0.08)" },
          { label:t("leads_pending"),      value:leads.filter(l=>l.status==="PENDING").length,  status:"PENDING",   grad: "linear-gradient(135deg,#f59e0b,#d97706)", border: "rgba(245,158,11,0.25)", glow: "rgba(245,158,11,0.08)" },
          { label:t("leads_unreached"),    value:leads.filter(l=>l.status==="UNREACHED").length,status:"UNREACHED", grad: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "rgba(59,130,246,0.25)", glow: "rgba(59,130,246,0.08)" },
          { label:t("leads_confirm_rate"), value:`${rate}%`,                                    status:"ALL",       grad: "linear-gradient(135deg,#f97316,#ea580c)", border: "rgba(249,115,22,0.25)", glow: "rgba(249,115,22,0.08)" },
        ] as {label:string;value:string|number;status:string;grad:string;border:string;glow:string}[]).map(k=>(
          <button key={k.label} onClick={()=>{setStat(k.status as LeadStatus|"ALL");setPage(1)}}
            className="relative rounded-2xl p-5 overflow-hidden text-left transition-all hover:-translate-y-0.5"
            style={{ background: "#111", border: `1px solid ${k.border}` }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ background: k.grad }} />
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: k.grad, opacity: 0.7 }} />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: k.glow, border: `1px solid ${k.border}` }}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-white mb-0.5">{loading?"…":k.value}</div>
              <p className="text-xs text-neutral-400 font-medium">{k.label}</p>
            </div>
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
                {[t("leads_th_customer"),t("leads_th_merchant"),t("leads_th_country"),t("leads_th_product"),t("leads_th_value"),t("leads_th_status"),"Attempts",t("leads_th_date"),"Action"].map(h=>(
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
