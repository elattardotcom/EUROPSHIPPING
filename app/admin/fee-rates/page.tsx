"use client"

import { useState, useEffect, useRef } from "react"
import { Truck, RotateCcw, Phone, Plus, Pencil, Trash2, Check, X, RefreshCw, Info } from "lucide-react"
import type { FeeRate } from "@/lib/db"

function countryFlag(code: string): string {
  if (code === "DEFAULT") return "🌍"
  return code.toUpperCase().split("").map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))).join("")
}

const COUNTRY_PRESETS: { code: string; name: string }[] = [
  { code: "DEFAULT", name: "Par défaut (fallback)" },
  { code: "ES", name: "Espagne" },
  { code: "IT", name: "Italie" },
  { code: "PT", name: "Portugal" },
  { code: "FR", name: "France" },
  { code: "MA", name: "Maroc" },
  { code: "BE", name: "Belgique" },
  { code: "NL", name: "Pays-Bas" },
  { code: "DE", name: "Allemagne" },
  { code: "GB", name: "Royaume-Uni" },
  { code: "DZ", name: "Algérie" },
  { code: "TN", name: "Tunisie" },
  { code: "PL", name: "Pologne" },
  { code: "RO", name: "Roumanie" },
  { code: "GR", name: "Grèce" },
]

interface EditRow {
  countryCode: string
  countryName: string
  deliveryFee: string
  returnFee: string
  callCenterFee: string
}

const fmt = (n: number) => n.toFixed(2)

