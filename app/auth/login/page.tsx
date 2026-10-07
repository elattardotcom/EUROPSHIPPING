"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, Package, TrendingUp, Zap, Globe2, Users, ShieldCheck, Star } from "lucide-react"
import { Logo } from "@/components/logo"
import { useLang } from "@/hooks/useLang"

const T = {
  fr: {
    badge:         "Plateforme active · 8 pays couverts",
    hero:          ["Gérez votre", "dropshipping COD", "en Europe"],
    heroSub:       "Synchronisez Shopify, suivez vos leads et recevez vos paiements automatiquement.",
    features:      ["Synchronisation Shopify automatique", "Couverture 8 pays européens", "Dashboard analytics en temps réel", "Paiements Wise, crypto, virement"],
    liveLabel:     "Commandes en direct",
    welcome:       "Bon retour 👋",
    welcomeSub:    "Connectez-vous à votre espace COD",
    emailLabel:    "Adresse email",
    emailPh:       "vous@exemple.com",
    pwdLabel:      "Mot de passe",
    pwdForgot:     "Oublié ?",
    btnLogin:      "Se connecter",
    btnLoading:    "Connexion…",
    noAccount:     "Pas encore de compte ?",
    register:      "Créer un compte",
    errCreds:      "Identifiants incorrects",
    errServer:     "Erreur de connexion au serveur",
    forgotTitle:   "Mot de passe oublié ?",
    forgotSub:     "Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
    forgotBtn:     "Envoyer le lien",
    forgotLoading: "Envoi…",
    back:          "Retour",
    sentTitle:     "Email envoyé !",
    sentSub1:      "Si un compte existe pour",
    sentSub2:      "vous recevrez un lien de réinitialisation.",
    sentSpam:      "Vérifiez aussi vos spams.",
    sentBack:      "Retour à la connexion",
    stat1v: "Bêta", stat1l: "Accès fondateurs",
    stat2v: "ES·PT", stat2l: "Marchés ciblés",
    stat3v: "COD",    stat3l: "Paiement à la livraison",
    trustLine:     "Plateforme sécurisée · Données chiffrées · Support 24/7",
    langSwitch:    "EN",
  },
  en: {
    badge:         "Platform active · 8 countries covered",
    hero:          ["Manage your", "COD dropshipping", "across Europe"],
    heroSub:       "Sync Shopify, track your leads and receive your payments automatically.",
    features:      ["Automatic Shopify synchronization", "8 European countries covered", "Real-time analytics dashboard", "Wise, crypto, bank transfer payments"],
    liveLabel:     "Live orders",
    welcome:       "Welcome back 👋",
    welcomeSub:    "Sign in to your COD workspace",
    emailLabel:    "Email address",
    emailPh:       "you@example.com",
    pwdLabel:      "Password",
    pwdForgot:     "Forgot?",
    btnLogin:      "Sign in",
    btnLoading:    "Signing in…",
    noAccount:     "No account yet?",
    register:      "Create account",
    errCreds:      "Incorrect credentials",
    errServer:     "Server connection error",
    forgotTitle:   "Forgot your password?",
    forgotSub:     "Enter your email and we'll send you a link to reset your password.",
    forgotBtn:     "Send reset link",
    forgotLoading: "Sending…",
    back:          "Back",
    sentTitle:     "Email sent!",
    sentSub1:      "If an account exists for",
    sentSub2:      "you will receive a reset link.",
    sentSpam:      "Check your spam folder too.",
    sentBack:      "Back to sign in",
    stat1v: "Beta", stat1l: "Founding access",
    stat2v: "ES·PT", stat2l: "Target markets",
    stat3v: "COD",     stat3l: "Cash on delivery",
    trustLine:     "Secure platform · Encrypted data · 24/7 support",
    langSwitch:    "FR",
  },
}

const LIVE_ORDERS = {
  fr: [
    { ref: "COD-9821", city: "Madrid",   product: "Montre Premium", amount: "€48", status: "LIVRÉ",    flag: "🇪🇸", color: "#10b981" },
    { ref: "COD-9820", city: "Milan",    product: "Smartwatch X4",  amount: "€71", status: "EN ROUTE", flag: "🇮🇹", color: "#6366f1" },
    { ref: "COD-9819", city: "Porto",    product: "Set Cuisine",    amount: "€44", status: "LIVRÉ",    flag: "🇵🇹", color: "#10b981" },
  ],
  en: [
    { ref: "COD-9821", city: "Madrid",   product: "Premium Watch",  amount: "€48", status: "DELIVERED", flag: "🇪🇸", color: "#10b981" },
    { ref: "COD-9820", city: "Milan",    product: "Smartwatch X4",  amount: "€71", status: "IN TRANSIT",flag: "🇮🇹", color: "#6366f1" },
    { ref: "COD-9819", city: "Porto",    product: "Kitchen Set",    amount: "€44", status: "DELIVERED", flag: "🇵🇹", color: "#10b981" },
  ],
}

const FEATURE_ICONS = [Zap, Globe2, TrendingUp, Package]

const INPUT = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 focus:bg-white/[0.06] transition-all"

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

const FEATURE_COLORS = ["#f97316", "#6366f1", "#10b981", "#06b6d4"]

