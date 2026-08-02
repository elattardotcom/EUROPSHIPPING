"use client"

import Link from "next/link"
import { CheckCircle, ArrowRight, Zap, Shield, Phone, Truck, Banknote, BarChart3, Gift, Star } from "lucide-react"
import { useLang } from "@/hooks/useLang"
import { NavHeader } from "@/components/NavHeader"

const T = {
  fr: {
    badge:      "Tarifs simples et transparents",
    h1a:        "Un seul plan.",
    h1b:        "Tout inclus.",
    sub:        "Pas de frais cachés, pas de tiers payants. Un abonnement mensuel qui couvre tout ce dont vous avez besoin pour scaler votre dropshipping COD en Europe.",
    plan_label: "Pro",
    plan_tag:   "Plan unique",
    per_month:  "/mois",
    plan_sub:   "Accès complet à toutes les fonctionnalités — sans engagement",
    cta:        "Créer mon compte",
    cta_note:   "Compte en cours de validation sous 24-48h par notre équipe",
    why_h2:     "Pourquoi €31.99/mois est un excellent investissement ?",
    countries_h2: "Pays couverts — un seul abonnement",
    faq_h2:     "Questions fréquentes sur les tarifs",
    cta_h2:     "Prêt à démarrer ?",
    cta_sub:    "Rejoignez 2 500+ marchands COD en Europe. Inscription en 2 minutes.",
    cta_btn:    "Créer mon compte gratuitement",
    cta_note2:  "Compte activé sous 24-48h · Sans engagement · Support 7j/7",
    footer:     "© 2025 CODShipEurope. Tous droits réservés.",
    nav_blog:   "Blog",
    nav_fees:   "Frais",
    nav_signup: "S'inscrire",
    nav_home:   "Accueil",
    features: [
      "Boutiques Shopify illimitées", "Leads & commandes illimités", "Programme affiliés inclus",
      "Wallet & virements sous 48h", "COD Drop catalog", "Analytics avancées",
      "Support prioritaire 7j/7", "SLA 99.9% garanti", "Suivi livraisons en temps réel",
      "9 pays couverts en Europe", "Agents natifs multilingues", "Intégration Shopify en 5 min",
    ],
    why: [
      { icon: "💸", title: "ROI immédiat", desc: "1 seule commande livrée à 60€ couvre déjà l'abonnement mensuel. Le reste, c'est du profit." },
      { icon: "⏱️", title: "10h/semaine économisées", desc: "Fini la gestion manuelle des confirmations et des livraisons. Concentrez-vous sur les publicités." },
      { icon: "📈", title: "Scale sans limite", desc: "Boutiques illimitées, commandes illimitées. Le prix reste le même que vous fassiez 10 ou 1 000 commandes/jour." },
    ],
    countries: [["🇪🇸","Espagne"],["🇵🇹","Portugal"],["🇮🇹","Italie"],["🇷🇴","Roumanie"],["🇧🇬","Bulgarie"],["🇬🇷","Grèce"],["🇭🇺","Hongrie"],["🇨🇿","Tchéquie"],["🇸🇰","Slovaquie"]],
    faq: [
      { q: "Y a-t-il un engagement minimum ?", a: "Non. L'abonnement est mensuel, sans engagement. Vous pouvez annuler à tout moment depuis votre espace client." },
      { q: "Est-ce que les frais de livraison sont inclus ?", a: "Non. Les frais de livraison COD sont facturés séparément selon le pays et le transporteur. L'abonnement à €31.99/mois couvre l'accès à la plateforme et toutes ses fonctionnalités." },
      { q: "Puis-je connecter plusieurs boutiques Shopify ?", a: "Oui, le plan Pro inclut des boutiques Shopify illimitées. Vous gérez toutes vos boutiques depuis un seul dashboard." },
      { q: "Comment fonctionne la période d'essai ?", a: "Votre compte commence en statut 'trial' après approbation. Vous avez accès à toutes les fonctionnalités pendant la période d'essai avant de passer à l'abonnement mensuel." },
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Nous acceptons les virements bancaires et les paiements par carte. Contactez notre équipe à contact@codshipeurope.com pour les modalités." },
    ],
    footer_links: [["Accueil","/"],["Blog","/blog"],["S'inscrire","/?signup=1"],["Conditions","/conditions"]],
  },
  en: {
    badge:      "Simple, transparent pricing",
    h1a:        "One plan.",
    h1b:        "Everything included.",
    sub:        "No hidden fees, no revenue share. A monthly subscription that covers everything you need to scale your COD dropshipping across Europe.",
    plan_label: "Pro",
    plan_tag:   "Single plan",
    per_month:  "/month",
    plan_sub:   "Full access to all features — no commitment",
    cta:        "Create my account",
    cta_note:   "Account validated within 24-48h by our team",
    why_h2:     "Why €31.99/month is an excellent investment?",
    countries_h2: "Countries covered — one single subscription",
    faq_h2:     "Frequently asked questions about pricing",
    cta_h2:     "Ready to get started?",
    cta_sub:    "Join 2,500+ COD merchants across Europe. Sign up in 2 minutes.",
    cta_btn:    "Create my account for free",
    cta_note2:  "Account activated within 24-48h · No commitment · 7/7 support",
    footer:     "© 2025 CODShipEurope. All rights reserved.",
    nav_blog:   "Blog",
    nav_fees:   "Fees",
    nav_signup: "Sign up",
    nav_home:   "Home",
    features: [
      "Unlimited Shopify stores", "Unlimited leads & orders", "Affiliate program included",
      "Wallet & payouts within 48h", "COD Drop catalog", "Advanced analytics",
      "Priority support 7/7", "99.9% SLA guaranteed", "Real-time delivery tracking",
      "9 countries covered in Europe", "Native multilingual agents", "Shopify integration in 5 min",
    ],
    why: [
      { icon: "💸", title: "Immediate ROI", desc: "A single delivered order at €60 already covers the monthly subscription. The rest is profit." },
      { icon: "⏱️", title: "10h/week saved", desc: "No more manual confirmation and delivery management. Focus on your ads." },
      { icon: "📈", title: "Scale without limits", desc: "Unlimited stores, unlimited orders. The price stays the same whether you process 10 or 1,000 orders/day." },
    ],
    countries: [["🇪🇸","Spain"],["🇵🇹","Portugal"],["🇮🇹","Italy"],["🇷🇴","Romania"],["🇧🇬","Bulgaria"],["🇬🇷","Greece"],["🇭🇺","Hungary"],["🇨🇿","Czechia"],["🇸🇰","Slovakia"]],
    faq: [
      { q: "Is there a minimum commitment?", a: "No. The subscription is monthly with no commitment. You can cancel at any time from your account." },
      { q: "Are delivery fees included?", a: "No. COD delivery fees are billed separately depending on the country and carrier. The €31.99/month subscription covers platform access and all its features." },
      { q: "Can I connect multiple Shopify stores?", a: "Yes, the Pro plan includes unlimited Shopify stores. You manage all your stores from a single dashboard." },
      { q: "How does the trial period work?", a: "Your account starts in 'trial' status after approval. You have access to all features during the trial before switching to the monthly subscription." },
      { q: "What payment methods do you accept?", a: "We accept bank transfers and card payments. Contact our team at contact@codshipeurope.com for details." },
    ],
    footer_links: [["Home","/"],["Blog","/blog"],["Sign up","/?signup=1"],["Terms","/conditions"]],
  },
}

