"use client"

import Link from "next/link"
import { ArrowRight, Truck, Phone, Banknote, Shield, Zap, BarChart3, Globe2 } from "lucide-react"
import { ArticleHeader } from "@/components/blog/ArticleHeader"
import { useLang } from "@/hooks/useLang"

const T = {
  fr: {
    badge: "Marché Italie — #1 COD Europe",
    h1sub: "Italie",
    heroDesc: (
      <>
        L&apos;Italie est le <strong className="text-white">plus grand marché COD d&apos;Europe</strong>. 60 millions d&apos;habitants, 30% des achats en Cash on Delivery. Lancez-vous avec des agents natifs italophones et BRT comme transporteur.
      </>
    ),
    ctaPrimary: "S'inscrire — Marché Italie",
    ctaSecondary: "Voir la plateforme",
    stepsTitle: "Comment fonctionne le COD en Italie ?",
    stepsSubtitle: "4 étapes pour vendre en Cash on Delivery en Italie",
    featuresTitle: "Pourquoi le COD en Italie est-il si rentable ?",
    featuresSubtitle: "",
    marketH2: "Pourquoi l'Italie est le meilleur marché COD d'Europe",
    marketCol1: [
      <>L&apos;Italie représente une opportunité unique pour le <strong className="text-white">dropshipping COD en Europe</strong>. Avec 60 millions d&apos;habitants et un taux de Cash on Delivery parmi les plus élevés du continent (30% des transactions e-commerce), c&apos;est un marché incontournable.</>,
      <>Contrairement à l&apos;Espagne où le paiement en ligne est bien adopté, les Italiens ont une méfiance culturelle envers les transactions par carte. Le COD leur offre la sécurité qu&apos;ils recherchent, ce qui en fait la <strong className="text-white">méthode de paiement préférée</strong> pour les achats en ligne.</>,
      <>Les catégories les plus performantes en COD en Italie sont : la mode, la beauté, les compléments alimentaires, les accessoires de sport et les produits pour enfants.</>,
    ],
    marketCol2: [
      <>La <strong className="text-white">disparité Nord/Sud</strong> est un élément clé à connaître. Le Nord (Milan, Turin, Gênes, Bologne) affiche des taux de livraison supérieurs à 85%. Le Sud (Naples, Palerme, Bari) nécessite plus de confirmations mais reste très rentable en volume.</>,
      <>Notre partenariat avec <strong className="text-white">BRT (Bartolini)</strong> — le leader historique du COD en Italie — nous permet d&apos;offrir les meilleurs délais et taux de livraison sur tout le territoire, Sicile et Sardaigne incluses.</>,
      <>Avec CODShipEurope, vos agents de confirmation parlent un <strong className="text-white">italien régional adapté</strong> : toscan standard pour le Centre, accent napolitain reconnu pour le Sud. Ce détail fait toute la différence sur le taux de confirmation.</>,
    ],
    faqTitle: "Questions fréquentes — COD Italie",
    faq: [
      { q: "L'Italie est-elle un bon marché pour le dropshipping COD ?", a: "L'Italie est le plus grand marché COD d'Europe avec 60 millions d'habitants. Le Cash on Delivery représente plus de 30% des transactions e-commerce italiennes. C'est un marché incontournable pour les dropshippers COD." },
      { q: "Quel est le taux de livraison COD en Italie ?", a: "Notre taux de livraison COD en Italie est de 78%+. Bien que légèrement inférieur à l'Espagne, le volume de commandes en Italie compense largement. Le Nord de l'Italie (Milan, Turin) affiche les meilleurs taux, le Sud (Naples, Palerme) nécessite plus de confirmations." },
      { q: "Quel est le délai de livraison COD en Italie ?", a: "Les livraisons COD en Italie s'effectuent en 24 à 72 heures ouvrables selon la région. Le Nord de l'Italie (Milan, Turin, Gênes) est livré en J+1. Le Centre (Rome, Florence) en J+2. Le Sud et les îles (Sicile, Sardaigne) en J+3 à J+5." },
      { q: "Quels transporteurs livrent en COD en Italie ?", a: "CODShipEurope s'appuie sur BRT (Bartolini), GLS Italy et DPD pour les livraisons Cash on Delivery en Italie. BRT est le leader du COD en Italie et offre la meilleure couverture nationale." },
      { q: "Pourquoi le COD est-il si populaire en Italie ?", a: "Les Italiens ont une forte méfiance historique envers les paiements en ligne par carte. Le Cash on Delivery leur offre une garantie de sécurité. Cette habitude culturelle fait de l'Italie le marché COD le plus mature et le plus rentable d'Europe pour les dropshippers." },
    ],
    ctaTitle: "Conquérez le marché COD numéro 1 d'Europe",
    ctaDesc: "60 millions de clients potentiels en Italie vous attendent. Lancez votre dropshipping COD dès aujourd'hui.",
    ctaBtn: "Créer mon compte gratuitement",
    internalTitle: "Autres marchés COD en Europe",
    internalLinks: [
      { href: "/dropshipping-cod-espagne", flag: "🇪🇸", label: "COD Espagne" },
      { href: "/dropshipping-cod-portugal", flag: "🇵🇹", label: "COD Portugal" },
      { href: "/blog/guide-dropshipping-cod-europe-2025", flag: "📖", label: "Guide COD Europe 2025" },
    ],
    footerCopy: "© 2025 CODShipEurope. Tous droits réservés.",
    footerLinks: [["Accueil", "/"], ["Blog", "/blog"], ["Connexion", "/connect"], ["Conditions", "/conditions"]] as [string, string][],
    steps: [
      { icon: Globe2,   n: "01", title: "Connectez Shopify",         desc: "Connectez votre boutique Shopify en 5 min. Les commandes italiennes arrivent automatiquement." },
      { icon: Phone,    n: "02", title: "Confirmation en italien",    desc: "Nos agents natifs italophones confirment chaque commande avant expédition." },
      { icon: Truck,    n: "03", title: "Livraison COD 24-72h",       desc: "BRT ou GLS livre et collecte le cash directement chez votre client en Italie." },
      { icon: Banknote, n: "04", title: "Paiement hebdomadaire",      desc: "Vos gains sont virés automatiquement chaque lundi." },
    ],
    features: [
      { icon: Phone,     title: "Agents natifs italophones",      desc: "Scripts adaptés aux régions italiennes. Taux de confirmation optimisé Nord vs Sud." },
      { icon: Truck,     title: "BRT + GLS Italie",               desc: "Les meilleurs transporteurs COD en Italie. Couverture Sicile et Sardaigne incluse." },
      { icon: BarChart3, title: "Plus grand marché COD Europe",   desc: "60M d'habitants, 30% de transactions e-com en COD. Volume incomparable." },
      { icon: Banknote,  title: "Paiement hebdomadaire",          desc: "Paiement automatique chaque lundi — réinvestissez sans attendre." },
      { icon: Zap,       title: "Intégration Shopify 5 min",      desc: "Connexion rapide et synchronisation automatique des commandes." },
      { icon: Shield,    title: "Gestion Sud/Nord différenciée",  desc: "Stratégies de confirmation adaptées selon la région pour maximiser les livraisons." },
    ],
    stats: [
      { value: "78%+",   label: "Taux de livraison" },
      { value: "24-72h", label: "Délai de livraison" },
      { value: "7j",     label: "Paiement hebdo" },
      { value: "#1",     label: "Marché COD en Europe" },
    ],
  },
  en: {
    badge: "Italy Market — #1 COD Europe",
    h1sub: "Italy",
    heroDesc: (
      <>
        Italy is the <strong className="text-white">largest COD market in Europe</strong>. 60 million inhabitants, 30% of purchases in Cash on Delivery. Get started with native Italian-speaking agents and BRT as carrier.
      </>
    ),
    ctaPrimary: "Sign up — Italy Market",
    ctaSecondary: "View platform",
    stepsTitle: "How does COD work in Italy?",
    stepsSubtitle: "4 steps to sell Cash on Delivery in Italy",
    featuresTitle: "Why is COD in Italy so profitable?",
    featuresSubtitle: "",
    marketH2: "Why Italy is the best COD market in Europe",
    marketCol1: [
      <>Italy represents a unique opportunity for <strong className="text-white">COD dropshipping in Europe</strong>. With 60 million inhabitants and one of the highest Cash on Delivery rates on the continent (30% of e-commerce transactions), it&apos;s an unmissable market.</>,
      <>Unlike Spain where online payment is well adopted, Italians have a cultural distrust of card transactions. COD gives them the security they need, making it the <strong className="text-white">preferred payment method</strong> for online purchases.</>,
      <>The best-performing COD categories in Italy are: fashion, beauty, dietary supplements, sports accessories and children&apos;s products.</>,
    ],
    marketCol2: [
      <>The <strong className="text-white">North/South divide</strong> is a key element to know. The North (Milan, Turin, Genoa, Bologna) shows delivery rates above 85%. The South (Naples, Palermo, Bari) requires more confirmations but remains very profitable in volume.</>,
      <>Our partnership with <strong className="text-white">BRT (Bartolini)</strong> — Italy&apos;s historical COD leader — allows us to offer the best delivery times and rates across the entire territory, Sicily and Sardinia included.</>,
      <>With CODShipEurope, your confirmation agents speak <strong className="text-white">regionally adapted Italian</strong>: standard Tuscan for the Centre, recognized Neapolitan accent for the South. This detail makes all the difference in confirmation rates.</>,
    ],
    faqTitle: "Frequently asked questions — COD Italy",
    faq: [
      { q: "Is Italy a good market for COD dropshipping?", a: "Italy is the largest COD market in Europe with 60 million inhabitants. Cash on Delivery accounts for more than 30% of Italian e-commerce transactions. It's an unmissable market for COD dropshippers." },
      { q: "What is the COD delivery rate in Italy?", a: "Our COD delivery rate in Italy is 78%+. Although slightly lower than Spain, the order volume in Italy more than compensates. Northern Italy (Milan, Turin) shows the best rates, Southern Italy (Naples, Palermo) requires more confirmations." },
      { q: "What is the COD delivery time in Italy?", a: "COD deliveries in Italy take 24 to 72 business hours depending on the region. Northern Italy (Milan, Turin, Genoa) is delivered in D+1. Centre (Rome, Florence) in D+2. South and islands (Sicily, Sardinia) in D+3 to D+5." },
      { q: "Which carriers deliver COD in Italy?", a: "CODShipEurope relies on BRT (Bartolini), GLS Italy and DPD for Cash on Delivery deliveries in Italy. BRT is the COD leader in Italy and offers the best national coverage." },
      { q: "Why is COD so popular in Italy?", a: "Italians have a strong historical distrust of online card payments. Cash on Delivery gives them a security guarantee. This cultural habit makes Italy the most mature and most profitable COD market in Europe for dropshippers." },
    ],
    ctaTitle: "Conquer Europe's #1 COD market",
    ctaDesc: "60 million potential customers in Italy are waiting for you. Launch your COD dropshipping today.",
    ctaBtn: "Create my free account",
    internalTitle: "Other COD markets in Europe",
    internalLinks: [
      { href: "/dropshipping-cod-espagne", flag: "🇪🇸", label: "COD Spain" },
      { href: "/dropshipping-cod-portugal", flag: "🇵🇹", label: "COD Portugal" },
      { href: "/blog/guide-dropshipping-cod-europe-2025", flag: "📖", label: "COD Europe Guide 2025" },
    ],
    footerCopy: "© 2025 CODShipEurope. All rights reserved.",
    footerLinks: [["Home", "/"], ["Blog", "/blog"], ["Login", "/connect"], ["Terms", "/conditions"]] as [string, string][],
    steps: [
      { icon: Globe2,   n: "01", title: "Connect Shopify",              desc: "Connect your Shopify store in 5 min. Italian orders arrive automatically." },
      { icon: Phone,    n: "02", title: "Confirmation in Italian",       desc: "Our native Italian-speaking agents confirm each order before shipment." },
      { icon: Truck,    n: "03", title: "COD Delivery 24-72h",           desc: "BRT or GLS delivers and collects cash directly from your customer in Italy." },
      { icon: Banknote, n: "04", title: "Weekly payment",                desc: "Your earnings are automatically transferred every Monday." },
    ],
    features: [
      { icon: Phone,     title: "Native Italian-speaking agents",        desc: "Scripts adapted to Italian regions. Optimized confirmation rate North vs South." },
      { icon: Truck,     title: "BRT + GLS Italy",                       desc: "Italy's best COD carriers. Sicily and Sardinia coverage included." },
      { icon: BarChart3, title: "Largest COD market in Europe",          desc: "60M inhabitants, 30% of e-com transactions in COD. Unmatched volume." },
      { icon: Banknote,  title: "Weekly payment",                        desc: "Automatic payment every Monday — reinvest without waiting." },
      { icon: Zap,       title: "Shopify integration 5 min",             desc: "Quick connection and automatic order synchronization." },
      { icon: Shield,    title: "Differentiated North/South management", desc: "Confirmation strategies adapted by region to maximize deliveries." },
    ],
    stats: [
      { value: "78%+",   label: "Delivery rate" },
      { value: "24-72h", label: "Delivery time" },
      { value: "7d",     label: "Weekly payment" },
      { value: "#1",     label: "#1 COD Market in Europe" },
    ],
  },
}

interface Props {
  jsonLd: unknown
}

export function ItalieContent({ jsonLd: _jsonLd }: Props) {
  const [lang] = useLang()
  const t = T[lang]

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <ArticleHeader />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6">
          <span className="text-base">🇮🇹</span> {t.badge}
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
            <span className="text-4xl">🇮🇹</span>
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
          <div className="text-4xl mb-4">🇮🇹</div>
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
