"use client"

import { useState } from "react"
import {
  CheckCircle, ArrowRight, Users, Truck, BarChart3, Zap, Shield,
  Star, Wallet, Link2, Gift, Phone, Mail, MapPin,
  Instagram, Facebook, Twitter,
  Banknote, PhoneCall, TrendingUp, BadgeCheck, Globe2, Layers,
} from "lucide-react"
import Link from "next/link"
import { Logo }             from "@/components/logo"
import { OpenModalButton }  from "@/components/landing/open-modal-button"
import { ModalListener }    from "@/components/landing/modal-listener"
import { LiveToast }        from "@/components/landing/live-toast"
import { AnimatedCounter }  from "@/components/landing/animated-counter"
import { LiveTicker }       from "@/components/landing/live-ticker"
import { LiveHeroStats }    from "@/components/landing/live-hero-stats"
import { FaqSection }       from "@/components/landing/faq-section"
import {
  ShopifyLogo, DpdLogo, GlsLogo, ColissimoLogo, BrtLogo,
  WiseLogo, BinanceLogo, BankLogo,
} from "@/components/landing/brand-logos"
import { T, Lang } from "@/lib/landing-translations"

const LIVE_ORDERS = {
  en: [
    { ref: "COD-7821", city: "Madrid",    product: "Premium Watch",    amount: "€48", status: "DELIVERED",  flag: "🇪🇸", color: "#10b981" },
    { ref: "COD-7820", city: "Porto",     product: "Handbag",          amount: "€62", status: "CONFIRMED",  flag: "🇵🇹", color: "#f59e0b" },
    { ref: "COD-7819", city: "Bucharest", product: "BT Earbuds",       amount: "€35", status: "IN TRANSIT", flag: "🇷🇴", color: "#6366f1" },
    { ref: "COD-7818", city: "Barcelona", product: "Sport Cologne",    amount: "€55", status: "DELIVERED",  flag: "🇪🇸", color: "#10b981" },
    { ref: "COD-7817", city: "Milan",     product: "Smartwatch X4",    amount: "€71", status: "CONFIRMED",  flag: "🇮🇹", color: "#f59e0b" },
    { ref: "COD-7816", city: "Lisbon",    product: "Kitchen Set",      amount: "€44", status: "DELIVERED",  flag: "🇵🇹", color: "#10b981" },
    { ref: "COD-7815", city: "Sofia",     product: "Running Shoes",    amount: "€89", status: "IN TRANSIT", flag: "🇧🇬", color: "#6366f1" },
    { ref: "COD-7814", city: "Athens",    product: "LED Lamp",         amount: "€29", status: "DELIVERED",  flag: "🇬🇷", color: "#10b981" },
    { ref: "COD-7813", city: "Budapest",  product: "Hair Brush",       amount: "€38", status: "DELIVERED",  flag: "🇭🇺", color: "#10b981" },
    { ref: "COD-7812", city: "Prague",    product: "Sport Watch",      amount: "€65", status: "CONFIRMED",  flag: "🇨🇿", color: "#f59e0b" },
  ],
  fr: [
    { ref: "COD-7821", city: "Madrid",    product: "Montre Premium",   amount: "€48", status: "LIVRÉ",    flag: "🇪🇸", color: "#10b981" },
    { ref: "COD-7820", city: "Porto",     product: "Sac à main",       amount: "€62", status: "CONFIRMÉ", flag: "🇵🇹", color: "#f59e0b" },
    { ref: "COD-7819", city: "Bucarest",  product: "Écouteurs BT",     amount: "€35", status: "EN ROUTE", flag: "🇷🇴", color: "#6366f1" },
    { ref: "COD-7818", city: "Barcelone", product: "Parfum Sport",     amount: "€55", status: "LIVRÉ",    flag: "🇪🇸", color: "#10b981" },
    { ref: "COD-7817", city: "Milan",     product: "Smartwatch X4",    amount: "€71", status: "CONFIRMÉ", flag: "🇮🇹", color: "#f59e0b" },
    { ref: "COD-7816", city: "Lisbonne",  product: "Set Cuisine",      amount: "€44", status: "LIVRÉ",    flag: "🇵🇹", color: "#10b981" },
    { ref: "COD-7815", city: "Sofia",     product: "Chaussures Run",   amount: "€89", status: "EN ROUTE", flag: "🇧🇬", color: "#6366f1" },
    { ref: "COD-7814", city: "Athènes",   product: "Lampe LED",        amount: "€29", status: "LIVRÉ",    flag: "🇬🇷", color: "#10b981" },
    { ref: "COD-7813", city: "Budapest",  product: "Brosse à cheveux", amount: "€38", status: "LIVRÉ",    flag: "🇭🇺", color: "#10b981" },
    { ref: "COD-7812", city: "Prague",    product: "Montre Sport",     amount: "€65", status: "CONFIRMÉ", flag: "🇨🇿", color: "#f59e0b" },
  ],
}