const ICONS = [Zap, BarChart3, Gift, Banknote, Star, BarChart3, Phone, Shield, Truck, CheckCircle, CheckCircle, CheckCircle]

export default function PricingClient() {
  const [lang, setLang] = useLang()
  const t = T[lang]

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <NavHeader lang={lang} setLang={setLang} activePage="pricing" />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6">
          {t.badge}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
          {t.h1a}<br />
          <span style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.h1b}</span>
        </h1>
        <p className="text-neutral-400 text-lg max-w-xl mx-auto">{t.sub}</p>
      </section>

      {/* Pricing card */}
      <section className="max-w-lg mx-auto px-6 py-10">
        <div className="relative rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(220,38,38,0.08))", border: "1px solid rgba(249,115,22,0.3)" }}>
          <div className="absolute top-5 right-5">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>{t.plan_tag}</span>
          </div>
          <div className="p-8 md:p-10">
            <p className="text-orange-400 font-bold text-sm uppercase tracking-widest mb-2">{t.plan_label}</p>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-6xl font-black text-white">€31</span>
              <div className="pb-2">
                <span className="text-3xl font-black text-white">.99</span>
                <p className="text-neutral-500 text-sm">{t.per_month}</p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm mb-8">{t.plan_sub}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {t.features.map((f, i) => {
                const Icon = ICONS[i] ?? CheckCircle
                return (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-neutral-300 text-sm">{f}</span>
                  </div>
                )
              })}
            </div>
            <Link href="/?signup=1" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-white font-bold text-base" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.4)" }}>
              {t.cta} <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-center text-neutral-600 text-xs mt-4">{t.cta_note}</p>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-black text-white text-center mb-8">{t.why_h2}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {t.why.map(c => (
            <div key={c.title} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">{c.icon}</div>
              <h3 className="text-white font-bold mb-2">{c.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Countries */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-black text-white text-center mb-8">{t.countries_h2}</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {t.countries.map(([f, l]) => (
            <div key={l} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center gap-2">
              <span className="text-xl">{f}</span>
              <span className="text-neutral-300 text-sm">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-black text-white text-center mb-8">{t.faq_h2}</h2>
        <div className="space-y-4">
          {t.faq.map(f => (
            <div key={f.q} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-2">{f.q}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="rounded-3xl p-10 md:p-16 text-center" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(220,38,38,0.1))", border: "1px solid rgba(249,115,22,0.2)" }}>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{t.cta_h2}</h2>
          <p className="text-neutral-400 text-lg mb-8">{t.cta_sub}</p>
          <Link href="/?signup=1" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-white font-bold text-base" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.4)" }}>
            {t.cta_btn} <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-neutral-600 text-xs mt-4">{t.cta_note2}</p>
        </div>
      </section>

      <footer className="border-t border-neutral-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-600 text-sm">{t.footer}</p>
          <div className="flex items-center gap-6">
            {t.footer_links.map(([l, h]) => (
              <Link key={h} href={h} className="text-neutral-600 hover:text-neutral-400 text-sm transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
