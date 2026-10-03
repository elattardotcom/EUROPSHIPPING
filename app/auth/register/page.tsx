"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, ArrowRight, CheckCircle, ShieldCheck, Truck, PhoneCall, BarChart3, Globe2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { useLang } from "@/hooks/useLang"

const T = {
  fr: {
    badge:       "Rejoignez 1 200+ vendeurs actifs",
    hero:        ["Lancez votre", "business COD", "dès aujourd'hui"],
    heroSub:     "Accès complet à la plateforme en 24-48h après validation de votre demande.",
    benefits:    [
      { title: "Livraison COD clé en main", desc: "Expédition vers 8+ pays européens" },
      { title: "Call center intégré",       desc: "Confirmation des commandes automatisée" },
      { title: "Analytics en temps réel",   desc: "Dashboard de performance complet" },
      { title: "Paiements sécurisés",       desc: "Wise, crypto ou virement bancaire" },
    ],
    pricingLabel:   "Abonnement Pro",
    pricingAccess:  "Accès complet · toutes fonctionnalités",
    title:          "Créer un compte",
    subtitle:       "Remplissez le formulaire, notre équipe vous contacte sous 24-48h",
    firstNameL:     "Prénom *",    firstNamePh:  "Prénom",
    lastNameL:      "Nom *",       lastNamePh:   "Nom",
    emailL:         "Adresse email *", emailPh:  "vous@exemple.com",
    phoneL:         "Téléphone *", phonePh:      "6 12 34 56 78",
    phoneHint:      "Numéro sans le code pays",
    companyL:       "Boutique / Entreprise", companyPh: "Ma Boutique (optionnel)",
    countryL:       "Pays d'activité *", countryPh: "Sélectionner un pays",
    passwordL:      "Mot de passe *", passwordPh:  "Minimum 8 caractères",
    terms1:         "J'accepte les",
    termsLink1:     "Conditions générales",
    terms2:         "et la",
    termsLink2:     "Politique de confidentialité",
    btnSubmit:      "Créer mon compte",
    btnLoading:     "Création en cours…",
    hasAccount:     "Déjà un compte ?",
    loginLink:      "Se connecter",
    errPhone:       "Numéro de téléphone invalide.",
    errDefault:     "Erreur lors de l'inscription",
    errNetwork:     "Erreur de connexion au serveur",
    pendingTitle:   "Demande envoyée !",
    pendingSub:     "Votre demande a été soumise.\nNotre équipe va l'examiner sous 24-48h.",
    pendingPlan:    "Abonnement",
    pendingPlanName:"CODShipEurope Pro",
    pendingSteps:   [
      "Notre équipe examine votre demande sous 24-48h",
      "Vous recevrez un email de confirmation dès l'approbation",
      "Connectez-vous et démarrez votre dropshipping COD",
    ],
    pendingBack:    "Retour à la connexion",
    langSwitch:     "EN",
  },
  en: {
    badge:       "Join 1,200+ active sellers",
    hero:        ["Launch your", "COD business", "today"],
    heroSub:     "Full platform access within 24-48h after your request is approved.",
    benefits:    [
      { title: "Turnkey COD delivery",    desc: "Shipping to 8+ European countries" },
      { title: "Integrated call center",  desc: "Automated order confirmation" },
      { title: "Real-time analytics",     desc: "Complete performance dashboard" },
      { title: "Secure payments",         desc: "Wise, crypto or bank transfer" },
    ],
    pricingLabel:   "Pro subscription",
    pricingAccess:  "Full access · all features",
    title:          "Create an account",
    subtitle:       "Fill in the form — our team will reach out within 24-48h",
    firstNameL:     "First name *",  firstNamePh:  "First name",
    lastNameL:      "Last name *",   lastNamePh:   "Last name",
    emailL:         "Email address *", emailPh:    "you@example.com",
    phoneL:         "Phone *",       phonePh:      "612 345 678",
    phoneHint:      "Number without the country code",
    companyL:       "Shop / Company", companyPh:   "My Store (optional)",
    countryL:       "Country of activity *", countryPh: "Select a country",
    passwordL:      "Password *",    passwordPh:   "Minimum 8 characters",
    terms1:         "I agree to the",
    termsLink1:     "Terms of service",
    terms2:         "and the",
    termsLink2:     "Privacy policy",
    btnSubmit:      "Create my account",
    btnLoading:     "Creating…",
    hasAccount:     "Already have an account?",
    loginLink:      "Sign in",
    errPhone:       "Invalid phone number.",
    errDefault:     "Registration error",
    errNetwork:     "Server connection error",
    pendingTitle:   "Request sent!",
    pendingSub:     "Your request has been submitted.\nOur team will review it within 24-48h.",
    pendingPlan:    "Subscription",
    pendingPlanName:"CODShipEurope Pro",
    pendingSteps:   [
      "Our team reviews your request within 24-48h",
      "You will receive a confirmation email upon approval",
      "Sign in and start your COD dropshipping",
    ],
    pendingBack:    "Back to sign in",
    langSwitch:     "FR",
  },
}

