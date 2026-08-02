"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Search, Download, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Phone, XCircle, AlertCircle,
  Users, Percent, PhoneCall, PhoneMissed, RefreshCw,
  ChevronDown, X, MapPin, Package, ShoppingBag,
  AlertTriangle, ExternalLink,
} from "lucide-react"
// XCircle, PhoneMissed, CheckCircle kept — used in StatusBadge and STATUS_CONFIG
import { Button } from "@/components/ui/button"
import { exportToCSV } from "@/lib/mock-data"
import type { Lead, LeadStatus } from "@/lib/mock-data"

/* ─── Constants ─────────────────────────────────────────── */

const FLAGS: Record<string, string> = {
  PT: "🇵🇹", ES: "🇪🇸", FR: "🇫🇷", IT: "🇮🇹",
  RO: "🇷🇴", BG: "🇧🇬", GR: "🇬🇷", HU: "🇭🇺",
  CZ: "🇨🇿", SK: "🇸🇰", MA: "🇲🇦", DZ: "🇩🇿", DE: "🇩🇪",
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; dot: string; Icon: React.ElementType }> = {
  CONFIRMED: { label: "Confirmé",    color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25", dot: "bg-emerald-400", Icon: CheckCircle },
  PENDING:   { label: "En attente",  color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/25",     dot: "bg-amber-400",   Icon: Clock },
  UNREACHED: { label: "Pas répondu", color: "text-blue-400",    bg: "bg-blue-500/15 border-blue-500/25",       dot: "bg-blue-400",    Icon: PhoneMissed },
  CANCELED:  { label: "Annulé",      color: "text-red-400",     bg: "bg-red-500/15 border-red-500/25",         dot: "bg-red-400",     Icon: XCircle },
  ERROR:     { label: "Erreur",      color: "text-rose-400",    bg: "bg-rose-600/15 border-rose-600/25",       dot: "bg-rose-500",    Icon: AlertCircle },
}

const AVATAR_COLORS = [
  "from-orange-500 to-red-600",
  "from-teal-500 to-emerald-600",
  "from-blue-500 to-cyan-600",
  "from-purple-500 to-violet-600",
  "from-pink-500 to-rose-600",
]

const ITEMS_PER_PAGE = 10

/* ─── Helpers ────────────────────────────────────────────── */

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0] ?? "").join("").toUpperCase() || "?"
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.Icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

/* ─── Lead Detail Drawer ─────────────────────────────────── */

