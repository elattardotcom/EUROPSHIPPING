"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronDown, ArrowUpRight, Users, TrendingUp, DollarSign, Shield, RefreshCw, Ban, CheckCircle, Loader2, Clock, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Client, Plan, UserStatus } from "@/lib/db"
import { useI18n } from "@/lib/admin-i18n"
import { exportToCSV } from "@/lib/mock-data"
import { PageHeader } from "@/components/admin/page-header"
import { KpiCard } from "@/components/admin/kpi-card"
import { StatusBadge, type StatusTone } from "@/components/admin/status-badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import {
  TableCard, TableToolbar, TablePagination,
  TableShell, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/admin/data-table"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

const PLAN_COLORS: Record<Plan, string> = {
  enterprise: "bg-orange-50 text-orange-700 border-orange-200",
  pro:        "bg-amber-50  text-amber-700  border-amber-200",
  starter:    "bg-neutral-100 text-neutral-600 border-neutral-200",
}

const STATUS_TONE: Record<UserStatus, StatusTone> = {
  active:    "success",
  trial:     "warning",
  suspended: "danger",
  cancelled: "neutral",
}

const PER_PAGE = 8

function formatLastLogin(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH   = Math.floor(diffMs / 3600000)
  const diffD   = Math.floor(diffMs / 86400000)
  if (diffMin < 1)  return "Just now"
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffH   < 24) return `${diffH}h ago`
  if (diffD   < 2)  return "Yesterday"
  if (diffD   < 7)  return `${diffD}d ago`
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function AdminClients() {
  const { t } = useI18n()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [planF,   setPlan]    = useState<Plan | "ALL">("ALL")
  const [statF,   setStat]    = useState<UserStatus | "ALL">("ALL")
  const [page,      setPage]      = useState(1)
  const [toggling,  setToggling]  = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Client | null>(null)

  async function confirmToggleSuspend() {
    if (!confirmTarget) return
    const c = confirmTarget
    const newStatus = c.status === "suspended" ? "active" : "suspended"
    setToggling(c.id)
    await fetch(`/api/admin/clients/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    setClients(prev => prev.map(x => x.id === c.id ? { ...x, status: newStatus } : x))
    setToggling(null)
    setConfirmTarget(null)
  }

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

  const handleExport = () => {
    exportToCSV(
      filtered.map(c => ({
        ID: c.id, "First name": c.firstName, "Last name": c.lastName, Email: c.email,
        Phone: c.phone, Company: c.company, Country: c.country, Plan: c.plan, Status: c.status,
        "Monthly revenue (EUR)": c.monthlyRevenue.toFixed(2), "Joined at": c.joinedAt,
      })),
      "clients_codshipeurope.csv"
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title={t("clients_title")}
        subtitle={t("clients_sub")}
        actions={
          <button onClick={load}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#17191D] text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />{t("refresh")}
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label={t("clients_total")} value={loading ? "…" : clients.length} icon={Users} />
        <KpiCard label={t("clients_active")} value={loading ? "…" : clients.filter(c=>c.status==="active").length} icon={Shield} />
        <KpiCard label={t("clients_trial")} value={loading ? "…" : clients.filter(c=>c.status==="trial").length} icon={TrendingUp} />
        <KpiCard label={t("dash_mrr")} value={loading ? "…" : `€${totalMRR}`} icon={DollarSign} />
      </div>

      <TableToolbar
        search={search} onSearchChange={v => { setSearch(v); setPage(1) }} searchPlaceholder={t("clients_search")}
        filters={
          <>
            <div className="relative">
              <select value={planF} onChange={e=>{setPlan(e.target.value as Plan|"ALL");setPage(1)}}
                className="appearance-none bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2.5 text-sm text-neutral-600 focus:outline-none focus:border-orange-400 cursor-pointer">
                <option value="ALL">{t("clients_all_plans")}</option>
                <option value="pro">Pro</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={statF} onChange={e=>{setStat(e.target.value as UserStatus|"ALL");setPage(1)}}
                className="appearance-none bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2.5 text-sm text-neutral-600 focus:outline-none focus:border-orange-400 cursor-pointer">
                <option value="ALL">{t("clients_all_status")}</option>
                {(Object.entries(STATUS_LABELS) as [UserStatus, string][]).map(([k,v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </>
        }
        actions={
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors">
            <Download className="w-3.5 h-3.5" />Export
          </button>
        }
      />

      <TableCard>
        <div className="px-5 py-3 border-b border-neutral-100">
          <p className="text-sm text-neutral-500">{loading ? t("loading") : `${filtered.length} clients`}</p>
        </div>
        <TableShell>
          <TableHeader>
            <TableRow>
              {[t("clients_th_client"),"",t("clients_th_plan"),t("clients_th_status"),t("clients_th_stores"),t("clients_th_orders"),t("clients_th_leads"),t("clients_th_mrr"),t("clients_th_joined"),"Last login",""].map((h,i) => (
                <TableHead key={i} className="whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? <TableRow><TableCell colSpan={11} className="py-12 text-center text-neutral-400">{t("loading")}</TableCell></TableRow>
              : rows.length === 0
                ? <TableRow><TableCell colSpan={11} className="py-12 text-center text-neutral-400">{t("clients_none")}</TableCell></TableRow>
                : rows.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {(c.firstName[0]??"")}{ (c.lastName[0]??"")}
                        </div>
                        <div>
                          <p className="text-[#17191D] text-sm font-medium whitespace-nowrap">{c.firstName} {c.lastName}</p>
                          <p className="text-neutral-400 text-xs">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{FLAGS[c.countryCode]??"🏳️"}</span>
                        <span className="text-sm text-neutral-600 whitespace-nowrap">{c.country}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${PLAN_COLORS[c.plan]??PLAN_COLORS.starter}`}>
                        {c.plan}
                      </span>
                    </TableCell>
                    <TableCell><StatusBadge label={STATUS_LABELS[c.status]??c.status} tone={STATUS_TONE[c.status]??"neutral"} /></TableCell>
                    <TableCell className="text-center">{c.storesCount}</TableCell>
                    <TableCell className="text-center">{c.ordersCount}</TableCell>
                    <TableCell className="text-center">{c.leadsCount}</TableCell>
                    <TableCell><span className="text-sm font-semibold text-emerald-600">€{c.monthlyRevenue}</span></TableCell>
                    <TableCell className="whitespace-nowrap text-neutral-500">{c.joinedAt}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {c.lastLoginAt ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="text-sm text-neutral-600">{formatLastLogin(c.lastLoginAt)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/clients/${c.id}`}>
                          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1 h-7 text-xs">
                            View <ArrowUpRight className="w-3 h-3" />
                          </Button>
                        </Link>
                        {toggling === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                        ) : c.status === "suspended" ? (
                          <button onClick={() => setConfirmTarget(c)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Reactivate account">
                            <CheckCircle className="w-3.5 h-3.5" /> Reactivate
                          </button>
                        ) : (
                          <button onClick={() => setConfirmTarget(c)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                            title="Suspend account">
                            <Ban className="w-3.5 h-3.5" /> Suspend
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </TableShell>
        <TablePagination page={cur} totalPages={totalPages} onChange={setPage}
          totalLabel={`${filtered.length===0?0:(cur-1)*PER_PAGE+1}–${Math.min(cur*PER_PAGE,filtered.length)} / ${filtered.length}`} />
      </TableCard>

      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={open => { if (!open) setConfirmTarget(null) }}
        title={confirmTarget?.status === "suspended" ? "Reactivate account?" : "Suspend account?"}
        description={confirmTarget
          ? confirmTarget.status === "suspended"
            ? `${confirmTarget.firstName} ${confirmTarget.lastName} will regain access to their dashboard immediately.`
            : `${confirmTarget.firstName} ${confirmTarget.lastName} will lose access to their dashboard immediately. They can be reactivated at any time.`
          : ""}
        confirmLabel={confirmTarget?.status === "suspended" ? "Reactivate" : "Suspend"}
        destructive={confirmTarget?.status !== "suspended"}
        loading={toggling === confirmTarget?.id}
        onConfirm={confirmToggleSuspend}
      />
    </div>
  )
}
