"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Building2, ArrowRight, Bitcoin, Copy, Check,
  Search, RefreshCw, Star, ExternalLink,
} from "lucide-react"

interface PM {
  id:            string
  clientId:      string
  clientName:    string
  clientEmail:   string
  type:          "bank" | "wise" | "crypto"
  label:         string
  iban?:         string | null
  bic?:          string | null
  accountHolder?: string | null
  wiseEmail?:    string | null
  wiseCurrency?: string | null
  cryptoNetwork?: string | null
  cryptoAddress?: string | null
  isDefault:     boolean
  createdAt:     string | null
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy}
      className="ml-1.5 text-neutral-600 hover:text-orange-400 transition-colors flex-shrink-0"
      title="Copier">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

const TYPE_CFG = {
  bank:   { label: "Virement IBAN",  Icon: Building2, bg: "bg-blue-500/10",   color: "text-blue-400",   border: "border-blue-500/20"   },
  wise:   { label: "Wise",           Icon: ArrowRight, bg: "bg-green-500/10", color: "text-green-400",  border: "border-green-500/20"  },
  crypto: { label: "Crypto",         Icon: Bitcoin,   bg: "bg-purple-500/10", color: "text-purple-400", border: "border-purple-500/20" },
}

export default function AdminPaymentMethods() {
  const [methods,  setMethods]  = useState<PM[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState("")
  const [typeF,    setTypeF]    = useState<"ALL" | "bank" | "wise" | "crypto">("ALL")

  const load = useCallback(async () => {
    setLoading(true)
    const d = await fetch("/api/admin/payment-methods").then(r => r.json()).catch(() => [])
    setMethods(Array.isArray(d) ? d : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = methods.filter(m => {
    const q = search.toLowerCase()
    const ms = `${m.clientName} ${m.clientEmail} ${m.iban ?? ""} ${m.wiseEmail ?? ""} ${m.cryptoAddress ?? ""} ${m.label}`.toLowerCase().includes(q)
    const mt = typeF === "ALL" || m.type === typeF
    return ms && mt
  })

  // Group by client
  const byClient = new Map<string, { name: string; email: string; id: string; methods: PM[] }>()
  for (const m of filtered) {
    if (!byClient.has(m.clientId)) {
      byClient.set(m.clientId, { name: m.clientName, email: m.clientEmail, id: m.clientId, methods: [] })
    }
    byClient.get(m.clientId)!.methods.push(m)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Méthodes de paiement</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Coordonnées bancaires clients pour les virements payout</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(["bank", "wise", "crypto"] as const).map(t => {
          const cfg = TYPE_CFG[t]
          const count = methods.filter(m => m.type === t).length
          return (
            <div key={t} className={`bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                <cfg.Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{count}</div>
                <div className="text-xs text-neutral-500">{cfg.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Client, IBAN, email Wise…"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
        </div>
        <div className="flex gap-2">
          {(["ALL", "bank", "wise", "crypto"] as const).map(t => (
            <button key={t} onClick={() => setTypeF(t)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                typeF === t
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600"
              }`}>
              {t === "ALL" ? "Tous" : TYPE_CFG[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grouped by client */}
      {loading ? (
        <div className="text-center py-16 text-neutral-500 text-sm">Chargement…</div>
      ) : byClient.size === 0 ? (
        <div className="text-center py-16 text-neutral-500 text-sm">Aucune méthode de paiement trouvée.</div>
      ) : (
        <div className="space-y-4">
          {[...byClient.values()].map(client => (
            <div key={client.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              {/* Client header */}
              <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{client.name}</p>
                  <p className="text-neutral-500 text-xs">{client.email}</p>
                </div>
                <Link href={`/admin/clients/${client.id}`}
                  className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  Voir le client <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Payment methods */}
              <div className="divide-y divide-neutral-800/60">
                {client.methods.map(m => {
                  const cfg = TYPE_CFG[m.type]
                  return (
                    <div key={m.id} className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                          <cfg.Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        </div>
                        <span className="text-white text-sm font-medium">{m.label}</span>
                        {m.isDefault && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                            <Star className="w-2.5 h-2.5 fill-amber-400" /> Défaut
                          </span>
                        )}
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Bank */}
                        {m.type === "bank" && <>
                          {m.accountHolder && (
                            <Field label="Titulaire du compte" value={m.accountHolder} />
                          )}
                          {m.iban && (
                            <Field label="IBAN" value={m.iban} mono copyable />
                          )}
                          {m.bic && (
                            <Field label="BIC / SWIFT" value={m.bic} mono copyable />
                          )}
                        </>}

                        {/* Wise */}
                        {m.type === "wise" && <>
                          {m.wiseEmail && (
                            <Field label="Email Wise" value={m.wiseEmail} copyable />
                          )}
                          {m.wiseCurrency && (
                            <Field label="Devise" value={m.wiseCurrency} />
                          )}
                        </>}

                        {/* Crypto */}
                        {m.type === "crypto" && <>
                          {m.cryptoNetwork && (
                            <Field label="Réseau" value={m.cryptoNetwork} />
                          )}
                          {m.cryptoAddress && (
                            <Field label="Adresse" value={m.cryptoAddress} mono copyable />
                          )}
                        </>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, mono, copyable }: { label: string; value: string; mono?: boolean; copyable?: boolean }) {
  return (
    <div className="bg-neutral-800/50 rounded-lg px-3 py-2.5">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <div className="flex items-center">
        <span className={`text-sm text-white ${mono ? "font-mono tracking-wide" : "font-medium"} break-all`}>
          {value}
        </span>
        {copyable && <CopyBtn value={value} />}
      </div>
    </div>
  )
}