const FLOATING = {
  en: {
    confirms_label: "Confirmations",
    confirms_value: "+198 today",
    revenue_label:  "Revenue / month",
  },
  fr: {
    confirms_label: "Confirmations",
    confirms_value: "+198 aujourd'hui",
    revenue_label:  "Revenus / mois",
  },
}

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("en")
  const t      = T[lang]
  const orders = LIVE_ORDERS[lang]
  const fl     = FLOATING[lang]

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes feed-scroll { 0% { transform: translateY(0) } 100% { transform: translateY(-50%) } }
        @keyframes cash-ping { 0%, 100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.15); opacity: 0.8 } }
        @keyframes slide-right { from { opacity: 0; transform: translateX(-20px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes glow-pulse { 0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.2) } 50% { box-shadow: 0 0 40px rgba(16,185,129,0.5), 0 0 80px rgba(16,185,129,0.15) } }
        @keyframes dot-blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.2 } }
        .marquee-track { animation: marquee 30s linear infinite }
        .marquee-track:hover { animation-play-state: paused }
        .feed-track { animation: feed-scroll 20s linear infinite }
        .animate-cash { animation: cash-ping 2s ease-in-out infinite }
        .animate-slide-r { animation: slide-right 0.6s ease-out forwards }
        .animate-slide-u { animation: slide-up 0.5s ease-out forwards }
        .animate-glow { animation: glow-pulse 3s ease-in-out infinite }
        .animate-dot { animation: dot-blink 1.2s ease-in-out infinite }
        .d1 { animation-delay: 0.1s; opacity: 0 } .d2 { animation-delay: 0.2s; opacity: 0 }
        .d3 { animation-delay: 0.35s; opacity: 0 } .d4 { animation-delay: 0.5s; opacity: 0 }
        .d5 { animation-delay: 0.65s; opacity: 0 }
        .diag-top { clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%) }
        .diag-bottom { clip-path: polygon(0 5%, 100% 0, 100% 100%, 0 100%) }
        .diag-mid { clip-path: polygon(0 4%, 100% 0, 100% 96%, 0 100%) }
        .cash-border { position: relative }
        .cash-border::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(16,185,129,0.4), rgba(249,115,22,0.4), rgba(16,185,129,0.1)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none }
        .bento-card { transition: all 0.25s ease }
        .bento-card:hover { transform: scale(1.015) }
        .noise { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E") }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-14 sm:h-16 flex items-center border-b border-white/[0.05]"
        style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Logo size={48} showBg={true} />
            <span className="font-black text-lg sm:text-xl tracking-tight">CODShipEurope</span>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-1 rounded-full uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-dot" />
              {t.live}
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-500">
            {([["#features", t.nav_features], ["#how", t.nav_how], ["#pricing", t.nav_pricing], ["#testimonials", t.nav_testimonials]] as [string, string][]).map(([h, l]) => (
              <a key={h} href={h} className="hover:text-white transition-colors">{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(l => l === "en" ? "fr" : "en")}
              className="hidden sm:flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 transition-all">
              {lang === "en" ? "🇫🇷 FR" : "🇬🇧 EN"}
            </button>
            <OpenModalButton step="login"
              className="hidden sm:block text-sm text-neutral-400 hover:text-white px-4 py-2 rounded-lg border border-transparent hover:border-white/10 transition-all">
              {t.sign_in}
            </OpenModalButton>
            <OpenModalButton step="signup"
              className="text-xs sm:text-sm font-bold text-white px-4 sm:px-5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
              style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 4px 20px rgba(249,115,22,0.3)" }}>
              {t.get_started}
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </OpenModalButton>
          </div>
        </div>
      </header>

      {/* ── Ticker ─────────────────────────────────────────────── */}
      <LiveTicker lang={lang} />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-0 px-4 sm:px-6 diag-top" style={{ background: "linear-gradient(160deg, #0d0d0d 0%, #0a0a0a 60%, #080808 100%)" }}>
        <div className="absolute top-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute top-20 right-0 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="max-w-7xl mx-auto relative pb-16 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <div className="animate-slide-r d1 inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold border border-orange-500/20 bg-orange-500/8 text-orange-400 px-3 py-1.5 rounded-full mb-6 sm:mb-8 uppercase tracking-widest">
                <Banknote className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {t.hero_badge}
              </div>

              <h1 className="animate-slide-r d2 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.04] tracking-tight mb-5 sm:mb-6">
                {t.hero_line1}<br />
                {t.hero_line2}{" "}
                <span style={{ background: "linear-gradient(90deg,#10b981,#34d399,#10b981)", backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {t.hero_highlight}
                </span>
                <br />{t.hero_line3}
              </h1>

              <p className="animate-slide-r d3 text-neutral-500 text-sm sm:text-base leading-relaxed mb-8 sm:mb-10 max-w-lg">
                {t.hero_p}
              </p>

              <div className="animate-slide-r d4 flex flex-col sm:flex-row gap-3 mb-10 sm:mb-12">
                <OpenModalButton step="signup"
                  className="group flex items-center justify-center gap-2 font-bold text-sm text-white px-8 py-3.5 rounded-xl transition-all w-full sm:w-auto"
                  style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.35)" }}>
                  {t.get_started}
                  <ArrowRight className="w-4 h-4" />
                </OpenModalButton>
                <OpenModalButton step="login"
                  className="sm:hidden flex items-center justify-center gap-2 text-sm text-neutral-400 px-8 py-3.5 rounded-xl border border-white/10 transition-all">
                  {t.sign_in}
                </OpenModalButton>
              </div>

              <LiveHeroStats lang={lang} />
            </div>

            {/* Right — live order feed (desktop only) */}
            <div className="relative hidden lg:block">
              <div className="relative h-[480px] overflow-hidden rounded-2xl cash-border"
                style={{ background: "rgba(12,12,12,0.9)", boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.6)" }}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <div>
                    <div className="text-xs text-neutral-600 mb-0.5 uppercase tracking-wider">{t.feed_title}</div>
                    <div className="text-sm font-bold text-white">{t.feed_sub}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-dot" />
                    LIVE
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 top-[57px] overflow-hidden">
                  <div className="feed-track">
                    {[...orders, ...orders].map((o, i) => (
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
                <div className="absolute bottom-0 inset-x-0 h-16 pointer-events-none rounded-b-2xl"
                  style={{ background: "linear-gradient(to top, rgba(12,12,12,1), transparent)" }} />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-bold text-emerald-400 border border-emerald-500/25 bg-[#0c0c0c] px-4 py-2 rounded-full animate-glow">
                  <Banknote className="w-3.5 h-3.5" />
                  {t.feed_label}
                </div>
              </div>

              <div className="absolute -left-6 top-1/3 flex items-center gap-2 bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 shadow-2xl animate-cash">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-600">{fl.confirms_label}</div>
                  <div className="text-xs font-black text-white">{fl.confirms_value}</div>
                </div>
              </div>
              <div className="absolute -right-4 bottom-1/4 flex items-center gap-2 bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 shadow-2xl"
                style={{ animation: "cash-ping 2.5s ease-in-out infinite", animationDelay: "1s" }}>
                <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-600">{fl.revenue_label}</div>
                  <div className="text-xs font-black text-white">€12,450</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COD Flow ───────────────────────────────────────────── */}
      <section id="how" className="py-16 sm:py-24 px-4 sm:px-6 diag-mid" style={{ background: "linear-gradient(180deg,#0d1a12 0%,#0a1410 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 rounded-full mb-4 sm:mb-5 uppercase tracking-widest">
              <Truck className="w-3.5 h-3.5" />
              {t.flow_badge}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4">{t.flow_h2}</h2>
            <p className="text-neutral-500 text-sm max-w-lg mx-auto">{t.flow_sub}</p>
          </div>
          <div className="relative">
            <div className="absolute top-10 left-0 right-0 h-px hidden md:block"
              style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), rgba(249,115,22,0.3), rgba(99,102,241,0.3), transparent)" }} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([
                { icon: Link2,     step: "01", color: "#6366f1", glow: "rgba(99,102,241,0.2)"  },
                { icon: PhoneCall, step: "02", color: "#f59e0b", glow: "rgba(245,158,11,0.2)"  },
                { icon: Truck,     step: "03", color: "#f97316", glow: "rgba(249,115,22,0.2)"  },
                { icon: Banknote,  step: "04", color: "#10b981", glow: "rgba(16,185,129,0.2)"  },
              ] as const).map((s, idx) => {
                const step = t.flow_steps[idx]
                return (
                  <div key={s.step} className="relative flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl border border-white/[0.05] hover:border-white/[0.1] transition-all group"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(ellipse at top, ${s.glow}, transparent 70%)` }} />
                    <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 sm:mb-5"
                      style={{ background: `${s.color}15`, border: `1px solid ${s.color}30`, boxShadow: `0 8px 24px ${s.glow}` }}>
                      <s.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: s.color }} />
                      <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background: s.color, color: "#000" }}>{s.step}</span>
                    </div>
                    <h3 className="text-white font-bold text-xs sm:text-sm mb-1 sm:mb-2 relative">{step.label}</h3>
                    <p className="text-neutral-600 text-[11px] sm:text-xs leading-relaxed relative hidden sm:block">{step.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Features ─────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6" style={{ background: "#080808" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 text-orange-400 text-xs font-bold border border-orange-500/20 bg-orange-500/8 px-3 py-1.5 rounded-full mb-4 sm:mb-5 uppercase tracking-widest">
              <Layers className="w-3.5 h-3.5" />{t.feat_badge}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4">{t.feat_h2}</h2>
            <p className="text-neutral-500 text-sm max-w-xl mx-auto">{t.feat_sub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Shopify — wide */}
            <div className="bento-card sm:col-span-2 relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(6,182,212,0.04))", minHeight: 200 }}>
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.1),transparent 70%)" }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
                <Link2 className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-white font-black text-lg sm:text-xl mb-2">{t.feat_shopify_title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">{t.feat_shopify_desc}</p>
            </div>
            {/* Leads */}
            <div className="bento-card relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{t.feat_leads_title}</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">{t.feat_leads_desc}</p>
              <div className="mt-4 flex gap-1.5 flex-wrap">
                {(t.feat_lead_statuses as readonly string[]).map((s, i) => (
                  <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: ["rgba(16,185,129,0.12)", "rgba(245,158,11,0.12)", "rgba(239,68,68,0.12)"][i],
                      color: ["#10b981", "#f59e0b", "#ef4444"][i],
                      border: `1px solid ${["rgba(16,185,129,0.2)", "rgba(245,158,11,0.2)", "rgba(239,68,68,0.2)"][i]}`,
                    }}>{s}</span>
                ))}
              </div>
            </div>
            {/* Wallet */}
            <div className="bento-card relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(234,88,12,0.04))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <Wallet className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{t.feat_wallet_title}</h3>
              <p className="text-neutral-500 text-xs leading-relaxed mb-4">{t.feat_wallet_desc}</p>
              <div className="bg-black/30 rounded-xl p-3 border border-white/[0.05]">
                <div className="text-[10px] text-neutral-600 mb-1">{t.feat_wallet_balance}</div>
                <div className="text-2xl font-black text-amber-400">€4,280</div>
                <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full w-2/3" style={{ background: "linear-gradient(90deg,#f59e0b,#f97316)" }} />
                </div>
              </div>
            </div>
            {/* Analytics — wide */}
            <div className="bento-card sm:col-span-2 relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.07),rgba(220,38,38,0.04))" }}>
              <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at bottom right,rgba(249,115,22,0.08),transparent 70%)" }} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.25)" }}>
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{t.feat_analytics_title}</h3>
                  <p className="text-neutral-500 text-xs leading-relaxed">{t.feat_analytics_desc}</p>
                </div>
                <div className="space-y-2 self-end">
                  {(t.feat_metrics as readonly { l: string; v: number }[]).map((m, idx) => (
                    <div key={m.l}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-neutral-600">{m.l}</span>
                        <span className="font-bold" style={{ color: ["#10b981","#f97316","#6366f1"][idx] }}>{m.v}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.v}%`, background: ["#10b981","#f97316","#6366f1"][idx] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Affiliate */}
            <div className="bento-card relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(244,63,94,0.08),rgba(190,18,60,0.04))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.25)" }}>
                <Gift className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{t.feat_affiliate_title}</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">{t.feat_affiliate_desc}</p>
            </div>
            {/* Order Tracking */}
            <div className="bento-card relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.08),rgba(109,40,217,0.04))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.25)" }}>
                <Truck className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{t.feat_orders_title}</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">{t.feat_orders_desc}</p>
            </div>
            {/* Security */}
            <div className="bento-card relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-white/[0.05]"
              style={{ background: "linear-gradient(135deg,rgba(14,165,233,0.08),rgba(2,132,199,0.04))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.25)" }}>
                <Shield className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{t.feat_security_title}</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">{t.feat_security_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 diag-mid" style={{ background: "linear-gradient(180deg,#0c0c0c 0%,#080808 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 text-violet-400 text-xs font-bold border border-violet-500/20 bg-violet-500/8 px-3 py-1.5 rounded-full mb-4 sm:mb-5 uppercase tracking-widest">
              <Globe2 className="w-3.5 h-3.5" />{t.pricing_badge}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4">{t.pricing_h2}</h2>
            <p className="text-neutral-500 text-sm max-w-md mx-auto">{t.pricing_sub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {(t.pricing_plans as readonly { name: string; price: string; desc: string; features: readonly string[] }[]).map((p, idx) => {
              const highlight = idx === 1
              return (
                <div key={p.name} className={`relative rounded-2xl p-6 sm:p-7 transition-all hover:-translate-y-1 ${highlight ? "cash-border" : "border border-white/[0.05]"}`}
                  style={{
                    background: highlight ? "linear-gradient(160deg,rgba(249,115,22,0.08),rgba(8,8,8,1) 60%)" : "rgba(12,12,12,0.8)",
                    boxShadow: highlight ? "0 0 60px rgba(249,115,22,0.1), 0 20px 40px rgba(0,0,0,0.5)" : undefined,
                  }}>
                  {highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black text-black px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap"
                      style={{ background: "linear-gradient(90deg,#f97316,#dc2626)", boxShadow: "0 4px 20px rgba(249,115,22,0.5)" }}>
                      {t.pricing_popular}
                    </div>
                  )}
                  <div className="mb-4 sm:mb-5">
                    <h3 className="text-white font-black text-lg">{p.name}</h3>
                    <p className="text-neutral-600 text-xs mt-1">{p.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-1 mb-5 sm:mb-7">
                    <span className={`text-4xl sm:text-5xl font-black ${highlight ? "text-orange-400" : "text-white"}`}>{p.price}</span>
                    <span className="text-neutral-600 text-sm">{t.pricing_period}</span>
                  </div>
                  <ul className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-8">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-xs text-neutral-400">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <OpenModalButton step="signup" plan={p.name}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${highlight ? "text-white" : "text-neutral-300 hover:text-white border border-white/[0.08] hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                    style={highlight ? { background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 24px rgba(249,115,22,0.25)" } : undefined}>
                    {t.pricing_cta}
                  </OpenModalButton>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-6" style={{ background: "#080808" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 text-yellow-400 text-xs font-bold border border-yellow-500/20 bg-yellow-500/8 px-3 py-1.5 rounded-full mb-4 sm:mb-5 uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />{t.testi_badge}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4">{t.testi_h2}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {(t.testimonials as readonly { name: string; country: string; role: string; text: string; revenue: string; color: string }[]).map(ts => (
              <div key={ts.name} className="relative rounded-2xl p-6 sm:p-7 border border-white/[0.05] hover:border-white/[0.1] transition-all group overflow-hidden"
                style={{ background: "rgba(12,12,12,0.9)" }}>
                <div className="absolute top-0 right-0 text-[120px] font-black text-white/[0.02] leading-none pointer-events-none select-none">"</div>
                <div className="flex items-center gap-0.5 mb-4 sm:mb-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed mb-5 sm:mb-6">"{ts.text}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 bg-gradient-to-br ${ts.color} rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                      {ts.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{ts.name} {ts.country}</p>
                      <p className="text-neutral-600 text-xs">{ts.role}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-emerald-400 text-xs font-black">{ts.revenue}</div>
                    <div className="text-neutral-700 text-[10px]">{t.testi_with}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Global Stats ───────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-y border-white/[0.04]" style={{ background: "linear-gradient(180deg,#0c0c0c,#090909)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {(t.stats as readonly { to: number; prefix: string; suffix: string; label: string; color: string; sub: string }[]).map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-1">
                  <AnimatedCounter to={s.to} prefix={s.prefix} suffix={s.suffix} color={s.color} duration={2000} />
                </div>
                <p className="text-white text-xs sm:text-sm font-semibold mb-0.5">{s.label}</p>
                <p className="text-neutral-600 text-[10px] sm:text-xs">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ───────────────────────────────────────── */}
      <section className="py-12 sm:py-10 px-4 sm:px-6 border-b border-white/[0.04]" style={{ background: "#080808" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                label: t.integ_ecom, color: "#96bf48",
                items: [{ Logo: ShopifyLogo, name: "Shopify", bg: "rgba(150,191,72,0.08)", border: "rgba(150,191,72,0.15)" }],
              },
              {
                label: t.integ_carriers, color: "#f97316",
                items: [
                  { Logo: DpdLogo,       name: "DPD",       bg: "rgba(220,0,50,0.06)",  border: "rgba(220,0,50,0.2)"  },
                  { Logo: GlsLogo,       name: "GLS",       bg: "rgba(255,209,0,0.06)", border: "rgba(255,209,0,0.2)" },
                  { Logo: ColissimoLogo, name: "Colissimo", bg: "rgba(0,49,137,0.06)",  border: "rgba(0,49,137,0.2)"  },
                  { Logo: BrtLogo,       name: "BRT",       bg: "rgba(227,6,19,0.06)",  border: "rgba(227,6,19,0.2)"  },
                ],
              },
              {
                label: t.integ_withdraw, color: "#6366f1",
                items: [
                  { Logo: WiseLogo,    name: "Wise",             bg: "rgba(159,232,112,0.08)", border: "rgba(159,232,112,0.2)" },
                  { Logo: BinanceLogo, name: "Binance / Crypto", bg: "rgba(243,186,47,0.08)",  border: "rgba(243,186,47,0.2)"  },
                  { Logo: BankLogo,    name: lang === "en" ? "Bank transfer" : "Virement bancaire", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
                ],
              },
            ].map(col => (
              <div key={col.label}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4 pb-2 border-b border-white/[0.05]" style={{ color: col.color }}>{col.label}</p>
                <div className="flex flex-col gap-3">
                  {col.items.map(({ Logo, name, bg, border }) => (
                    <div key={name} className="flex items-center gap-2.5 opacity-75 hover:opacity-100 transition-opacity">
                      <div className="rounded-lg px-2 py-1.5 flex items-center flex-shrink-0" style={{ background: bg, border: `1px solid ${border}` }}>
                        <Logo size={36} />
                      </div>
                      <span className="text-neutral-400 text-sm font-medium">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <FaqSection lang={lang} />

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-28 px-4 sm:px-6 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0d0d,#080808)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.06) 0%, transparent 65%)" }} />
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.3),transparent)" }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 rounded-full mb-6 sm:mb-8 uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />{t.cta_badge}
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5 leading-tight">
            {t.cta_h2_1}<br />{t.cta_h2_2}{" "}
            <span style={{ background: "linear-gradient(90deg,#10b981,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{t.cta_highlight}</span>
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base mb-8 sm:mb-10 max-w-lg mx-auto">{t.cta_sub}</p>
          <OpenModalButton step="signup"
            className="group inline-flex items-center justify-center gap-2 font-black text-base text-white px-8 sm:px-10 py-4 rounded-xl transition-all w-full sm:w-auto"
            style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 0 50px rgba(249,115,22,0.4)" }}>
            {t.get_started}
            <ArrowRight className="w-4 h-4" />
          </OpenModalButton>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-8 sm:mt-10 text-xs text-neutral-700">
            {(t.cta_trust as readonly string[]).map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-700" />{item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-10 sm:py-14 px-4 sm:px-6" style={{ background: "#050505" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Logo size={48} showBg={true} />
                <span className="font-black text-lg">CODShipEurope</span>
              </div>
              <p className="text-neutral-700 text-xs leading-relaxed mb-4 sm:mb-5">{t.footer_desc}</p>
              <div className="flex gap-2">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-orange-500/30 hover:bg-orange-500/5 flex items-center justify-center text-neutral-700 hover:text-white transition-all">
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
            {(t.footer_cols as readonly { title: string; links: readonly { label: string; href: string }[] }[]).map(col => (
              <div key={col.title}>
                <h4 className="text-neutral-400 font-bold text-xs mb-3 sm:mb-4 uppercase tracking-widest">{col.title}</h4>
                <ul className="space-y-2 sm:space-y-2.5">
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-neutral-700 hover:text-orange-400 text-xs transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.04] pt-6 sm:pt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-neutral-800 text-xs">{t.footer_rights}</p>
            <div className="flex flex-wrap gap-3 sm:gap-5 text-xs text-neutral-700">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> support@codshipeurope.com</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> +351 912 000 000</span>
              <span className="hidden sm:flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Lisbon, Portugal</span>
            </div>
          </div>
        </div>
      </footer>

      <LiveToast />
      <ModalListener />
    </div>
  )
}
