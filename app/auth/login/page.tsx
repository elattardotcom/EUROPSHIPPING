"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, Mail, Lock,
  ShieldCheck, Truck, Heart, Globe2, ShoppingCart, PhoneCall, Package, Wallet,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { EuropeMap } from "@/components/auth/europe-map"
import { useLang } from "@/hooks/useLang"

const T = {
  fr: {
    tagline:       "Logistique paiement à la livraison",
    needHelp:      "Besoin d'aide ? Contactez le support",
    heroTitle1:    "Vos opérations COD.",
    heroTitle2:    "Un seul centre de contrôle.",
    heroSub:       "Commandes, livraisons et paiements — gérés au même endroit.",
    emailLabel:    "Adresse email",
    emailPh:       "vous@entreprise.com",
    pwdLabel:      "Mot de passe",
    pwdPh:         "Entrez votre mot de passe",
    pwdForgot:     "Mot de passe oublié ?",
    btnLogin:      "Se connecter",
    btnLoading:    "Connexion…",
    noAccount:     "Pas encore sur CODShipEurope ?",
    register:      "Créer un compte",
    errCreds:      "Identifiants incorrects",
    errServer:     "Erreur de connexion au serveur",
    forgotTitle:   "Réinitialiser votre mot de passe",
    forgotSub:     "Entrez votre adresse email et nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.",
    forgotBtn:     "Envoyer le lien",
    forgotLoading: "Envoi…",
    back:          "Retour",
    rememberPwd:   "Vous vous souvenez de votre mot de passe ?",
    signIn:        "Se connecter",
    sentTitle:     "Vérifiez votre boîte mail",
    sentSub1:      "Si un compte existe pour",
    sentSub2:      "vous recevrez un lien de réinitialisation.",
    sentExpiry:    "Le lien expire dans 1 heure.",
    sentSpam:      "Vous ne l'avez pas reçu ? Vérifiez vos spams ou réessayez.",
    sentBack:      "Retour à la connexion",
    trustLine:     "Pensé pour les opérations paiement à la livraison en Europe.",
    trust1t: "Sécurisé & fiable", trust1s: "Données chiffrées",
    trust2t: "Partenaires logistiques", trust2s: "Transporteurs de confiance",
    trust3t: "Votre activité, notre priorité", trust3s: "Support dédié",
    badge1: "RAPIDE", badge2: "SÉCURISÉ", badge3: "TOUTE L'EUROPE",
    step1t: "Commandes",      step1s: "Votre boutique, notre plateforme",
    step2t: "Confirmation",   step2s: "Nous appelons vos clients",
    step3t: "Livraison",      step3s: "Transporteurs de confiance",
    step4t: "Paiement COD",   step4s: "Vous êtes payé",
    tagline1: "Plus qu'une livraison.",
    tagline2: "C'est votre croissance.",
    footerRights:  "Tous droits réservés.",
    privacy:       "Politique de confidentialité",
    terms:         "Conditions générales",
    langSwitch:    "EN",
    showPwd:       "Afficher le mot de passe",
    hidePwd:       "Masquer le mot de passe",
    support:       "Aide",
  },
  en: {
    tagline:       "Cash on delivery logistics",
    needHelp:      "Need help? Contact support",
    heroTitle1:    "Your COD operations.",
    heroTitle2:    "One control center.",
    heroSub:       "Orders, delivery operations and payouts — managed in one place.",
    emailLabel:    "Email address",
    emailPh:       "you@company.com",
    pwdLabel:      "Password",
    pwdPh:         "Enter your password",
    pwdForgot:     "Forgot your password?",
    btnLogin:      "Sign in",
    btnLoading:    "Signing in…",
    noAccount:     "New to CODShipEurope?",
    register:      "Create an account",
    errCreds:      "Incorrect credentials",
    errServer:     "Server connection error",
    forgotTitle:   "Reset your password",
    forgotSub:     "Enter your email address and we'll send you a secure link to reset your password.",
    forgotBtn:     "Send reset link",
    forgotLoading: "Sending…",
    back:          "Back",
    rememberPwd:   "Remember your password?",
    signIn:        "Sign in",
    sentTitle:     "Check your inbox",
    sentSub1:      "If an account exists for",
    sentSub2:      "you will receive a reset link.",
    sentExpiry:    "The link will expire in 1 hour.",
    sentSpam:      "Didn't receive it? Check your spam folder or try again.",
    sentBack:      "Back to sign in",
    trustLine:     "Built for cash-on-delivery operations across Europe.",
    trust1t: "Secure & reliable",   trust1s: "Encrypted data",
    trust2t: "Logistics partners",  trust2s: "Trusted carriers",
    trust3t: "Your business, our priority", trust3s: "Dedicated support",
    badge1: "FAST", badge2: "SECURE", badge3: "EUROPE-WIDE",
    step1t: "Orders",        step1s: "Your store, our platform",
    step2t: "Confirmation",  step2s: "We call your customers",
    step3t: "Delivery",      step3s: "Trusted carriers",
    step4t: "COD Payout",    step4s: "You get paid",
    tagline1: "More than delivery.",
    tagline2: "It's your growth.",
    footerRights:  "All rights reserved.",
    privacy:       "Privacy Policy",
    terms:         "Terms of Service",
    langSwitch:    "FR",
    showPwd:       "Show password",
    hidePwd:       "Hide password",
    support:       "Help",
  },
}

