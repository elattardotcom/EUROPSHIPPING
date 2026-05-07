"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User, Bell, Shield, CreditCard, Globe, Palette,
  Save, Key, Eye, EyeOff, Check, Download, Monitor, Moon, Sun, Loader2, LogOut,
  Wallet, Plus, Trash2, Star, Bitcoin, Building2, ArrowRight, CheckCircle2, AlertCircle,
} from "lucide-react"
import type { PaymentMethod, PaymentMethodType } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { getPlanLimits } from "@/lib/plan-limits"
import { getClientIdFromCookie } from "@/lib/client-cookie"

const INPUT = "w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50"

function Alert({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div className={`px-4 py-3 rounded-lg text-sm ${
      type === "success"
        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
        : "bg-red-500/10 border border-red-500/20 text-red-400"
    }`}>
      {msg}
    </div>
  )
}

export default function SettingsPage() {
  const router     = useRouter()
  const [activeTab, setActiveTab] = useState("profile")

  // ── Profile state ──────────────────────────────────────
  const [clientId,    setClientId]    = useState(getClientIdFromCookie)
  const [firstName,   setFirstName]   = useState("")
  const [lastName,    setLastName]    = useState("")
  const [email,       setEmail]       = useState("")
  const [phone,       setPhone]       = useState("")
  const [company,     setCompany]     = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [avatarColor, setAvatarColor] = useState("from-orange-500 to-red-600")
  const [initials,    setInitials]    = useState("…")
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile,  setSavingProfile]  = useState(false)
  const [profileMsg, setProfileMsg]         = useState<{ type: "success" | "error"; text: string } | null>(null)

  // ── Password state ─────────────────────────────────────
  const [showCurrent,  setShowCurrent]  = useState(false)
  const [showNew,      setShowNew]      = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [currentPw,    setCurrentPw]    = useState("")
  const [newPw,        setNewPw]        = useState("")
  const [confirmPw,    setConfirmPw]    = useState("")
  const [savingPw,     setSavingPw]     = useState(false)
  const [pwMsg,        setPwMsg]        = useState<{ type: "success" | "error"; text: string } | null>(null)

  // ── Billing / plan state ───────────────────────────────
  const [plan,          setPlan]          = useState("starter")
  const [showPlans,     setShowPlans]     = useState(false)
  const [selectedPlan,  setSelectedPlan]  = useState("starter")
  const [savingPlan,    setSavingPlan]    = useState(false)
  const [planMsg,       setPlanMsg]       = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [storesUsed,    setStoresUsed]    = useState(0)
  const [ordersUsed,    setOrdersUsed]    = useState(0)
  const [loggingOut,    setLoggingOut]    = useState(false)

  // ── Appearance state ───────────────────────────────────
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark")

  // ── Payment methods state ──────────────────────────────
  const [payMethods,    setPayMethods]    = useState<PaymentMethod[]>([])
  const [loadingPay,    setLoadingPay]    = useState(false)
  const [showPayForm,   setShowPayForm]   = useState(false)
  const [payFormType,   setPayFormType]   = useState<PaymentMethodType>("bank")
  const [payLabel,      setPayLabel]      = useState("")
  const [payIban,       setPayIban]       = useState("")
  const [payBic,        setPayBic]        = useState("")
  const [payHolder,     setPayHolder]     = useState("")
  const [payWiseEmail,  setPayWiseEmail]  = useState("")
  const [payWiseCurr,   setPayWiseCurr]   = useState("USD")
  const [payCryptoNet,  setPayCryptoNet]  = useState("USDT-TRC20")
  const [payCryptoAddr, setPayCryptoAddr] = useState("")
  const [payDefault,    setPayDefault]    = useState(false)
  const [savingPay,     setSavingPay]     = useState(false)
  const [payMsg,        setPayMsg]        = useState<{ type: "success"|"error"; text: string } | null>(null)
  const [deletingPay,   setDeletingPay]   = useState<string | null>(null)

  // ── Load profile ───────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(c => {
        if (!c?.id) return
        setClientId(c.id)
        setFirstName(c.firstName ?? "")
        setLastName(c.lastName   ?? "")
        setEmail(c.email         ?? "")
        setPhone(c.phone         ?? "")
        setCompany(c.company     ?? "")
        setCountryCode(c.countryCode ?? "")
        setAvatarColor(c.avatarColor ?? "from-orange-500 to-red-600")
        setInitials(((c.firstName?.[0] ?? "") + (c.lastName?.[0] ?? "")).toUpperCase() || "?")
        const p = c.plan ?? "starter"
        setPlan(p)
        setSelectedPlan(p)
        // Load usage counts
        Promise.all([
          fetch("/api/stores").then(r => r.json()).catch(() => []),
          fetch("/api/client/orders").then(r => r.json()).catch(() => []),
        ]).then(([stores, orders]) => {
          setStoresUsed(Array.isArray(stores) ? stores.length : 0)
          if (Array.isArray(orders)) {
            const now   = new Date()
            const month = now.getMonth()
            const year  = now.getFullYear()
            const monthOrders = orders.filter((o: { createdAt?: string }) => {
              if (!o.createdAt) return false
              const [d, m, y] = (o.createdAt as string).split("/").map(Number)
              return m - 1 === month && y === year
            })
            setOrdersUsed(monthOrders.length)
          }
        })
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false))
  }, [])

  const isDemo = clientId === "c1"

  // ── Save profile ───────────────────────────────────────
  async function saveProfile() {
    if (isDemo) { setProfileMsg({ type: "error", text: "Le compte démo ne peut pas être modifié." }); return }
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      const res = await fetch("/api/client/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ firstName, lastName, phone, company, countryCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setInitials(((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "?")
      setProfileMsg({ type: "success", text: "Profil mis à jour avec succès." })
    } catch (e: unknown) {
      setProfileMsg({ type: "error", text: e instanceof Error ? e.message : "Erreur serveur" })
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Change password ────────────────────────────────────
  async function changePassword() {
    if (isDemo) { setPwMsg({ type: "error", text: "Le compte démo ne peut pas être modifié." }); return }
    if (newPw !== confirmPw) { setPwMsg({ type: "error", text: "Les mots de passe ne correspondent pas." }); return }
    if (newPw.length < 8)    { setPwMsg({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères." }); return }
    setSavingPw(true)
    setPwMsg(null)
    try {
      const res = await fetch("/api/client/password", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setCurrentPw(""); setNewPw(""); setConfirmPw("")
      setPwMsg({ type: "success", text: "Mot de passe modifié avec succès." })
    } catch (e: unknown) {
      setPwMsg({ type: "error", text: e instanceof Error ? e.message : "Erreur serveur" })
    } finally {
      setSavingPw(false)
    }
  }

  async function loadPaymentMethods() {
    setLoadingPay(true)
    try {
      const res = await fetch("/api/client/payment-methods")
      if (res.ok) setPayMethods(await res.json())
    } catch {} finally { setLoadingPay(false) }
  }

  useEffect(() => { if (activeTab === "payment") loadPaymentMethods() }, [activeTab])

  async function savePaymentMethod() {
    setPayMsg(null)
    setSavingPay(true)
    try {
      const body: Record<string, unknown> = { type: payFormType, label: payLabel.trim(), isDefault: payDefault }
      if (payFormType === "bank")   { body.iban = payIban.trim(); body.bic = payBic.trim(); body.accountHolder = payHolder.trim() }
      if (payFormType === "wise")   { body.wiseEmail = payWiseEmail.trim(); body.wiseCurrency = payWiseCurr }
      if (payFormType === "crypto") { body.cryptoNetwork = payCryptoNet; body.cryptoAddress = payCryptoAddr.trim() }
      const res = await fetch("/api/client/payment-methods", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setPayMsg({ type: "success", text: "Méthode ajoutée avec succès." })
      setShowPayForm(false)
      setPayLabel(""); setPayIban(""); setPayBic(""); setPayHolder("")
      setPayWiseEmail(""); setPayCryptoAddr(""); setPayDefault(false)
      loadPaymentMethods()
    } catch (e: unknown) {
      setPayMsg({ type: "error", text: e instanceof Error ? e.message : "Erreur serveur" })
    } finally { setSavingPay(false) }
  }

  async function deletePaymentMethod(id: string) {
    setDeletingPay(id)
    await fetch(`/api/client/payment-methods/${id}`, { method: "DELETE" })
    setDeletingPay(null)
    loadPaymentMethods()
  }

  async function setDefaultMethod(id: string) {
    await fetch(`/api/client/payment-methods/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isDefault: true }),
    })
    loadPaymentMethods()
  }

  async function logout() {
    if (loggingOut) return
    setLoggingOut(true)
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    router.push("/")
  }

  const PLANS = [
    { id: "starter",    label: "Starter",    price: 29, stores: "1",       orders: "500 / mois",      support: "Email" },
    { id: "pro",        label: "Pro",        price: 59, stores: "3",       orders: "2 000 / mois",    support: "Prioritaire" },
    { id: "enterprise", label: "Enterprise", price: 89, stores: "Illimitées", orders: "Illimitées",   support: "Dédié 24/7" },
  ]
  const PLAN_LABELS: Record<string, string> = { starter: "Starter", pro: "Pro", enterprise: "Enterprise" }
  const PLAN_PRICES: Record<string, string> = { starter: "€29 / mois", pro: "€59 / mois", enterprise: "€89 / mois" }

  async function changePlan() {
    if (isDemo) { setPlanMsg({ type: "error", text: "Le compte démo ne peut pas être modifié." }); return }
    if (selectedPlan === plan) { setShowPlans(false); return }
    setSavingPlan(true)
    setPlanMsg(null)
    try {
      const res = await fetch("/api/client/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan: selectedPlan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setPlan(selectedPlan)
      setShowPlans(false)
      setPlanMsg({ type: "success", text: "Plan mis à jour avec succès." })
    } catch (e: unknown) {
      setPlanMsg({ type: "error", text: e instanceof Error ? e.message : "Erreur serveur" })
    } finally {
      setSavingPlan(false)
    }
  }

  const tabs = [
    { id: "profile",       icon: User,       label: "Profil" },
    { id: "payment",       icon: Wallet,     label: "Paiement" },
    { id: "notifications", icon: Bell,       label: "Notifications" },
    { id: "security",      icon: Shield,     label: "Sécurité" },
    { id: "billing",       icon: CreditCard, label: "Facturation" },
    { id: "localization",  icon: Globe,      label: "Localisation" },
    { id: "appearance",    icon: Palette,    label: "Apparence" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Paramètres</h1>
        <p className="text-sm text-neutral-500">Gérez votre compte et vos préférences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-56 flex-shrink-0">
          <nav className="bg-neutral-900 border border-neutral-800 rounded-xl p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-orange-500/10 text-orange-500"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={logout}
            disabled={loggingOut}
            className="w-full mt-3 flex items-center gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:border-red-500/40 transition-colors disabled:opacity-50"
          >
            {loggingOut
              ? <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
              : <LogOut className="w-4 h-4 flex-shrink-0" />
            }
            <span className="text-sm font-medium">{loggingOut ? "Déconnexion…" : "Se déconnecter"}</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ── Profile ─────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-lg font-medium text-white mb-6">Informations du profil</h2>

              {loadingProfile ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-white font-medium">{firstName} {lastName}</p>
                      <p className="text-sm text-neutral-500">{email}</p>
                    </div>
                  </div>

                  {profileMsg && <Alert type={profileMsg.type} msg={profileMsg.text} />}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Prénom</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        disabled={isDemo}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Nom</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        disabled={isDemo}
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className={`${INPUT} cursor-not-allowed`}
                    />
                    <p className="text-xs text-neutral-600 mt-1">L&apos;email ne peut pas être modifié.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        disabled={isDemo}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Entreprise</label>
                      <input
                        type="text"
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        disabled={isDemo}
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Pays</label>
                    <select
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      disabled={isDemo}
                      className={`${INPUT} disabled:opacity-50`}
                    >
                      <option value="">— Sélectionner —</option>
                      {[
                        ["MA","Maroc"],["DZ","Algérie"],["TN","Tunisie"],
                        ["FR","France"],["BE","Belgique"],["CH","Suisse"],["LU","Luxembourg"],
                        ["ES","Espagne"],["PT","Portugal"],["IT","Italie"],
                        ["DE","Allemagne"],["GB","Royaume-Uni"],["NL","Pays-Bas"],
                        ["SN","Sénégal"],["CI","Côte d'Ivoire"],
                      ].map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={saveProfile}
                      disabled={savingProfile || isDemo}
                      className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                    >
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Paiement ─────────────────────────────────── */}
          {activeTab === "payment" && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-white">Méthodes de retrait</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">Enregistrez vos coordonnées de paiement pour accélérer vos retraits</p>
                </div>
                {!showPayForm && (
                  <button onClick={() => setShowPayForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
                    <Plus className="w-4 h-4" />Ajouter
                  </button>
                )}
              </div>

              {payMsg && <Alert type={payMsg.type} msg={payMsg.text} />}

              {/* Add form */}
              {showPayForm && (
                <div className="border border-orange-500/20 bg-orange-500/5 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium text-sm">Nouvelle méthode</p>
                    <button onClick={() => setShowPayForm(false)} className="text-neutral-500 hover:text-white text-xl leading-none">×</button>
                  </div>

                  {/* Type selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "bank",   icon: Building2, label: "Virement bancaire", sub: "IBAN / BIC" },
                      { id: "wise",   icon: ArrowRight, label: "Wise",             sub: "Email Wise" },
                      { id: "crypto", icon: Bitcoin,    label: "Crypto",           sub: "BTC / ETH / USDT" },
                    ] as { id: PaymentMethodType; icon: React.ElementType; label: string; sub: string }[]).map(t => (
                      <button key={t.id} onClick={() => setPayFormType(t.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          payFormType === t.id
                            ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                            : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                        }`}>
                        <t.icon className="w-5 h-5" />
                        <span className="text-xs font-semibold">{t.label}</span>
                        <span className="text-[10px] text-neutral-500">{t.sub}</span>
                      </button>
                    ))}
                  </div>

                  {/* Label */}
                  <div>
                    <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Libellé *</label>
                    <input value={payLabel} onChange={e => setPayLabel(e.target.value)} placeholder="Ex: Compte principal"
                      className={INPUT} />
                  </div>

                  {/* Bank fields */}
                  {payFormType === "bank" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-neutral-400 font-medium mb-1.5 block">IBAN *</label>
                        <input value={payIban} onChange={e => setPayIban(e.target.value)} placeholder="PT50 0002 0000 0001 2345 6781 4"
                          className={INPUT + " font-mono"} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-neutral-400 font-medium mb-1.5 block">BIC / SWIFT</label>
                          <input value={payBic} onChange={e => setPayBic(e.target.value)} placeholder="CGDIPTPL"
                            className={INPUT + " font-mono"} />
                        </div>
                        <div>
                          <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Titulaire du compte</label>
                          <input value={payHolder} onChange={e => setPayHolder(e.target.value)} placeholder="Nom Prénom"
                            className={INPUT} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wise fields */}
                  {payFormType === "wise" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Email Wise *</label>
                        <input type="email" value={payWiseEmail} onChange={e => setPayWiseEmail(e.target.value)} placeholder="vous@email.com"
                          className={INPUT} />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Devise préférée</label>
                        <select value={payWiseCurr} onChange={e => setPayWiseCurr(e.target.value)}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500">
                          {["USD","EUR","GBP","MAD","CAD","AUD"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Crypto fields */}
                  {payFormType === "crypto" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Réseau *</label>
                        <select value={payCryptoNet} onChange={e => setPayCryptoNet(e.target.value)}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500">
                          {["USDT-TRC20","USDT-ERC20","BTC","ETH","BNB","USDC-ERC20"].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Adresse de wallet *</label>
                        <input value={payCryptoAddr} onChange={e => setPayCryptoAddr(e.target.value)} placeholder="0x... ou T..."
                          className={INPUT + " font-mono text-xs"} />
                        <p className="text-[11px] text-amber-400/70 mt-1.5">⚠ Vérifiez bien l'adresse — les envois crypto sont irréversibles</p>
                      </div>
                    </div>
                  )}

                  {/* Default */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={payDefault} onChange={e => setPayDefault(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-orange-500" />
                    <span className="text-sm text-neutral-300">Définir comme méthode par défaut</span>
                  </label>

                  <div className="flex gap-3 pt-1">
                    <button onClick={savePaymentMethod} disabled={savingPay || !payLabel.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                      {savingPay ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Enregistrer
                    </button>
                    <button onClick={() => setShowPayForm(false)}
                      className="px-5 py-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 text-sm rounded-xl transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Methods list */}
              {loadingPay ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-orange-500 animate-spin" /></div>
              ) : payMethods.length === 0 && !showPayForm ? (
                <div className="py-12 text-center border border-dashed border-neutral-800 rounded-xl">
                  <Wallet className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm font-medium">Aucune méthode enregistrée</p>
                  <p className="text-neutral-600 text-xs mt-1">Ajoutez votre IBAN, Wise ou adresse crypto</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payMethods.map(m => (
                    <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      m.isDefault ? "border-orange-500/30 bg-orange-500/5" : "border-neutral-800 bg-neutral-800/40"
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          m.type === "bank"   ? "bg-blue-500/15"   :
                          m.type === "wise"   ? "bg-emerald-500/15" : "bg-amber-500/15"
                        }`}>
                          {m.type === "bank"   && <Building2 className="w-4 h-4 text-blue-400" />}
                          {m.type === "wise"   && <ArrowRight className="w-4 h-4 text-emerald-400" />}
                          {m.type === "crypto" && <Bitcoin    className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-medium">{m.label}</p>
                            {m.isDefault && (
                              <span className="text-[10px] font-bold text-orange-400 bg-orange-500/15 border border-orange-500/20 px-1.5 py-0.5 rounded-full">Par défaut</span>
                            )}
                          </div>
                          <p className="text-neutral-500 text-xs mt-0.5 truncate font-mono">
                            {m.type === "bank"   && (m.iban   ? `IBAN: ${m.iban.slice(0,4)} •••• ${m.iban.replace(/\s/g,"").slice(-4)}` : "")}
                            {m.type === "wise"   && (m.wiseEmail   ? `${m.wiseEmail} · ${m.wiseCurrency ?? "USD"}` : "")}
                            {m.type === "crypto" && (m.cryptoAddress ? `${m.cryptoNetwork} · ${m.cryptoAddress.slice(0,8)}...${m.cryptoAddress.slice(-6)}` : "")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!m.isDefault && (
                          <button onClick={() => setDefaultMethod(m.id)}
                            className="text-xs text-neutral-500 hover:text-orange-400 px-2 py-1 rounded-lg hover:bg-orange-500/10 transition-colors"
                            title="Définir par défaut">
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => deletePaymentMethod(m.id)} disabled={deletingPay === m.id}
                          className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                          {deletingPay === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Notifications ────────────────────────────── */}
          {activeTab === "notifications" && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-lg font-medium text-white mb-6">Préférences de notifications</h2>
              <div className="space-y-1">
                {[
                  { title: "Nouvelles commandes",       desc: "Recevoir une alerte lors d'une nouvelle commande" },
                  { title: "Mises à jour de statut",    desc: "Alertes lors des changements de statut de commande" },
                  { title: "Confirmations de leads",    desc: "Notifier quand un lead est confirmé" },
                  { title: "Problèmes de synchronisation", desc: "Alertes en cas de problème Shopify" },
                  { title: "Rapports quotidiens",       desc: "Recevoir un rapport de performance chaque jour" },
                  { title: "Résumé hebdomadaire",       desc: "Recevoir un résumé hebdomadaire par email" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-neutral-800 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input type="checkbox" defaultChecked={i < 4} className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Security ─────────────────────────────────── */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h2 className="text-lg font-medium text-white mb-6">Changer le mot de passe</h2>
                <div className="space-y-4">
                  {pwMsg && <Alert type={pwMsg.type} msg={pwMsg.text} />}

                  {[
                    { label: "Mot de passe actuel",        val: currentPw, set: setCurrentPw, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                    { label: "Nouveau mot de passe",       val: newPw,     set: setNewPw,     show: showNew,     toggle: () => setShowNew(v => !v)     },
                    { label: "Confirmer le nouveau mot de passe", val: confirmPw, set: setConfirmPw, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
                  ].map(({ label, val, set, show, toggle }) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">{label}</label>
                      <div className="relative">
                        <input
                          type={show ? "text" : "password"}
                          value={val}
                          onChange={e => set(e.target.value)}
                          placeholder="••••••••"
                          className={`${INPUT} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={toggle}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                        >
                          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <Button
                      onClick={changePassword}
                      disabled={savingPw || !currentPw || !newPw || !confirmPw}
                      className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                    >
                      {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                      Mettre à jour
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Billing ──────────────────────────────────── */}
          {activeTab === "billing" && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-white">Plan actuel</h2>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-sm font-medium">
                    {PLAN_LABELS[plan] ?? "Starter"}
                  </span>
                </div>

                {planMsg && <div className="mb-4"><Alert type={planMsg.type} msg={planMsg.text} /></div>}

                {/* Static info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Abonnement mensuel",   value: PLAN_PRICES[plan] ?? "€29 / mois" },
                    { label: "Prochaine facturation", value: "—" },
                  ].map((item) => (
                    <div key={item.label} className="bg-neutral-800/50 rounded-xl p-4">
                      <p className="text-xs text-neutral-500 mb-1">{item.label}</p>
                      <p className="text-white font-medium text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Usage bars */}
                {(() => {
                  const limits = getPlanLimits(plan)
                  const storeMax   = limits.stores === Infinity ? null : limits.stores
                  const orderMax   = limits.ordersPerMonth === Infinity ? null : limits.ordersPerMonth
                  const storePct   = storeMax ? Math.min(100, (storesUsed / storeMax) * 100) : 0
                  const orderPct   = orderMax ? Math.min(100, (ordersUsed / orderMax) * 100) : 0
                  const storeWarn  = storePct >= 100
                  const orderWarn  = orderPct >= 80
                  return (
                    <div className="space-y-4 mb-6">
                      <div className="bg-neutral-800/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-neutral-400 font-medium">Boutiques connectées</p>
                          <p className={`text-xs font-bold ${storeWarn ? "text-red-400" : "text-white"}`}>
                            {storesUsed} / {storeMax ?? "∞"}
                          </p>
                        </div>
                        <div className="h-1.5 rounded-full bg-neutral-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${storeWarn ? "bg-red-500" : "bg-orange-500"}`}
                            style={{ width: storeMax ? `${storePct}%` : "0%" }}
                          />
                        </div>
                        {storeWarn && (
                          <p className="text-[10px] text-red-400 mt-1.5">Limite atteinte — <a href="#" onClick={() => setShowPlans(true)} className="underline">passez à un plan supérieur</a></p>
                        )}
                      </div>
                      <div className="bg-neutral-800/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-neutral-400 font-medium">Commandes ce mois-ci</p>
                          <p className={`text-xs font-bold ${orderWarn ? "text-amber-400" : "text-white"}`}>
                            {ordersUsed} / {orderMax ?? "∞"}
                          </p>
                        </div>
                        <div className="h-1.5 rounded-full bg-neutral-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${orderPct >= 100 ? "bg-red-500" : orderWarn ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: orderMax ? `${orderPct}%` : "0%" }}
                          />
                        </div>
                        {orderPct >= 100 && (
                          <p className="text-[10px] text-red-400 mt-1.5">Limite mensuelle atteinte — <a href="#" onClick={() => setShowPlans(true)} className="underline">passez à un plan supérieur</a></p>
                        )}
                        {orderWarn && orderPct < 100 && (
                          <p className="text-[10px] text-amber-400 mt-1.5">Vous approchez de votre limite mensuelle</p>
                        )}
                      </div>
                    </div>
                  )
                })()}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { setShowPlans(v => !v); setSelectedPlan(plan); setPlanMsg(null) }}
                    className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                  >
                    Changer de plan
                  </Button>
                </div>

                {showPlans && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {PLANS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPlan(p.id)}
                          className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                            selectedPlan === p.id
                              ? "border-orange-500 bg-orange-500/5"
                              : "border-neutral-700 hover:border-neutral-600 bg-neutral-800/50"
                          }`}
                        >
                          {selectedPlan === p.id && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <p className="text-white font-semibold text-sm mb-1">{p.label}</p>
                          <p className="text-orange-400 font-bold text-lg mb-3">€{p.price}<span className="text-xs text-neutral-400 font-normal"> / mois</span></p>
                          <ul className="space-y-1.5">
                            <li className="text-xs text-neutral-400"><span className="text-neutral-300">{p.stores}</span> boutique{p.stores !== "1" ? "s" : ""}</li>
                            <li className="text-xs text-neutral-400"><span className="text-neutral-300">{p.orders}</span> commandes</li>
                            <li className="text-xs text-neutral-400">Support <span className="text-neutral-300">{p.support}</span></li>
                          </ul>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        onClick={changePlan}
                        disabled={savingPlan || selectedPlan === plan}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                      >
                        {savingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Confirmer
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowPlans(false)}
                        className="text-neutral-400 hover:text-white"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-white">Historique de facturation</h2>
                  <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
                    <Download className="w-4 h-4 mr-1" /> Tout télécharger
                  </Button>
                </div>
                <p className="text-neutral-500 text-sm py-8 text-center">Aucune facture pour le moment.</p>
              </div>
            </div>
          )}

          {/* ── Localization ─────────────────────────────── */}
          {activeTab === "localization" && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-lg font-medium text-white mb-6">Localisation</h2>
              <div className="space-y-4">
                {[
                  { label: "Langue", options: [["fr","Français"],["en","English"],["es","Español"],["ar","العربية"],["pt","Português"]] },
                  { label: "Fuseau horaire", options: [["lisbon","Europe/Lisbon (GMT+0)"],["madrid","Europe/Madrid (GMT+1)"],["paris","Europe/Paris (GMT+1)"],["casablanca","Africa/Casablanca (GMT+1)"],["utc","UTC"]] },
                  { label: "Format de date", options: [["dmy","JJ/MM/AAAA"],["mdy","MM/JJ/AAAA"],["ymd","AAAA-MM-JJ"]] },
                  { label: "Devise", options: [["eur","EUR (€)"],["usd","USD ($)"],["gbp","GBP (£)"],["mad","MAD (DH)"]] },
                ].map(({ label, options }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">{label}</label>
                    <select className={INPUT}>
                      {options.map(([val, name]) => <option key={val} value={val}>{name}</option>)}
                    </select>
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    <Save className="w-4 h-4" /> Sauvegarder
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Appearance ───────────────────────────────── */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h2 className="text-lg font-medium text-white mb-6">Thème</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: "dark",   label: "Sombre",  icon: Moon,    preview: "bg-neutral-950 border-neutral-800" },
                    { id: "light",  label: "Clair",   icon: Sun,     preview: "bg-gray-100 border-gray-300" },
                    { id: "system", label: "Système", icon: Monitor, preview: "bg-gradient-to-br from-neutral-950 to-gray-100 border-neutral-500" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id as typeof theme)}
                      className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                        theme === opt.id
                          ? "border-orange-500 bg-orange-500/5"
                          : "border-neutral-700 hover:border-neutral-600 bg-neutral-800/50"
                      }`}
                    >
                      {theme === opt.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={`w-full h-14 rounded-lg border ${opt.preview}`} />
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-300">{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h2 className="text-lg font-medium text-white mb-4">Préférences d&apos;affichage</h2>
                <div className="space-y-1">
                  {[
                    { label: "Sidebar compacte",      desc: "Utiliser une barre latérale réduite" },
                    { label: "Animations",            desc: "Activer les transitions et animations" },
                    { label: "Badge de notifications",desc: "Afficher le compteur non-lu sur la cloche" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-neutral-800 last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input type="checkbox" defaultChecked={i !== 0} className="sr-only peer" />
                        <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
