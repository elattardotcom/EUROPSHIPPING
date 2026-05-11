"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import {
  ClipboardList, CheckCircle, XCircle, Clock, RefreshCw,
  User, Mail, Phone, Globe, Building2, X, Loader2, ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface RegistrationRequest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  company: string
  country: string
  country_code: string
  status: "pending" | "approved" | "rejected"
  admin_note: string | null
  created_at: string
}

const STATUS_CFG = {
  pending:  { label: "En attente", color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",    Icon: Clock },
  approved: { label: "Approuvé",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", Icon: CheckCircle },
  rejected: { label: "Rejeté",     color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",         Icon: XCircle },
}

function ActionModal({
  req,
  action,
  onClose,
  onDone,
}: {
  req: RegistrationRequest
  action: "approve" | "reject"
  onClose: () => void
  onDone: (id: string, status: "approved" | "rejected") => void
}) {
  const [note,    setNote]    = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const submit = async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/admin/registration-requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote: note.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Erreur"); setLoading(false); return }
      onDone(req.id, action === "approve" ? "approved" : "rejected")
    } catch { setError("Erreur réseau") }
    setLoading(false)
  }

  const isApprove = action === "approve"

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className={`text-base font-semibold ${isApprove ? "text-emerald-400" : "text-red-400"}`}>
            {isApprove ? "Approuver le compte" : "Rejeter la demande"}
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-neutral-800 rounded-xl p-4 space-y-2">
            <p className="text-white font-semibold">{req.first_name} {req.last_name}</p>
            <p className="text-neutral-400 text-sm">{req.email}</p>
            {req.company && <p className="text-neutral-500 text-sm">{req.company}</p>}
            <p className="text-neutral-500 text-sm">{req.country}</p>
          </div>

          {isApprove && (
            <p className="text-sm text-neutral-400">
              Un compte client <span className="text-white font-medium">Starter</span> sera créé. Le client pourra se connecter immédiatement.
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Note admin (optionnel)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={isApprove ? "Bienvenue sur CODShip !" : "Raison du rejet..."}
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-neutral-400 hover:text-white">Annuler</Button>
          <Button
            onClick={submit}
            disabled={loading}
            className={`gap-2 text-white ${isApprove ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"}`}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : isApprove ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
            }
            {isApprove ? "Approuver" : "Rejeter"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [modal,    setModal]    = useState<{ req: RegistrationRequest; action: "approve" | "reject" } | null>(null)

  const load = useCallback(async () => {
    const data = await fetch("/api/admin/registration-requests").then(r => r.json()).catch(() => [])
    setRequests(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDone = (id: string, status: "approved" | "rejected") => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    setModal(null)
  }

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter)
  const pendingCount = requests.filter(r => r.status === "pending").length

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {modal && (
        <ActionModal
          req={modal.req}
          action={modal.action}
          onClose={() => setModal(null)}
          onDone={handleDone}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
            Demandes d'inscription
            {pendingCount > 0 && (
              <span className="text-sm bg-orange-500 text-white px-2.5 py-0.5 rounded-full font-semibold">
                {pendingCount} en attente
              </span>
            )}
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 mt-0.5">Approuvez ou rejetez les demandes de création de compte</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />Actualiser
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl w-fit">
        {([
          { value: "pending",  label: "En attente", count: requests.filter(r => r.status === "pending").length },
          { value: "approved", label: "Approuvés",  count: requests.filter(r => r.status === "approved").length },
          { value: "rejected", label: "Rejetés",    count: requests.filter(r => r.status === "rejected").length },
          { value: "all",      label: "Tous",       count: requests.length },
        ] as const).map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                : "text-neutral-500 hover:text-white"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === tab.value ? "bg-orange-500/20 text-orange-400" : "bg-neutral-800 text-neutral-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-neutral-500 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-600 gap-3">
            <ClipboardList className="w-10 h-10" />
            <p className="text-sm">Aucune demande {filter !== "all" ? STATUS_CFG[filter as keyof typeof STATUS_CFG]?.label.toLowerCase() : ""}</p>
          </div>
        ) : filtered.map(req => {
          const cfg = STATUS_CFG[req.status]
          const StatusIcon = cfg.Icon
          return (
            <div key={req.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">

              {/* Avatar + info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                  {(req.first_name[0] ?? "").toUpperCase()}{(req.last_name[0] ?? "").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold">{req.first_name} {req.last_name}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <Mail className="w-3 h-3" />{req.email}
                    </span>
                    {req.phone && (
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <Phone className="w-3 h-3" />{req.phone}
                      </span>
                    )}
                    {req.country && (
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <Globe className="w-3 h-3" />{req.country}
                      </span>
                    )}
                    {req.company && (
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <Building2 className="w-3 h-3" />{req.company}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">
                    {new Date(req.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Status + actions */}
              <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />{cfg.label}
                </span>
                {req.status === "pending" && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setModal({ req, action: "approve" })}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />Approuver
                    </button>
                    <button
                      onClick={() => setModal({ req, action: "reject" })}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-red-600/20 text-red-400 hover:text-red-300 text-sm font-semibold transition-colors border border-neutral-700 hover:border-red-500/30"
                    >
                      <XCircle className="w-3.5 h-3.5" />Rejeter
                    </button>
                  </div>
                )}
                {req.admin_note && (
                  <span className="text-xs text-neutral-500 italic max-w-[200px] truncate" title={req.admin_note}>
                    {req.admin_note}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
