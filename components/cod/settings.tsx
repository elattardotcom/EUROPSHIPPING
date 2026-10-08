"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User, Bell, Shield, CreditCard, Globe, Palette,
  Save, Key, Eye, EyeOff, Check, Download, Monitor, Moon, Sun, Loader2, LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getClientIdFromCookie } from "@/lib/client-cookie"
import { useTheme } from "next-themes"
import { useLang } from "@/hooks/useLang"

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
  const [planMsg,       setPlanMsg]       = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [storesUsed,    setStoresUsed]    = useState(0)
  const [ordersUsed,    setOrdersUsed]    = useState(0)
  const [loggingOut,    setLoggingOut]    = useState(false)

  // ── Appearance state ───────────────────────────────────
  const { theme: currentTheme, setTheme } = useTheme()
  const theme = (currentTheme ?? "dark") as "dark" | "light" | "system"

  // ── Localization state ─────────────────────────────────
  const [lang, setLang] = useLang()
  const [timezone,   setTimezone]   = useState(() => (typeof window !== "undefined" ? localStorage.getItem("site-timezone")    ?? "paris"  : "paris"))
  const [dateFormat, setDateFormat] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("site-date-format") ?? "dmy"    : "dmy"))
  const [currency,   setCurrency]   = useState(() => (typeof window !== "undefined" ? localStorage.getItem("site-currency")    ?? "eur"    : "eur"))
  const [localeMsg,  setLocaleMsg]  = useState<{ type: "success" | "error"; text: string } | null>(null)

  // ── Notification toggles (persisted to localStorage) ──
  const [notifToggles, setNotifToggles] = useState<boolean[]>(() => {
    if (typeof window === "undefined") return [true, true, true, true, false, false]
    const saved = localStorage.getItem("site-notif-toggles")
    return saved ? JSON.parse(saved) : [true, true, true, true, false, false]
  })
  const setNotif = (i: number, v: boolean) => setNotifToggles(prev => {
    const next = [...prev]; next[i] = v
    localStorage.setItem("site-notif-toggles", JSON.stringify(next))
    return next
  })

  // ── Display preference toggles (persisted to localStorage) ─
  const [dispToggles, setDispToggles] = useState<boolean[]>(() => {
    if (typeof window === "undefined") return [false, true, true]
    const saved = localStorage.getItem("site-disp-toggles")
    return saved ? JSON.parse(saved) : [false, true, true]
  })
  const setDisp = (i: number, v: boolean) => setDispToggles(prev => {
    const next = [...prev]; next[i] = v
    localStorage.setItem("site-disp-toggles", JSON.stringify(next))
    return next
  })

  function saveLocalization() {
    localStorage.setItem("site-timezone",    timezone)
    localStorage.setItem("site-date-format", dateFormat)
    localStorage.setItem("site-currency",    currency)
    // Notify other components on same tab
    window.dispatchEvent(new StorageEvent("storage", { key: "site-currency", newValue: currency }))
    setLocaleMsg({ type: "success", text: "Préférences de localisation sauvegardées." })
    setTimeout(() => setLocaleMsg(null), 3000)
  }

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

  async function logout() {
    if (loggingOut) return
    setLoggingOut(true)
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    router.push("/")
  }

  const tabs = [
    { id: "profile",       icon: User,       label: "Profil" },
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
                      <input type="checkbox" checked={notifToggles[i] ?? false}
                        onChange={e => setNotif(i, e.target.checked)} className="sr-only peer" />
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
                  <h2 className="text-lg font-medium text-white">Abonnement</h2>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-sm font-black">
                    Pro · €31.99/mois
                  </span>
                </div>

                {planMsg && <div className="mb-4"><Alert type={planMsg.type} msg={planMsg.text} /></div>}

                {/* Plan card */}
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white font-black text-lg">CODShipEurope Pro</p>
                      <p className="text-neutral-500 text-xs mt-0.5">Accès complet à toutes les fonctionnalités</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-black text-2xl">€31.99</p>
                      <p className="text-neutral-600 text-xs">/mois</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Boutiques illimitées","Leads & commandes illimités","Wallet & virements 48h","Support prioritaire 7j/7"].map(f => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2 h-2 text-emerald-400" />
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Usage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-neutral-400">Boutiques connectées</p>
                      <p className="text-xs font-bold text-white">{storesUsed} / ∞</p>
                    </div>
                    <div className="h-1.5 rounded-full bg-neutral-700 overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: "8%" }} />
                    </div>
                  </div>
                  <div className="bg-neutral-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-neutral-400">Commandes ce mois</p>
                      <p className="text-xs font-bold text-white">{ordersUsed} / ∞</p>
                    </div>
                    <div className="h-1.5 rounded-full bg-neutral-700 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "12%" }} />
                    </div>
                  </div>
                </div>
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
                {localeMsg && <Alert type={localeMsg.type} msg={localeMsg.text} />}
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Langue</label>
                  <select value={lang} onChange={e => setLang(e.target.value as "fr" | "en")} className={INPUT}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Fuseau horaire</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)} className={INPUT}>
                    {[["lisbon","Europe/Lisbon (GMT+0)"],["madrid","Europe/Madrid (GMT+1)"],["paris","Europe/Paris (GMT+1)"],["casablanca","Africa/Casablanca (GMT+1)"],["utc","UTC"]].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Format de date</label>
                  <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className={INPUT}>
                    {[["dmy","JJ/MM/AAAA"],["mdy","MM/JJ/AAAA"],["ymd","AAAA-MM-JJ"]].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Devise</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className={INPUT}>
                    {[["eur","EUR (€)"],["usd","USD ($)"],["gbp","GBP (£)"],["mad","MAD (DH)"]].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={saveLocalization} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
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
                  {([
                    {
                      id: "dark",   label: "Sombre",  icon: Moon,
                      previewStyle: { background: "#0a0a0a", border: "1px solid #404040" } as React.CSSProperties,
                    },
                    {
                      id: "light",  label: "Clair",   icon: Sun,
                      previewStyle: { background: "#f1f5f9", border: "1px solid #d1d5db" } as React.CSSProperties,
                    },
                    {
                      id: "system", label: "Système", icon: Monitor,
                      previewStyle: { background: "linear-gradient(135deg, #0a0a0a 50%, #f1f5f9 50%)", border: "1px solid #737373" } as React.CSSProperties,
                    },
                  ] as const).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
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
                      <div className="w-full h-14 rounded-lg overflow-hidden" style={opt.previewStyle} />
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
                        <input type="checkbox" checked={dispToggles[i] ?? false}
                          onChange={e => setDisp(i, e.target.checked)} className="sr-only peer" />
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
