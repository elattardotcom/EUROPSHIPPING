"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, X, Loader2, RefreshCw, Gift, Users, Tag, Globe } from "lucide-react"

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
  cost_price: number | null
  cod_price: number | null
  category: string | null
  countries: string[] | null
  stock_status: "available" | "limited" | "out_of_stock" | null
  shipping_days: number | null
  activation_count: number
}

const EMPTY: Omit<AffiliateOffer, "id" | "created_at" | "activation_count"> = {
  name: "", product: "", commission: 0, commission_type: "percent",
  description: "", image_url: "", status: "active",
  cost_price: 0, cod_price: 0, category: "Général",
  countries: [], stock_status: "available", shipping_days: 5,
}

const CATEGORIES = ["Beauté","Sport","Maison","Mode","Tech","Santé","Cuisine","Enfants","Général"]
const COUNTRY_LIST = [
  { code:"ES", flag:"🇪🇸", name:"Espagne" },
  { code:"IT", flag:"🇮🇹", name:"Italie" },
  { code:"PT", flag:"🇵🇹", name:"Portugal" },
  { code:"RO", flag:"🇷🇴", name:"Roumanie" },
  { code:"BG", flag:"🇧🇬", name:"Bulgarie" },
  { code:"HU", flag:"🇭🇺", name:"Hongrie" },
  { code:"GR", flag:"🇬🇷", name:"Grèce" },
  { code:"FR", flag:"🇫🇷", name:"France" },
  { code:"DE", flag:"🇩🇪", name:"Allemagne" },
  { code:"BE", flag:"🇧🇪", name:"Belgique" },
]

