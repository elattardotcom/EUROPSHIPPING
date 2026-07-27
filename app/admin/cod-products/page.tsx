"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, X, Loader2, RefreshCw, Package } from "lucide-react"

interface CodProduct {
  id: string
  name: string
  supplier: string | null
  cost_price: number
  selling_price: number
  stock: number
  category: string | null
  shipping_days: string | null
  image_url: string | null
  description: string | null
  status: "active" | "paused" | "ended"
  created_at: string
}

const EMPTY: Omit<CodProduct, "id" | "created_at"> = {
  name: "", supplier: "", cost_price: 0, selling_price: 0,
  stock: 0, category: "", shipping_days: "", image_url: "", description: "", status: "active",
}

const STATUS_CFG = {
  active: { label: "Actif",   cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  paused: { label: "Pausé",   cls: "bg-yellow-500/20  text-yellow-400  border-yellow-500/30"  },
  ended:  { label: "Terminé", cls: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30" },
}

export default function AdminCodProductsPage() {
  const [products, setProducts] = useState<CodProduct[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [modal,    setModal]    = useState<"add" | "edit" | null>(null)
  const [form,     setForm]     = useState<Omit<CodProduct, "id" | "created_at">>(EMPTY)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const d = await fetch("/api/admin/cod-products").then(r => r.json()).catch(() => [])
    setProducts(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() { setForm(EMPTY); setEditId(null); setModal("add") }
  function openEdit(p: CodProduct) {
    setForm({ name: p.name, supplier: p.supplier ?? "", cost_price: p.cost_price,
      selling_price: p.selling_price, stock: p.stock, category: p.category ?? "",
      shipping_days: p.shipping_days ?? "", image_url: p.image_url ?? "",
      description: p.description ?? "", status: p.status })
    setEditId(p.id)
    setModal("edit")
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    if (modal === "add") {
      const d = await fetch("/api/admin/cod-products", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      }).then(r => r.json())
      if (d?.id) setProducts(prev => [d, ...prev])
    } else if (editId) {
      await fetch(`/api/admin/cod-products/${editId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...form } : p))
    }
    setSaving(false)
    setModal(null)
  }

  async function del(id: string) {
    if (!confirm("Supprimer ce produit ?")) return
    setDeleting(id)
    await fetch(`/api/admin/cod-products/${id}`, { method: "DELETE" })
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const margin = form.selling_price > 0
    ? (((form.selling_price - form.cost_price) / form.selling_price) * 100).toFixed(1)
    : "0"

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Produits COD Drop</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gérez le catalogue produits visible par les clients</p>
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
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total produits", val: products.length },
          { label: "Actifs", val: products.filter(p => p.status === "active").length },
          { label: "Stock total", val: products.reduce((a, p) => a + p.stock, 0) },
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
                {["Produit", "Fournisseur", "Prix coût", "Prix vente", "Marge", "Stock", "Livraison", "Statut", ""].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-12 text-center text-neutral-500 text-sm">Chargement…</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center">
                  <Package className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">Aucun produit. Cliquez sur "Ajouter produit".</p>
                </td></tr>
              ) : products.map(p => {
                const m = p.selling_price > 0 ? (((p.selling_price - p.cost_price) / p.selling_price) * 100).toFixed(1) : "0"
                const cfg = STATUS_CFG[p.status]
                return (
                  <tr key={p.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-orange-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">{p.name}</p>
                          {p.category && <p className="text-neutral-600 text-xs">{p.category}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-400">{p.supplier || "—"}</td>
                    <td className="p-4 text-sm text-neutral-300">€{p.cost_price.toFixed(2)}</td>
                    <td className="p-4 text-sm text-orange-400 font-medium">€{p.selling_price.toFixed(2)}</td>
                    <td className="p-4 text-sm text-emerald-400 font-medium">{m}%</td>
                    <td className="p-4 text-sm">
                      <span className={p.stock > 0 ? "text-neutral-300" : "text-red-400"}>{p.stock}</span>
                    </td>
                    <td className="p-4 text-sm text-neutral-400">{p.shipping_days || "—"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>{cfg.label}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {deleting === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                        ) : (
                          <button onClick={() => del(p.id)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
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
              <h2 className="text-white font-semibold">{modal === "add" ? "Ajouter un produit" : "Modifier le produit"}</h2>
              <button onClick={() => setModal(null)} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Nom du produit *", key: "name", type: "text", placeholder: "Ex: Fitness Tracker Pro" },
                { label: "Fournisseur",      key: "supplier", type: "text", placeholder: "Ex: ShenzhenTech" },
                { label: "Catégorie",        key: "category", type: "text", placeholder: "Ex: Fitness, Electronics…" },
                { label: "Délai livraison",  key: "shipping_days", type: "text", placeholder: "Ex: 3-5 jours" },
                { label: "URL image",        key: "image_url", type: "url", placeholder: "https://…" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">{f.label}</label>
                  <input type={f.type} value={(form as Record<string, unknown>)[f.key] as string ?? ""}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
                </div>
              ))}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Prix coût (€)</label>
                  <input type="number" step="0.01" min="0" value={form.cost_price}
                    onChange={e => setForm(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Prix vente (€)</label>
                  <input type="number" step="0.01" min="0" value={form.selling_price}
                    onChange={e => setForm(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Stock</label>
                  <input type="number" min="0" value={form.stock}
                    onChange={e => setForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
                </div>
              </div>

              {form.selling_price > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm text-emerald-400">
                  Marge estimée : <span className="font-bold">{margin}%</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Description</label>
                <textarea value={form.description ?? ""} rows={3}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description courte du produit…"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Statut</label>
                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as CodProduct["status"] }))}
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
                {saving ? "Enregistrement…" : modal === "add" ? "Ajouter le produit" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
