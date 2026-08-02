"use client"

import { useState } from "react"
import { Eye, EyeOff, ArrowRight, X, ArrowLeft, CheckCircle } from "lucide-react"
import { Logo } from "@/components/logo"
import { useLang } from "@/hooks/useLang"

const INPUT = "w-full bg-[#111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"

const PLAN_AMOUNT = 31.99
const PAYPAL_ME   = process.env.NEXT_PUBLIC_PAYPAL_ME ?? ""

const T = {
  fr: {
    tagline:           "Pro Platform",
    tab_signup:        "Créer un compte",
    tab_login:         "Se connecter",
    // signup
    label_first:       "Prénom *",
    label_last:        "Nom *",
    ph_first:          "Prénom",
    ph_last:           "Nom",
    label_email:       "Email *",
    ph_email:          "vous@exemple.com",
    label_phone:       "Téléphone *",
    ph_phone:          "612345678",
    hint_phone:        "Numéro sans le code pays",
    label_store:       "Boutique",
    ph_store:          "Ma Boutique (optionnel)",
    label_country:     "Pays *",
    ph_country:        "Sélectionner un pays",
    label_password:    "Mot de passe *",
    ph_password:       "Minimum 8 caractères",
    terms:             "J'accepte les",
    terms_link1:       "Conditions",
    terms_and:         "et la",
    terms_link2:       "Politique de confidentialité",
    btn_signup:        "Créer mon compte",
    btn_loading_sign:  "Création...",
    // login
    label_pwd:         "Mot de passe",
    forgot:            "Oublié ?",
    btn_login:         "Se connecter",
    btn_loading_log:   "Connexion...",
    // forgot
    back:              "Retour",
    forgot_title:      "Mot de passe oublié ?",
    forgot_sub:        "Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
    label_fg_email:    "Adresse email",
    btn_send:          "Envoyer le lien",
    btn_sending:       "Envoi...",
    sent_title:        "Email envoyé !",
    sent_sub:          "Si un compte existe pour",
    sent_sub2:         "vous recevrez un lien de réinitialisation.",
    sent_spam:         "Vérifiez aussi vos spams.",
    back_login:        "Retour à la connexion",
    // pending
    pend_title:        "Demande envoyée !",
    pend_sub:          "Votre demande a été envoyée. Notre équipe va l'examiner et vous contacter sous 24-48h.",
    pend_plan_label:   "Abonnement",
    pend_plan_name:    "CODShipEurope Pro",
    pend_plan_desc:    "Accès complet — toutes fonctionnalités",
    pend_amount_label: "Montant",
    pend_per_month:    "/mois",
    pend_steps_title:  "Prochaines étapes :",
    pend_steps: [
      "Notre équipe examine votre demande sous 24-48h",
      "Vous recevrez un email de confirmation dès l'approbation",
      "Connectez-vous et démarrez votre dropshipping COD",
    ],
    btn_close:         "Fermer",
    err_phone:         "Numéro de téléphone invalide.",
    err_server:        "Erreur de connexion au serveur",
    err_register:      "Erreur lors de l'inscription",
    err_login:         "Identifiants incorrects",
  },
  en: {
    tagline:           "Pro Platform",
    tab_signup:        "Create account",
    tab_login:         "Sign in",
    // signup
    label_first:       "First name *",
    label_last:        "Last name *",
    ph_first:          "Name",
    ph_last:           "Surname",
    label_email:       "Email *",
    ph_email:          "you@example.com",
    label_phone:       "Phone *",
    ph_phone:          "612345678",
    hint_phone:        "Number without country code",
    label_store:       "Store",
    ph_store:          "My Store (optional)",
    label_country:     "Country *",
    ph_country:        "Select a country",
    label_password:    "Password *",
    ph_password:       "Minimum 8 characters",
    terms:             "I accept the",
    terms_link1:       "Terms",
    terms_and:         "and the",
    terms_link2:       "Privacy Policy",
    btn_signup:        "Create my account",
    btn_loading_sign:  "Creating...",
    // login
    label_pwd:         "Password",
    forgot:            "Forgot?",
    btn_login:         "Sign in",
    btn_loading_log:   "Signing in...",
    // forgot
    back:              "Back",
    forgot_title:      "Forgot your password?",
    forgot_sub:        "Enter your email address and we'll send you a link to reset your password.",
    label_fg_email:    "Email address",
    btn_send:          "Send reset link",
    btn_sending:       "Sending...",
    sent_title:        "Email sent!",
    sent_sub:          "If an account exists for",
    sent_sub2:         "you will receive a reset link.",
    sent_spam:         "Check your spam folder too.",
    back_login:        "Back to sign in",
    // pending
    pend_title:        "Request submitted!",
    pend_sub:          "Your request has been submitted. Our team will review it and contact you within 24-48h.",
    pend_plan_label:   "Subscription",
    pend_plan_name:    "CODShipEurope Pro",
    pend_plan_desc:    "Full access — all features",
    pend_amount_label: "Amount",
    pend_per_month:    "/month",
    pend_steps_title:  "Next steps:",
    pend_steps: [
      "Our team reviews your request within 24-48h",
      "You'll receive a confirmation email once approved",
      "Log in and start your COD dropshipping",
    ],
    btn_close:         "Close",
    err_phone:         "Invalid phone number.",
    err_server:        "Server connection error",
    err_register:      "Error during registration",
    err_login:         "Incorrect credentials",
  },
}

