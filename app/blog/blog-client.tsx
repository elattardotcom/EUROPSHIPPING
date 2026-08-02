"use client"

import Link from "next/link"
import { ArrowRight, Clock, BookOpen } from "lucide-react"
import { useLang } from "@/hooks/useLang"
import { NavHeader } from "@/components/NavHeader"

const ARTICLES = {
  fr: [
    {
      href: "/blog/guide-dropshipping-cod-europe-2025",
      title: "Guide complet du dropshipping COD en Europe (2025)",
      excerpt: "Tout ce que vous devez savoir pour lancer et scaler votre business de dropshipping Cash on Delivery en Europe : marchés, taux de livraison, confirmations d'appel et stratégies gagnantes.",
      date: "15 janvier 2025", readTime: "12 min", tag: "Guide", flag: "🌍",
    },
    {
      href: "/blog/avantages-cod-vs-prepaye-dropshipping",
      title: "COD vs Prépayé en dropshipping : quel modèle choisir en Europe ?",
      excerpt: "Comparatif complet entre le Cash on Delivery et le paiement prépayé pour le dropshipping en Europe. Marges, risques, marchés cibles et recommandations selon votre profil.",
      date: "22 janvier 2025", readTime: "8 min", tag: "Stratégie", flag: "⚖️",
    },
    {
      href: "/dropshipping-cod-espagne",
      title: "Dropshipping COD en Espagne : le guide du marché ibérique",
      excerpt: "L'Espagne est l'un des marchés COD les plus rentables d'Europe. Découvrez nos stratégies, les transporteurs, les taux et tout ce qu'il faut savoir pour réussir en COD en Espagne.",
      date: "28 janvier 2025", readTime: "7 min", tag: "Marché", flag: "🇪🇸",
    },
    {
      href: "/dropshipping-cod-italie",
      title: "Italie : le plus grand marché COD d'Europe pour votre dropshipping",
      excerpt: "60 millions d'habitants, 30% des achats en COD. L'Italie est une opportunité unique pour les dropshippers. Tout sur BRT, les agents italophones et les spécificités Nord/Sud.",
      date: "5 février 2025", readTime: "9 min", tag: "Marché", flag: "🇮🇹",
    },
    {
      href: "/dropshipping-cod-portugal",
      title: "Dropshipping COD au Portugal : opportunités et stratégies 2025",
      excerpt: "Le Portugal, souvent négligé, est un marché COD en forte croissance. Lisbonne, Porto, délais J+1, agents lusophones : voici comment maximiser vos ventes au Portugal.",
      date: "12 février 2025", readTime: "6 min", tag: "Marché", flag: "🇵🇹",
    },
  ],
  en: [
    {
      href: "/blog/guide-dropshipping-cod-europe-2025",
      title: "Complete guide to COD dropshipping in Europe (2025)",
      excerpt: "Everything you need to know to launch and scale your Cash on Delivery dropshipping business in Europe: markets, delivery rates, call confirmations and winning strategies.",
      date: "January 15, 2025", readTime: "12 min", tag: "Guide", flag: "🌍",
    },
    {
      href: "/blog/avantages-cod-vs-prepaye-dropshipping",
      title: "COD vs Prepaid in dropshipping: which model to choose in Europe?",
      excerpt: "Full comparison between Cash on Delivery and prepaid payment for dropshipping in Europe. Margins, risks, target markets and recommendations depending on your profile.",
      date: "January 22, 2025", readTime: "8 min", tag: "Strategy", flag: "⚖️",
    },
    {
      href: "/dropshipping-cod-espagne",
      title: "COD Dropshipping in Spain: the Iberian market guide",
      excerpt: "Spain is one of the most profitable COD markets in Europe. Discover our strategies, carriers, rates and everything you need to know to succeed with COD in Spain.",
      date: "January 28, 2025", readTime: "7 min", tag: "Market", flag: "🇪🇸",
    },
    {
      href: "/dropshipping-cod-italie",
      title: "Italy: Europe's largest COD market for your dropshipping",
      excerpt: "60 million inhabitants, 30% of purchases via COD. Italy is a unique opportunity for dropshippers. Everything about BRT, Italian-speaking agents and North/South specifics.",
      date: "February 5, 2025", readTime: "9 min", tag: "Market", flag: "🇮🇹",
    },
    {
      href: "/dropshipping-cod-portugal",
      title: "COD Dropshipping in Portugal: opportunities and strategies 2025",
      excerpt: "Portugal, often overlooked, is a fast-growing COD market. Lisbon, Porto, next-day delivery, Portuguese-speaking agents: here's how to maximise your sales in Portugal.",
      date: "February 12, 2025", readTime: "6 min", tag: "Market", flag: "🇵🇹",
    },
  ],
}