const INPUT = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 focus:bg-white/[0.06] transition-all"

function Spinner() {
  return (
    <svg className="animate-spin motion-reduce:animate-none w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

const WORKFLOW_ICONS = [ShoppingCart, PhoneCall, Truck, Wallet]

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
  const year = new Date().getFullYear()

  const workflowSteps = [
    { t: t.step1t, s: t.step1s }, { t: t.step2t, s: t.step2s },
    { t: t.step3t, s: t.step3s }, { t: t.step4t, s: t.step4s },
  ]
  const trustBadges = [
    { Icon: ShieldCheck, t: t.trust1t, s: t.trust1s },
    { Icon: Truck,       t: t.trust2t, s: t.trust2s },
    { Icon: Heart,       t: t.trust3t, s: t.trust3s },
  ]

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

      {/* ── Left: form column ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6" style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}>
          <div className="flex items-center gap-3">
            <Logo size={32} showBg />
            <div className="hidden sm:block">
              <p className="text-white font-black text-sm leading-tight">CODShipEurope</p>
              <p className="text-neutral-600 text-[10px] uppercase tracking-wide leading-tight">{t.tagline}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a href="mailto:contact@codshipeurope.com" aria-label={t.needHelp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <Mail className="w-3 h-3" />
              <span className="hidden sm:inline">{t.needHelp}</span>
              <span className="sm:hidden">{t.support}</span>
            </a>
            <button
              onClick={() => setLang(l => l === "fr" ? "en" : "fr")}
              aria-label={lang === "fr" ? "Switch to English" : "Passer en français"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <Globe2 className="w-3 h-3" />
              {t.langSwitch}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-[420px]">

            {/* ── LOGIN ─────────────────────────────────────────── */}
            {step === "login" && (
              <>
                <div className="mb-8">
                  <h1 className="text-[1.65rem] sm:text-[1.85rem] font-black text-white leading-[1.15] mb-2">
                    {t.heroTitle1}<br /><span className="text-orange-500">{t.heroTitle2}</span>
                  </h1>
                  <p className="text-neutral-500 text-sm">{t.heroSub}</p>
                </div>

                {error && (
                  <div className="mb-5 rounded-xl px-4 py-3 text-red-400 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="block text-xs font-semibold text-neutral-400 mb-2">{t.emailLabel}</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
                      <input id="login-email" type="email" inputMode="email" autoComplete="email" placeholder={t.emailPh} required
                        value={email} onChange={e => setEmail(e.target.value)} className={INPUT} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="login-password" className="block text-xs font-semibold text-neutral-400 mb-2">{t.pwdLabel}</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
                      <input id="login-password" type={showPwd ? "text" : "password"} autoComplete="current-password" placeholder={t.pwdPh} required
                        value={password} onChange={e => setPassword(e.target.value)} className={INPUT + " pr-12"} />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        aria-label={showPwd ? t.hidePwd : t.showPwd} aria-pressed={showPwd}
                        className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-neutral-600 hover:text-white transition-colors">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button type="button" onClick={() => { setStep("forgot"); setForgotEmail(email) }}
                        className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                        {t.pwdForgot}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.99]"
                    style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.3)" }}>
                    {loading ? <><Spinner />{t.btnLoading}</> : <>{t.btnLogin} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <div className="mt-6">
                  <p className="text-center text-sm text-neutral-600">
                    {t.noAccount}{" "}
                    <Link href="/auth/register" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                      {t.register} <span aria-hidden>→</span>
                    </Link>
                  </p>
                </div>

                <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-center text-neutral-600 text-xs mb-4">{t.trustLine}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {trustBadges.map(b => (
                      <div key={b.t} className="flex flex-col items-center text-center gap-1.5 px-1">
                        <b.Icon className="w-4 h-4 text-orange-400/80" />
                        <p className="text-neutral-400 text-[11px] font-medium leading-tight">{b.t}</p>
                        <p className="text-neutral-700 text-[10px] leading-tight">{b.s}</p>
                      </div>
                    ))}
                  </div>
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
                  <h1 className="text-[1.6rem] font-black text-white mb-1.5">{t.forgotTitle}</h1>
                  <p className="text-neutral-500 text-sm leading-relaxed">{t.forgotSub}</p>
                </div>
                <form onSubmit={handleForgot} className="space-y-5">
                  <div>
                    <label htmlFor="forgot-email" className="block text-xs font-semibold text-neutral-400 mb-2">{t.emailLabel}</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
                      <input id="forgot-email" type="email" inputMode="email" autoComplete="email" placeholder={t.emailPh} required
                        value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className={INPUT} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.3)" }}>
                    {loading ? <><Spinner />{t.forgotLoading}</> : <>{t.forgotBtn} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
                <p className="mt-6 text-center text-sm text-neutral-600">
                  {t.rememberPwd}{" "}
                  <button onClick={() => setStep("login")} className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                    {t.signIn} <span aria-hidden>→</span>
                  </button>
                </p>

                <div className="mt-8 rounded-2xl p-5 flex items-start gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Lock className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-semibold">{lang === "fr" ? "Votre compte est en sécurité" : "Your account is safe"}</p>
                    <p className="text-neutral-500 text-xs mt-0.5">{lang === "fr" ? "Nous utilisons des protocoles sécurisés pour protéger vos informations." : "We use secure protocols to protect your information."}</p>
                  </div>
                </div>
              </>
            )}

            {/* ── SENT ────────────────────────────────────────────── */}
            {step === "sent" && (
              <div className="text-center py-4">
                <div className="relative w-16 h-16 mx-auto mb-5">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)" }}>
                    <Mail className="w-7 h-7 text-orange-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500 border-2 border-[#070709]">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-black text-white mb-2">{t.sentTitle}</h1>
                <p className="text-neutral-500 text-sm mb-1">{t.sentSub1} <span className="text-white font-medium">{forgotEmail}</span>,</p>
                <p className="text-neutral-500 text-sm mb-2">{t.sentSub2}</p>
                <p className="text-neutral-700 text-xs mb-8">{t.sentExpiry}</p>

                <Link href="/auth/login"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.3)" }}
                  onClick={() => { setStep("login"); setForgotEmail("") }}>
                  {t.sentBack}
                </Link>
                <p className="text-neutral-700 text-xs mt-5">{t.sentSpam}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between flex-wrap gap-2" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          <p className="text-neutral-700 text-[11px]">© {year} CODShipEurope. {t.footerRights}</p>
          <div className="flex items-center gap-4">
            <Link href="/confidentialite" className="text-neutral-700 hover:text-neutral-500 text-[11px] transition-colors">{t.privacy}</Link>
            <Link href="/conditions" className="text-neutral-700 hover:text-neutral-500 text-[11px] transition-colors">{t.terms}</Link>
          </div>
        </div>
      </div>

      {/* ── Right: illustration panel (desktop only) ──────────────── */}
      <div className="hidden lg:flex flex-col w-[45%] relative overflow-hidden" style={{ background: "#08080e", borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="absolute -bottom-40 -right-40 w-[540px] h-[540px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 70%)" }} />
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"   style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Badges */}
          <div className="flex items-center justify-end gap-4 text-[10px] font-bold tracking-widest text-neutral-600">
            <span>{t.badge1}</span><span className="text-neutral-800">/</span>
            <span>{t.badge2}</span><span className="text-neutral-800">/</span>
            <span>{t.badge3}</span>
          </div>

          {/* Map */}
          <div className="flex-1 relative my-6">
            <EuropeMap className="absolute inset-0" />

            {/* Workflow steps */}
            <div className="absolute top-6 right-0 w-[220px] space-y-2.5">
              {workflowSteps.map((s, i) => {
                const Icon = WORKFLOW_ICONS[i]
                return (
                  <div key={s.t} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 backdrop-blur-md"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)" }}>
                      <Icon className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-bold">{i + 1}. {s.t}</p>
                      <p className="text-neutral-500 text-[10px] truncate">{s.s}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tagline */}
          <div>
            <p className="text-white text-xl font-black leading-tight">{t.tagline1}</p>
            <p className="text-xl font-black leading-tight" style={{ background: "linear-gradient(90deg,#f97316,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t.tagline2}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
