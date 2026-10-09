"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Lock } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"

// text-base (16px) on purpose — anything smaller triggers an unwanted
// zoom-on-focus in iOS Safari.
const INPUT = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-12 py-3 text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 focus:bg-white/[0.06] transition-colors"

const Spinner = () => (
  <svg className="animate-spin motion-reduce:animate-none w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

function ResetForm() {
  const params   = useSearchParams()
  const token    = params.get("token") ?? ""

  const [password,    setPassword]    = useState("")
  const [confirm,     setConfirm]     = useState("")
  const [showPw,      setShowPw]      = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState(false)
  const [error,       setError]       = useState("")

  useEffect(() => {
    if (!token) setError("Lien invalide. Veuillez refaire la demande.")
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return }
    if (password.length < 8)  { setError("Minimum 8 caractères requis"); return }

    setLoading(true)
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? "Erreur serveur"); return }
    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center p-4"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-8" style={{ background: "#0d0d10", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>

          <div className="flex items-center gap-3 mb-8">
            <Logo size={48} showBg={true} />
            <div>
              <h1 className="text-white font-black text-base tracking-tight">CODShipEurope</h1>
              <p className="text-neutral-600 text-[10px] uppercase tracking-wide">Logistique paiement à la livraison</p>
            </div>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-white font-bold text-xl">Mot de passe mis à jour !</h2>
              <p className="text-neutral-500 text-sm">Votre mot de passe a été réinitialisé avec succès.</p>
              <Link href="/auth/login"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
                Se connecter <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white font-black text-xl mb-1">Nouveau mot de passe</h2>
              <p className="text-neutral-500 text-sm mb-6">Choisissez un mot de passe sécurisé pour votre compte.</p>

              {error && (
                <div className="mb-4 rounded-xl px-4 py-3 flex items-center gap-2 text-red-400 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-password" className="block text-xs font-semibold text-neutral-400 mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
                    <input id="reset-password" type={showPw ? "text" : "password"} autoComplete="new-password" placeholder="Minimum 8 caractères"
                      required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                      disabled={!token} className={INPUT} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      aria-label={showPw ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPw}
                      className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-neutral-600 hover:text-white">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="reset-password-confirm" className="block text-xs font-semibold text-neutral-400 mb-2">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
                    <input id="reset-password-confirm" type={showPw ? "text" : "password"} autoComplete="new-password" placeholder="Répétez le mot de passe"
                      required value={confirm} onChange={e => setConfirm(e.target.value)}
                      disabled={!token} className={INPUT.replace("pr-12", "pr-4")} />
                  </div>
                </div>
                <button type="submit" disabled={loading || !token}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
                  {loading ? <><Spinner />Mise à jour…</> : <>Réinitialiser mon mot de passe <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-neutral-600">
                Vous vous souvenez de votre mot de passe ?{" "}
                <Link href="/auth/login" className="text-orange-400 hover:underline">Se connecter</Link>
              </p>

              <div className="mt-6 rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Lock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-semibold">Votre compte est en sécurité</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">Nous utilisons des protocoles sécurisés pour protéger vos informations.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  )
}
