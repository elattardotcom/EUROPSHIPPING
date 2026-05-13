"use client"

import { useState, useEffect } from "react"
import {
  Store, Plus, Settings, Trash2, RefreshCw, CheckCircle,
  AlertCircle, ExternalLink, ArrowRight, Copy, Check,
  Zap, Link2, ShoppingBag, Package, Lock, Unplug, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPlanLimits } from "@/lib/plan-limits"
import { getClientIdFromCookie } from "@/lib/client-cookie"

interface ShopifyStore {
  id: string
  name: string
  domain: string
  status: "connected" | "error" | "syncing"
  ordersToday: number
  totalOrders: number
  lastSync: string
  currency: string
}

const DEMO_STORES: ShopifyStore[] = [
  {
    id: "1",
    name: "Main Store Portugal",
    domain: "main-store-pt.myshopify.com",
    status: "connected",
    ordersToday: 12,
    totalOrders: 1247,
    lastSync: "Il y a 2 min",
    currency: "EUR",
  },
  {
    id: "2",
    name: "Store Espagne",
    domain: "store-spain.myshopify.com",
    status: "connected",
    ordersToday: 8,
    totalOrders: 892,
    lastSync: "Il y a 5 min",
    currency: "EUR",
  },
  {
    id: "3",
    name: "Store Italie",
    domain: "store-italy.myshopify.com",
    status: "syncing",
    ordersToday: 5,
    totalOrders: 634,
    lastSync: "Synchronisation…",
    currency: "EUR",
  },
]

const STEPS = [
  {
    num: "1",
    icon: ShoppingBag,
    title: "Ouvrez votre admin Shopify",
    desc: "Connectez-vous à votre boutique Shopify et allez dans Applications → Gérer les applications privées.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
  {
    num: "2",
    icon: Link2,
    title: "Créez une app privée",
    desc: "Activez le développement d'applications privées, créez une nouvelle app et copiez la clé API et le mot de passe.",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
  },
  {
    num: "3",
    icon: Settings,
    title: "Entrez vos informations",
    desc: "Collez votre domaine Shopify et la clé API dans le formulaire ci-dessous. Nous nous occupons du reste.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    num: "4",
    icon: Zap,
    title: "Synchronisation automatique",
    desc: "Dès la connexion établie, vos commandes et leads arrivent en temps réel dans votre tableau de bord CODShipEurope.",
    color: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.2)",
  },
]

function StoreStatusBadge({ status }: { status: ShopifyStore["status"] }) {
  const cfg = {
    connected: { label: "Connectée",     cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", Icon: CheckCircle, spin: false },
    error:     { label: "Erreur",         cls: "bg-red-500/15 text-red-400 border-red-500/25",             Icon: AlertCircle, spin: false },
    syncing:   { label: "Sync en cours",  cls: "bg-blue-500/15 text-blue-400 border-blue-500/25",          Icon: RefreshCw,   spin: true  },
  }[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <cfg.Icon className={`w-3 h-3 ${cfg.spin ? "animate-spin" : ""}`} />
      {cfg.label}
    </span>
  )
}

function ConnectForm({ onCancel }: { onCancel: () => void }) {
  const [domain, setDomain] = useState("")
  const [err,    setErr]    = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = domain.trim().toLowerCase()
      .replace(/^https?:\/\//, "").replace(/\/$/, "")
    if (!clean.includes(".myshopify.com")) {
      setErr("Le domaine doit se terminer par .myshopify.com")
      return
    }
    window.location.href = `/api/shopify/auth?shop=${clean}`
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: "rgba(12,12,12,0.9)" }}>
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: "rgba(255,255,255,0.04)" }}>🛍️</div>
          <div>
            <p className="text-white font-semibold text-sm">Connecter une boutique Shopify</p>
            <p className="text-neutral-600 text-xs">Vous serez redirigé vers Shopify pour autoriser l&apos;accès</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-neutral-600 hover:text-white text-xl leading-none transition-colors">×</button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {err && (
          <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{err}
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wider">Domaine Shopify *</label>
          <input
            type="text"
            value={domain}
            onChange={e => { setDomain(e.target.value); setErr("") }}
            placeholder="ma-boutique.myshopify.com"
            required
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-700 focus:outline-none focus:border-orange-500/60 transition-colors font-mono"
          />
          <p className="text-neutral-700 text-xs mt-1.5">Ex : ma-boutique.myshopify.com — sans https://</p>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit"
            className="flex items-center gap-2 font-bold text-sm text-white px-6 py-3 rounded-xl transition-all"
            style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 4px 20px rgba(249,115,22,0.25)" }}>
            <CheckCircle className="w-4 h-4" />Connecter via Shopify
          </button>
          <button type="button" onClick={onCancel}
            className="text-sm text-neutral-500 hover:text-white border border-white/[0.08] px-5 py-3 rounded-xl transition-all hover:border-white/20">
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

