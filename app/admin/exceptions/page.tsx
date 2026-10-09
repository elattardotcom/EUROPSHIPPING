"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, CheckCircle2, Eye, ShoppingCart, PhoneCall } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { KpiCard } from "@/components/admin/kpi-card"
import { StatusBadge, type StatusTone } from "@/components/admin/status-badge"
import {
  TableCard, TableToolbar,
  TableShell, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/admin/data-table"

interface Exception {
  id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  entityType: string
  entityId: string
  title: string
  description: string | null
  status: "open" | "acknowledged" | "resolved"
  resolvedBy: string | null
  resolvedAt: string | null
  createdAt: string
}

const SEVERITY_TONE: Record<Exception["severity"], StatusTone> = {
  low: "neutral", medium: "warning", high: "danger", critical: "danger",
}
const STATUS_TONE: Record<Exception["status"], StatusTone> = {
  open: "danger", acknowledged: "warning", resolved: "success",
}

export default function AdminExceptionsPage() {
  const [exceptions, setExceptions] = useState<Exception[]>([])
  const [loading,    setLoading]    = useState(true)
  const [statusF,    setStatusF]    = useState<"open" | "acknowledged" | "resolved" | "ALL">("open")
  const [search,     setSearch]     = useState("")
  const [acting,     setActing]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const d = await fetch("/api/admin/exceptions").then(r => r.json()).catch(() => [])
    setExceptions(Array.isArray(d) ? d : [])
    setLoading(false)
  }, [])

  useEffect(() => { load(); const i = setInterval(load, 30_000); return () => clearInterval(i) }, [load])

  const act = async (id: string, status: Exception["status"]) => {
    setActing(id)
    await fetch(`/api/admin/exceptions/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    })
    await load()
    setActing(null)
  }

  const filtered = useMemo(() => exceptions.filter(e => {
    const ms = !search || `${e.title} ${e.description ?? ""}`.toLowerCase().includes(search.toLowerCase())
    const mst = statusF === "ALL" || e.status === statusF
    return ms && mst
  }), [exceptions, search, statusF])

  const openCount         = exceptions.filter(e => e.status === "open").length
  const acknowledgedCount = exceptions.filter(e => e.status === "acknowledged").length
  const criticalCount     = exceptions.filter(e => e.status !== "resolved" && (e.severity === "critical" || e.severity === "high")).length

  return (
    <div className="p-4 md:p-6 space-y-5">
      <PageHeader
        title="Operational Exceptions"
        subtitle="Orders and leads that need admin attention, derived from real data — nothing fabricated"
        actions={
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#17191D] text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />Refresh
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Open" value={loading ? "…" : openCount} icon={AlertTriangle}
          active={statusF === "open"} onClick={() => setStatusF("open")} />
        <KpiCard label="Acknowledged" value={loading ? "…" : acknowledgedCount} icon={Eye}
          active={statusF === "acknowledged"} onClick={() => setStatusF("acknowledged")} />
        <KpiCard label="High/critical (unresolved)" value={loading ? "…" : criticalCount} icon={AlertTriangle} />
        <KpiCard label="All" value={loading ? "…" : exceptions.length} icon={CheckCircle2}
          active={statusF === "ALL"} onClick={() => setStatusF("ALL")} />
      </div>

      <TableToolbar
        search={search} onSearchChange={setSearch} searchPlaceholder="Search exceptions…"
        filters={
          <div className="flex gap-1.5">
            {(["open", "acknowledged", "resolved", "ALL"] as const).map(s => (
              <button key={s} onClick={() => setStatusF(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  statusF === s ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                }`}>
                {s === "ALL" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        }
      />

      <TableCard>
        <div className="px-5 py-3 border-b border-neutral-100">
          <p className="text-sm text-neutral-500">{loading ? "Loading…" : `${filtered.length} exception${filtered.length !== 1 ? "s" : ""}`}</p>
        </div>
        <TableShell>
          <TableHeader>
            <TableRow>
              {["Severity", "Type", "Issue", "Status", "Created", ""].map(h => <TableHead key={h}>{h}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="py-12 text-center text-neutral-400">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-12 text-center text-neutral-400">No exceptions{statusF !== "ALL" ? ` with status "${statusF}"` : ""} — nothing needs attention right now</TableCell></TableRow>
            ) : filtered.map(e => (
              <TableRow key={e.id}>
                <TableCell><StatusBadge label={e.severity} tone={SEVERITY_TONE[e.severity]} /></TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                    {e.entityType === "order" ? <ShoppingCart className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
                    {e.entityType}
                  </span>
                </TableCell>
                <TableCell>
                  <Link href={e.entityType === "order" ? `/admin/orders/${e.entityId}` : `/admin/leads`} className="text-[#17191D] font-medium hover:text-orange-600">
                    {e.title}
                  </Link>
                  {e.description && <p className="text-xs text-neutral-400 mt-0.5">{e.description}</p>}
                </TableCell>
                <TableCell>
                  <StatusBadge label={e.status} tone={STATUS_TONE[e.status]} />
                  {e.resolvedBy && <p className="text-[11px] text-neutral-400 mt-1">by {e.resolvedBy}</p>}
                </TableCell>
                <TableCell className="whitespace-nowrap text-neutral-500">{new Date(e.createdAt).toLocaleString("en-GB")}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {e.status === "open" && (
                      <button onClick={() => act(e.id, "acknowledged")} disabled={acting === e.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50">
                        Acknowledge
                      </button>
                    )}
                    {e.status !== "resolved" && (
                      <button onClick={() => act(e.id, "resolved")} disabled={acting === e.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50">
                        Resolve
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableShell>
      </TableCard>
    </div>
  )
}