export default function LoginPage() {
  const [lang, setLang]         = useLang()
  const [step, setStep]         = useState<"login" | "forgot" | "sent">("login")
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")
  const t = T[lang]
  const orders = LIVE_ORDERS[lang]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true)
    try {
      const res  = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t.errCreds); setLoading(false); return }
      window.location.href = "/dashboard"
    } catch { setError(t.errServer) }
    setLoading(false)
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail }) }).catch(() => {})
    setLoading(false); setStep("sent")
  }

  return (
    <div className="min-h-screen bg-[#070709] flex">

      {/* ── Left panel ──────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[45%] relative overflow-hidden" style={{ background: "#08080e", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="absolute -bottom-40 -right-40 w-[540px] h-[540px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)" }} />
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"   style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)" }} />

        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="flex items-center gap-3">
            <Logo size={44} showBg />
            <div>
              <p className="text-white font-black text-base tracking-tight">CODShipEurope</p>
              <p className="text-neutral-600 text-xs">Pro Platform</p>
            </div>
          </div>

          <div className="my-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-7" style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-orange-400 text-xs font-semibold">{t.badge}</span>
            </div>

            <h2 className="text-[2rem] font-black text-white leading-[1.15] mb-4">
              {t.hero[0]}<br />{t.hero[1]}<br />
              <span style={{ background: "linear-gradient(90deg,#f97316,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t.hero[2]}
              </span>
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-9">{t.heroSub}</p>

            <div className="space-y-3 mb-10">
              {t.features.map((label, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${FEATURE_COLORS[i]}12`, border: `1px solid ${FEATURE_COLORS[i]}22` }}>
                    {(() => { const Icon = FEATURE_ICONS[i]; return <Icon className="w-3.5 h-3.5" style={{ color: FEATURE_COLORS[i] }} /> })()}
                  </div>
                  <span className="text-neutral-400 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-neutral-700 text-[10px] uppercase tracking-[0.15em] font-bold mb-3">{t.liveLabel}</p>
            <div className="space-y-2">
              {orders.map(o => (
                <div key={o.ref} className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{o.flag}</span>
                    <div>
                      <p className="text-white text-xs font-medium">{o.product}</p>
                      <p className="text-neutral-600 text-[10px]">{o.ref} · {o.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-bold">{o.amount}</p>
                    <p className="text-[10px] font-bold" style={{ color: o.color }}>{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Logo size={32} showBg />
            <p className="text-white font-black text-sm">CODShipEurope</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setLang(l => l === "fr" ? "en" : "fr")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <Globe2 className="w-3 h-3" />
              {t.langSwitch}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[420px]">

            {/* ── LOGIN ─────────────────────────────────────────── */}
            {step === "login" && (
              <>
                <div className="mb-8">
                  <h1 className="text-[1.85rem] font-black text-white mb-1.5">{t.welcome}</h1>
                  <p className="text-neutral-500 text-sm">{t.welcomeSub}</p>
                </div>

                {error && (
                  <div className="mb-5 rounded-xl px-4 py-3 text-red-400 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-2">{t.emailLabel}</label>
                    <input type="email" placeholder={t.emailPh} required value={email} onChange={e => setEmail(e.target.value)} className={INPUT} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-neutral-400">{t.pwdLabel}</label>
                      <button type="button" onClick={() => { setStep("forgot"); setForgotEmail(email) }}
                        className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                        {t.pwdForgot}
                      </button>
                    </div>
                    <div className="relative">
                      <input type={showPwd ? "text" : "password"} placeholder="••••••••" required
                        value={password} onChange={e => setPassword(e.target.value)} className={INPUT + " pr-12"} />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.99]"
                    style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.3)" }}>
                    {loading ? <><Spinner />{t.btnLoading}</> : <>{t.btnLogin} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-3 mt-8">
                  {[
                    { icon: Users,       v: t.stat1v, l: t.stat1l, color: "#f97316" },
                    { icon: Globe2,      v: t.stat2v, l: t.stat2l, color: "#6366f1" },
                    { icon: ShieldCheck, v: t.stat3v, l: t.stat3l, color: "#10b981" },
                  ].map((s, i) => (
                    <div key={i} className="text-center rounded-xl py-3 px-2"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <s.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: s.color }} />
                      <p className="text-white font-black text-base leading-none">{s.v}</p>
                      <p className="text-neutral-600 text-[10px] mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-center text-sm text-neutral-600">
                    {t.noAccount}{" "}
                    <Link href="/auth/register" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                      {t.register}
                    </Link>
                  </p>
                </div>
              </>
            )}

            {/* ── FORGOT ──────────────────────────────────────────── */}
            {step === "forgot" && (
              <>
                <button onClick={() => setStep("login")}
                  className="flex items-center gap-1.5 text-neutral-500 hover:text-white text-sm mb-7 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> {t.back}
                </button>
                <div className="mb-8">
                  <h1 className="text-[1.75rem] font-black text-white mb-1.5">{t.forgotTitle}</h1>
                  <p className="text-neutral-500 text-sm leading-relaxed">{t.forgotSub}</p>
                </div>
                <form onSubmit={handleForgot} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-2">{t.emailLabel}</label>
                    <input type="email" placeholder={t.emailPh} required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className={INPUT} />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.3)" }}>
                    {loading ? <><Spinner />{t.forgotLoading}</> : <>{t.forgotBtn} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </>
            )}

            {/* ── SENT ────────────────────────────────────────────── */}
            {step === "sent" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">{t.sentTitle}</h1>
                <p className="text-neutral-500 text-sm mb-1">{t.sentSub1} <span className="text-white font-medium">{forgotEmail}</span>,</p>
                <p className="text-neutral-500 text-sm mb-2">{t.sentSub2}</p>
                <p className="text-neutral-700 text-xs mb-8">{t.sentSpam}</p>
                <button onClick={() => { setStep("login"); setForgotEmail("") }}
                  className="flex items-center justify-center gap-2 mx-auto text-orange-400 hover:text-orange-300 text-sm transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> {t.sentBack}
                </button>
              </div>
            )}

            {/* Trust line */}
            <p className="text-center text-neutral-800 text-[10px] mt-6">{t.trustLine}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
