"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Store, Plus, Settings, Trash2, RefreshCw, CheckCircle,
  AlertCircle, ExternalLink, ArrowRight, Copy, Check,
  Zap, Link2, ShoppingBag, Package, Lock, Unplug, Loader2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPlanLimits } from "@/lib/plan-limits"
import { getClientIdFromCookie } from "@/lib/client-cookie"

const ERROR_MESSAGES: Record<string, string> = {
  state_invalide:    "Erreur de sécurité OAuth (state). Recommencez la connexion.",
  shop_invalide:     "Le domaine Shopify ne correspond pas. Recommencez.",
  hmac_invalide:     "Signature Shopify invalide. Vérifiez votre app Shopify.",
  code_manquant:     "Code d'autorisation manquant. Recommencez la connexion.",
  db_non_configuree: "Erreur de configuration serveur. Contactez le support.",
  plan_limit:        "Limite de boutiques atteinte pour votre plan.",
}

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
    desc: "Connectez-vous à votre boutique Shopify. Allez dans Paramètres → Applications et canaux de vente → Développer des applications.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
  {
    num: "2",
    icon: Link2,
    title: "Créez une application personnalisée",
    desc: "Cliquez sur « Créer une application », donnez-lui un nom (ex : CODShipEurope), puis configurez les permissions : read_products, write_products, read_orders, write_orders.",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
  },
  {
    num: "3",
    icon: Settings,
    title: "Copiez le token d'accès",
    desc: "Installez l'application, allez dans l'onglet « Credentials de l'API » et copiez le « Jeton d'accès Admin API ».",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    num: "4",
    icon: Zap,
    title: "Collez dans le formulaire ci-dessous",
    desc: "Entrez votre domaine .myshopify.com et le token. Vos commandes arrivent en temps réel dans CODShipEurope.",
    color: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.2)",
  },
]

const WEBHOOK_STEPS = [
  {
    num: "1", color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)",
    icon: ShoppingBag,
    title: "Ouvrez votre admin Shopify",
    desc: "Connectez-vous à votre boutique Shopify et allez dans Paramètres (en bas à gauche).",
  },
  {
    num: "2", color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)",
    icon: Link2,
    title: "Notifications → Webhooks",
    desc: "Dans Paramètres, cliquez sur « Notifications ». Faites défiler jusqu'en bas → section « Webhooks » → « Créer un webhook ».",
  },
  {
    num: "3", color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)",
    icon: Zap,
    title: "Collez votre URL et enregistrez",
    desc: "Évènement : « Création de commande » · Format : JSON · URL : copiez-la ci-dessus. Cliquez Enregistrer. C'est tout.",
  },
]