function LeadDrawer({
  lead,
  onClose,
}: {
  lead: Lead | null
  onClose: () => void
}) {
  if (!lead) return null

  const hasAddress = lead.address || lead.city || lead.zip

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col"
        style={{ background: "#0d0d0d", borderLeft: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${AVATAR_COLORS[parseInt(lead.id) % AVATAR_COLORS.length]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
              {initials(lead.name)}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">{lead.name}</p>
              <p className="text-neutral-500 text-xs mt-0.5">{lead.store} · {lead.createdAt} à {lead.createdTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={lead.status} />
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Duplicate warning */}
          {lead.isDuplicate && (
            <div className="flex items-start gap-3 rounded-xl px-4 py-3.5"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)" }}>
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-bold">Doublon détecté</p>
                <p className="text-red-400/70 text-xs mt-0.5">
                  Ce client a passé la même commande plusieurs fois en moins de 5 minutes. Vérifiez avant de confirmer.
                </p>
              </div>
            </div>
          )}

          {/* Client info */}
          <div className="rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-4 pt-3.5 pb-2">
              Informations client
            </p>
            <div className="divide-y divide-white/5">
              {/* Phone */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-sm text-neutral-300">{lead.phone}</span>
                </div>
                <a href={`tel:${lead.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg hover:bg-orange-500/20 transition-colors">
                  <PhoneCall className="w-3 h-3" />
                  Appeler
                </a>
              </div>

              {/* Country */}
              <div className="flex items-center gap-2.5 px-4 py-3">
                <span className="text-base leading-none">{FLAGS[lead.countryCode] ?? "🏳️"}</span>
                <span className="text-sm text-neutral-300">{lead.country}</span>
              </div>

              {/* Address */}
              {hasAddress && (
                <div className="flex items-start gap-2.5 px-4 py-3">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500 mt-0.5 flex-shrink-0" />
                  <div>
                    {lead.address && <p className="text-sm text-neutral-300">{lead.address}</p>}
                    {(lead.zip || lead.city) && (
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {[lead.zip, lead.city].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order details */}
          <div className="rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-4 pt-3.5 pb-2">
              Détails de la commande
            </p>
            <div className="divide-y divide-white/5">
              {/* Product */}
              <div className="flex items-center gap-2.5 px-4 py-3">
                <Package className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-sm text-neutral-300 flex-1">{lead.product}</span>
              </div>
              {/* Quantity */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-sm text-neutral-500">Quantité</span>
                </div>
                <span className="text-sm font-semibold text-white">{lead.quantity ?? 1}</span>
              </div>
              {/* Value */}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-neutral-500 pl-6">Valeur totale</span>
                <span className="text-base font-black text-white">
                  {lead.currency === "EUR" ? "€" : "$"}{lead.orderValue.toFixed(2)}
                </span>
              </div>
              {/* Store */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-sm text-neutral-500">Boutique</span>
                </div>
                <span className="text-sm text-neutral-300">{lead.store}</span>
              </div>
            </div>
          </div>

          {/* Attempts */}
          <div className="rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                Tentatives d&apos;appel
              </p>
              <span className={`text-sm font-bold ${lead.attempts >= 4 ? "text-red-400" : lead.attempts >= 2 ? "text-amber-400" : "text-neutral-400"}`}>
                {lead.attempts} / 5
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-4 pb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${
                  i < lead.attempts
                    ? lead.attempts >= 4 ? "bg-red-500" : lead.attempts >= 2 ? "bg-amber-500" : "bg-orange-500"
                    : "bg-white/10"
                }`} />
              ))}
            </div>
            {lead.attempts >= 4 && (
              <p className="text-xs text-red-400/80 px-4 pb-3.5">
                Nombre de tentatives élevé — envisagez d&apos;annuler ce lead.
              </p>
            )}
          </div>
        </div>

        {/* Info footer — read only */}
        <div className="px-5 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0a0a0a" }}>
          <p className="text-xs text-neutral-600 text-center">
            Le statut de ce lead est géré par l&apos;équipe CODShipEurope.
          </p>
        </div>
      </div>
    </>
  )
}

/* ─── Page ───────────────────────────────────────────────── */

