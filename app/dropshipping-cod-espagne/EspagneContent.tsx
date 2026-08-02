"use client"

import Link from "next/link"
import { ArrowRight, Truck, Phone, Banknote, Shield, Zap, BarChart3, Globe2 } from "lucide-react"
import { ArticleHeader } from "@/components/blog/ArticleHeader"
import { useLang } from "@/hooks/useLang"

const T = {
  fr: {
    badge: "Marché Espagne",
    h1sub: "Espagne",
    heroDesc: (
      <>
        Vendez en <strong className="text-white">Cash on Delivery en Espagne</strong> avec des agents natifs hispanophones, une livraison en 24-48h et des virements sous 48h. Connectez votre boutique Shopify en 5 minutes.
      </>
    ),
    ctaPrimary: "S'inscrire — Marché Espagne",
    ctaSecondary: "Voir la plateforme",
    stepsTitle: "Comment fonctionne le COD en Espagne ?",
    stepsSubtitle: "Un processus simple en 4 étapes pour vendre en Cash on Delivery en Espagne",
    featuresTitle: "Pourquoi choisir CODShipEurope pour l'Espagne ?",
    featuresSubtitle: "Tout ce dont vous avez besoin pour réussir votre dropshipping COD en Espagne",
    marketH2: "Le marché COD en Espagne",
    marketCol1: [
      <>L&apos;Espagne est l&apos;un des marchés les plus dynamiques pour le <strong className="text-white">dropshipping COD en Europe</strong>. Avec 47 millions d&apos;habitants et une forte culture du paiement à la livraison, l&apos;Espagne offre un potentiel considérable pour les dropshippers.</>,
      <>Les Espagnols apprécient particulièrement le Cash on Delivery car il leur offre une sécurité lors des achats en ligne. Les catégories les plus performantes sont la mode, l&apos;électronique, la beauté et les accessoires de maison.</>,
      <>Les grandes villes comme <strong className="text-white">Madrid, Barcelone, Valence et Séville</strong> concentrent la majorité des commandes, mais notre réseau couvre l&apos;intégralité du territoire espagnol.</>,
    ],
    marketCol2: [
      <>Notre équipe d&apos;agents natifs hispanophones garantit des <strong className="text-white">confirmations d&apos;appel de qualité</strong> en espagnol. Cette étape est cruciale : une commande confirmée par un agent professionnel a 3x plus de chances d&apos;être livrée avec succès.</>,
      <>Le partenariat avec <strong className="text-white">GLS España et DPD Espagne</strong> nous permet de proposer des délais de livraison compétitifs : 24h pour les grandes villes, 48h pour les zones rurales.</>,
      <>Après chaque cycle de livraison, vos fonds sont virés sous 48 heures ouvrables, vous permettant de réinvestir rapidement dans vos campagnes publicitaires.</>,
    ],
    faqTitle: "Questions fréquentes — COD Espagne",
    faq: [
      { q: "Quel est le taux de livraison COD en Espagne ?", a: "Notre taux de livraison COD en Espagne dépasse 85%, grâce à nos agents de confirmation natifs hispanophones et à nos partenariats avec GLS España et DPD Espagne. La confirmation d'appel avant expédition réduit significativement les retours." },
      { q: "Quel est le délai de livraison COD en Espagne ?", a: "Les livraisons COD en Espagne s'effectuent en 24 à 48 heures ouvrables après confirmation de la commande. La péninsule ibérique est couverte en J+1 à J+2, les îles Canaries et Baléares en J+3 à J+5." },
      { q: "Quels transporteurs livrent en COD en Espagne ?", a: "CODShipEurope travaille avec GLS España, DPD Espagne et SEUR pour les livraisons Cash on Delivery en Espagne. Ces partenaires couvrent 100% du territoire espagnol, y compris les zones rurales et les îles." },
      { q: "Comment fonctionne le paiement pour le COD Espagne ?", a: "Une fois vos commandes livrées et le Cash on Delivery collecté, vous recevez votre virement bancaire sous 48 heures ouvrables. Aucune avance de trésorerie n'est requise de votre côté." },
      { q: "Peut-on faire du dropshipping COD en Espagne depuis le Maroc ou la France ?", a: "Oui, CODShipEurope permet à des vendeurs basés partout dans le monde de vendre en COD en Espagne. Vous gérez votre boutique Shopify depuis n'importe où, et nous nous occupons des confirmations et des livraisons en Espagne." },
    ],
    ctaTitle: "Prêt à vous lancer en COD en Espagne ?",
    ctaDesc: "Rejoignez 1 200+ marchands qui génèrent des revenus en Cash on Delivery en Espagne avec CODShipEurope.",
    ctaBtn: "Créer mon compte gratuitement",
    internalTitle: "Autres marchés COD en Europe",
    internalLinks: [
      { href: "/dropshipping-cod-portugal", flag: "🇵🇹", label: "COD Portugal" },
      { href: "/dropshipping-cod-italie", flag: "🇮🇹", label: "COD Italie" },
      { href: "/blog/guide-dropshipping-cod-europe-2025", flag: "📖", label: "Guide COD Europe 2025" },
    ],
    footerCopy: "© 2025 CODShipEurope. Tous droits réservés.",
    footerLinks: [["Accueil", "/"], ["Blog", "/blog"], ["Connexion", "/connect"], ["Conditions", "/conditions"]] as [string, string][],
    steps: [
      { icon: Globe2,    n: "01", title: "Connectez Shopify",        desc: "Liez votre boutique Shopify en 5 minutes. Vos commandes arrivent automatiquement sur notre plateforme." },
      { icon: Phone,     n: "02", title: "Confirmation en espagnol", desc: "Nos agents natifs hispanophones appellent chaque client pour confirmer la commande et l'adresse de livraison." },
      { icon: Truck,     n: "03", title: "Livraison COD en 24-48h",  desc: "GLS ou DPD livre votre colis en Espagne et collecte le Cash on Delivery directement chez le client." },
      { icon: Banknote,  n: "04", title: "Virement sous 48h",        desc: "Votre argent est viré sur votre compte en 48 heures ouvrables après chaque livraison confirmée." },
    ],
    features: [
      { icon: Phone,     title: "Agents natifs hispanophones",   desc: "Nos agents parlent espagnol courant. Taux de confirmation supérieur de 30% vs agents non natifs." },
      { icon: Truck,     title: "Livraison 24-48h en péninsule", desc: "Réseau GLS & DPD couvrant 100% de l'Espagne, y compris zones rurales et îles." },
      { icon: BarChart3, title: "85%+ de taux de livraison",     desc: "Confirmation avant expédition = moins de refus à la livraison = plus de revenus." },
      { icon: Banknote,  title: "Virement 48h garanti",          desc: "Encaissez vos gains rapidement. Pas d'avance de trésorerie requise." },
      { icon: Zap,       title: "Intégration Shopify en 5 min",  desc: "Connectez votre boutique et vos commandes arrivent automatiquement, sans manipulation manuelle." },
      { icon: Shield,    title: "Protection anti-fraude",        desc: "Détection des adresses invalides et des faux numéros pour protéger votre chiffre d'affaires." },
    ],
    stats: [
      { value: "85%+",   label: "Taux de livraison" },
      { value: "24-48h", label: "Délai de livraison" },
      { value: "48h",    label: "Délai de virement" },
      { value: "1 200+", label: "Marchands en Espagne" },
    ],
  },
  en: {
    badge: "Spain Market",
    h1sub: "Spain",
    heroDesc: (
      <>
        Sell <strong className="text-white">Cash on Delivery in Spain</strong> with native Spanish-speaking agents, 24-48h delivery and payouts within 48h. Connect your Shopify store in 5 minutes.
      </>
    ),
    ctaPrimary: "Sign up — Spain Market",
    ctaSecondary: "View platform",
    stepsTitle: "How does COD work in Spain?",
    stepsSubtitle: "A simple 4-step process to sell Cash on Delivery in Spain",
    featuresTitle: "Why choose CODShipEurope for Spain?",
    featuresSubtitle: "Everything you need to succeed with COD dropshipping in Spain",
    marketH2: "The COD market in Spain",
    marketCol1: [
      <>Spain is one of the most dynamic markets for <strong className="text-white">COD dropshipping in Europe</strong>. With 47 million inhabitants and a strong cash-on-delivery culture, Spain offers considerable potential for dropshippers.</>,
      <>Spanish consumers particularly appreciate Cash on Delivery as it gives them security when shopping online. The best-performing categories are fashion, electronics, beauty and home accessories.</>,
      <>Major cities like <strong className="text-white">Madrid, Barcelona, Valencia and Seville</strong> concentrate most orders, but our network covers the entire Spanish territory.</>,
    ],
    marketCol2: [
      <>Our team of native Spanish-speaking agents guarantees <strong className="text-white">high-quality call confirmations</strong> in Spanish. This step is crucial: an order confirmed by a professional agent is 3x more likely to be delivered successfully.</>,
      <>Our partnership with <strong className="text-white">GLS España and DPD Spain</strong> allows us to offer competitive delivery times: 24h for major cities, 48h for rural areas.</>,
      <>After each delivery cycle, your funds are transferred within 48 business hours, allowing you to quickly reinvest in your advertising campaigns.</>,
    ],
    faqTitle: "Frequently asked questions — COD Spain",
    faq: [
      { q: "What is the COD delivery rate in Spain?", a: "Our COD delivery rate in Spain exceeds 85%, thanks to our native Spanish-speaking confirmation agents and our partnerships with GLS España and DPD Spain. Call confirmation before shipment significantly reduces returns." },
      { q: "What is the COD delivery time in Spain?", a: "COD deliveries in Spain are made within 24 to 48 business hours after order confirmation. The Iberian peninsula is covered in D+1 to D+2, the Canary Islands and Balearics in D+3 to D+5." },
      { q: "Which carriers deliver COD in Spain?", a: "CODShipEurope works with GLS España, DPD Spain and SEUR for Cash on Delivery deliveries in Spain. These partners cover 100% of the Spanish territory, including rural areas and islands." },
      { q: "How does payment work for COD Spain?", a: "Once your orders are delivered and Cash on Delivery collected, you receive your bank transfer within 48 business hours. No upfront cash required on your side." },
      { q: "Can we do COD dropshipping in Spain from Morocco or France?", a: "Yes, CODShipEurope allows sellers based anywhere in the world to sell COD in Spain. You manage your Shopify store from anywhere, and we handle confirmations and deliveries in Spain." },
    ],
    ctaTitle: "Ready to launch COD in Spain?",
    ctaDesc: "Join 1,200+ merchants generating revenue with Cash on Delivery in Spain with CODShipEurope.",
    ctaBtn: "Create my free account",
    internalTitle: "Other COD markets in Europe",
    internalLinks: [
      { href: "/dropshipping-cod-portugal", flag: "🇵🇹", label: "COD Portugal" },
      { href: "/dropshipping-cod-italie", flag: "🇮🇹", label: "COD Italy" },
      { href: "/blog/guide-dropshipping-cod-europe-2025", flag: "📖", label: "COD Europe Guide 2025" },
    ],
    footerCopy: "© 2025 CODShipEurope. All rights reserved.",
    footerLinks: [["Home", "/"], ["Blog", "/blog"], ["Login", "/connect"], ["Terms", "/conditions"]] as [string, string][],
    steps: [
      { icon: Globe2,    n: "01", title: "Connect Shopify",              desc: "Connect your Shopify store in 5 minutes. Orders arrive automatically on our platform." },
      { icon: Phone,     n: "02", title: "Confirmation in Spanish",       desc: "Our native Spanish-speaking agents call each customer to confirm the order and delivery address." },
      { icon: Truck,     n: "03", title: "COD Delivery in 24-48h",        desc: "GLS or DPD delivers your parcel in Spain and collects Cash on Delivery directly from the customer." },
      { icon: Banknote,  n: "04", title: "Payout within 48h",             desc: "Your money is transferred to your account within 48 business hours after each confirmed delivery." },
    ],
    features: [
      { icon: Phone,     title: "Native Spanish-speaking agents",    desc: "Our agents speak fluent Spanish. 30% higher confirmation rate vs non-native agents." },
      { icon: Truck,     title: "24-48h delivery on the peninsula",  desc: "GLS & DPD network covering 100% of Spain, including rural areas and islands." },
      { icon: BarChart3, title: "85%+ delivery rate",                desc: "Confirmation before shipping = fewer delivery refusals = more revenue." },
      { icon: Banknote,  title: "Guaranteed 48h payout",             desc: "Collect your earnings fast. No upfront cash required." },
      { icon: Zap,       title: "Shopify integration in 5 min",      desc: "Connect your store and orders arrive automatically, no manual handling." },
      { icon: Shield,    title: "Anti-fraud protection",             desc: "Detection of invalid addresses and fake numbers to protect your revenue." },
    ],
    stats: [
      { value: "85%+",   label: "Delivery rate" },
      { value: "24-48h", label: "Delivery time" },
      { value: "48h",    label: "Payout delay" },
      { value: "1,200+", label: "Merchants in Spain" },
    ],
  },
}