interface RealStore {
  id: string; name: string; domain: string
  status: string; last_sync: string | null
}

export default function StoresPage() {
  const [clientId,       setClientId]       = useState(getClientIdFromCookie)
  const [plan,           setPlan]           = useState("starter")
  const [stores,         setStores]         = useState(DEMO_STORES)
  const [realStores,     setRealStores]     = useState<RealStore[]>([])
  const [loadingReal,    setLoadingReal]    = useState(true)
  const [showForm,       setShowForm]       = useState(false)
  const [disconnecting,  setDisconnecting]  = useState<string | null>(null)
  const [syncing,        setSyncing]        = useState<string | null>(null)

  const isDemo = clientId === "c1"

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(c => { if (c?.id) { setClientId(c.id); setPlan(c.plan ?? "starter") } })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isDemo) { setLoadingReal(false); return }
    fetch("/api/stores")
      .then(r => r.json())
      .then(d => { setRealStores(Array.isArray(d) ? d : []); setLoadingReal(false) })
      .catch(() => setLoadingReal(false))
  }, [isDemo])

  async function syncStore(storeId: string) {
    setSyncing(storeId)
    try {
      await fetch("/api/shopify/sync-store", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ storeId }),
      })
    } catch {}
    setSyncing(null)
  }

  async function disconnectStore(storeId: string) {
    if (!confirm("Déconnecter cette boutique ? Les produits associés seront supprimés.")) return
    setDisconnecting(storeId)
    try {
      const res = await fetch(`/api/stores/${storeId}`, { method: "DELETE" })
      if (res.ok) setRealStores(prev => prev.filter(s => s.id !== storeId))
    } catch {}
    setDisconnecting(null)
  }

  /* ── Real clients view ────────────────────────────── */
  if (!isDemo) {
    const hasStores   = realStores.length > 0
    const limits      = getPlanLimits(plan)
    const atStoreLimit = limits.stores !== Infinity && realStores.length >= limits.stores

    return (
      <div className="max-w-3xl mx-auto py-8">
        <style>{`
          @keyframes float-shop {
            0%,100% { transform: translateY(0) }
            50% { transform: translateY(-8px) }
          }
          .float-shop { animation: float-shop 3s ease-in-out infinite }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Intégrations Shopify</h1>
            <p className="text-neutral-500 text-sm">Connectez vos boutiques pour synchroniser vos commandes automatiquement</p>
          </div>
          {hasStores && (
            atStoreLimit ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-500/30 bg-orange-500/5">
                <Lock className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <div className="text-right">
                  <p className="text-xs font-bold text-orange-400">{realStores.length}/{limits.stores} boutiques</p>
                  <a href="/dashboard/settings" className="text-[10px] text-orange-400/70 hover:text-orange-300 underline">Passer au plan supérieur</a>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 font-bold text-sm text-white px-5 py-2.5 rounded-xl transition-all"
                style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 4px 16px rgba(249,115,22,0.25)" }}>
                <Plus className="w-4 h-4" />Ajouter une boutique
              </button>
            )
          )}
        </div>

        {/* Connected stores list */}
        {loadingReal ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : hasStores ? (
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden mb-8"
            style={{ background: "rgba(10,10,10,0.8)" }}>
            <div className="px-5 py-4 border-b border-white/[0.05]">
              <p className="text-white font-bold text-sm">Mes boutiques ({realStores.length})</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {realStores.map(s => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="text-2xl flex-shrink-0">🛍️</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-semibold text-sm">{s.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        s.status === "connected"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      }`}>
                        {s.status === "connected" ? "Connectée" : "En cours"}
                      </span>
                    </div>
                    <p className="text-neutral-600 text-xs font-mono">{s.domain}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      {s.last_sync && (
                        <p className="text-neutral-700 text-[10px]">
                          Sync {new Date(s.last_sync).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                      <a href="/dashboard/products"
                        className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 justify-end mt-1">
                        Voir les produits <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                    <button
                      onClick={() => syncStore(s.id)}
                      disabled={syncing === s.id}
                      title="Synchroniser"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15 transition-colors disabled:opacity-50"
                    >
                      {syncing === s.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <RefreshCw className="w-3 h-3" />
                      }
                      Synchroniser
                    </button>
                    <button
                      onClick={() => disconnectStore(s.id)}
                      disabled={disconnecting === s.id}
                      title="Déconnecter"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 transition-colors disabled:opacity-50"
                    >
                      {disconnecting === s.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Unplug className="w-3 h-3" />
                      }
                      Déconnecter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Hero card — only shown when no stores yet */}
        {!loadingReal && !hasStores && (
        <div className="relative rounded-2xl border border-white/[0.07] overflow-hidden mb-8 text-center py-14 px-8"
          style={{ background: "linear-gradient(160deg,rgba(16,185,129,0.06) 0%,rgba(8,8,8,1) 60%)" }}>
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(16,185,129,0.4),transparent)" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 pointer-events-none"
            style={{ background: "radial-gradient(ellipse,rgba(16,185,129,0.08),transparent 70%)" }} />

          <div className="relative">
            <div className="float-shop text-7xl mb-6 select-none">🛍️</div>
            <h2 className="text-2xl font-black text-white mb-3">Aucune boutique connectée</h2>
            <p className="text-neutral-500 text-sm max-w-sm mx-auto leading-relaxed mb-8">
              Connectez votre première boutique Shopify et vos commandes arriveront automatiquement dans CODShipEurope en temps réel.
            </p>
            {atStoreLimit ? (
              <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-orange-500/30 bg-orange-500/5">
                <Lock className="w-4 h-4 text-orange-400" />
                <div className="text-left">
                  <p className="text-sm font-bold text-orange-400">Limite atteinte — plan {limits.label}</p>
                  <a href="/dashboard/settings" className="text-xs text-orange-400/70 hover:text-orange-300 underline">Passer à un plan supérieur</a>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 font-bold text-sm text-white px-8 py-3.5 rounded-xl transition-all"
                style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
                <Plus className="w-4 h-4" />
                Connecter ma boutique
              </button>
            )}
          </div>
        </div>
        )}

        {/* Steps — shown when no store yet, or when the add form is open */}
        {(!hasStores || showForm) && <div className="mb-8">
          <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest mb-5">Comment ça marche</p>
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={i} className="group flex gap-4 p-5 rounded-2xl border border-white/[0.05] hover:border-white/[0.1] transition-all"
                style={{ background: "rgba(10,10,10,0.8)" }}>
                {/* Number + icon */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-px flex-1 min-h-[20px]" style={{ background: `${s.color}20` }} />
                  )}
                </div>
                {/* Text */}
                <div className="pt-1.5 pb-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded"
                      style={{ color: s.color, background: s.bg }}>
                      ÉTAPE {s.num}
                    </span>
                    <h3 className="text-white font-bold text-sm">{s.title}</h3>
                  </div>
                  <p className="text-neutral-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* Benefits row — only when no stores yet */}
        {!hasStores && <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: "⚡", label: "Sync instantanée", sub: "Commandes en temps réel" },
            { icon: "🔒", label: "Connexion sécurisée", sub: "API Shopify officielle" },
            { icon: "🛒", label: "Multi-boutiques", sub: "Autant que vous voulez" },
          ].map(b => (
            <div key={b.label} className="text-center p-4 rounded-xl border border-white/[0.05]"
              style={{ background: "rgba(10,10,10,0.6)" }}>
              <div className="text-2xl mb-2">{b.icon}</div>
              <p className="text-white text-xs font-bold mb-0.5">{b.label}</p>
              <p className="text-neutral-600 text-[10px]">{b.sub}</p>
            </div>
          ))}
        </div>}

        {/* Connect form */}
        {(showForm || !hasStores) && <ConnectForm onCancel={() => setShowForm(false)} />}
      </div>
    )
  }

  /* ── Demo view with mock stores ───────────────────── */
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Boutiques Shopify</h1>
          <p className="text-sm text-neutral-500">Connectez et gérez vos boutiques pour la synchronisation automatique des commandes</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 font-semibold text-sm text-white px-5 py-2.5 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 4px 16px rgba(249,115,22,0.25)" }}>
          <Plus className="w-4 h-4" />
          Connecter une boutique
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Boutiques actives",  value: stores.filter(s => s.status === "connected").length, icon: Store,      color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Commandes du jour",  value: stores.reduce((a, s) => a + s.ordersToday, 0),       icon: Package,     color: "text-blue-400",    bg: "bg-blue-500/10" },
          { label: "Total commandes",    value: stores.reduce((a, s) => a + s.totalOrders, 0).toLocaleString(), icon: CheckCircle, color: "text-purple-400",  bg: "bg-purple-500/10" },
          { label: "Erreurs de sync",    value: stores.filter(s => s.status === "error").length,     icon: AlertCircle, color: "text-orange-400",  bg: "bg-orange-500/10" },
        ].map(s => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-neutral-500">{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Store list */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <h2 className="text-base font-semibold text-white">Mes boutiques</h2>
        </div>
        <div className="divide-y divide-neutral-800">
          {stores.map(store => (
            <div key={store.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  🛍️
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm">{store.name}</h3>
                    <StoreStatusBadge status={store.status} />
                  </div>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 font-mono">
                    {store.domain}
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-base font-bold text-white">{store.ordersToday}</p>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wide">Aujourd'hui</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-white">{store.totalOrders.toLocaleString()}</p>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wide">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-400">{store.lastSync}</p>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wide">Dernière sync</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white hover:bg-white/5 h-8 w-8">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white hover:bg-white/5 h-8 w-8">
                    <Settings className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-red-400 hover:bg-red-500/8 h-8 w-8">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <ConnectForm onCancel={() => setShowForm(false)} />
      )}
    </div>
  )
}
