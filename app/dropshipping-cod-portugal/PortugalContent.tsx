"use client"

import Link from "next/link"
import { ArrowRight, Truck, Phone, Banknote, Shield, Zap, BarChart3, Globe2 } from "lucide-react"
import { ArticleHeader } from "@/components/blog/ArticleHeader"
import { useLang } from "@/hooks/useLang"

const T = {
  fr: {
    badge: "Marché Portugal",
    h1sub: "Portugal",
    heroDesc: (
      <>
        Vendez en <strong className="text-white">Cash on Delivery au Portugal</strong> avec des agents natifs lusophones, une livraison en 24-48h à Lisbonne, Porto et partout sur le territoire. Paiement hebdomadaire.
      </>
    ),
    ctaPrimary: "S'inscrire — Marché Portugal",
    ctaSecondary: "Voir la plateforme",
    stepsTitle: "Comment fonctionne le COD au Portugal ?",
    stepsSubtitle: "4 étapes simples pour vendre en Cash on Delivery au Portugal",
    featuresTitle: "Pourquoi CODShipEurope pour le Portugal ?",
    featuresSubtitle: "",
    marketH2: "Le marché COD au Portugal",
    marketCol1: [
      <>Le Portugal est un marché COD en forte croissance, notamment grâce à la montée du e-commerce post-pandémie. Les consommateurs portugais, concentrés à <strong className="text-white">Lisbonne, Porto et Braga</strong>, adoptent massivement le Cash on Delivery pour leurs achats en ligne.</>,
      <>Les catégories les plus vendues en COD au Portugal sont la mode, la beauté, les produits pour enfants et les accessoires high-tech. Le panier moyen COD au Portugal est de 45 à 65€.</>,
      <>Notre présence locale et notre connaissance du marché portugais nous permettent d&apos;adapter les scripts d&apos;appel aux codes culturels locaux, augmentant significativement les taux de confirmation.</>,
    ],
    marketCol2: [
      <>La <strong className="text-white">langue est un facteur clé</strong> au Portugal : les Portugais répondent mieux aux appels en portugais européen (et non en portugais brésilien). Nos agents sont formés spécifiquement pour ce marché.</>,
      <>Grâce à notre partenariat avec <strong className="text-white">DPD Portugal et CTT</strong>, nous assurons une couverture complète du territoire, y compris les zones péri-urbaines et les petites villes de province.</>,
      <>Le Portugal offre également des frais de livraison parmi les plus compétitifs d&apos;Europe du Sud, ce qui maximise vos marges sur chaque commande COD.</>,
    ],
    faqTitle: "Questions fréquentes — COD Portugal",
    faq: [
      { q: "Quel est le taux de livraison COD au Portugal ?", a: "Notre taux de livraison COD au Portugal atteint 82%, grâce à nos agents de confirmation natifs lusophones et nos partenariats avec DPD Portugal et CTT. La confirmation d'appel préalable réduit les retours à la livraison." },
      { q: "Quel est le délai de livraison COD au Portugal ?", a: "Les livraisons COD au Portugal s'effectuent en 24 à 48 heures ouvrables. Lisbonne et Porto sont livrées en J+1, les régions comme l'Alentejo ou le Nord en J+2. Madère et les Açores en J+5 à J+7." },
      { q: "Quels transporteurs couvrent le Portugal en COD ?", a: "CODShipEurope s'appuie sur DPD Portugal et CTT pour les livraisons Cash on Delivery. Ces partenaires couvrent 100% du territoire continental ainsi que les îles avec des délais optimisés." },
      { q: "Peut-on vendre en COD au Portugal depuis l'étranger ?", a: "Oui, de nombreux marchands basés en France, au Maroc ou ailleurs vendent en COD au Portugal via CODShipEurope. Vous gérez votre boutique Shopify de n'importe où, et nous gérons toute la logistique locale." },
    ],
    ctaTitle: "Prêt à vendre en COD au Portugal ?",
    ctaDesc: "Rejoignez 600+ marchands qui réussissent leur dropshipping COD au Portugal avec CODShipEurope.",
    ctaBtn: "Créer mon compte gratuitement",
    internalTitle: "Autres marchés COD en Europe",
    internalLinks: [
      { href: "/dropshipping-cod-espagne", flag: "🇪🇸", label: "COD Espagne" },
      { href: "/dropshipping-cod-italie", flag: "🇮🇹", label: "COD Italie" },
      { href: "/blog/guide-dropshipping-cod-europe-2025", flag: "📖", label: "Guide COD Europe 2025" },
    ],
    footerCopy: "© 2025 CODShipEurope. Tous droits réservés.",
    footerLinks: [["Accueil", "/"], ["Blog", "/blog"], ["Connexion", "/connect"], ["Conditions", "/conditions"]] as [string, string][],
    steps: [
      { icon: Globe2,   n: "01", title: "Connectez Shopify",              desc: "Liez votre boutique en 5 minutes. Les commandes portugaises arrivent automatiquement." },
      { icon: Phone,    n: "02", title: "Confirmation en portugais",       desc: "Nos agents natifs lusophones confirment chaque commande par téléphone avant expédition." },
      { icon: Truck,    n: "03", title: "Livraison COD 24-48h Portugal",   desc: "DPD ou CTT livre et collecte le Cash on Delivery directement chez votre client au Portugal." },
      { icon: Banknote, n: "04", title: "Paiement hebdomadaire",           desc: "Vos gains sont virés automatiquement chaque lundi." },
    ],
    features: [
      { icon: Phone,     title: "Agents natifs lusophones",   desc: "Nos agents parlent portugais courant. Taux de confirmation 30% supérieur aux agents non natifs." },
      { icon: Truck,     title: "Réseau DPD + CTT Portugal",  desc: "Couverture complète du Portugal, des grandes villes aux zones rurales et aux îles." },
      { icon: BarChart3, title: "82%+ taux de livraison",     desc: "Confirmation avant expédition pour maximiser les livraisons réussies." },
      { icon: Banknote,  title: "Paiement hebdomadaire",      desc: "Paiement hebdomadaire automatique — sans avance de trésorerie." },
      { icon: Zap,       title: "Intégration Shopify 5 min",  desc: "Connexion rapide, synchronisation automatique des commandes, zéro manipulation manuelle." },
      { icon: Shield,    title: "Protection anti-fraude",     desc: "Vérification des adresses et numéros pour éviter les fausses commandes." },
    ],
    stats: [
      { value: "82%+",   label: "Taux de livraison" },
      { value: "24-48h", label: "Délai de livraison" },
      { value: "7j",     label: "Paiement hebdo" },
      { value: "600+",   label: "Marchands au Portugal" },
    ],
  },
  en: {
    badge: "Portugal Market",
    h1sub: "Portugal",
    heroDesc: (
      <>
        Sell <strong className="text-white">Cash on Delivery in Portugal</strong> with native Portuguese-speaking agents, 24-48h delivery in Lisbon, Porto and across the territory. Weekly payment.
      </>
    ),
    ctaPrimary: "Sign up — Portugal Market",
    ctaSecondary: "View platform",
    stepsTitle: "How does COD work in Portugal?",
    stepsSubtitle: "4 simple steps to sell Cash on Delivery in Portugal",
    featuresTitle: "Why CODShipEurope for Portugal?",
    featuresSubtitle: "",
    marketH2: "The COD market in Portugal",
    marketCol1: [
      <>Portugal is a fast-growing COD market, driven by the rise of post-pandemic e-commerce. Portuguese consumers, concentrated in <strong className="text-white">Lisbon, Porto and Braga</strong>, are rapidly adopting Cash on Delivery for their online purchases.</>,
      <>The best-selling COD categories in Portugal are fashion, beauty, children&apos;s products and high-tech accessories. The average COD basket in Portugal is €45 to €65.</>,
      <>Our local presence and knowledge of the Portuguese market allow us to adapt call scripts to local cultural codes, significantly increasing confirmation rates.</>,
    ],
    marketCol2: [
      <>The <strong className="text-white">language is a key factor</strong> in Portugal: the Portuguese respond better to calls in European Portuguese (not Brazilian Portuguese). Our agents are specifically trained for this market.</>,
      <>Thanks to our partnership with <strong className="text-white">DPD Portugal and CTT</strong>, we ensure complete coverage of the territory, including peri-urban areas and small provincial towns.</>,
      <>Portugal also offers some of the most competitive delivery costs in Southern Europe, maximising your margins on every COD order.</>,
    ],
    faqTitle: "Frequently asked questions — COD Portugal",
    faq: [
      { q: "What is the COD delivery rate in Portugal?", a: "Our COD delivery rate in Portugal reaches 82%, thanks to our native Portuguese-speaking confirmation agents and our partnerships with DPD Portugal and CTT. Prior call confirmation reduces delivery returns." },
      { q: "What is the COD delivery time in Portugal?", a: "COD deliveries in Portugal are made within 24 to 48 business hours. Lisbon and Porto are delivered in D+1, regions such as the Alentejo or the North in D+2. Madeira and the Azores in D+5 to D+7." },
      { q: "Which carriers cover Portugal for COD?", a: "CODShipEurope relies on DPD Portugal and CTT for Cash on Delivery deliveries. These partners cover 100% of the continental territory as well as the islands with optimized delivery times." },
      { q: "Can we sell COD in Portugal from abroad?", a: "Yes, many merchants based in France, Morocco or elsewhere sell COD in Portugal via CODShipEurope. You manage your Shopify store from anywhere, and we handle all the local logistics." },
    ],
    ctaTitle: "Ready to launch COD in Portugal?",
    ctaDesc: "Join 600+ merchants successfully running COD dropshipping in Portugal with CODShipEurope.",
    ctaBtn: "Create my free account",
    internalTitle: "Other COD markets in Europe",
    internalLinks: [
      { href: "/dropshipping-cod-espagne", flag: "🇪🇸", label: "COD Spain" },
      { href: "/dropshipping-cod-italie", flag: "🇮🇹", label: "COD Italy" },
      { href: "/blog/guide-dropshipping-cod-europe-2025", flag: "📖", label: "COD Europe Guide 2025" },
    ],
    footerCopy: "© 2025 CODShipEurope. All rights reserved.",
    footerLinks: [["Home", "/"], ["Blog", "/blog"], ["Login", "/connect"], ["Terms", "/conditions"]] as [string, string][],
    steps: [
      { icon: Globe2,   n: "01", title: "Connect Shopify",              desc: "Connect your store in 5 minutes. Portuguese orders arrive automatically." },
      { icon: Phone,    n: "02", title: "Confirmation in Portuguese",   desc: "Our native Portuguese-speaking agents confirm each order by phone before shipment." },
      { icon: Truck,    n: "03", title: "COD Delivery 24-48h Portugal", desc: "DPD or CTT delivers and collects Cash on Delivery directly from your customer in Portugal." },
      { icon: Banknote, n: "04", title: "Weekly payment",               desc: "Your earnings are automatically transferred every Monday." },
    ],
    features: [
      { icon: Phone,     title: "Native Portuguese-speaking agents", desc: "Our agents speak fluent Portuguese. Confirmation rate 30% higher than non-native agents." },
      { icon: Truck,     title: "DPD + CTT Portugal network",        desc: "Full coverage of Portugal, from major cities to rural areas and islands." },
      { icon: BarChart3, title: "82%+ delivery rate",                desc: "Confirmation before shipment to maximise successful deliveries." },
      { icon: Banknote,  title: "Weekly payment",                    desc: "Automatic weekly payment — no upfront cash required." },
      { icon: Zap,       title: "Shopify integration 5 min",         desc: "Quick connection, automatic order synchronisation, zero manual handling." },
      { icon: Shield,    title: "Anti-fraud protection",             desc: "Address and number verification to avoid fake orders." },
    ],
    stats: [
      { value: "82%+",   label: "Delivery rate" },
      { value: "24-48h", label: "Delivery time" },
      { value: "7d",     label: "Weekly payment" },
      { value: "600+",   label: "Merchants in Portugal" },
    ],
  },
}

interface Props {
  jsonLd: unknown
}

export function PortugalContent({ jsonLd: _jsonLd }: Props) {
  const [lang] = useLang()
  const t = T[lang]

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <ArticleHeader />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6">
          <span className="text-base">🇵🇹</span> {t.badge}
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          Dropshipping COD<br />
          <span style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.h1sub}</span>
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.heroDesc}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/?signup=1" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.35)" }}>
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

      {/* Steps */}
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
            <span className="text-4xl">🇵🇹</span>
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
          <div className="text-4xl mb-4">🇵🇹</div>
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
