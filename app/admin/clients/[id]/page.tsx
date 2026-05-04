"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, Mail, Phone, Globe, Store, ShoppingCart, Users,
  DollarSign, CheckCircle, Clock, Truck, XCircle, AlertCircle, PhoneMissed,
  PlusCircle, MinusCircle, Loader2, TrendingUp, TrendingDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Client, AdminOrder, AdminLead, AdminStore, BalanceAdjustment } from "@/lib/db"

const FLAGS: Record<string, string> = { PT:"🇵🇹", ES:"🇪🇸", FR:"🇫🇷", MA:"🇲🇦", BE:"🇧🇪", TN:"🇹🇳" }

const PLAN_CFG: Record<string, string> = {
  enterprise: "bg-orange-500/20 text-orange-400 border-orange-500/25",
  pro:        "bg-amber-500/20  text-amber-400  border-amber-500/25",
  starter:    "bg-neutral-500/20 text-neutral-400 border-neutral-500/25",
}

const STATUS_CFG: Record<string, { label:string; color:string }> = {
  active:    { label:"Actif",    color:"bg-emerald-500/15 text-emerald-400" },
  trial:     { label:"Essai",    color:"bg-amber-500/15   text-amber-400"   },
  suspended: { label:"Suspendu", color:"bg-red-500/15     text-red-400"     },
  cancelled: { label:"Annulé",   color:"bg-neutral-500/15 text-neutral-400" },
}

const ORDER_STATUS: Record<string, { label:string; color:string; Icon: React.ElementType }> = {
  PENDING:   { label:"En attente", color:"text-amber-400",   Icon: Clock },
  SHIPPED:   { label:"Expédié",    color:"text-blue-400",    Icon: Truck },
  DELIVERED: { label:"Livré",      color:"text-emerald-400", Icon: CheckCircle },
  RETURNED:  { label:"Retourné",   color:"text-red-400",     Icon: XCircle },
  ERROR:     { label:"Erreur",     color:"text-rose-400",    Icon: AlertCircle },
}

const LEAD_STATUS: Record<string, { label:string; color:string; Icon: React.ElementType }> = {
  CONFIRMED: { label:"Confirmé",    color:"text-emerald-400", Icon: CheckCircle },
  PENDING:   { label:"En attente",  color:"text-amber-400",   Icon: Clock },
  UNREACHED: { label:"Pas répondu", color:"text-blue-400",    Icon: PhoneMissed },
  CANCELED:  { label:"Annulé",      color:"text-red-400",     Icon: XCircle },
  ERROR:     { label:"Erreur",      color:"text-rose-400",    Icon: AlertCircle },
}