export default function FeeRatesPage() {
  const [rates,    setRates]    = useState<FeeRate[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [editRow,  setEditRow]  = useState<EditRow | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showAdd,  setShowAdd]  = useState(false)
  const [newRow,   setNewRow]   = useState<EditRow>({ countryCode: "", countryName: "", deliveryFee: "3.00", returnFee: "2.00", callCenterFee: "0.50" })
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null)
  const toastRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/fee-rates")
      if (res.ok) setRates(await res.json())
    } catch { /* no-op */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const startEdit = (rate: FeeRate) => {
    setEditId(rate.countryCode)
    setEditRow({
      countryCode:   rate.countryCode,
      countryName:   rate.countryName,
      deliveryFee:   fmt(rate.deliveryFee),
      returnFee:     fmt(rate.returnFee),
      callCenterFee: fmt(rate.callCenterFee),
    })
    setShowAdd(false)
  }

  const cancelEdit = () => { setEditId(null); setEditRow(null) }

  const saveEdit = async () => {
    if (!editRow) return
    setSaving(true)
    const res = await fetch("/api/admin/fee-rates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode:   editRow.countryCode,
        countryName:   editRow.countryName,
        deliveryFee:   parseFloat(editRow.deliveryFee)   || 0,
        returnFee:     parseFloat(editRow.returnFee)     || 0,
        callCenterFee: parseFloat(editRow.callCenterFee) || 0,
      }),
    })
    setSaving(false)
    if (res.ok) {
      cancelEdit()
      await load()
      showToast("Frais mis à jour !")
    } else {
      showToast("Erreur lors de la sauvegarde", false)
    }
  }

  const deleteRate = async (code: string) => {
    setDeleting(code)
    const res = await fetch(`/api/admin/fee-rates?code=${encodeURIComponent(code)}`, { method: "DELETE" })
    setDeleting(null)
    if (res.ok) { await load(); showToast(`Pays ${code} supprimé`) }
    else showToast("Impossible de supprimer", false)
  }

  const saveNew = async () => {
    if (!newRow.countryCode || !newRow.countryName) return
    setSaving(true)
    const res = await fetch("/api/admin/fee-rates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode:   newRow.countryCode.toUpperCase(),
        countryName:   newRow.countryName,
        deliveryFee:   parseFloat(newRow.deliveryFee)   || 0,
        returnFee:     parseFloat(newRow.returnFee)     || 0,
        callCenterFee: parseFloat(newRow.callCenterFee) || 0,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setShowAdd(false)
      setNewRow({ countryCode: "", countryName: "", deliveryFee: "3.00", returnFee: "2.00", callCenterFee: "0.50" })
      await load()
      showToast("Nouveau pays ajouté !")
    } else {
      showToast("Erreur lors de l'ajout", false)
    }
  }

  const onPresetSelect = (setter: (v: EditRow) => void, current: EditRow, code: string) => {
    const preset = COUNTRY_PRESETS.find(p => p.code === code)
    if (preset) setter({ ...current, countryCode: preset.code, countryName: preset.name })
    else setter({ ...current, countryCode: code })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Frais de service par pays</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Configurer les frais appliqués sur chaque commande lors du retrait</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => { setShowAdd(true); setEditId(null); setEditRow(null) }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <Plus className="w-4 h-4" />Ajouter un pays
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-neutral-400 space-y-0.5">
          <p><span className="text-white font-medium">DEFAULT</span> sert de taux de secours pour tout pays non listé.</p>
          <p>Les frais sont calculés automatiquement à chaque demande de retrait, sur les commandes non encore facturées.</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center gap-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          <span className="w-24">Code</span>
          <span className="flex-1">Pays</span>
          <span className="w-32 text-center flex items-center justify-center gap-1"><Truck className="w-3.5 h-3.5" />Livraison</span>
          <span className="w-32 text-center flex items-center justify-center gap-1"><RotateCcw className="w-3.5 h-3.5" />Retour</span>
          <span className="w-32 text-center flex items-center justify-center gap-1"><Phone className="w-3.5 h-3.5" />Call center</span>
          <span className="w-20 text-center">Actions</span>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-neutral-500">
            <RefreshCw className="w-4 h-4 animate-spin" /><span className="text-sm">Chargement…</span>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {/* Add new row */}
            {showAdd && (
              <div className="px-5 py-4 flex items-center gap-4 bg-orange-500/5 border-b border-orange-500/20">
                <div className="w-24 flex items-center gap-2">
                  {newRow.countryCode && (
                    <span className="text-2xl leading-none flex-shrink-0">{countryFlag(newRow.countryCode)}</span>
                  )}
                  <select
                    value={newRow.countryCode}
                    onChange={e => onPresetSelect(v => setNewRow(v), newRow, e.target.value)}
                    className="flex-1 min-w-0 bg-neutral-800 border border-neutral-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Code</option>
                    {COUNTRY_PRESETS.filter(p => !rates.find(r => r.countryCode === p.code)).map(p => (
                      <option key={p.code} value={p.code}>{countryFlag(p.code)} {p.code} — {p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    value={newRow.countryName}
                    onChange={e => setNewRow(r => ({ ...r, countryName: e.target.value }))}
                    placeholder="Nom du pays"
                    className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                {(["deliveryFee", "returnFee", "callCenterFee"] as const).map(field => (
                  <div key={field} className="w-32">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">€</span>
                      <input
                        type="number" min="0" step="0.10"
                        value={newRow[field]}
                        onChange={e => setNewRow(r => ({ ...r, [field]: e.target.value }))}
                        className="w-full bg-neutral-800 border border-neutral-600 rounded-lg pl-6 pr-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                ))}
                <div className="w-20 flex items-center justify-center gap-1.5">
                  <button onClick={saveNew} disabled={saving || !newRow.countryCode || !newRow.countryName}
                    className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg disabled:opacity-40">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowAdd(false)} className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {rates.length === 0 && !showAdd ? (
              <div className="py-14 text-center text-neutral-500 text-sm">
                Aucun tarif configuré — cliquez sur "Ajouter un pays" ou exécutez la migration SQL.
              </div>
            ) : (
              rates.map(rate => {
                const isEditing = editId === rate.countryCode
                const isDefault = rate.countryCode === "DEFAULT"
                return (
                  <div key={rate.countryCode} className={`px-5 py-3.5 flex items-center gap-4 transition-colors ${isEditing ? "bg-orange-500/5" : "hover:bg-neutral-800/30"}`}>
                    <div className="w-24 flex items-center gap-2">
                      <span className="text-2xl leading-none">{countryFlag(rate.countryCode)}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${isDefault ? "bg-blue-500/15 text-blue-400" : "bg-neutral-800 text-neutral-300"}`}>
                        {rate.countryCode}
                      </span>
                    </div>

                    <div className="flex-1">
                      {isEditing && editRow ? (
                        <input
                          value={editRow.countryName}
                          onChange={e => setEditRow(r => r ? { ...r, countryName: e.target.value } : r)}
                          className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">{rate.countryName}</span>
                      )}
                    </div>

                    {(["deliveryFee", "returnFee", "callCenterFee"] as const).map(field => (
                      <div key={field} className="w-32 text-center">
                        {isEditing && editRow ? (
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">€</span>
                            <input
                              type="number" min="0" step="0.10"
                              value={editRow[field as keyof EditRow]}
                              onChange={e => setEditRow(r => r ? { ...r, [field]: e.target.value } : r)}
                              className="w-full bg-neutral-800 border border-neutral-600 rounded-lg pl-6 pr-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        ) : (
                          <span className="text-white text-sm font-semibold">€ {fmt(rate[field])}</span>
                        )}
                      </div>
                    ))}

                    <div className="w-20 flex items-center justify-center gap-1.5">
                      {isEditing ? (
                        <>
                          <button onClick={saveEdit} disabled={saving}
                            className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg disabled:opacity-40">
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(rate)} className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {!isDefault && (
                            <button
                              onClick={() => deleteRate(rate.countryCode)}
                              disabled={deleting === rate.countryCode}
                              className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40">
                              {deleting === rate.countryCode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Summary card */}
      {rates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Frais livraison", icon: Truck, color: "text-orange-400", bg: "bg-orange-500/10", field: "deliveryFee" as const },
            { label: "Frais retour",    icon: RotateCcw, color: "text-red-400",    bg: "bg-red-500/10",    field: "returnFee" as const },
            { label: "Call center",     icon: Phone,  color: "text-blue-400",   bg: "bg-blue-500/10",   field: "callCenterFee" as const },
          ].map(({ label, icon: Icon, color, bg, field }) => {
            const def = rates.find(r => r.countryCode === "DEFAULT")
            return (
              <div key={field} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-neutral-400 text-xs">{label} (défaut)</p>
                  <p className={`text-xl font-bold ${color}`}>€ {def ? fmt(def[field]) : "—"}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl transition-all ${
          toast.ok ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"
        }`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
