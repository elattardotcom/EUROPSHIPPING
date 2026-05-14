"use client"

import { useState } from "react"
import { Eye, EyeOff, ArrowRight, X, ArrowLeft, CheckCircle } from "lucide-react"
import { Logo } from "@/components/logo"

const INPUT = "w-full bg-[#111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"

const PLAN_AMOUNTS: Record<string, number> = { Starter: 29, Pro: 59, Enterprise: 89 }
const PAYPAL_ME = process.env.NEXT_PUBLIC_PAYPAL_ME ?? ""

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
  const [step,         setStep]        = useState<"signup" | "login" | "forgot" | "pending">(initialStep)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading,    setIsLoading]   = useState(false)
  const [error,        setError]       = useState("")

  const [signup, setSignup] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    dialCode: "+212", company: "", countryCode: "",
    password: "", plan: initialPlan ?? "Starter",
  })
  const [login,        setLogin]       = useState({ email: "", password: "" })
  const [forgotEmail,  setForgotEmail] = useState("")
  const [forgotSent,   setForgotSent]  = useState(false)

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
    } catch { setError("Erreur de connexion au serveur") }
    setIsLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError("")

    const phoneDigits = signup.phone.replace(/\D/g, "")
    if (phoneDigits.startsWith("0")) {
      setError("Ne pas inclure le 0 au début — le code pays (+212, +33…) est déjà ajouté.")
      return
    }
    if (phoneDigits.length !== 9) {
      setError("Le numéro doit contenir exactement 9 chiffres sans le 0 initial.")
      return
    }

    setIsLoading(true)
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...signup, fullPhone: signup.dialCode + signup.phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Erreur lors de l'inscription"); setIsLoading(false); return }
      setStep("pending")
    } catch { setError("Erreur de connexion au serveur"); setIsLoading(false) }
    setIsLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setIsLoading(true)
    try {
      const res  = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(login) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Identifiants incorrects"); setIsLoading(false); return }
      window.location.href = "/dashboard"
    } catch { setError("Erreur de connexion au serveur"); setIsLoading(false) }
  }

  const planAmount  = PLAN_AMOUNTS[signup.plan] ?? 29
  const paypalLink  = PAYPAL_ME ? `https://paypal.me/${PAYPAL_ME}/${planAmount}EUR` : "#"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.9)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-600 hover:text-white transition-colors"><X className="w-5 h-5" /></button>

        <div className="flex items-center gap-3 mb-8">
          <Logo size={56} showBg={true} />
          <div>
            <h1 className="text-white font-black text-lg tracking-tight">CODShipEurope</h1>
            <p className="text-neutral-600 text-xs">Pro Platform</p>
          </div>
        </div>

        {/* ── Pending / Payment ──────────────────────────────────── */}
        {step === "pending" && (
          <div className="space-y-5 py-2">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-white font-bold text-xl mb-1">Demande envoyée !</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Pour activer votre compte, réglez votre pack via PayPal.
              </p>
            </div>

            {/* Plan recap */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Pack choisi</p>
                <p className="text-white font-bold">{signup.plan}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 mb-0.5">Montant</p>
                <p className="text-orange-400 font-black text-2xl">€{planAmount}</p>
                <p className="text-neutral-600 text-xs">/mois</p>
              </div>
            </div>

            {/* PayPal button */}
            <a
              href={paypalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#003087,#0070ba)", boxShadow: "0 8px 24px rgba(0,112,186,0.3)" }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 4.643-5.813 4.643h-2.19c-.38 0-.702.277-.76.653l-1.12 7.106-.316 2.001a.48.48 0 0 0 .474.554h3.324c.458 0 .85-.332.922-.784l.038-.196.733-4.646.047-.256a.933.933 0 0 1 .921-.784h.581c3.758 0 6.698-1.527 7.556-5.944.358-1.845.173-3.386-.75-4.47z"/>
              </svg>
              Payer €{planAmount} via PayPal
            </a>

            {/* Instructions */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-semibold text-neutral-300">Instructions de paiement :</p>
              {[
                `Cliquez "Payer via PayPal" ci-dessus`,
                `Ajoutez votre email (${signup.email}) en note de référence`,
                "Votre compte sera activé sous 24h après réception du paiement",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-neutral-500">
                  <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>

            <button onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-sm text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700 transition-all">
              Fermer
            </button>
          </div>
        )}

        {step !== "forgot" && step !== "pending" && (
          <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl mb-6 border border-white/[0.05]">
            {(["signup","login"] as const).map(s => (
              <button key={s} onClick={() => { setStep(s); setError("") }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${step === s ? "bg-orange-500 text-white" : "text-neutral-500 hover:text-white"}`}>
                {s === "signup" ? "Créer un compte" : "Se connecter"}
              </button>
            ))}
          </div>
        )}

        {error && step !== "pending" && <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

        {/* ── Signup form ───────────────────────────────────────── */}
        {step === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Prénom *</label>
                <input type="text" placeholder="Mohamed" required value={signup.firstName} onChange={su("firstName")} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Nom *</label>
                <input type="text" placeholder="Alami" required value={signup.lastName} onChange={su("lastName")} className={INPUT} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email *</label>
              <input type="email" placeholder="vous@exemple.com" required value={signup.email} onChange={su("email")} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Téléphone *</label>
              <div className="flex gap-2">
                <select
                  value={signup.dialCode}
                  onChange={e => setSignup(f => ({ ...f, dialCode: e.target.value }))}
                  className="bg-[#111] border border-white/10 rounded-xl px-2 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="+212">🇲🇦 +212</option>
                  <option value="+213">🇩🇿 +213</option>
                  <option value="+216">🇹🇳 +216</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+39">🇮🇹 +39</option>
                  <option value="+351">🇵🇹 +351</option>
                  <option value="+40">🇷🇴 +40</option>
                  <option value="+32">🇧🇪 +32</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+31">🇳🇱 +31</option>
                  <option value="+41">🇨🇭 +41</option>
                  <option value="+30">🇬🇷 +30</option>
                  <option value="+36">🇭🇺 +36</option>
                  <option value="+421">🇸🇰 +421</option>
                  <option value="+386">🇸🇮 +386</option>
                  <option value="+420">🇨🇿 +420</option>
                  <option value="+359">🇧🇬 +359</option>
                </select>
                <input type="tel" placeholder="612345678" required
                  value={signup.phone}
                  onChange={e => setSignup(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 9) }))}
                  className={INPUT} />
              </div>
              <p className="text-[11px] text-neutral-700 mt-1">9 chiffres sans le 0 initial</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Boutique</label>
              <input type="text" placeholder="Ma Boutique (optionnel)" value={signup.company} onChange={su("company")} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Pays *</label>
              <select required value={signup.countryCode} onChange={su("countryCode")}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors">
                <option value="">Sélectionner un pays</option>
                <option value="ES">🇪🇸 Espagne</option>
                <option value="IT">🇮🇹 Italie</option>
                <option value="PT">🇵🇹 Portugal</option>
                <option value="RO">🇷🇴 Roumanie</option>
                <option value="BG">🇧🇬 Bulgarie</option>
                <option value="HU">🇭🇺 Hongrie</option>
                <option value="GR">🇬🇷 Grèce</option>
                <option value="SK">🇸🇰 Slovaquie</option>
                <option value="SI">🇸🇮 Slovénie</option>
                <option value="CZ">🇨🇿 République tchèque</option>
              </select>
            </div>

            {/* ── Plan selection ──────────────────────────────────── */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-2">Pack *</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "Starter",    price: "€29", color: "#10b981" },
                  { id: "Pro",        price: "€59", color: "#f97316", popular: true },
                  { id: "Enterprise", price: "€89", color: "#6366f1" },
                ] as const).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSignup(f => ({ ...f, plan: p.id }))}
                    className={`relative flex flex-col items-center pt-4 pb-3 px-2 rounded-xl border text-center transition-all ${signup.plan === p.id ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-[#111] hover:border-white/20"}`}
                  >
                    {"popular" in p && p.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">POPULAIRE</span>
                    )}
                    <span className="text-white font-bold text-xs">{p.id}</span>
                    <span className="font-black text-base" style={{ color: p.color }}>{p.price}</span>
                    <span className="text-neutral-600 text-[10px]">/mois</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Mot de passe *</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Minimum 8 caractères" required minLength={8} value={signup.password} onChange={su("password")} className={INPUT + " pr-11"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-white/10 bg-[#111] text-orange-500" />
              <span className="text-xs text-neutral-600">
                J'accepte les <span className="text-orange-400 cursor-pointer hover:underline">Conditions</span> et la <span className="text-orange-400 cursor-pointer hover:underline">Politique de confidentialité</span>
              </span>
            </label>
            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
              {isLoading ? <><Spinner />Création...</> : <>Créer mon compte <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* ── Login form ────────────────────────────────────────── */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email</label>
              <input type="email" placeholder="vous@exemple.com" required value={login.email} onChange={lg("email")} className={INPUT} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-500">Mot de passe</label>
                <button type="button" onClick={() => { setStep("forgot"); setError(""); setForgotEmail(login.email) }}
                  className="text-xs text-orange-400 hover:underline">Oublié ?</button>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" required value={login.password} onChange={lg("password")} className={INPUT + " pr-11"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
              {isLoading ? <><Spinner />Connexion...</> : <>Se connecter <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* ── Forgot password ───────────────────────────────────── */}
        {step === "forgot" && (
          forgotSent ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-lg">Email envoyé !</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Si un compte existe pour <span className="text-white">{forgotEmail}</span>,<br />
                vous recevrez un lien de réinitialisation.
              </p>
              <p className="text-neutral-600 text-xs">Vérifiez aussi vos spams.</p>
              <button onClick={() => { setStep("login"); setForgotSent(false); setError("") }}
                className="flex items-center justify-center gap-2 mx-auto text-orange-400 text-sm hover:text-orange-300 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => { setStep("login"); setError("") }}
                className="flex items-center gap-1.5 text-neutral-500 hover:text-white text-sm mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />Retour
              </button>
              <h3 className="text-white font-bold text-xl mb-1">Mot de passe oublié ?</h3>
              <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Adresse email</label>
                  <input type="email" placeholder="vous@exemple.com" required
                    value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className={INPUT} />
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
                  {isLoading ? <><Spinner />Envoi...</> : <>Envoyer le lien <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )
        )}
      </div>
    </div>
  )
}
