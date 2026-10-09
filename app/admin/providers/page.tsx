"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2, Trash2, Truck, AlertCircle, CheckCircle, X, Save, Wifi, WifiOff } from "lucide-react"

interface Provider {
  id:          string
  name:        string
  serviceType: string
  countries:   string[]
  status:      "active" | "inactive" | "pending"
  apiStatus:   "not_connected" | "connected" | "error"
  lastSyncAt?: string
  lastError?:  string
  notes?:      string
  createdAt:   string
}

const STATUS_CFG = {
  active:   { label: "Active",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  inactive: { label: "Inactive", color: "text-neutral-400", bg: "bg-neutral-800 border-neutral-700" },
  pending:  { label: "Pending",  color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
} as const

function ApiStatusBadge({ apiStatus }: { apiStatus: Provider["apiStatus"] }) {
  if (apiStatus === "connected")
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Wifi className="w-3 h-3" />Connected</span>
  if (apiStatus === "error")
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><AlertCircle className="w-3 h-3" />Error</span>
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-500 border border-neutral-700"><WifiOff className="w-3 h-3" />Not connected</span>
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading,    setLoading]  = useState(true)
  const [showForm,   setShowForm] = useState(false)
  const [name,        setName]        = useState("")
  const [serviceType, setServiceType] = useState("")
  const [countries,   setCountries]   = useState("")
  const [status,      setStatus]      = useState<Provider["status"]>("pending")
  const [notes,       setNotes]       = useState("")
  const [saving,      setSaving]      = useState(false)
  const [msg,         setMsg]         = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [deletingId,  setDeletingId]  = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const d = await fetch("/api/admin/providers").then(r => r.json()).catch(() => [])
    setProviders(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    setMsg(null)
    setSaving(true)
    try {
      const res = await fetch("/api/admin/providers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(), serviceType: serviceType.trim(),
          countries: countries.split(",").map(c => c.trim().toUpperCase()).filter(Boolean),
          status, notes: notes.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error")
      setMsg({ type: "success", text: "Provider added." })
      setShowForm(false)
      setName(""); setServiceType(""); setCountries(""); setStatus("pending"); setNotes("")
      await load()
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Server error" })
    } finally { setSaving(false) }
  }

  async function remove(id: string) {
    setDeletingId(id)
    await fetch(`/api/admin/providers/${id}`, { method: "DELETE" })
    setDeletingId(null)
    await load()
  }

  async function setProviderStatus(id: string, newStatus: Provider["status"]) {
    await fetch(`/api/admin/providers/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    await load()
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-400" />Providers
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">Fulfillment, last-mile, and call-center service providers</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <Plus className="w-4 h-4" />Add provider
          </button>
        )}
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-neutral-400">
          No provider has a live API connection yet. This page lets you record providers you're evaluating or
          onboarding — connecting one for real (API credentials, webhook sync) is separate work done per provider.
        </p>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
          msg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
        }`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="bg-neutral-900 border border-orange-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white font-medium text-sm">New provider</p>
            <button onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white text-xl leading-none"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Beeping"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Service type *</label>
              <input value={serviceType} onChange={e => setServiceType(e.target.value)} placeholder="e.g. fulfillment, last_mile, call_center"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Countries served (comma-separated ISO codes)</label>
              <input value={countries} onChange={e => setCountries(e.target.value)} placeholder="PT, ES, FR"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Commercial status</label>
              <select value={status} onChange={e => setStatus(e.target.value as Provider["status"])}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500">
                <option value="pending">Pending (evaluating)</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Coverage, contact, pricing discussions…"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-orange-500" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={save} disabled={saving || !name.trim() || !serviceType.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 text-sm rounded-xl transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-800">
          <p className="text-sm text-neutral-500">{loading ? "Loading…" : `${providers.length} provider${providers.length !== 1 ? "s" : ""}`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Provider", "Service", "Countries", "Status", "API", "Last sync", ""].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">Loading…</td></tr>
              ) : providers.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">No providers recorded yet</td></tr>
              ) : providers.map(p => {
                const cfg = STATUS_CFG[p.status]
                return (
                  <tr key={p.id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 transition-colors">
                    <td className="p-4">
                      <p className="text-white text-sm font-medium">{p.name}</p>
                      {p.notes && <p className="text-neutral-600 text-xs mt-0.5 max-w-[220px] truncate">{p.notes}</p>}
                    </td>
                    <td className="p-4 text-sm text-neutral-300 font-mono">{p.serviceType}</td>
                    <td className="p-4 text-sm text-neutral-400">{p.countries.length > 0 ? p.countries.join(", ") : "—"}</td>
                    <td className="p-4">
                      <select value={p.status} onChange={e => setProviderStatus(p.id, e.target.value as Provider["status"])}
                        className={`appearance-none px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none ${cfg.bg} ${cfg.color}`}>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="p-4"><ApiStatusBadge apiStatus={p.apiStatus} /></td>
                    <td className="p-4 text-sm text-neutral-500 whitespace-nowrap">{p.lastSyncAt ? new Date(p.lastSyncAt).toLocaleString("en-GB") : "Never"}</td>
                    <td className="p-4">
                      <button onClick={() => remove(p.id)} disabled={deletingId === p.id}
                        className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                        {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
