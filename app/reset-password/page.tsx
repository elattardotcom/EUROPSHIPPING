"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"

const INPUT = "w-full bg-[#111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-8 shadow-2xl"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.9)" }}>

          <div className="flex items-center gap-3 mb-8">
            <Logo size={40} showBg={true} />
            <div>
              <h1 className="text-white font-black text-lg tracking-tight">CODShip</h1>
              <p className="text-neutral-600 text-xs">Pro Platform</p>
            </div>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-white font-bold text-xl">Mot de passe mis à jour !</h2>
              <p className="text-neutral-500 text-sm">Votre mot de passe a été réinitialisé avec succès.</p>
              <Link href="/"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-all"
                style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
                Se connecter <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-xl mb-1">Nouveau mot de passe</h2>
              <p className="text-neutral-500 text-sm mb-6">Choisissez un mot de passe sécurisé pour votre compte.</p>

              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Nouveau mot de passe</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder="Minimum 8 caractères"
                      required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                      disabled={!token} className={INPUT + " pr-11"} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Confirmer le mot de passe</label>
                  <input type={showPw ? "text" : "password"} placeholder="Répétez le mot de passe"
                    required value={confirm} onChange={e => setConfirm(e.target.value)}
                    disabled={!token} className={INPUT} />
                </div>
                <button type="submit" disabled={loading || !token}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
                  {loading ? <><Spinner />Mise à jour…</> : <>Réinitialiser mon mot de passe <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-neutral-600">
                Vous vous souvenez de votre mot de passe ?{" "}
                <Link href="/" className="text-orange-400 hover:underline">Se connecter</Link>
              </p>
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
