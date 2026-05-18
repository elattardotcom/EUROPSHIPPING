"use client"

import { useState } from "react"
import { Search, Send, CheckCircle, Clock, Package, Link2, AlertCircle, Loader2, ChevronDown } from "lucide-react"

const STATUS_CFG = {
  PENDING:   { label: "En attente",   cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  PROCESSING:{ label: "En traitement",cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  SHIPPED:   { label: "Expédié",      cls: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  RECEIVED:  { label: "Reçu",         cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  CANCELED:  { label: "Annulé",       cls: "text-red-400 bg-red-500/10 border-red-500/20" },
}

interface SourcingRequest {
  id: string
  product_name: string
  reference_url: string | null
  quantity: number
  budget_eur: number | null
  notes: string | null
  status: keyof typeof STATUS_CFG
  created_at: string
}

const INPUT = "w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-teal-500 transition-colors"

export default function SourcingPage() {
  const [requests, setRequests]   = useState<SourcingRequest[]>([])
  const [loadedList, setLoadedList] = useState(false)
  const [sent,    setSent]        = useState(false)
  const [loading, setLoading]     = useState(false)
  const [formErr, setFormErr]     = useState("")
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm] = useState({
    product_name: "", reference_url: "", quantity: "", budget_eur: "", notes: "",
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  async function loadRequests() {
    if (loadedList) return
    const d = await fetch("/api/sourcing").then(r => r.json()).catch(() => [])
    setRequests(Array.isArray(d) ? d : [])
    setLoadedList(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFormErr("")
    try {
      const res = await fetch("/api/sourcing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name:  form.product_name,
          reference_url: form.reference_url || null,
          quantity:      parseInt(form.quantity) || null,
          budget_eur:    parseFloat(form.budget_eur) || null,
          notes:         form.notes || null,
        }),
      })
      if (res.ok) {
        setSent(true)
        setShowForm(false)
        setLoadedList(false)
      } else {
        const d = await res.json().catch(() => ({}))
        setFormErr(d.error ?? `Erreur ${res.status} — veuillez réessayer.`)
      }
    } catch {
      setFormErr("Erreur réseau — veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-teal-400" />
            Sourcing Produit
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Trouvez vos fournisseurs et recevez vos produits directement en entrepôt.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setSent(false) }}
          className="inline-flex items-center gap-2 font-bold text-sm text-white px-5 py-2.5 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", boxShadow: "0 4px 16px rgba(20,184,166,0.25)" }}
        >
          <Send className="w-4 h-4" />
          Nouvelle demande
        </button>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon:"🌏", label:"Fournisseurs vérifiés", sub:"Chine, Turquie, Europe" },
          { icon:"✅", label:"Contrôle qualité",      sub:"Inspection avant envoi" },
          { icon:"🚀", label:"Livraison rapide",       sub:"Direct en entrepôt" },
          { icon:"📊", label:"Suivi en temps réel",    sub:"Depuis votre dashboard" },
        ].map(b => (
          <div key={b.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{b.icon}</div>
            <p className="text-white text-xs font-bold">{b.label}</p>
            <p className="text-neutral-600 text-[10px] mt-0.5">{b.sub}</p>
          </div>
        ))}
      </div>

      {/* Success message */}
      {sent && (
        <div className="flex items-center gap-3 bg-teal-500/10 border border-teal-500/20 rounded-xl px-5 py-4">
          <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <div>
            <p className="text-white font-semibold text-sm">Demande envoyée !</p>
            <p className="text-neutral-500 text-xs">Notre équipe va analyser votre demande et vous recontacter rapidement.</p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-4 h-4 text-teal-400" />
            <p className="text-white font-semibold">Détails de votre demande</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Nom du produit *</label>
              <input type="text" required placeholder="Ex: Montre smartwatch X4 noire" value={form.product_name} onChange={set("product_name")} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1">
                <Link2 className="w-3 h-3" /> Lien de référence (AliExpress, 1688, Amazon…)
              </label>
              <input type="url" placeholder="https://..." value={form.reference_url} onChange={set("reference_url")} className={INPUT} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Quantité souhaitée</label>
                <input type="number" min={1} placeholder="Ex: 500" value={form.quantity} onChange={set("quantity")} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Budget cible (€ / unité)</label>
                <input type="number" step="0.01" min={0} placeholder="Ex: 8.50" value={form.budget_eur} onChange={set("budget_eur")} className={INPUT} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Notes complémentaires</label>
              <textarea placeholder="Couleur, taille, packaging, délai souhaité…" rows={4} value={form.notes} onChange={set("notes")} className={INPUT + " resize-none"} />
            </div>
            {formErr && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{formErr}
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 font-bold text-sm text-white px-6 py-3 rounded-xl transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "Envoi…" : "Envoyer la demande"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-sm text-neutral-500 hover:text-white border border-neutral-700 px-5 py-3 rounded-xl transition-all hover:border-neutral-500">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My requests */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <button
          onClick={loadRequests}
          className="w-full px-5 py-4 border-b border-neutral-800 flex items-center justify-between hover:bg-neutral-800/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            <p className="text-white font-semibold text-sm">Mes demandes</p>
          </div>
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        </button>

        {loadedList && (
          requests.length === 0 ? (
            <div className="py-10 text-center">
              <AlertCircle className="w-6 h-6 text-neutral-700 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">Aucune demande pour l&apos;instant</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {requests.map(r => {
                const cfg = STATUS_CFG[r.status] ?? STATUS_CFG.PENDING
                return (
                  <div key={r.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{r.product_name}</p>
                      <p className="text-neutral-500 text-xs mt-0.5">
                        {r.quantity ? `${r.quantity} unités` : ""}{r.budget_eur ? ` · €${r.budget_eur}/u` : ""}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
                    <span className="text-neutral-600 text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