function WebhookView({
  clientId, webhookUrl, banner, setBanner,
}: {
  clientId: string
  webhookUrl: string
  banner: { type: "success" | "error"; msg: string } | null
  setBanner: (b: { type: "success" | "error"; msg: string } | null) => void
}) {
  const [copied,      setCopied]      = useState(false)
  const [stores,      setStores]      = useState<RealStore[]>([])
  const [domain,      setDomain]      = useState("")
  const [token,       setToken]       = useState("")
  const [showToken,   setShowToken]   = useState(false)
  const [connecting,  setConnecting]  = useState(false)
  const [formErr,     setFormErr]     = useState("")
  const [syncing,     setSyncing]     = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/stores").then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        setStores(d)
        // Auto-sync the most recently added store after OAuth connection
        if (banner?.type === "success" && d.length > 0) {
          const latest = d[d.length - 1]
          fetch("/api/shopify/sync-store", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ storeId: latest.id }),
          }).catch(() => {})
        }
      }
    }).catch(() => {})
  }, [])

  const copy = () => {
    if (!webhookUrl) return
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "")
    if (!clean.includes(".myshopify.com")) { setFormErr("Le domaine doit se terminer par .myshopify.com"); return }
    if (!token.trim()) { setFormErr("Le token est requis"); return }
    setConnecting(true); setFormErr("")
    const res  = await fetch("/api/stores/connect", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: clean, accessToken: token.trim() }),
    }).catch(() => null)
    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => ({})) : {}
      setFormErr(data.error ?? "Erreur de connexion")
      setConnecting(false); return
    }
    const { store } = await res.json()
    setStores(prev => [...prev.filter(s => s.domain !== store.domain), { ...store, status: "connected", last_sync: null }])
    setDomain(""); setToken("")
    setBanner({ type: "success", msg: `Boutique ${store.name} connectée ! Synchronisation des produits en cours…` })
    setConnecting(false)
  }

  const syncStore = async (id: string) => {
    setSyncing(id)
    await fetch("/api/shopify/sync-store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeId: id }) }).catch(() => {})
    setSyncing(null)
    setBanner({ type: "success", msg: "Synchronisation terminée." })
  }

  const disconnectStore = async (id: string) => {
    if (!confirm("Déconnecter cette boutique ? Les produits associés seront supprimés.")) return
    setDisconnecting(id)
    const res = await fetch(`/api/stores/${id}`, { method: "DELETE" }).catch(() => null)
    if (res?.ok) setStores(prev => prev.filter(s => s.id !== id))
    setDisconnecting(null)
  }

  const INPUT = "w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/60 transition-colors font-mono"

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">

      {/* Banner */}
      {banner && (
        <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-sm ${banner.type === "success" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : "bg-red-500/10 border-red-500/25 text-red-300"}`}>
          {banner.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />}
          <p className="flex-1">{banner.msg}</p>
          <button onClick={() => setBanner(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Intégrations Shopify</h1>
        <p className="text-neutral-500 text-sm">Connectez vos boutiques pour recevoir commandes et produits automatiquement.</p>
      </div>

      {/* ── SECTION 1 : Commandes via webhook ── */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Commandes en temps réel</p>
            <p className="text-neutral-500 text-xs">Webhook Shopify — aucune app requise</p>
          </div>
          <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">PRÊT</span>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wider">Votre URL webhook</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 font-mono text-xs text-neutral-300 overflow-x-auto whitespace-nowrap">
                {webhookUrl || "Chargement…"}
              </div>
              <button onClick={copy} disabled={!webhookUrl}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 ${copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-white border border-neutral-700 hover:border-orange-500/40"}`}
                style={copied ? {} : { background: "rgba(249,115,22,0.08)" }}>
                {copied ? <><Check className="w-4 h-4" />Copié !</> : <><Copy className="w-4 h-4" />Copier</>}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {WEBHOOK_STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.num}</span>
                <div>
                  <span className="text-white font-medium">{s.title} </span>
                  <span className="text-neutral-500">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 2 : Boutiques connectées ── */}
      {stores.length > 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800">
            <p className="text-white font-bold text-sm">Boutiques connectées ({stores.length})</p>
          </div>
          <div className="divide-y divide-neutral-800">
            {stores.map(s => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-800/30 transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#96BF48]/10 border border-[#96BF48]/30">
                  <svg viewBox="0 0 109.5 124.5" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M74.7 14.8s-.3-.2-.8-.3c-.5-.1-1.2-.1-2-.1-.8 0-3.3.3-5.2 1.7-1.8 1.3-3.4 3.5-4.5 7.5 0 0-2.1-1.1-4.2-1.1-5.8 0-8.6 4.9-9.5 7.8L28.8 35c-.4.1-.7.5-.7.9l-4.2 76.6c0 .5.3.9.8.9l60.1-10.3c.4-.1.7-.5.7-.9L81.4 15.3c-.1-.3-.4-.5-.7-.5z" fill="#95BF47"/>
                    <path d="M73.9 14.5c-.5-.1-1.2-.1-2-.1-.8 0-3.3.3-5.2 1.7-1.8 1.3-3.4 3.5-4.5 7.5 0 0-2.1-1.1-4.2-1.1-5.8 0-8.6 4.9-9.5 7.8L28.8 35c-.4.1-.7.5-.7.9l-4.2 76.6c0 .5.3.9.8.9l60.1-10.3c.4-.1.7-.5.7-.9L81.4 15.3c-.1-.4-.8-.7-7.5-.8z" fill="#5E8E3E"/>
                    <path d="M57.8 50.8l-3.4 10.1s-3-1.6-6.6-1.6c-5.3 0-5.6 3.3-5.6 4.2 0 4.6 12 6.3 12 17 0 8.4-5.3 13.8-12.5 13.8-8.6 0-13-5.4-13-5.4l2.3-7.6s4.5 3.9 8.3 3.9c2.5 0 3.5-2 3.5-3.4 0-5.9-9.8-6.2-9.8-16.1 0-8.3 5.9-16.3 17.9-16.3 4.6 0 6.9 1.4 6.9 1.4z" fill="white"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{s.name}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">Connectée</span>
                  </div>
                  <p className="text-neutral-600 text-xs font-mono">{s.domain}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href="/dashboard/products" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                    Produits <ArrowRight className="w-3 h-3" />
                  </a>
                  <button onClick={() => syncStore(s.id)} disabled={syncing === s.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15 transition-colors disabled:opacity-50">
                    {syncing === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Sync
                  </button>
                  <button onClick={() => disconnectStore(s.id)} disabled={disconnecting === s.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 transition-colors disabled:opacity-50">
                    {disconnecting === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unplug className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 3 : Produits + historique via OAuth ── */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Produits & historique des commandes</p>
            <p className="text-neutral-500 text-xs">Connexion OAuth Shopify — importe catalogue + toutes les commandes passées</p>
          </div>
        </div>
        <form onSubmit={e => {
          e.preventDefault()
          const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "")
          if (!clean.includes(".myshopify.com")) { setFormErr("Le domaine doit se terminer par .myshopify.com"); return }
          window.location.href = `/api/shopify/auth?shop=${clean}`
        }} className="p-6 space-y-4">
          {formErr && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{formErr}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wider">Domaine Shopify</label>
            <input type="text" value={domain} onChange={e => { setDomain(e.target.value); setFormErr("") }}
              placeholder="ma-boutique.myshopify.com" required className={INPUT} />
            <p className="text-neutral-600 text-xs mt-1.5">Ex : ma-boutique.myshopify.com — sans https://</p>
          </div>
          <button type="submit"
            className="flex items-center gap-2 font-bold text-sm text-white px-6 py-3 rounded-xl transition-all"
            style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", boxShadow: "0 4px 16px rgba(168,85,247,0.2)" }}>
            <CheckCircle className="w-4 h-4" />Connecter via Shopify
          </button>
        </form>
      </div>

    </div>
  )
}

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

function ConnectForm({ onCancel, onConnected }: { onCancel: () => void; onConnected: (store: RealStore) => void }) {
  const [domain,      setDomain]      = useState("")
  const [token,       setToken]       = useState("")
  const [showToken,   setShowToken]   = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [err,         setErr]         = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = domain.trim().toLowerCase()
      .replace(/^https?:\/\//, "").replace(/\/$/, "")
    if (!clean.includes(".myshopify.com")) {
      setErr("Le domaine doit se terminer par .myshopify.com")
      return
    }
    if (!token.trim()) {
      setErr("Le token d'accès Admin API est requis")
      return
    }
    setLoading(true)
    setErr("")
    try {
      const res = await fetch("/api/stores/connect", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ domain: clean, accessToken: token.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErr(data.error ?? "Erreur de connexion")
        setLoading(false)
        return
      }
      onConnected(data.store)
    } catch {
      setErr("Erreur réseau. Vérifiez votre connexion et réessayez.")
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-900">
      <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#96BF48]/10 border border-[#96BF48]/30">
              <svg viewBox="0 0 109.5 124.5" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M74.7 14.8s-.3-.2-.8-.3c-.5-.1-1.2-.1-2-.1-.8 0-3.3.3-5.2 1.7-1.8 1.3-3.4 3.5-4.5 7.5 0 0-2.1-1.1-4.2-1.1-5.8 0-8.6 4.9-9.5 7.8L28.8 35c-.4.1-.7.5-.7.9l-4.2 76.6c0 .5.3.9.8.9l60.1-10.3c.4-.1.7-.5.7-.9L81.4 15.3c-.1-.3-.4-.5-.7-.5z" fill="#95BF47"/>
                <path d="M73.9 14.5c-.5-.1-1.2-.1-2-.1-.8 0-3.3.3-5.2 1.7-1.8 1.3-3.4 3.5-4.5 7.5 0 0-2.1-1.1-4.2-1.1-5.8 0-8.6 4.9-9.5 7.8L28.8 35c-.4.1-.7.5-.7.9l-4.2 76.6c0 .5.3.9.8.9l60.1-10.3c.4-.1.7-.5.7-.9L81.4 15.3c-.1-.4-.8-.7-7.5-.8z" fill="#5E8E3E"/>
                <path d="M57.8 50.8l-3.4 10.1s-3-1.6-6.6-1.6c-5.3 0-5.6 3.3-5.6 4.2 0 4.6 12 6.3 12 17 0 8.4-5.3 13.8-12.5 13.8-8.6 0-13-5.4-13-5.4l2.3-7.6s4.5 3.9 8.3 3.9c2.5 0 3.5-2 3.5-3.4 0-5.9-9.8-6.2-9.8-16.1 0-8.3 5.9-16.3 17.9-16.3 4.6 0 6.9 1.4 6.9 1.4z" fill="white"/>
              </svg>
            </div>
          <div>
            <p className="text-white font-semibold text-sm">Connecter une boutique Shopify</p>
            <p className="text-neutral-600 text-xs">Via application personnalisée — aucune revue Shopify requise</p>
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
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/60 transition-colors font-mono"
          />
          <p className="text-neutral-600 text-xs mt-1.5">Ex : ma-boutique.myshopify.com — sans https://</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wider">Token d&apos;accès Admin API *</label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={e => { setToken(e.target.value); setErr("") }}
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/60 transition-colors font-mono"
            />
            <button
              type="button"
              onClick={() => setShowToken(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
            >
              {showToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-neutral-600 text-xs mt-1.5">Paramètres → Applications → Développer des applications → Credentials de l&apos;API</p>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 font-bold text-sm text-white px-6 py-3 rounded-xl transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 4px 20px rgba(249,115,22,0.25)" }}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Connexion en cours…</>
              : <><CheckCircle className="w-4 h-4" />Connecter la boutique</>
            }
          </button>
          <button type="button" onClick={onCancel} disabled={loading}
            className="text-sm text-neutral-500 hover:text-white border border-neutral-700 px-5 py-3 rounded-xl transition-all hover:border-neutral-500 disabled:opacity-50">
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
  const searchParams = useSearchParams()
  const router       = useRouter()
  const [clientId,       setClientId]       = useState(getClientIdFromCookie)
  const [plan,           setPlan]           = useState("starter")
  const [stores,         setStores]         = useState(DEMO_STORES)
  const [realStores,     setRealStores]     = useState<RealStore[]>([])
  const [loadingReal,    setLoadingReal]    = useState(true)
  const [showForm,       setShowForm]       = useState(false)
  const [disconnecting,  setDisconnecting]  = useState<string | null>(null)
  const [syncing,        setSyncing]        = useState<string | null>(null)
  const [banner,         setBanner]         = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const isDemo = clientId === "c1"

  const handleConnected = (store: RealStore) => {
    setRealStores(prev => [...prev, { ...store, status: "connected", last_sync: null }])
    setShowForm(false)
    setBanner({ type: "success", msg: "Boutique connectée ! Synchronisation des produits en cours…" })
  }

  // Read OAuth result from URL params
  useEffect(() => {
    const connected = searchParams.get("connected")
    const error     = searchParams.get("error")
    if (connected === "1") {
      setBanner({ type: "success", msg: "Boutique connectée avec succès ! Synchronisation des produits en cours…" })
      router.replace("/dashboard/stores")
    } else if (error) {
      setBanner({ type: "error", msg: ERROR_MESSAGES[error] ?? `Erreur : ${error}` })
      router.replace("/dashboard/stores")
    }
  }, [searchParams, router])

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
    const appUrl     = "https://www.codshipeurope.com"
    const webhookUrl = clientId ? `${appUrl}/api/webhooks/orders/${clientId}` : ""

    return (
      <WebhookView clientId={clientId} webhookUrl={webhookUrl} banner={banner} setBanner={setBanner} />
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
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#96BF48]/10 border border-[#96BF48]/30">
                  <svg viewBox="0 0 109.5 124.5" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M74.7 14.8s-.3-.2-.8-.3c-.5-.1-1.2-.1-2-.1-.8 0-3.3.3-5.2 1.7-1.8 1.3-3.4 3.5-4.5 7.5 0 0-2.1-1.1-4.2-1.1-5.8 0-8.6 4.9-9.5 7.8L28.8 35c-.4.1-.7.5-.7.9l-4.2 76.6c0 .5.3.9.8.9l60.1-10.3c.4-.1.7-.5.7-.9L81.4 15.3c-.1-.3-.4-.5-.7-.5zM61.2 18.2c0 0-1.5 4.5-2.7 9.1-2.1-.8-4.3-1.5-6.4-1.5-.2 0-.3 0-.5 0 1.4-3.7 4.1-7.1 7.5-8.1.7-.2 1.5-.3 2.1.5zm-4.3 11.2c-2.3 0-4.6.8-6.4 2.2.4-2.1 1.2-5.6 2.1-8 2.1.1 4.3.8 6.4 1.6-.9 1.4-1.6 2.9-2.1 4.2zm-2.6-13.1c.1 0 .1 0 0 0 .7 0 1.4.1 2 .3-3.9 1.6-6.7 5.6-8 9.6-1.4.2-2.7.6-3.9 1.2 1.3-5.7 4.8-11.1 9.9-11.1z" fill="#95BF47"/>
                    <path d="M73.9 14.5c-.5-.1-1.2-.1-2-.1-.8 0-3.3.3-5.2 1.7-1.8 1.3-3.4 3.5-4.5 7.5 0 0-2.1-1.1-4.2-1.1-5.8 0-8.6 4.9-9.5 7.8L28.8 35c-.4.1-.7.5-.7.9l-4.2 76.6c0 .5.3.9.8.9l60.1-10.3c.4-.1.7-.5.7-.9L81.4 15.3c-.1-.4-.8-.7-7.5-.8z" fill="#5E8E3E"/>
                    <path d="M57.8 50.8l-3.4 10.1s-3-1.6-6.6-1.6c-5.3 0-5.6 3.3-5.6 4.2 0 4.6 12 6.3 12 17 0 8.4-5.3 13.8-12.5 13.8-8.6 0-13-5.4-13-5.4l2.3-7.6s4.5 3.9 8.3 3.9c2.5 0 3.5-2 3.5-3.4 0-5.9-9.8-6.2-9.8-16.1 0-8.3 5.9-16.3 17.9-16.3 4.6 0 6.9 1.4 6.9 1.4z" fill="white"/>
                  </svg>
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
        <ConnectForm onCancel={() => setShowForm(false)} onConnected={() => setShowForm(false)} />
      )}
    </div>
  )
}
