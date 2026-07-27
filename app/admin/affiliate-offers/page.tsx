"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, X, Loader2, RefreshCw, Gift } from "lucide-react"

interface AffiliateOffer {
  id: string
  name: string
  product: string | null
  commission: number
  commission_type: "percent" | "fixed"
  description: string | null
  image_url: string | null
  status: "active" | "paused" | "ended"
  created_at: string
}

const EMPTY: Omit<AffiliateOffer, "id" | "created_at"> = {
  name: "", product: "", commission: 0, commission_type: "percent",
  description: "", image_url: "", status: "active",
}

const STATUS_CFG = {
  active: { label: "Actif",   cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  paused: { label: "Pausé",   cls: "bg-yellow-500/20  text-yellow-400  border-yellow-500/30"  },
  ended:  { label: "Terminé", cls: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30" },
}

export default function AdminAffiliateOffersPage() {
  const [offers,   setOffers]   = useState<AffiliateOffer[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [modal,    setModal]    = useState<"add" | "edit" | null>(null)
  const [form,     setForm]     = useState<Omit<AffiliateOffer, "id" | "created_at">>(EMPTY)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const d = await fetch("/api/admin/affiliate-offers").then(r => r.json()).catch(() => [])
    setOffers(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() { setForm(EMPTY); setEditId(null); setModal("add") }
  function openEdit(o: AffiliateOffer) {
    setForm({ name: o.name, product: o.product ?? "", commission: o.commission,
      commission_type: o.commission_type, description: o.description ?? "",
      image_url: o.image_url ?? "", status: o.status })
    setEditId(o.id)
    setModal("edit")
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    if (modal === "add") {
      const d = await fetch("/api/admin/affiliate-offers", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      }).then(r => r.json())
      if (d?.id) setOffers(prev => [d, ...prev])
    } else if (editId) {
      await fetch(`/api/admin/affiliate-offers/${editId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      setOffers(prev => prev.map(o => o.id === editId ? { ...o, ...form } : o))
    }
    setSaving(false)
    setModal(null)
  }

  async function del(id: string) {
    if (!confirm("Supprimer cette offre ?")) return
    setDeleting(id)
    await fetch(`/api/admin/affiliate-offers/${id}`, { method: "DELETE" })
    setOffers(prev => prev.filter(o => o.id !== id))
    setDeleting(null)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Offres Affiliés</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gérez les offres d'affiliation visibles par les clients</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
            <Plus className="w-4 h-4" /> Ajouter offre
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total offres",      val: offers.length },
          { label: "Actives",           val: offers.filter(o => o.status === "active").length },
          { label: "Commission moy.",   val: offers.length ? (offers.reduce((a, o) => a + o.commission, 0) / offers.length).toFixed(1) + "%" : "—" },
        ].map(s => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{s.val}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Offre", "Produit", "Commission", "Type", "Statut", "Créé le", ""].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">Chargement…</td></tr>
              ) : offers.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Gift className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">Aucune offre. Cliquez sur "Ajouter offre".</p>
                </td></tr>
              ) : offers.map(o => {
                const cfg = STATUS_CFG[o.status]
                return (
                  <tr key={o.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {o.image_url ? (
                          <img src={o.image_url} alt={o.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Gift className="w-4 h-4 text-purple-400" />
                          </div>
                        )}
                        <p className="text-white text-sm font-medium">{o.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-400">{o.product || "—"}</td>
                    <td className="p-4 text-sm text-orange-400 font-medium">{o.commission}{o.commission_type === "percent" ? "%" : "€"}</td>
                    <td className="p-4 text-sm text-neutral-400">{o.commission_type === "percent" ? "Pourcentage" : "Fixe"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>{cfg.label}</span>
                    </td>
                    <td className="p-4 text-sm text-neutral-500">{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(o)} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {deleting === o.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                        ) : (
                          <button onClick={() => del(o.id)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-white font-semibold">{modal === "add" ? "Ajouter une offre" : "Modifier l'offre"}</h2>
              <button onClick={() => setModal(null)} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Nom de l'offre *", key: "name",      type: "text", placeholder: "Ex: Summer Fitness Offer" },
                { label: "Produit",           key: "product",   type: "text", placeholder: "Ex: Fitness Band Pro" },
                { label: "URL image",         key: "image_url", type: "url",  placeholder: "https://…" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">{f.label}</label>
                  <input type={f.type} value={(form as Record<string, unknown>)[f.key] as string ?? ""}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Commission</label>
                  <input type="number" step="0.1" min="0" value={form.commission}
                    onChange={e => setForm(prev => ({ ...prev, commission: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Type</label>
                  <select value={form.commission_type}
                    onChange={e => setForm(prev => ({ ...prev, commission_type: e.target.value as "percent" | "fixed" }))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500">
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">Fixe (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Description</label>
                <textarea value={form.description ?? ""} rows={3}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de l'offre affilié…"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Statut</label>
                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as AffiliateOffer["status"] }))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500">
                  <option value="active">Actif</option>
                  <option value="paused">Pausé</option>
                  <option value="ended">Terminé</option>
                </select>
              </div>

              <button onClick={save} disabled={saving || !form.name.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? "Enregistrement…" : modal === "add" ? "Ajouter l'offre" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