const COUNTRIES = {
  fr: [
    { v: "ES", l: "🇪🇸 Espagne"           },
    { v: "IT", l: "🇮🇹 Italie"             },
    { v: "PT", l: "🇵🇹 Portugal"           },
    { v: "RO", l: "🇷🇴 Roumanie"           },
    { v: "BG", l: "🇧🇬 Bulgarie"           },
    { v: "HU", l: "🇭🇺 Hongrie"            },
    { v: "GR", l: "🇬🇷 Grèce"              },
    { v: "SK", l: "🇸🇰 Slovaquie"          },
    { v: "CZ", l: "🇨🇿 République tchèque" },
  ],
  en: [
    { v: "ES", l: "🇪🇸 Spain"    },
    { v: "IT", l: "🇮🇹 Italy"    },
    { v: "PT", l: "🇵🇹 Portugal" },
    { v: "RO", l: "🇷🇴 Romania"  },
    { v: "BG", l: "🇧🇬 Bulgaria" },
    { v: "HU", l: "🇭🇺 Hungary"  },
    { v: "GR", l: "🇬🇷 Greece"   },
    { v: "SK", l: "🇸🇰 Slovakia" },
    { v: "CZ", l: "🇨🇿 Czechia"  },
  ],
}

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

export function SignupModal({
  onClose,
  initialStep = "signup",
  initialPlan,
}: {
  onClose: () => void
  initialStep?: "signup" | "login"
  initialPlan?: string
}) {
  const [lang]          = useLang()
  const t               = T[lang]

  const [step,          setStep]         = useState<"signup" | "login" | "forgot" | "pending">(initialStep)
  const [showPassword,  setShowPassword] = useState(false)
  const [isLoading,     setIsLoading]   = useState(false)
  const [error,         setError]       = useState("")

  const [signup, setSignup] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    dialCode: "+212", company: "", countryCode: "",
    password: "", plan: "Pro",
  })
  const [login,       setLogin]       = useState({ email: "", password: "" })
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotSent,  setForgotSent]  = useState(false)

  const su = (k: keyof typeof signup) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setSignup(f => ({ ...f, [k]: e.target.value }))
  const lg = (k: keyof typeof login) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLogin(f => ({ ...f, [k]: e.target.value }))

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setIsLoading(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      })
      setForgotSent(true)
    } catch { setError(t.err_server) }
    setIsLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError("")
    const phoneDigits = signup.phone.replace(/\D/g, "")
    if (phoneDigits.length < 6 || phoneDigits.length > 15) {
      setError(t.err_phone); return
    }
    setIsLoading(true)
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...signup, fullPhone: signup.dialCode + signup.phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t.err_register); setIsLoading(false); return }
      setStep("pending")
    } catch { setError(t.err_server) }
    setIsLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setIsLoading(true)
    try {
      const res  = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(login) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t.err_login); setIsLoading(false); return }
      window.location.href = "/dashboard"
    } catch { setError(t.err_server) }
    setIsLoading(false)
  }

  const planAmount = PLAN_AMOUNT
  void initialPlan

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.9)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-600 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Logo size={56} showBg={true} />
          <div>
            <h1 className="text-white font-black text-lg tracking-tight">CODShipEurope</h1>
            <p className="text-neutral-600 text-xs">{t.tagline}</p>
          </div>
        </div>

        {/* ── Pending ─────────────────────────────────────────── */}
        {step === "pending" && (
          <div className="space-y-5 py-2">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-white font-bold text-xl mb-1">{t.pend_title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{t.pend_sub}</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">{t.pend_plan_label}</p>
                <p className="text-white font-bold">{t.pend_plan_name}</p>
                <p className="text-neutral-600 text-[10px]">{t.pend_plan_desc}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 mb-0.5">{t.pend_amount_label}</p>
                <p className="text-orange-400 font-black text-2xl">€{planAmount}</p>
                <p className="text-neutral-600 text-xs">{t.pend_per_month}</p>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-semibold text-neutral-300">{t.pend_steps_title}</p>
              {t.pend_steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-neutral-500">
                  <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>

            <button onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-sm text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700 transition-all">
              {t.btn_close}
            </button>
          </div>
        )}

        {/* ── Tabs ────────────────────────────────────────────── */}
        {step !== "forgot" && step !== "pending" && (
          <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl mb-6 border border-white/[0.05]">
            {(["signup", "login"] as const).map(s => (
              <button key={s} onClick={() => { setStep(s); setError("") }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${step === s ? "bg-orange-500 text-white" : "text-neutral-500 hover:text-white"}`}>
                {s === "signup" ? t.tab_signup : t.tab_login}
              </button>
            ))}
          </div>
        )}

        {error && step !== "pending" && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        {/* ── Signup form ──────────────────────────────────────── */}
        {step === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">{t.label_first}</label>
                <input type="text" placeholder={t.ph_first} required value={signup.firstName} onChange={su("firstName")} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">{t.label_last}</label>
                <input type="text" placeholder={t.ph_last} required value={signup.lastName} onChange={su("lastName")} className={INPUT} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">{t.label_email}</label>
              <input type="email" placeholder={t.ph_email} required value={signup.email} onChange={su("email")} className={INPUT} />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">{t.label_phone}</label>
              <div className="flex gap-2">
                <select value={signup.dialCode} onChange={e => setSignup(f => ({ ...f, dialCode: e.target.value }))}
                  className="bg-[#111] border border-white/10 rounded-xl px-2 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors">
                  <option value="+212">🇲🇦 +212</option>
                  <option value="+213">🇩🇿 +213</option>
                  <option value="+216">🇹🇳 +216</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+39">🇮🇹 +39</option>
                  <option value="+351">🇵🇹 +351</option>
                  <option value="+40">🇷🇴 +40</option>
                  <option value="+359">🇧🇬 +359</option>
                  <option value="+30">🇬🇷 +30</option>
                  <option value="+36">🇭🇺 +36</option>
                  <option value="+421">🇸🇰 +421</option>
                  <option value="+420">🇨🇿 +420</option>
                  <option value="+32">🇧🇪 +32</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+31">🇳🇱 +31</option>
                  <option value="+41">🇨🇭 +41</option>
                </select>
                <input type="tel" placeholder={t.ph_phone} required
                  value={signup.phone}
                  onChange={e => setSignup(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 15) }))}
                  className={INPUT} />
              </div>
              <p className="text-[11px] text-neutral-700 mt-1">{t.hint_phone}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">{t.label_store}</label>
              <input type="text" placeholder={t.ph_store} value={signup.company} onChange={su("company")} className={INPUT} />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">{t.label_country}</label>
              <select required value={signup.countryCode} onChange={su("countryCode")}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors">
                <option value="">{t.ph_country}</option>
                {COUNTRIES[lang].map(c => (
                  <option key={c.v} value={c.v}>{c.l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">{t.label_password}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder={t.ph_password} required minLength={8}
                  value={signup.password} onChange={su("password")} className={INPUT + " pr-11"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-white/10 bg-[#111] text-orange-500" />
              <span className="text-xs text-neutral-600">
                {t.terms}{" "}
                <span className="text-orange-400 cursor-pointer hover:underline">{t.terms_link1}</span>
                {" "}{t.terms_and}{" "}
                <span className="text-orange-400 cursor-pointer hover:underline">{t.terms_link2}</span>
              </span>
            </label>

            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
              {isLoading ? <><Spinner />{t.btn_loading_sign}</> : <>{t.btn_signup} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* ── Login form ───────────────────────────────────────── */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">{t.label_email}</label>
              <input type="email" placeholder={t.ph_email} required value={login.email} onChange={lg("email")} className={INPUT} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-500">{t.label_pwd}</label>
                <button type="button" onClick={() => { setStep("forgot"); setError(""); setForgotEmail(login.email) }}
                  className="text-xs text-orange-400 hover:underline">{t.forgot}</button>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" required
                  value={login.password} onChange={lg("password")} className={INPUT + " pr-11"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
              {isLoading ? <><Spinner />{t.btn_loading_log}</> : <>{t.btn_login} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* ── Forgot password ──────────────────────────────────── */}
        {step === "forgot" && (
          forgotSent ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-lg">{t.sent_title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {t.sent_sub} <span className="text-white">{forgotEmail}</span>,<br />
                {t.sent_sub2}
              </p>
              <p className="text-neutral-600 text-xs">{t.sent_spam}</p>
              <button onClick={() => { setStep("login"); setForgotSent(false); setError("") }}
                className="flex items-center justify-center gap-2 mx-auto text-orange-400 text-sm hover:text-orange-300 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />{t.back_login}
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => { setStep("login"); setError("") }}
                className="flex items-center gap-1.5 text-neutral-500 hover:text-white text-sm mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />{t.back}
              </button>
              <h3 className="text-white font-bold text-xl mb-1">{t.forgot_title}</h3>
              <p className="text-neutral-500 text-sm mb-6 leading-relaxed">{t.forgot_sub}</p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">{t.label_fg_email}</label>
                  <input type="email" placeholder={t.ph_email} required
                    value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className={INPUT} />
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
                  {isLoading ? <><Spinner />{t.btn_sending}</> : <>{t.btn_send} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )
        )}
      </div>
    </div>
  )
}