const STATUS_CFG = {
  active: { label: "Actif",   cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  paused: { label: "Pausé",   cls: "bg-yellow-500/20  text-yellow-400  border-yellow-500/30"  },
  ended:  { label: "Terminé", cls: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30" },
}

const STOCK_CFG = {
  available:    { label: "Disponible",  cls: "text-emerald-400" },
  limited:      { label: "Stock limité",cls: "text-amber-400"   },
  out_of_stock: { label: "Rupture",     cls: "text-red-400"     },
}

const INPUT = "w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500"

export default function AdminAffiliateOffersPage() {
  const [offers,   setOffers]   = useState<AffiliateOffer[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [modal,    setModal]    = useState<"add" | "edit" | null>(null)
  const [form,     setForm]     = useState<Omit<AffiliateOffer, "id" | "created_at" | "activation_count">>(EMPTY)
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
    setForm({
      name: o.name, product: o.product ?? "", commission: o.commission,
      commission_type: o.commission_type, description: o.description ?? "",
      image_url: o.image_url ?? "", status: o.status,
      cost_price: o.cost_price ?? 0, cod_price: o.cod_price ?? 0,
      category: o.category ?? "Général", countries: o.countries ?? [],
      stock_status: o.stock_status ?? "available", shipping_days: o.shipping_days ?? 5,
    })
    setEditId(o.id); setModal("edit")
  }

  function toggleCountry(code: string) {
    setForm(prev => {
      const current = prev.countries ?? []
      return { ...prev, countries: current.includes(code) ? current.filter(c => c !== code) : [...current, code] }
    })
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    if (modal === "add") {
      const d = await fetch("/api/admin/affiliate-offers", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      }).then(r => r.json())
      if (d?.id) setOffers(prev => [{ ...d, activation_count: 0 }, ...prev])
    } else if (editId) {
      await fetch(`/api/admin/affiliate-offers/${editId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      setOffers(prev => prev.map(o => o.id === editId ? { ...o, ...form } : o))
    }
    setSaving(false); setModal(null)
  }

  async function del(id: string) {
    if (!confirm("Supprimer ce produit ?")) return
    setDeleting(id)
    await fetch(`/api/admin/affiliate-offers/${id}`, { method: "DELETE" })
    setOffers(prev => prev.filter(o => o.id !== id))
    setDeleting(null)
  }

  const totalActivations = offers.reduce((s, o) => s + (o.activation_count ?? 0), 0)

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Catalogue produits</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Produits disponibles à l'activation par les clients</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
            <Plus className="w-4 h-4" /> Ajouter produit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total produits",    val: offers.length,                                             icon: Gift,  color: "#f97316" },
          { label: "Actifs",            val: offers.filter(o => o.status === "active").length,          icon: Tag,   color: "#10b981" },
          { label: "Activations total", val: totalActivations,                                          icon: Users, color: "#8b5cf6" },
          { label: "Marge moy. client", val: offers.length
              ? "€" + (offers.reduce((s, o) => s + ((o.cod_price ?? 0) - (o.cost_price ?? 0) - o.commission), 0) / offers.length).toFixed(0)
              : "—",                                                                                     icon: Globe, color: "#06b6d4" },
        ].map(s => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}18` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{s.val}</p>
              <p className="text-xs text-neutral-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Produit","Catégorie","Prix coûtant","Prix COD","Marge client","Commission","Pays","Stock","Statut","Activations",""].map(h => (
                  <th key={h} className="text-left p-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="py-12 text-center text-neutral-500 text-sm">Chargement…</td></tr>
              ) : offers.length === 0 ? (
                <tr><td colSpan={11} className="py-16 text-center">
                  <Gift className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">Aucun produit. Cliquez sur "Ajouter produit".</p>
                </td></tr>
              ) : offers.map(o => {
                const margin = (o.cod_price ?? 0) - (o.cost_price ?? 0) - o.commission
                const cfg    = STATUS_CFG[o.status]
                const stock  = STOCK_CFG[o.stock_status ?? "available"]
                return (
                  <tr key={o.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        {o.image_url
                          ? <img src={o.image_url} alt={o.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                          : <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0"><Gift className="w-4 h-4 text-orange-400" /></div>
                        }
                        <div>
                          <p className="text-white text-sm font-medium leading-tight">{o.name}</p>
                          {o.product && <p className="text-neutral-600 text-[10px]">{o.product}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">{o.category ?? "—"}</span>
                    </td>
                    <td className="p-3 text-sm text-neutral-400">€{(o.cost_price ?? 0).toFixed(2)}</td>
                    <td className="p-3 text-sm text-white font-medium">€{(o.cod_price ?? 0).toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`text-sm font-bold ${margin >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        €{margin.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-orange-400 font-medium">
                      {o.commission}{o.commission_type === "percent" ? "%" : "€"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-0.5">
                        {(o.countries ?? []).slice(0, 4).map(c => (
                          <span key={c} className="text-sm">{COUNTRY_LIST.find(x => x.code === c)?.flag ?? c}</span>
                        ))}
                        {(o.countries ?? []).length > 4 && <span className="text-xs text-neutral-600">+{(o.countries ?? []).length - 4}</span>}
                        {!(o.countries ?? []).length && <span className="text-neutral-700 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-medium ${stock.cls}`}>{stock.label}</span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>{cfg.label}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-violet-400" />
                        <span className="text-sm font-bold text-violet-400">{o.activation_count ?? 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(o)} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {deleting === o.id
                          ? <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                          : <button onClick={() => del(o.id)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        }
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
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900 z-10">
              <h2 className="text-white font-semibold">{modal === "add" ? "Ajouter un produit" : "Modifier le produit"}</h2>
              <button onClick={() => setModal(null)} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">

              {/* Section: Infos produit */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Informations produit</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1.5">Nom du produit *</label>
                      <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Ex: Montre Sport Ultra" className={INPUT} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1.5">Référence / SKU</label>
                      <input type="text" value={form.product ?? ""} onChange={e => setForm(p => ({ ...p, product: e.target.value }))}
                        placeholder="Ex: SKU-001" className={INPUT} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1.5">Catégorie</label>
                      <select value={form.category ?? "Général"} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={INPUT}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1.5">URL image</label>
                      <input type="url" value={form.image_url ?? ""} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                        placeholder="https://…" className={INPUT} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Description</label>
                    <textarea value={form.description ?? ""} rows={2}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Description du produit…"
                      className={INPUT + " resize-none"} />
                  </div>
                </div>
              </div>

              {/* Section: Tarification */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Tarification</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Prix fournisseur (€)</label>
                    <input type="number" step="0.01" min="0" value={form.cost_price ?? 0}
                      onChange={e => setForm(p => ({ ...p, cost_price: parseFloat(e.target.value) || 0 }))} className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Prix COD suggéré (€)</label>
                    <input type="number" step="0.01" min="0" value={form.cod_price ?? 0}
                      onChange={e => setForm(p => ({ ...p, cod_price: parseFloat(e.target.value) || 0 }))} className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Commission</label>
                    <input type="number" step="0.1" min="0" value={form.commission}
                      onChange={e => setForm(p => ({ ...p, commission: parseFloat(e.target.value) || 0 }))} className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Type commission</label>
                    <select value={form.commission_type} onChange={e => setForm(p => ({ ...p, commission_type: e.target.value as "percent" | "fixed" }))} className={INPUT}>
                      <option value="fixed">Fixe (€)</option>
                      <option value="percent">Pourcentage (%)</option>
                    </select>
                  </div>
                </div>
                {/* Margin preview */}
                {(form.cod_price ?? 0) > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-neutral-500">Marge estimée client :</span>
                    <span className="font-bold text-emerald-400">
                      €{((form.cod_price ?? 0) - (form.cost_price ?? 0) - (form.commission_type === "fixed" ? form.commission : (form.cod_price ?? 0) * form.commission / 100)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Section: Logistique */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Logistique</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Délai livraison (jours)</label>
                    <input type="number" min="1" value={form.shipping_days ?? 5}
                      onChange={e => setForm(p => ({ ...p, shipping_days: parseInt(e.target.value) || 5 }))} className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Stock</label>
                    <select value={form.stock_status ?? "available"} onChange={e => setForm(p => ({ ...p, stock_status: e.target.value as AffiliateOffer["stock_status"] }))} className={INPUT}>
                      <option value="available">Disponible</option>
                      <option value="limited">Stock limité</option>
                      <option value="out_of_stock">Rupture de stock</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2">Pays disponibles</label>
                  <div className="flex flex-wrap gap-2">
                    {COUNTRY_LIST.map(c => {
                      const active = (form.countries ?? []).includes(c.code)
                      return (
                        <button key={c.code} type="button" onClick={() => toggleCountry(c.code)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            active ? "bg-orange-500/15 border-orange-500/40 text-orange-400" : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                          }`}>
                          <span>{c.flag}</span>{c.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Statut</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as AffiliateOffer["status"] }))} className={INPUT}>
                  <option value="active">Actif</option>
                  <option value="paused">Pausé</option>
                  <option value="ended">Terminé</option>
                </select>
              </div>

              <button onClick={save} disabled={saving || !form.name.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? "Enregistrement…" : modal === "add" ? "Ajouter le produit" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