export default function LeadsPage() {
  const [search, setSearch]         = useState("")
  const [statusFilter, setStatus]   = useState<LeadStatus | "ALL">("ALL")
  const [countryFilter, setCountry] = useState("ALL")
  const [page, setPage]             = useState(1)
  const [selected, setSelected]     = useState<string[]>([])
  const [leads, setLeads]           = useState<Lead[]>([])
  const [loading, setLoading]       = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const fetchLeads = useCallback(() => {
    fetch("/api/client/leads")
      .then(r => r.json())
      .then(data => { setLeads(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  /* filtered */
  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSearch  = (l.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
                           (l.phone ?? "").includes(search) ||
                           (l.product ?? "").toLowerCase().includes(search.toLowerCase())
      const matchStatus  = statusFilter === "ALL" || l.status === statusFilter
      const matchCountry = countryFilter === "ALL" || l.countryCode === countryFilter
      return matchSearch && matchStatus && matchCountry
    })
  }, [leads, search, statusFilter, countryFilter])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginated   = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const total     = leads.length
  const confirmed = leads.filter(l => l.status === "CONFIRMED").length
  const pending   = leads.filter(l => l.status === "PENDING").length
  const unreached = leads.filter(l => l.status === "UNREACHED").length
  const canceled  = leads.filter(l => l.status === "CANCELED").length
  const rate      = total > 0 ? Math.round((confirmed / total) * 100) : 0

  const toggleAll = () =>
    selected.length === paginated.length
      ? setSelected([])
      : setSelected(paginated.map(l => l.id))

  const toggleOne = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">

      {/* Drawer */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Suivez et gérez tous vos prospects en temps réel</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => { setSearch(""); setStatus("ALL"); setCountry("ALL"); setPage(1) }}
            className="bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white gap-2">
            <RefreshCw className="w-4 h-4" />
            Réinitialiser
          </Button>
          <Button onClick={() => exportToCSV(
            (selected.length ? leads.filter(l => selected.includes(l.id)) : leads).map(l => ({
              ID: l.id, Nom: l.name, Téléphone: l.phone, Pays: l.country,
              Adresse: l.address ?? "", Ville: l.city ?? "", CP: l.zip ?? "",
              Statut: STATUS_CONFIG[l.status].label, Produit: l.product,
              Quantité: l.quantity ?? 1,
              "Valeur (EUR)": l.orderValue.toFixed(2), Boutique: l.store,
              Tentatives: l.attempts, Doublon: l.isDuplicate ? "Oui" : "Non",
              Date: l.createdAt, Heure: l.createdTime,
            })),
            "leads_codshipeurope.csv"
          )} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
            <Download className="w-4 h-4" />
            Exporter Excel
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total leads",   value: total,      icon: Users,      color: "text-blue-400",    bg: "bg-blue-500/15",    border: "border-l-blue-500",    status: "ALL"       },
          { label: "Confirmés",     value: confirmed,  icon: CheckCircle,color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-l-emerald-500", status: "CONFIRMED" },
          { label: "En attente",    value: pending,    icon: Clock,      color: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-l-amber-500",   status: "PENDING"   },
          { label: "Pas répondu",   value: unreached,  icon: PhoneMissed,color: "text-blue-400",    bg: "bg-blue-500/15",    border: "border-l-blue-400",    status: "UNREACHED" },
          { label: "Taux confirm.", value: `${rate}%`, icon: Percent,    color: "text-orange-400",  bg: "bg-orange-500/15",  border: "border-l-orange-500",  status: "ALL"       },
        ].map((c) => {
          const Icon = c.icon
          return (
            <button
              key={c.label}
              onClick={() => { setStatus(c.status as LeadStatus | "ALL"); setPage(1) }}
              className={`bg-neutral-900 border border-neutral-800 border-l-4 ${c.border} rounded-xl p-4 text-left hover:border-neutral-700 transition-colors`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{c.value}</div>
              <p className="text-xs text-neutral-500">{c.label}</p>
            </button>
          )
        })}
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Nom, téléphone, produit…"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => { setStatus(e.target.value as LeadStatus | "ALL"); setPage(1) }}
              className="appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="CONFIRMED">Confirmé</option>
              <option value="PENDING">En attente</option>
              <option value="UNREACHED">Pas répondu</option>
              <option value="CANCELED">Annulé</option>
              <option value="ERROR">Erreur / Doublon</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={countryFilter}
              onChange={e => { setCountry(e.target.value); setPage(1) }}
              className="appearance-none bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-9 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
              <option value="ALL">Tous les pays</option>
              <option value="PT">🇵🇹 Portugal</option>
              <option value="ES">🇪🇸 Espagne</option>
              <option value="IT">🇮🇹 Italie</option>
              <option value="RO">🇷🇴 Roumanie</option>
              <option value="BG">🇧🇬 Bulgarie</option>
              <option value="GR">🇬🇷 Grèce</option>
              <option value="HU">🇭🇺 Hongrie</option>
              <option value="CZ">🇨🇿 Tchéquie</option>
              <option value="SK">🇸🇰 Slovaquie</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl">
            <span className="text-sm text-orange-400 font-medium">{selected.length} sélectionné(s)</span>
            <Button size="sm" variant="outline" onClick={() => exportToCSV(
              leads.filter(l => selected.includes(l.id)).map(l => ({
                ID: l.id, Nom: l.name, Téléphone: l.phone, Pays: l.country,
                Adresse: l.address ?? "", Ville: l.city ?? "", CP: l.zip ?? "",
                Statut: STATUS_CONFIG[l.status].label, Produit: l.product,
                Quantité: l.quantity ?? 1,
              })),
              "leads_selection.csv"
            )} className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20 h-7 text-xs">
              Exporter
            </Button>
          </div>
        )}
      </div>

      {/* ── Status tabs ────────────────────────────────────── */}
      <div className="flex items-center gap-1 flex-wrap">
        {([
          { value: "ALL",       label: "Tous",          count: total },
          { value: "CONFIRMED", label: "Confirmés",     count: confirmed },
          { value: "PENDING",   label: "En attente",    count: pending },
          { value: "UNREACHED", label: "Pas répondu",   count: unreached },
          { value: "CANCELED",  label: "Annulés",       count: canceled },
        ] as { value: LeadStatus | "ALL"; label: string; count: number }[]).map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1) }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-orange-500/15 text-orange-400 border border-orange-500/25"
                : "text-neutral-500 hover:text-white hover:bg-neutral-800 border border-transparent"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              statusFilter === tab.value ? "bg-orange-500/20 text-orange-400" : "bg-neutral-800 text-neutral-500"
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Tous les Leads</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{filtered.length} résultats · cliquer sur une ligne pour voir les détails</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selected.length === paginated.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 accent-orange-500 cursor-pointer"
                  />
                </th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Client</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Téléphone</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pays</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Statut</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Produit</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Valeur</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tentatives</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-16 text-center text-neutral-500 text-sm">Chargement…</td></tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-neutral-500 text-sm">
                    Aucun lead trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                paginated.map((lead, i) => {
                  const colorIdx = i % AVATAR_COLORS.length
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/40 transition-colors cursor-pointer ${
                        selectedLead?.id === lead.id ? "bg-orange-500/5" : ""
                      } ${selected.includes(lead.id) ? "bg-orange-500/5" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="p-4" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.includes(lead.id)}
                          onChange={() => toggleOne(lead.id)}
                          className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 accent-orange-500 cursor-pointer"
                        />
                      </td>

                      {/* Client */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {initials(lead.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-white text-sm font-medium truncate max-w-[140px]">{lead.name}</p>
                              {lead.isDuplicate && (
                                <span className="flex-shrink-0 text-[9px] font-bold text-red-400 border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                  Doublon
                                </span>
                              )}
                            </div>
                            <p className="text-neutral-500 text-xs">{lead.store}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-300 text-sm">{lead.phone}</span>
                          <a
                            href={`tel:${lead.phone.replace(/\s/g, "")}`}
                            onClick={e => e.stopPropagation()}
                            className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center text-orange-400 hover:bg-orange-500/20 transition-colors flex-shrink-0"
                            title="Appeler"
                          >
                            <PhoneCall className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl leading-none">{FLAGS[lead.countryCode] ?? "🏳️"}</span>
                          <span className="text-sm text-neutral-300">{lead.country}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Product */}
                      <td className="p-4">
                        <div>
                          <span className="text-sm text-neutral-300 max-w-[130px] truncate block">{lead.product}</span>
                          {(lead.quantity ?? 1) > 1 && (
                            <span className="text-xs text-neutral-500">x{lead.quantity}</span>
                          )}
                        </div>
                      </td>

                      {/* Value */}
                      <td className="p-4">
                        <span className="text-sm font-semibold text-white">
                          {lead.currency === "EUR" ? "€" : "$"}{lead.orderValue.toFixed(2)}
                        </span>
                      </td>

                      {/* Attempts */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-neutral-500" />
                          <span className={`text-sm font-medium ${lead.attempts >= 4 ? "text-red-400" : lead.attempts >= 2 ? "text-amber-400" : "text-neutral-300"}`}>
                            {lead.attempts}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <div>
                          <p className="text-sm text-neutral-300">{lead.createdAt}</p>
                          <p className="text-xs text-neutral-600">{lead.createdTime}</p>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            Affichage{" "}
            <span className="text-white font-medium">
              {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
            </span>{" "}
            sur <span className="text-white font-medium">{filtered.length}</span> leads
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon"
              className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
              disabled={currentPage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…")
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`e-${i}`} className="px-2 text-neutral-600 text-sm">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === p
                        ? "bg-orange-500 text-white"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                    }`}>
                    {p}
                  </button>
                )
              )}
            <Button variant="ghost" size="icon"
              className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
              disabled={currentPage === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