const TAG_COLORS: Record<string, string> = {
  Guide: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  Stratégie: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Strategy: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Marché: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Market: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
}

const T = {
  fr: {
    badge:    "Blog & Ressources",
    h1:       "Guides COD Dropshipping Europe",
    sub:      "Stratégies, analyses de marchés et conseils pratiques pour réussir votre dropshipping Cash on Delivery en Europe.",
    read:     "Lire l'article",
    reading:  "de lecture",
    cta_h2:   "Prêt à lancer votre COD en Europe ?",
    cta_sub:  "Connectez votre boutique Shopify et commencez à vendre en Cash on Delivery dès aujourd'hui.",
    cta_btn:  "S'inscrire gratuitement",
    footer:   "© 2025 CODShipEurope. Tous droits réservés.",
    nav_home:    "Accueil",
    nav_pricing: "Tarifs",
    nav_fees:    "Frais",
    nav_signup:  "Commencer",
    footer_links: [["Accueil","/"],["Blog","/blog"],["Connexion","/connect"],["Conditions","/conditions"]],
  },
  en: {
    badge:    "Blog & Resources",
    h1:       "COD Dropshipping Europe Guides",
    sub:      "Strategies, market analyses and practical tips to succeed with Cash on Delivery dropshipping in Europe.",
    read:     "Read article",
    reading:  "read",
    cta_h2:   "Ready to launch your COD in Europe?",
    cta_sub:  "Connect your Shopify store and start selling Cash on Delivery today.",
    cta_btn:  "Sign up for free",
    footer:   "© 2025 CODShipEurope. All rights reserved.",
    nav_home:    "Home",
    nav_pricing: "Pricing",
    nav_fees:    "Fees",
    nav_signup:  "Get started",
    footer_links: [["Home","/"],["Blog","/blog"],["Login","/connect"],["Terms","/conditions"]],
  },
}

export default function BlogClient() {
  const [lang, setLang] = useLang()
  const t = T[lang]
  const articles = ARTICLES[lang]

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <NavHeader lang={lang} setLang={setLang} activePage="blog" />

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6">
          <BookOpen className="w-3.5 h-3.5" /> {t.badge}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t.h1}</h1>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto">{t.sub}</p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <Link href={articles[0].href} className="block mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-10 hover:border-orange-500/30 transition-all group">
            <div className="flex items-start gap-6">
              <div className="text-5xl hidden md:block">{articles[0].flag}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TAG_COLORS[articles[0].tag] ?? ""}`}>{articles[0].tag}</span>
                  <span className="text-neutral-600 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{articles[0].readTime} {t.reading}</span>
                  <span className="text-neutral-600 text-xs">{articles[0].date}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3 group-hover:text-orange-400 transition-colors">{articles[0].title}</h2>
                <p className="text-neutral-400 leading-relaxed mb-4">{articles[0].excerpt}</p>
                <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold">
                  {t.read} <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          {articles.slice(1).map(a => (
            <Link key={a.href} href={a.href} className="block group">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-full hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{a.flag}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TAG_COLORS[a.tag] ?? ""}`}>{a.tag}</span>
                  <span className="text-neutral-600 text-xs flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{a.readTime}</span>
                </div>
                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors leading-snug">{a.title}</h2>
                <p className="text-neutral-500 text-sm leading-relaxed mb-4">{a.excerpt}</p>
                <div className="flex items-center gap-1 text-orange-400 text-xs font-semibold">
                  {t.read} <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl p-10 text-center" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(220,38,38,0.08))", border: "1px solid rgba(249,115,22,0.2)" }}>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{t.cta_h2}</h2>
          <p className="text-neutral-400 mb-6">{t.cta_sub}</p>
          <Link href="/?signup=1" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
            {t.cta_btn} <ArrowRight className="w-4 h-4" />
          </Link>
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