export default function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [client,  setClient]  = useState<Client | null>(null)
  const [orders,  setOrders]  = useState<AdminOrder[]>([])
  const [leads,   setLeads]   = useState<AdminLead[]>([])
  const [stores,  setStores]  = useState<AdminStore[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Balance adjustment state
  const [adjustments, setAdjustments] = useState<BalanceAdjustment[]>([])
  const [adjAmount,   setAdjAmount]   = useState("")
  const [adjType,     setAdjType]     = useState<"credit" | "debit">("credit")
  const [adjReason,   setAdjReason]   = useState("")
  const [adjSaving,   setAdjSaving]   = useState(false)
  const [adjMsg,      setAdjMsg]      = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Plan / status edit state
  const [editPlan,    setEditPlan]    = useState("")
  const [editStatus,  setEditStatus]  = useState("")
  const [savingMeta,  setSavingMeta]  = useState(false)
  const [metaMsg,     setMetaMsg]     = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetch(`/api/admin/clients/${id}`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
      .then(d => {
        if (!d || !d.client) { setNotFound(true); setLoading(false); return }
        setClient(d.client)
        setOrders(d.orders ?? [])
        setLeads(d.leads ?? [])
        setStores(d.stores ?? [])
        setEditPlan(d.client.plan ?? "starter")
        setEditStatus(d.client.status ?? "active")
        setLoading(false)
      })
    fetch(`/api/admin/clients/${id}/balance`)
      .then(r => r.json())
      .then(data => setAdjustments(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [id])

  async function submitAdjustment() {
    const amt = parseFloat(adjAmount)
    if (!amt || amt <= 0) { setAdjMsg({ type: "error", text: "Montant invalide" }); return }
    setAdjSaving(true)
    setAdjMsg(null)
    try {
      const res = await fetch(`/api/admin/clients/${id}/balance`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount: amt, type: adjType, reason: adjReason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setAdjustments(prev => [data, ...prev])
      setAdjAmount("")
      setAdjReason("")
      setAdjMsg({ type: "success", text: `${adjType === "credit" ? "Crédit" : "Débit"} de €${amt.toFixed(2)} appliqué.` })
    } catch (e: unknown) {
      setAdjMsg({ type: "error", text: e instanceof Error ? e.message : "Erreur serveur" })
    } finally {
      setAdjSaving(false)
    }
  }

  async function saveMeta() {
    setSavingMeta(true)
    setMetaMsg(null)
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan: editPlan, status: editStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setClient(prev => prev ? { ...prev, plan: editPlan as Client["plan"], status: editStatus as Client["status"] } : prev)
      setMetaMsg({ type: "success", text: "Plan et statut mis à jour." })
    } catch (e: unknown) {
      setMetaMsg({ type: "error", text: e instanceof Error ? e.message : "Erreur serveur" })
    } finally {
      setSavingMeta(false)
    }
  }

  if (notFound) return (
    <div className="p-6">
      <p className="text-neutral-500">Client introuvable.</p>
      <Link href="/admin/clients" className="text-orange-400 text-sm mt-2 inline-block">← Retour</Link>
    </div>
  )

  if (loading || !client) return (
    <div className="p-6 flex items-center justify-center h-64">
      <p className="text-neutral-500 text-sm">Chargement…</p>
    </div>
  )

  const confirmedLeads  = leads.filter(l => l.status === "CONFIRMED").length
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length
  const totalRevenue    = orders.filter(o => o.status === "DELIVERED").reduce((s,o) => s + o.value, 0)

  return (
    <div className="p-6 space-y-6">
      <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour aux clients
      </Link>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${client.avatarColor} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{client.firstName} {client.lastName}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${PLAN_CFG[client.plan]}`}>
                  {client.plan.charAt(0).toUpperCase()+client.plan.slice(1)}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_CFG[client.status]?.color}`}>
                  {STATUS_CFG[client.status]?.label}
                </span>
              </div>
              <p className="text-neutral-400 font-medium mb-3">{client.company}</p>
              <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/>{client.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/>{client.phone}</span>
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5"/>{FLAGS[client.countryCode]} {client.country}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0 min-w-[220px]">
            {metaMsg && (
              <div className={`px-3 py-2 rounded-lg text-xs border ${
                metaMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>{metaMsg.text}</div>
            )}
            <div className="flex items-center gap-2">
              <select
                value={editPlan}
                onChange={e => setEditPlan(e.target.value)}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="active">Actif</option>
                <option value="trial">Essai</option>
                <option value="suspended">Suspendu</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            <Button
              onClick={saveMeta}
              disabled={savingMeta}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2 w-full"
            >
              {savingMeta ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Boutiques",       value: stores.length,                       icon: Store,        color:"border-l-orange-500"  },
          { label:"Commandes",       value: orders.length,                       icon: ShoppingCart, color:"border-l-orange-500"  },
          { label:"Leads confirmés", value: `${confirmedLeads}/${leads.length}`, icon: Users,        color:"border-l-teal-500"    },
          { label:"Revenus générés", value: `€${totalRevenue.toFixed(0)}`,       icon: DollarSign,   color:"border-l-emerald-500" },
        ].map(s => (
          <div key={s.label} className={`bg-neutral-900 border border-neutral-800 border-l-4 ${s.color} rounded-xl p-4`}>
            <s.icon className="w-4 h-4 text-neutral-500 mb-2" />
            <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800">
            <h2 className="font-semibold text-white">Boutiques Shopify ({stores.length})</h2>
          </div>
          {stores.length === 0
            ? <p className="p-5 text-neutral-500 text-sm">Aucune boutique connectée.</p>
            : stores.map(s => {
                const sc = { connected:"bg-emerald-500/15 text-emerald-400", syncing:"bg-blue-500/15 text-blue-400", error:"bg-red-500/15 text-red-400" }[s.status]
                const sl = { connected:"Connecté", syncing:"Sync...", error:"Erreur" }[s.status]
                return (
                  <div key={s.id} className="px-5 py-4 border-b border-neutral-800 last:border-0 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{s.name}</p>
                      <p className="text-neutral-500 text-xs">{s.domain}</p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-white text-sm font-semibold">{s.totalOrders}</p>
                        <p className="text-neutral-600 text-xs">commandes</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sc}`}>{sl}</span>
                    </div>
                  </div>
                )
              })
          }
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800">
            <h2 className="font-semibold text-white">Derniers Leads ({leads.length})</h2>
          </div>
          {leads.length === 0
            ? <p className="p-5 text-neutral-500 text-sm">Aucun lead.</p>
            : leads.slice(0,5).map(l => {
                const cfg = LEAD_STATUS[l.status] ?? LEAD_STATUS.ERROR
                const Icon = cfg.Icon
                return (
                  <div key={l.id} className="px-5 py-3.5 border-b border-neutral-800 last:border-0 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{l.customerName}</p>
                      <p className="text-neutral-500 text-xs">{FLAGS[l.countryCode]} {l.country} · {l.product}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="text-sm font-semibold text-white">€{l.value}</span>
                      <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                        <Icon className="w-3 h-3"/>{cfg.label}
                      </span>
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>

      {/* ── Balance Adjustment ──────────────────────────────────────────── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-orange-400" />
          Ajustement manuel du solde
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            {adjMsg && (
              <div className={`px-4 py-3 rounded-lg text-sm border ${
                adjMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {adjMsg.text}
              </div>
            )}

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAdjType("credit")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  adjType === "credit"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                }`}
              >
                <PlusCircle className="w-4 h-4" /> Crédit
              </button>
              <button
                onClick={() => setAdjType("debit")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  adjType === "debit"
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                }`}
              >
                <MinusCircle className="w-4 h-4" /> Débit
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Montant (€)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={adjAmount}
                onChange={e => setAdjAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Motif (facultatif)</label>
              <input
                type="text"
                value={adjReason}
                onChange={e => setAdjReason(e.target.value)}
                placeholder="Ex: Bonus, correction, remboursement…"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <Button
              onClick={submitAdjustment}
              disabled={adjSaving || !adjAmount || parseFloat(adjAmount) <= 0}
              className={`w-full gap-2 ${
                adjType === "credit"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {adjSaving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : adjType === "credit"
                  ? <PlusCircle className="w-4 h-4" />
                  : <MinusCircle className="w-4 h-4" />
              }
              {adjType === "credit" ? "Ajouter un crédit" : "Appliquer un débit"}
            </Button>
          </div>

          {/* History */}
          <div>
            <p className="text-xs font-medium text-neutral-400 mb-3">Historique des ajustements</p>
            {adjustments.length === 0 ? (
              <p className="text-neutral-600 text-sm text-center py-8">Aucun ajustement pour ce client.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {adjustments.map(a => (
                  <div key={a.id} className="flex items-center justify-between bg-neutral-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {a.amount >= 0
                        ? <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        : <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                      }
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{a.reason || "Sans motif"}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(a.createdAt).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ml-3 ${a.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {a.amount >= 0 ? "+" : ""}€{Math.abs(a.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Orders table ────────────────────────────────────────────────── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <h2 className="font-semibold text-white">Commandes ({orders.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Client final","Pays","Produit","Valeur","N° Suivi","Statut","Date"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0
                ? <tr><td colSpan={7} className="py-8 text-center text-neutral-500 text-sm">Aucune commande.</td></tr>
                : orders.map(o => {
                    const cfg = ORDER_STATUS[o.status] ?? ORDER_STATUS.ERROR
                    const Icon = cfg.Icon
                    return (
                      <tr key={o.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                        <td className="p-4 text-sm text-white whitespace-nowrap">{o.customerName}</td>
                        <td className="p-4"><span className="text-base">{FLAGS[o.countryCode]??"🏳️"}</span></td>
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
      </div>
    </div>
  )
}