const COUNTRIES = {
  fr: [
    { v: "ES", l: "🇪🇸 Espagne" },      { v: "IT", l: "🇮🇹 Italie" },
    { v: "PT", l: "🇵🇹 Portugal" },      { v: "RO", l: "🇷🇴 Roumanie" },
    { v: "BG", l: "🇧🇬 Bulgarie" },      { v: "HU", l: "🇭🇺 Hongrie" },
    { v: "GR", l: "🇬🇷 Grèce" },         { v: "SK", l: "🇸🇰 Slovaquie" },
    { v: "CZ", l: "🇨🇿 République tchèque" }, { v: "FR", l: "🇫🇷 France" },
    { v: "DE", l: "🇩🇪 Allemagne" },     { v: "BE", l: "🇧🇪 Belgique" },
    { v: "MA", l: "🇲🇦 Maroc" },         { v: "DZ", l: "🇩🇿 Algérie" },
    { v: "TN", l: "🇹🇳 Tunisie" },
  ],
  en: [
    { v: "ES", l: "🇪🇸 Spain" },         { v: "IT", l: "🇮🇹 Italy" },
    { v: "PT", l: "🇵🇹 Portugal" },      { v: "RO", l: "🇷🇴 Romania" },
    { v: "BG", l: "🇧🇬 Bulgaria" },      { v: "HU", l: "🇭🇺 Hungary" },
    { v: "GR", l: "🇬🇷 Greece" },        { v: "SK", l: "🇸🇰 Slovakia" },
    { v: "CZ", l: "🇨🇿 Czech Republic" },{ v: "FR", l: "🇫🇷 France" },
    { v: "DE", l: "🇩🇪 Germany" },       { v: "BE", l: "🇧🇪 Belgium" },
    { v: "MA", l: "🇲🇦 Morocco" },       { v: "DZ", l: "🇩🇿 Algeria" },
    { v: "TN", l: "🇹🇳 Tunisia" },
  ],
}

const DIAL_CODES = [
  { v: "+212", l: "🇲🇦 +212" }, { v: "+213", l: "🇩🇿 +213" }, { v: "+216", l: "🇹🇳 +216" },
  { v: "+33",  l: "🇫🇷 +33"  }, { v: "+34",  l: "🇪🇸 +34"  }, { v: "+39",  l: "🇮🇹 +39"  },
  { v: "+351", l: "🇵🇹 +351" }, { v: "+40",  l: "🇷🇴 +40"  }, { v: "+359", l: "🇧🇬 +359" },
  { v: "+30",  l: "🇬🇷 +30"  }, { v: "+36",  l: "🇭🇺 +36"  }, { v: "+421", l: "🇸🇰 +421" },
  { v: "+420", l: "🇨🇿 +420" }, { v: "+32",  l: "🇧🇪 +32"  }, { v: "+49",  l: "🇩🇪 +49"  },
]

const BENEFIT_ICONS = [Truck, PhoneCall, BarChart3, ShieldCheck]
const BENEFIT_COLORS = ["#f97316", "#6366f1", "#10b981", "#06b6d4"]

const INPUT  = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 focus:bg-white/[0.06] transition-all"
const SELECT = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
const LABEL  = "block text-xs font-medium text-neutral-400 mb-2"

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

