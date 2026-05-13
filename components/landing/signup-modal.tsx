"use client"

import { useState } from "react"
import { Eye, EyeOff, ArrowRight, X, ArrowLeft, CheckCircle } from "lucide-react"
import { Logo } from "@/components/logo"

const INPUT = "w-full bg-[#111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

export function SignupModal({ onClose, initialStep = "signup" }: { onClose: () => void; initialStep?: "signup" | "login" }) {
  const [step,         setStep]        = useState<"signup" | "login" | "forgot" | "pending">(initialStep)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading,    setIsLoading]   = useState(false)
  const [error,        setError]       = useState("")

  const [signup, setSignup] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    company: "", countryCode: "", password: "",
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
    e.preventDefault(); setError(""); setIsLoading(true)
    try {
      const res  = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(signup) })
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.9)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-600 hover:text-white transition-colors"><X className="w-5 h-5" /></button>

        <div className="flex items-center gap-3 mb-8">
          <Logo size={40} showBg={true} />
          <div>
            <h1 className="text-white font-black text-lg tracking-tight">CODShipEurope</h1>
            <p className="text-neutral-600 text-xs">Pro Platform</p>
          </div>
        </div>

        {step === "pending" && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-2">Demande envoyée !</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Votre demande d'inscription a bien été reçue.<br />
                Un administrateur va examiner votre dossier et vous activera votre compte sous peu.
              </p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Examen sous 24–48h ouvrées
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Vous recevrez un email dès l&apos;activation
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Aucune action requise de votre part
              </div>
            </div>
            <button onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
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
              <input type="tel" placeholder="+212 6 12 34 56 78" required value={signup.phone} onChange={su("phone")} className={INPUT} />
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
              {isLoading ? <><Spinner />Création...</> : <>Créer mon compte gratuit <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-center text-xs text-neutral-700">14 jours gratuits · Aucune carte requise</p>
          </form>
        )}

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
