"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, AlertCircle, Lock, Mail, Shield } from "lucide-react"
import { useI18n } from "@/lib/admin-i18n"
import { Logo } from "@/components/logo"

export default function AdminLogin() {
  const router = useRouter()
  const { t } = useI18n()
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      })
      if (res.ok) {
        router.push("/admin")
      } else {
        const data = await res.json()
        setError(data.error ?? "Incorrect email or password.")
      }
    } catch {
      setError("Server connection error.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #f97316 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(ellipse, #f97316 0%, transparent 70%)" }} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: "radial-gradient(ellipse, #ef4444 0%, transparent 70%)" }} />
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-5 mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-2xl shadow-orange-500/20 mx-auto">
              <Logo size={80} showBg={false} />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-neutral-950 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight">{t("login_title")}</h1>
          <p className="text-neutral-500 text-sm">{t("login_sub")}</p>
        </div>

        <div className="relative rounded-2xl border border-white/10 overflow-hidden"
          style={{ background: "rgba(15,15,15,0.95)", boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)" }}>

          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #f97316, #ef4444, transparent)" }} />

          <div className="p-8">
            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                  {t("login_email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t("login_placeholder_email")}
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-neutral-700 focus:outline-none focus:border-orange-500/60 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                  {t("login_password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-11 py-3.5 text-white text-sm placeholder:text-neutral-700 focus:outline-none focus:border-orange-500/60 focus:bg-white/[0.06] transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all relative overflow-hidden disabled:opacity-60 mt-2"
                style={{ background: loading ? "rgba(249,115,22,0.5)" : "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: loading ? "none" : "0 8px 24px rgba(249,115,22,0.3)" }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {t("login_loading")}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    {t("login_submit")}
                  </span>
                )}
              </button>
            </form>

            <p className="text-center text-neutral-700 text-xs mt-6">{t("login_restricted")}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-neutral-600 text-xs">{t("login_secure")}</p>
        </div>
      </div>
    </div>
  )
}