export default function RegisterPage() {
  const [lang, setLang]       = useLang()
  const [step,    setStep]    = useState<"form" | "pending">("form")
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const t = T[lang]
  const countries = COUNTRIES[lang]

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    dialCode: "+212", company: "", countryCode: "", password: "",
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("")
    const digits = form.phone.replace(/\D/g, "")
    if (digits.length < 6 || digits.length > 15) { setError(t.errPhone); return }
    setLoading(true)
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: "Pro", fullPhone: form.dialCode + form.phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t.errDefault); setLoading(false); return }
      setStep("pending")
    } catch { setError(t.errNetwork) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#070709] flex">

      {/* ── Left panel ────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[42%] relative overflow-hidden"
        style={{ background: "#08080e", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }} />

        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="flex items-center gap-3">
            <Logo size={44} showBg />
            <div>
              <p className="text-white font-black text-base tracking-tight">CODShipEurope</p>
              <p className="text-neutral-600 text-xs">Pro Platform</p>
            </div>
          </div>

          <div className="my-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-7"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-semibold">{t.badge}</span>
            </div>

            <h2 className="text-[2rem] font-black text-white leading-[1.15] mb-4">
              {t.hero[0]}<br />{t.hero[1]}<br />
              <span style={{ background: "linear-gradient(90deg,#f97316,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t.hero[2]}
              </span>
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-10">{t.heroSub}</p>

            <div className="space-y-4">
              {t.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${BENEFIT_COLORS[i]}12`, border: `1px solid ${BENEFIT_COLORS[i]}22` }}>
                    {(() => { const Icon = BENEFIT_ICONS[i]; return <Icon className="w-4 h-4" style={{ color: BENEFIT_COLORS[i] }} /> })()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{b.title}</p>
                    <p className="text-neutral-600 text-xs mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-xs mb-0.5">{t.pricingLabel}</p>
                <p className="text-white font-black text-lg">€31.99 <span className="text-neutral-500 text-sm font-normal">/mois</span></p>
                <p className="text-neutral-600 text-xs mt-0.5">{t.pricingAccess}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(249,115,22,0.15)" }}>
                <ShieldCheck className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-[440px] py-8">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Logo size={36} showBg />
              <div>
                <p className="text-white font-black text-sm">CODShipEurope</p>
                <p className="text-neutral-600 text-xs">Pro Platform</p>
              </div>
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

          {/* ── FORM ────────────────────────────────────────────────── */}
          {step === "form" && (
            <>
              <div className="mb-7">
                <h1 className="text-[1.75rem] font-black text-white mb-1.5">{t.title}</h1>
                <p className="text-neutral-500 text-sm">{t.subtitle}</p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl px-4 py-3 text-red-400 text-sm"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>{t.firstNameL}</label>
                    <input type="text" placeholder={t.firstNamePh} required value={form.firstName} onChange={set("firstName")} className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>{t.lastNameL}</label>
                    <input type="text" placeholder={t.lastNamePh} required value={form.lastName} onChange={set("lastName")} className={INPUT} />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>{t.emailL}</label>
                  <input type="email" placeholder={t.emailPh} required value={form.email} onChange={set("email")} className={INPUT} />
                </div>

                <div>
                  <label className={LABEL}>{t.phoneL}</label>
                  <div className="flex gap-2">
                    <select value={form.dialCode} onChange={e => setForm(f => ({ ...f, dialCode: e.target.value }))}
                      className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-all flex-shrink-0">
                      {DIAL_CODES.map(d => <option key={d.v} value={d.v}>{d.l}</option>)}
                    </select>
                    <input type="tel" placeholder={t.phonePh} required
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 15) }))}
                      className={INPUT} />
                  </div>
                  <p className="text-[11px] text-neutral-700 mt-1.5">{t.phoneHint}</p>
                </div>

                <div>
                  <label className={LABEL}>{t.companyL}</label>
                  <input type="text" placeholder={t.companyPh} value={form.company} onChange={set("company")} className={INPUT} />
                </div>

                <div>
                  <label className={LABEL}>{t.countryL}</label>
                  <select required value={form.countryCode} onChange={set("countryCode")} className={SELECT}>
                    <option value="">{t.countryPh}</option>
                    {countries.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                  </select>
                </div>

                <div>
                  <label className={LABEL}>{t.passwordL}</label>
                  <div className="relative">
                    <input type={showPwd ? "text" : "password"} placeholder={t.passwordPh} required minLength={8}
                      value={form.password} onChange={set("password")} className={INPUT + " pr-12"} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded accent-orange-500 flex-shrink-0" />
                  <span className="text-xs text-neutral-600 leading-relaxed">
                    {t.terms1}{" "}
                    <Link href="/conditions" className="text-orange-400 hover:underline">{t.termsLink1}</Link>
                    {" "}{t.terms2}{" "}
                    <Link href="/confidentialite" className="text-orange-400 hover:underline">{t.termsLink2}</Link>
                  </span>
                </label>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white mt-2 transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.99]"
                  style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.3)" }}>
                  {loading ? <><Spinner />{t.btnLoading}</> : <>{t.btnSubmit} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="mt-7 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-center text-sm text-neutral-600">
                  {t.hasAccount}{" "}
                  <Link href="/auth/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                    {t.loginLink}
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* ── PENDING / SUCCESS ─────────────────────────────────── */}
          {step === "pending" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
                <CheckCircle className="w-10 h-10 text-orange-400" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">{t.pendingTitle}</h1>
              <p className="text-neutral-400 text-sm leading-relaxed mb-8 whitespace-pre-line">{t.pendingSub}</p>

              <div className="rounded-2xl p-5 mb-6 text-left"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-neutral-500 text-xs">{t.pendingPlan}</span>
                  <span className="text-orange-400 font-black text-xl">€31.99<span className="text-neutral-600 text-xs font-normal">/mois</span></span>
                </div>
                <p className="text-white font-bold text-sm">{t.pendingPlanName}</p>
                <p className="text-neutral-600 text-xs">{t.pricingAccess}</p>
              </div>

              <div className="space-y-3 text-left mb-8">
                {t.pendingSteps.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-neutral-500">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black mt-0.5"
                      style={{ background: "rgba(249,115,22,0.15)", color: "#f97316" }}>
                      {i + 1}
                    </span>
                    {s}
                  </div>
                ))}
              </div>

              <Link href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-neutral-400 transition-all hover:text-white"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                {t.pendingBack}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