interface Props {
  jsonLd: unknown
}

export function EspagneContent({ jsonLd: _jsonLd }: Props) {
  const [lang] = useLang()
  const t = T[lang]

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <ArticleHeader />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6">
          <span className="text-base">🇪🇸</span> {t.badge}
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          Dropshipping COD<br />
          <span style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.h1sub}</span>
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.heroDesc}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/?signup=1" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm transition-all" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.35)" }}>
            {t.ctaPrimary} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-neutral-300 font-semibold text-sm border border-neutral-700 hover:border-neutral-500 transition-all">
            {t.ctaSecondary}
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {t.stats.map(s => (
            <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-white mb-1">{s.value}</div>
              <div className="text-sm text-neutral-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">{t.stepsTitle}</h2>
          <p className="text-neutral-500">{t.stepsSubtitle}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.steps.map(step => (
            <div key={step.n} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="text-xs font-bold text-orange-500 mb-4">{step.n}</div>
              <step.icon className="w-6 h-6 text-orange-400 mb-3" />
              <h3 className="text-white font-bold mb-2">{step.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">{t.featuresTitle}</h2>
          <p className="text-neutral-500">{t.featuresSubtitle}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.map(f => (
            <div key={f.title} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-orange-500/30 transition-colors">
              <f.icon className="w-5 h-5 text-orange-400 mb-3" />
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Market info */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🇪🇸</span>
            <h2 className="text-2xl font-black text-white">{t.marketH2}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 text-neutral-400 leading-relaxed">
            <div>
              {t.marketCol1.map((p, i) => (
                <p key={i} className={i < t.marketCol1.length - 1 ? "mb-4" : ""}>{p}</p>
              ))}
            </div>
            <div>
              {t.marketCol2.map((p, i) => (
                <p key={i} className={i < t.marketCol2.length - 1 ? "mb-4" : ""}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">{t.faqTitle}</h2>
        </div>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">{item.q}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl p-10 md:p-16 text-center" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(220,38,38,0.1))", border: "1px solid rgba(249,115,22,0.2)" }}>
          <div className="text-4xl mb-4">🇪🇸</div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{t.ctaTitle}</h2>
          <p className="text-neutral-400 text-lg mb-8">{t.ctaDesc}</p>
          <Link href="/?signup=1" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-white font-bold text-base" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.4)" }}>
            {t.ctaBtn} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Internal links */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-lg font-bold text-white mb-6">{t.internalTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {t.internalLinks.map(l => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-orange-500/30 transition-colors">
              <span className="text-2xl">{l.flag}</span>
              <span className="text-neutral-300 text-sm font-medium">{l.label}</span>
              <ArrowRight className="w-4 h-4 text-neutral-600 ml-auto" />
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-600 text-sm">{t.footerCopy}</p>
          <div className="flex items-center gap-6">
            {t.footerLinks.map(([label, href]) => (
              <Link key={href} href={href} className="text-neutral-600 hover:text-neutral-400 text-sm transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
