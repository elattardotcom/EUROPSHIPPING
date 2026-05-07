"use client"

import { useState } from "react"
import {
  CheckCircle, ArrowRight, Users, Truck, BarChart3, Zap, Shield,
  Star, X, Eye, EyeOff, Wallet, Link2, Gift, Phone, Mail, MapPin,
  Instagram, Facebook, Twitter, Package, ChevronRight,
  Banknote, PhoneCall, TrendingUp, Clock, BadgeCheck, Globe2, Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const INPUT = "w-full bg-[#111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"

const LIVE_ORDERS = [
  { ref: "COD-7821", city: "Madrid",    product: "Montre Premium",  amount: "€48", status: "LIVRÉ",     flag: "🇪🇸", color: "#10b981" },
  { ref: "COD-7820", city: "Porto",     product: "Sac à main",      amount: "€62", status: "CONFIRMÉ",  flag: "🇵🇹", color: "#f59e0b" },
  { ref: "COD-7819", city: "Bucarest",  product: "Écouteurs BT",    amount: "€35", status: "EN ROUTE",  flag: "🇷🇴", color: "#6366f1" },
  { ref: "COD-7818", city: "Barcelone", product: "Parfum Sport",    amount: "€55", status: "LIVRÉ",     flag: "🇪🇸", color: "#10b981" },
  { ref: "COD-7817", city: "Milan",     product: "Smartwatch X4",   amount: "€71", status: "CONFIRMÉ",  flag: "🇮🇹", color: "#f59e0b" },
  { ref: "COD-7816", city: "Lisbonne",  product: "Set Cuisine",     amount: "€44", status: "LIVRÉ",     flag: "🇵🇹", color: "#10b981" },
  { ref: "COD-7815", city: "Sofia",     product: "Chaussures Run",  amount: "€89", status: "EN ROUTE",  flag: "🇧🇬", color: "#6366f1" },
  { ref: "COD-7814", city: "Athènes",   product: "Lampe LED",       amount: "€29", status: "LIVRÉ",     flag: "🇬🇷", color: "#10b981" },
  { ref: "COD-7813", city: "Budapest",  product: "Brosse à cheveux",amount: "€38", status: "LIVRÉ",     flag: "🇭🇺", color: "#10b981" },
  { ref: "COD-7812", city: "Prague",    product: "Montre Sport",    amount: "€65", status: "CONFIRMÉ",  flag: "🇨🇿", color: "#f59e0b" },
]

const TICKER = [
  "📦 COD-7821 LIVRÉ · +€48",
  "✅ 198 commandes confirmées aujourd'hui",
  "💰 €12,450 encaissés ce mois",
  "🚚 89 colis en route maintenant",
  "📦 COD-7814 LIVRÉ · +€29",
  "✅ Taux de livraison 94%",
  "💰 Virement reçu en 48h",
  "🚚 COD-7819 EN ROUTE · Bucarest",
]

function SignupModal({ onClose, initialStep = "signup" }: { onClose: () => void; initialStep?: "signup" | "login" }) {
  const [step,         setStep]        = useState<"signup" | "login">(initialStep)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading,    setIsLoading]   = useState(false)
  const [error,        setError]       = useState("")

  const [signup, setSignup] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    company: "", countryCode: "", password: "",
  })
  const [login, setLogin] = useState({ email: "", password: "" })

  const su = (k: keyof typeof signup) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setSignup(f => ({ ...f, [k]: e.target.value }))
  const lg = (k: keyof typeof login) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLogin(f => ({ ...f, [k]: e.target.value }))

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setIsLoading(true)
    try {
      const res  = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(signup) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Erreur lors de l'inscription"); setIsLoading(false); return }
      window.location.href = "/dashboard"
    } catch { setError("Erreur de connexion au serveur"); setIsLoading(false) }
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

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.9)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-600 hover:text-white transition-colors"><X className="w-5 h-5" /></button>

        <div className="flex items-center gap-3 mb-8">
          <Logo size={40} showBg={true} />
          <div>
            <h1 className="text-white font-black text-lg tracking-tight">CODShip</h1>
            <p className="text-neutral-600 text-xs">Pro Platform</p>
          </div>
        </div>

        <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl mb-6 border border-white/[0.05]">
          {(["signup","login"] as const).map(s => (
            <button key={s} onClick={() => { setStep(s); setError("") }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${step === s ? "bg-orange-500 text-white" : "text-neutral-500 hover:text-white"}`}>
              {s === "signup" ? "Créer un compte" : "Se connecter"}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

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
                <span className="text-xs text-orange-400 hover:underline cursor-pointer">Oublié ?</span>
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
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [showModal,    setShowModal]    = useState(false)
  const [modalStep,    setModalStep]    = useState<"signup" | "login">("signup")
  const openSignup = () => { setModalStep("signup"); setShowModal(true) }
  const openLogin  = () => { setModalStep("login");  setShowModal(true) }

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
        @keyframes feed-scroll {
          0% { transform: translateY(0) }
          100% { transform: translateY(-50%) }
        }
        @keyframes cash-ping {
          0%, 100% { transform: scale(1); opacity: 1 }
          50% { transform: scale(1.15); opacity: 0.8 }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-20px) }
          to { opacity: 1; transform: translateX(0) }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.2) }
          50% { box-shadow: 0 0 40px rgba(16,185,129,0.5), 0 0 80px rgba(16,185,129,0.15) }
        }
        @keyframes dot-blink {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.2 }
        }
        @keyframes counter {
          from { opacity: 0; transform: translateY(10px) }
          to { opacity: 1; transform: translateY(0) }
        }
        .marquee-track { animation: marquee 30s linear infinite }
        .marquee-track:hover { animation-play-state: paused }
        .feed-track { animation: feed-scroll 20s linear infinite }
        .animate-cash { animation: cash-ping 2s ease-in-out infinite }
        .animate-slide-r { animation: slide-right 0.6s ease-out forwards }
        .animate-slide-u { animation: slide-up 0.5s ease-out forwards }
        .animate-glow { animation: glow-pulse 3s ease-in-out infinite }
        .animate-dot { animation: dot-blink 1.2s ease-in-out infinite }
        .d1 { animation-delay: 0.1s; opacity: 0 }
        .d2 { animation-delay: 0.2s; opacity: 0 }
        .d3 { animation-delay: 0.35s; opacity: 0 }
        .d4 { animation-delay: 0.5s; opacity: 0 }
        .d5 { animation-delay: 0.65s; opacity: 0 }
        .diag-top { clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%) }
        .diag-bottom { clip-path: polygon(0 5%, 100% 0, 100% 100%, 0 100%) }
        .diag-mid { clip-path: polygon(0 4%, 100% 0, 100% 96%, 0 100%) }
        .cash-border {
          position: relative;
        }
        .cash-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(16,185,129,0.4), rgba(249,115,22,0.4), rgba(16,185,129,0.1));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .bento-card {
          transition: all 0.25s ease;
        }
        .bento-card:hover {
          transform: scale(1.015);
        }
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-16 flex items-center border-b border-white/[0.05]"
        style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} showBg={true} />
            <span className="font-black text-xl tracking-tight">CODShip</span>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-1 rounded-full uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-dot" />
              Live
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-500">
            {[["#features","Fonctionnalités"],["#how","Comment ça marche"],["#pricing","Tarifs"],["#testimonials","Avis"]].map(([h,l]) => (
              <a key={h} href={h} className="hover:text-white transition-colors">{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <button onClick={openLogin}
              className="text-sm text-neutral-400 hover:text-white px-4 py-2 rounded-lg border border-transparent hover:border-white/10 transition-all">
              Se connecter
            </button>
            <button onClick={openSignup}
              className="text-sm font-bold text-white px-5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
              style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 4px 20px rgba(249,115,22,0.3)" }}>
              Devenir client
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Ticker ─────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.04] overflow-hidden py-2.5" style={{ background: "rgba(16,185,129,0.04)" }}>
        <div className="flex whitespace-nowrap">
          <div className="marquee-track flex items-center gap-0">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="text-xs text-neutral-500 px-6 flex items-center gap-3">
                {t}
                <span className="w-px h-3 bg-white/10" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-0 px-6 diag-top" style={{ background: "linear-gradient(160deg, #0d0d0d 0%, #0a0a0a 60%, #080808 100%)" }}>
        {/* Ambient */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="max-w-7xl mx-auto relative pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div>
              <div className="animate-slide-r d1 inline-flex items-center gap-2 text-xs font-semibold border border-orange-500/20 bg-orange-500/8 text-orange-400 px-3.5 py-1.5 rounded-full mb-8 uppercase tracking-widest">
                <Banknote className="w-3.5 h-3.5" />
                Cash on Delivery · Europe · 10 pays
              </div>

              <h1 className="animate-slide-r d2 text-5xl lg:text-6xl font-black leading-[1.04] tracking-tight mb-6">
                Chaque<br />
                livraison,{" "}
                <span style={{
                  background: "linear-gradient(90deg,#10b981,#34d399,#10b981)",
                  backgroundSize: "200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>du cash</span>
                <br />
                dans votre poche
              </h1>

              <p className="animate-slide-r d3 text-neutral-500 text-base leading-relaxed mb-10 max-w-lg">
                CODShip centralise vos commandes Shopify, gère vos confirmations d'appel, suit chaque livraison et vire votre argent — en 48h. Zéro friction, 100% COD.
              </p>

              <div className="animate-slide-r d4 flex flex-col sm:flex-row gap-3 mb-12">
                <button onClick={openSignup}
                  className="group flex items-center justify-center gap-2 font-bold text-sm text-white px-8 py-3.5 rounded-xl transition-all"
                  style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.35)" }}>
                  Devenir client
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Mini stats row */}
              <div className="animate-slide-r d5 flex items-center gap-6 text-sm">
                {[
                  { n: "2 500+", l: "marchands", color: "#f97316" },
                  { n: "€1.2M", l: "/ mois", color: "#10b981" },
                  { n: "94%", l: "livraison", color: "#6366f1" },
                ].map(s => (
                  <div key={s.l} className="flex flex-col">
                    <span className="text-xl font-black" style={{ color: s.color }}>{s.n}</span>
                    <span className="text-xs text-neutral-600 uppercase tracking-wide">{s.l}</span>
                  </div>
                ))}
                <div className="w-px h-10 bg-white/[0.06]" />
                <div className="flex flex-wrap gap-2">
                  {["🇪🇸","🇮🇹","🇵🇹","🇷🇴","🇧🇬","🇭🇺","🇬🇷","🇸🇰","🇸🇮","🇨🇿"].map(f => (
                    <span key={f} className="text-base">{f}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — live order feed */}
            <div className="relative hidden lg:block">
              <div className="relative h-[480px] overflow-hidden rounded-2xl cash-border"
                style={{ background: "rgba(12,12,12,0.9)", boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.6)" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <div>
                    <div className="text-xs text-neutral-600 mb-0.5 uppercase tracking-wider">Flux en direct</div>
                    <div className="text-sm font-bold text-white">Commandes COD</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-dot" />
                    LIVE
                  </div>
                </div>

                {/* Scrolling feed */}
                <div className="absolute inset-x-0 bottom-0 top-[57px] overflow-hidden">
                  <div className="feed-track">
                    {[...LIVE_ORDERS, ...LIVE_ORDERS].map((o, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <div className="text-xl flex-shrink-0">{o.flag}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono text-neutral-600">{o.ref}</span>
                            <span className="text-[10px] text-neutral-700">·</span>
                            <span className="text-[10px] text-neutral-500">{o.city}</span>
                          </div>
                          <div className="text-sm font-medium text-white truncate">{o.product}</div>
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <span className="text-sm font-black" style={{ color: "#10b981" }}>{o.amount}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color: o.color, background: `${o.color}15`, border: `1px solid ${o.color}30` }}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 inset-x-0 h-16 pointer-events-none rounded-b-2xl"
                  style={{ background: "linear-gradient(to top, rgba(12,12,12,1), transparent)" }} />

                {/* Cash total badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-bold text-emerald-400 border border-emerald-500/25 bg-[#0c0c0c] px-4 py-2 rounded-full animate-glow">
                  <Banknote className="w-3.5 h-3.5" />
                  +€48 encaissé il y a 2 min
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -left-6 top-1/3 flex items-center gap-2 bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 shadow-2xl animate-cash">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-600">Confirmations</div>
                  <div className="text-xs font-black text-white">+198 aujourd'hui</div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 flex items-center gap-2 bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 shadow-2xl" style={{ animation: "cash-ping 2.5s ease-in-out infinite", animationDelay: "1s" }}>
                <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-600">Revenus / mois</div>
                  <div className="text-xs font-black text-white">€12,450</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COD Flow ───────────────────────────────────────────── */}
      <section id="how" className="py-28 px-6 diag-mid" style={{ background: "linear-gradient(180deg,#0d1a12 0%,#0a1410 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <Truck className="w-3.5 h-3.5" />
              Le cycle COD complet
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">De la commande au virement</h2>
            <p className="text-neutral-500 text-sm max-w-lg mx-auto">
              CODShip couvre l'intégralité du flux Cash on Delivery — de l'arrivée du lead jusqu'au virement bancaire.
            </p>
          </div>

          {/* Flow steps */}
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-10 left-0 right-0 h-px hidden md:block"
              style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), rgba(249,115,22,0.3), rgba(99,102,241,0.3), transparent)" }} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  icon: Link2, step: "01", label: "Shopify connecté",
                  desc: "Lead entrant automatiquement depuis votre boutique Shopify",
                  color: "#6366f1", glow: "rgba(99,102,241,0.2)",
                },
                {
                  icon: PhoneCall, step: "02", label: "Confirmation d'appel",
                  desc: "Votre équipe confirme la commande et valide l'adresse de livraison",
                  color: "#f59e0b", glow: "rgba(245,158,11,0.2)",
                },
                {
                  icon: Truck, step: "03", label: "Expédition & Suivi",
                  desc: "Le colis part, le client reçoit et paie en cash à la livraison",
                  color: "#f97316", glow: "rgba(249,115,22,0.2)",
                },
                {
                  icon: Banknote, step: "04", label: "Virement 48h",
                  desc: "CODShip collecte le cash et vous vire sur votre compte en 48h",
                  color: "#10b981", glow: "rgba(16,185,129,0.2)",
                },
              ].map(s => (
                <div key={s.step} className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-white/[0.05] hover:border-white/[0.1] transition-all group"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(ellipse at top, ${s.glow}, transparent 70%)` }} />
                  <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}30`, boxShadow: `0 8px 24px ${s.glow}` }}>
                    <s.icon className="w-6 h-6" style={{ color: s.color }} />
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: s.color, color: "#000" }}>
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2 relative">{s.label}</h3>
                  <p className="text-neutral-600 text-xs leading-relaxed relative">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Features ─────────────────────────────────────── */}
      <section id="features" className="py-28 px-6" style={{ background: "#080808" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-orange-400 text-xs font-bold border border-orange-500/20 bg-orange-500/8 px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <Layers className="w-3.5 h-3.5" />
              Fonctionnalités
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Tout ce qu'il vous faut</h2>
            <p className="text-neutral-500 text-sm max-w-xl mx-auto">
              Une suite complète pensée pour les marchands COD. Gérez, confirmez, livrez, encaissez.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Large card — Shopify */}
            <div className="bento-card md:col-span-2 relative overflow-hidden rounded-2xl p-8 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(6,182,212,0.04))", minHeight: 220 }}>
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.1),transparent 70%)" }} />
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
                <Link2 className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-white font-black text-xl mb-2">Connexion Shopify en 1 clic</h3>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
                Installez notre app et connectez autant de boutiques Shopify que vous voulez. Chaque nouvelle commande arrive instantanément dans CODShip.
              </p>
            </div>

            {/* Leads */}
            <div className="bento-card relative overflow-hidden rounded-2xl p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Gestion des Leads</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">Centralisez, confirmez ou recontactez vos leads depuis une interface ultra-rapide.</p>
              <div className="mt-4 flex gap-1.5">
                {["Confirmé","En attente","Refusé"].map((s,i) => (
                  <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: [["rgba(16,185,129,0.12)"],["rgba(245,158,11,0.12)"],["rgba(239,68,68,0.12)"]].flat()[i],
                      color: ["#10b981","#f59e0b","#ef4444"][i],
                      border: `1px solid ${["rgba(16,185,129,0.2)","rgba(245,158,11,0.2)","rgba(239,68,68,0.2)"][i]}`,
                    }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Wallet — tall */}
            <div className="bento-card relative overflow-hidden rounded-2xl p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(234,88,12,0.04))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <Wallet className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Wallet & Virements</h3>
              <p className="text-neutral-500 text-xs leading-relaxed mb-4">Votre solde en temps réel. Demandez un virement et recevez en 48h sur votre compte bancaire.</p>
              <div className="bg-black/30 rounded-xl p-3 border border-white/[0.05]">
                <div className="text-[10px] text-neutral-600 mb-1">Solde disponible</div>
                <div className="text-2xl font-black text-amber-400">€4,280</div>
                <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full w-2/3" style={{ background: "linear-gradient(90deg,#f59e0b,#f97316)" }} />
                </div>
              </div>
            </div>

            {/* Dashboard — wide */}
            <div className="bento-card md:col-span-2 relative overflow-hidden rounded-2xl p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.07),rgba(220,38,38,0.04))" }}>
              <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at bottom right,rgba(249,115,22,0.08),transparent 70%)" }} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.25)" }}>
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Dashboard Analytics</h3>
                  <p className="text-neutral-500 text-xs leading-relaxed">Revenus, taux de confirmation, livraisons — tout en un coup d'œil.</p>
                </div>
                <div className="space-y-2 self-end">
                  {[{ l: "Livraisons", v: 94, c: "#10b981" },{ l: "Confirmation", v: 71, c: "#f97316" },{ l: "Retours", v: 6, c: "#6366f1" }].map(m => (
                    <div key={m.l}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-neutral-600">{m.l}</span>
                        <span className="font-bold" style={{ color: m.c }}>{m.v}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${m.v}%`, background: m.c }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Affiliés */}
            <div className="bento-card relative overflow-hidden rounded-2xl p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(244,63,94,0.08),rgba(190,18,60,0.04))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.25)" }}>
                <Gift className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Programme Affiliés</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">Recrutez des apporteurs et gérez leurs commissions automatiquement.</p>
            </div>

            {/* Suivi commandes */}
            <div className="bento-card relative overflow-hidden rounded-2xl p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.08),rgba(109,40,217,0.04))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.25)" }}>
                <Truck className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Suivi Commandes</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">Temps réel : en attente, en route, livrée, retournée.</p>
            </div>

            {/* Shield */}
            <div className="bento-card relative overflow-hidden rounded-2xl p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(14,165,233,0.08),rgba(2,132,199,0.04))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.25)" }}>
                <Shield className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Sécurisé & Fiable</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">Vos données et transactions protégées. SLA 99.9% garanti.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 px-6 diag-mid" style={{ background: "linear-gradient(180deg,#0c0c0c 0%,#080808 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-violet-400 text-xs font-bold border border-violet-500/20 bg-violet-500/8 px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <Globe2 className="w-3.5 h-3.5" />
              Tarifs
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Investissement simple</h2>
            <p className="text-neutral-500 text-sm max-w-md mx-auto">Aucun frais caché. L'outil paye pour lui-même dès la première semaine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Starter", price: "€29", period: "/mois",
                desc: "Pour démarrer votre activité COD",
                highlight: false,
                features: ["1 boutique Shopify","Jusqu'à 500 leads/mois","Gestion commandes","Wallet & virements","Support email"],
              },
              {
                name: "Pro", price: "€59", period: "/mois",
                desc: "Pour les marchands en croissance",
                highlight: true,
                features: ["3 boutiques Shopify","Leads illimités","Programme affiliés","COD Drop catalog","Support prioritaire","Rapports avancés"],
              },
              {
                name: "Enterprise", price: "€89", period: "/mois",
                desc: "Pour les équipes et grandes opérations",
                highlight: false,
                features: ["Boutiques illimitées","Leads illimités","Multi-utilisateurs","API complète","Manager dédié","SLA 99.9%"],
              },
            ].map(p => (
              <div key={p.name} className={`relative rounded-2xl p-7 transition-all hover:-translate-y-1 ${p.highlight ? "cash-border" : "border border-white/[0.05]"}`}
                style={{
                  background: p.highlight ? "linear-gradient(160deg,rgba(249,115,22,0.08),rgba(8,8,8,1) 60%)" : "rgba(12,12,12,0.8)",
                  boxShadow: p.highlight ? "0 0 60px rgba(249,115,22,0.1), 0 20px 40px rgba(0,0,0,0.5)" : undefined,
                }}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black text-black px-4 py-1 rounded-full uppercase tracking-widest"
                    style={{ background: "linear-gradient(90deg,#f97316,#dc2626)", boxShadow: "0 4px 20px rgba(249,115,22,0.5)" }}>
                    LE PLUS POPULAIRE
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-white font-black text-lg">{p.name}</h3>
                  <p className="text-neutral-600 text-xs mt-1">{p.desc}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className={`text-5xl font-black ${p.highlight ? "text-orange-400" : "text-white"}`}>{p.price}</span>
                  <span className="text-neutral-600 text-sm">{p.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-neutral-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={openSignup}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${p.highlight ? "text-white" : "text-neutral-300 hover:text-white border border-white/[0.08] hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                  style={p.highlight ? { background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.25)" } : undefined}>
                  Commencer — 14j gratuits
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section id="testimonials" className="py-28 px-6" style={{ background: "#080808" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-yellow-400 text-xs font-bold border border-yellow-500/20 bg-yellow-500/8 px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              Témoignages
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ils encaissent tous les jours</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Karim B.", country: "🇵🇹 Portugal", role: "3 boutiques Shopify", text: "Avant CODShip, je gérais tout sur Excel et je perdais des leads en permanence. Maintenant mes confirmations sont automatiques, mes livraisons suivies et mes virements arrivent en 48h.", revenue: "+€3,200/mois", color: "from-orange-500 to-red-600" },
              { name: "Sara M.", country: "🇮🇹 Italie", role: "Mode & Beauté COD", text: "Le programme affilié m'a permis de doubler mes ventes sans pub. L'interface est claire, mon équipe de 3 personnes l'a pris en main en une journée. Le support répond dans l'heure.", revenue: "+€5,800/mois", color: "from-rose-500 to-pink-600" },
              { name: "Ahmed R.", country: "🇪🇸 Espagne", role: "COD Drop entrepreneur", text: "J'ai essayé 3 autres plateformes. CODShip est la seule qui comprend le flux COD de A à Z. Le suivi des retours et le wallet sont parfaits. Je gère 6 boutiques depuis un seul tableau de bord.", revenue: "+€8,100/mois", color: "from-blue-500 to-cyan-600" },
            ].map(t => (
              <div key={t.name} className="relative rounded-2xl p-7 border border-white/[0.05] hover:border-white/[0.1] transition-all group overflow-hidden"
                style={{ background: "rgba(12,12,12,0.9)" }}>
                <div className="absolute top-0 right-0 text-[120px] font-black text-white/[0.02] leading-none pointer-events-none select-none">"</div>
                <div className="flex items-center gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center text-white font-black text-sm`}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{t.name} {t.country}</p>
                      <p className="text-neutral-600 text-xs">{t.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 text-xs font-black">{t.revenue}</div>
                    <div className="text-neutral-700 text-[10px]">avec CODShip</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0d0d,#080808)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.06) 0%, transparent 65%)" }} />
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.3),transparent)" }} />

        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 rounded-full mb-8 uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            Rejoignez 2 500+ marchands actifs
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
            Prêt à transformer<br />
            chaque livraison en{" "}
            <span style={{
              background: "linear-gradient(90deg,#10b981,#34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>cash ?</span>
          </h2>
          <p className="text-neutral-500 text-base mb-10 max-w-lg mx-auto">
            14 jours d'essai gratuit. Aucune carte bancaire. Configuration en moins de 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={openSignup}
              className="group flex items-center gap-2 font-black text-base text-white px-10 py-4 rounded-xl transition-all"
              style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 0 50px rgba(249,115,22,0.4)" }}>
              Devenir client
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          {/* Small trust row */}
          <div className="flex flex-wrap items-center justify-center gap-5 mt-10 text-xs text-neutral-700">
            {["Aucune carte requise","Annulation à tout moment","Données sécurisées","Support 7j/7"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-700" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-14 px-6" style={{ background: "#050505" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Logo size={36} showBg={true} />
                <span className="font-black text-lg">CODShip</span>
              </div>
              <p className="text-neutral-700 text-xs leading-relaxed mb-5">
                La plateforme tout-en-un pour gérer votre activité Cash on Delivery, de la commande au virement.
              </p>
              <div className="flex gap-2">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-orange-500/30 hover:bg-orange-500/5 flex items-center justify-center text-neutral-700 hover:text-white transition-all">
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
            {[
              { title: "Produit", links: ["Fonctionnalités","Tarifs","Roadmap","Changelog","API"] },
              { title: "Ressources", links: ["Documentation","Blog","Tutoriels","Support","Status"] },
              { title: "Légal", links: ["Conditions d'utilisation","Confidentialité","RGPD","Mentions légales"] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-neutral-400 font-bold text-xs mb-4 uppercase tracking-widest">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-neutral-700 hover:text-orange-400 text-xs transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-800 text-xs">© 2025 CODShip. Tous droits réservés.</p>
            <div className="flex items-center gap-5 text-xs text-neutral-700">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> support@codship.com</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> +351 912 000 000</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Lisbonne, Portugal</span>
            </div>
          </div>
        </div>
      </footer>

      {showModal && <SignupModal onClose={() => setShowModal(false)} initialStep={modalStep} />}
    </div>
  )
}
