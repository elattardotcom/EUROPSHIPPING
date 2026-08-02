import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Truck, Phone, Banknote, Shield, Zap, BarChart3, Globe2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Dropshipping COD Italie — Cash on Delivery Italie | CODShipEurope",
  description: "Lancez votre dropshipping COD en Italie. L'Italie est le plus grand marché COD d'Europe. Agents natifs italophones, livraison BRT/GLS 24-72h, paiement hebdomadaire.",
  keywords: ["dropshipping COD Italie", "cash on delivery Italie", "livraison contre remboursement Italie", "dropshipping Shopify Italie", "COD Italy dropshipping", "fulfillment Italie"],
  alternates: { canonical: "https://www.codshipeurope.com/dropshipping-cod-italie" },
  openGraph: {
    title: "Dropshipping COD Italie — CODShipEurope",
    description: "L'Italie est le plus grand marché COD d'Europe. Agents natifs italophones, livraison 24-72h, taux 78%+.",
    url: "https://www.codshipeurope.com/dropshipping-cod-italie",
    type: "website",
    locale: "fr_FR",
    siteName: "CODShipEurope",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "L'Italie est-elle un bon marché pour le dropshipping COD ?",
      acceptedAnswer: { "@type": "Answer", text: "L'Italie est le plus grand marché COD d'Europe avec 60 millions d'habitants. Le Cash on Delivery représente plus de 30% des transactions e-commerce italiennes. C'est un marché incontournable pour les dropshippers COD." },
    },
    {
      "@type": "Question",
      name: "Quel est le taux de livraison COD en Italie ?",
      acceptedAnswer: { "@type": "Answer", text: "Notre taux de livraison COD en Italie est de 78%+. Bien que légèrement inférieur à l'Espagne, le volume de commandes en Italie compense largement. Le Nord de l'Italie (Milan, Turin) affiche les meilleurs taux, le Sud (Naples, Palerme) nécessite plus de confirmations." },
    },
    {
      "@type": "Question",
      name: "Quel est le délai de livraison COD en Italie ?",
      acceptedAnswer: { "@type": "Answer", text: "Les livraisons COD en Italie s'effectuent en 24 à 72 heures ouvrables selon la région. Le Nord de l'Italie (Milan, Turin, Gênes) est livré en J+1. Le Centre (Rome, Florence) en J+2. Le Sud et les îles (Sicile, Sardaigne) en J+3 à J+5." },
    },
    {
      "@type": "Question",
      name: "Quels transporteurs livrent en COD en Italie ?",
      acceptedAnswer: { "@type": "Answer", text: "CODShipEurope s'appuie sur BRT (Bartolini), GLS Italy et DPD pour les livraisons Cash on Delivery en Italie. BRT est le leader du COD en Italie et offre la meilleure couverture nationale." },
    },
    {
      "@type": "Question",
      name: "Pourquoi le COD est-il si populaire en Italie ?",
      acceptedAnswer: { "@type": "Answer", text: "Les Italiens ont une forte méfiance historique envers les paiements en ligne par carte. Le Cash on Delivery leur offre une garantie de sécurité. Cette habitude culturelle fait de l'Italie le marché COD le plus mature et le plus rentable d'Europe pour les dropshippers." },
    },
  ],
}

const STEPS = [
  { icon: Globe2,   n: "01", title: "Connectez Shopify",          desc: "Connectez votre boutique Shopify en 5 min. Les commandes italiennes arrivent automatiquement." },
  { icon: Phone,    n: "02", title: "Confirmation en italien",     desc: "Nos agents natifs italophones confirment chaque commande avant expédition." },
  { icon: Truck,    n: "03", title: "Livraison COD 24-72h",        desc: "BRT ou GLS livre et collecte le cash directement chez votre client en Italie." },
  { icon: Banknote, n: "04", title: "Paiement hebdomadaire",           desc: "Vos gains sont virés automatiquement chaque lundi." },
]

const FEATURES = [
  { icon: Phone,    title: "Agents natifs italophones",   desc: "Scripts adaptés aux régions italiennes. Taux de confirmation optimisé Nord vs Sud." },
  { icon: Truck,    title: "BRT + GLS Italie",            desc: "Les meilleurs transporteurs COD en Italie. Couverture Sicile et Sardaigne incluse." },
  { icon: BarChart3,title: "Plus grand marché COD Europe",desc: "60M d'habitants, 30% de transactions e-com en COD. Volume incomparable." },
  { icon: Banknote, title: "Paiement hebdomadaire",                desc: "Paiement automatique chaque lundi — réinvestissez sans attendre." },
  { icon: Zap,      title: "Intégration Shopify 5 min",   desc: "Connexion rapide et synchronisation automatique des commandes." },
  { icon: Shield,   title: "Gestion Sud/Nord différenciée", desc: "Stratégies de confirmation adaptées selon la région pour maximiser les livraisons." },
]

const STATS = [
  { value: "78%+",   label: "Taux de livraison" },
  { value: "24-72h", label: "Délai de livraison" },
  { value: "7j", label: "Paiement hebdo" },
  { value: "#1",     label: "Marché COD en Europe" },
]

export default function ItaliePage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header style={{ background: "rgba(6,6,6,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="sticky top-0 z-40 h-16 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
              <span className="text-white font-black text-xs">C</span>
            </div>
            <span className="font-bold text-white text-sm">CODShipEurope</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-neutral-400 hover:text-white text-sm transition-colors">Blog</Link>
            <Link href="/?signup=1" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
              Commencer
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6">
          <span className="text-base">🇮🇹</span> Marché Italie — #1 COD Europe
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          Dropshipping COD<br />
          <span style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Italie</span>
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          L&apos;Italie est le <strong className="text-white">plus grand marché COD d&apos;Europe</strong>. 60 millions d&apos;habitants, 30% des achats en Cash on Delivery. Lancez-vous avec des agents natifs italophones et BRT comme transporteur.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/?signup=1" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.35)" }}>
            S'inscrire — Marché Italie <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-neutral-300 font-semibold text-sm border border-neutral-700 hover:border-neutral-500 transition-all">
            Voir la plateforme
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-white mb-1">{s.value}</div>
              <div className="text-sm text-neutral-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Comment fonctionne le COD en Italie ?</h2>
          <p className="text-neutral-500">4 étapes pour vendre en Cash on Delivery en Italie</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(step => (
            <div key={step.n} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="text-xs font-bold text-orange-500 mb-4">{step.n}</div>
              <step.icon className="w-6 h-6 text-orange-400 mb-3" />
              <h3 className="text-white font-bold mb-2">{step.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Pourquoi le COD en Italie est-il si rentable ?</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-orange-500/30 transition-colors">
              <f.icon className="w-5 h-5 text-orange-400 mb-3" />
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🇮🇹</span>
            <h2 className="text-2xl font-black text-white">Pourquoi l&apos;Italie est le meilleur marché COD d&apos;Europe</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 text-neutral-400 leading-relaxed">
            <div>
              <p className="mb-4">L&apos;Italie représente une opportunité unique pour le <strong className="text-white">dropshipping COD en Europe</strong>. Avec 60 millions d&apos;habitants et un taux de Cash on Delivery parmi les plus élevés du continent (30% des transactions e-commerce), c&apos;est un marché incontournable.</p>
              <p className="mb-4">Contrairement à l&apos;Espagne où le paiement en ligne est bien adopté, les Italiens ont une méfiance culturelle envers les transactions par carte. Le COD leur offre la sécurité qu&apos;ils recherchent, ce qui en fait la <strong className="text-white">méthode de paiement préférée</strong> pour les achats en ligne.</p>
              <p>Les catégories les plus performantes en COD en Italie sont : la mode, la beauté, les compléments alimentaires, les accessoires de sport et les produits pour enfants.</p>
            </div>
            <div>
              <p className="mb-4">La <strong className="text-white">disparité Nord/Sud</strong> est un élément clé à connaître. Le Nord (Milan, Turin, Gênes, Bologne) affiche des taux de livraison supérieurs à 85%. Le Sud (Naples, Palerme, Bari) nécessite plus de confirmations mais reste très rentable en volume.</p>
              <p className="mb-4">Notre partenariat avec <strong className="text-white">BRT (Bartolini)</strong> — le leader historique du COD en Italie — nous permet d&apos;offrir les meilleurs délais et taux de livraison sur tout le territoire, Sicile et Sardaigne incluses.</p>
              <p>Avec CODShipEurope, vos agents de confirmation parlent un <strong className="text-white">italien régional adapté</strong> : toscan standard pour le Centre, accent napolitain reconnu pour le Sud. Ce détail fait toute la différence sur le taux de confirmation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Questions fréquentes — COD Italie</h2>
        </div>
        <div className="space-y-4">
          {jsonLd.mainEntity.map((q, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">{q.name}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{q.acceptedAnswer.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl p-10 md:p-16 text-center" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(220,38,38,0.1))", border: "1px solid rgba(249,115,22,0.2)" }}>
          <div className="text-4xl mb-4">🇮🇹</div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Conquérez le marché COD numéro 1 d&apos;Europe</h2>
          <p className="text-neutral-400 text-lg mb-8">60 millions de clients potentiels en Italie vous attendent. Lancez votre dropshipping COD dès aujourd&apos;hui.</p>
          <Link href="/?signup=1" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-white font-bold text-base" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.4)" }}>
            Créer mon compte gratuitement <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-lg font-bold text-white mb-6">Autres marchés COD en Europe</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { href: "/dropshipping-cod-espagne", flag: "🇪🇸", label: "COD Espagne" },
            { href: "/dropshipping-cod-portugal", flag: "🇵🇹", label: "COD Portugal" },
            { href: "/blog/guide-dropshipping-cod-europe-2025", flag: "📖", label: "Guide COD Europe 2025" },
          ].map(l => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-orange-500/30 transition-colors">
              <span className="text-2xl">{l.flag}</span>
              <span className="text-neutral-300 text-sm font-medium">{l.label}</span>
              <ArrowRight className="w-4 h-4 text-neutral-600 ml-auto" />
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-600 text-sm">© 2025 CODShipEurope. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            {[["Accueil","/"],["Blog","/blog"],["Connexion","/connect"],["Conditions","/conditions"]].map(([l,h]) => (
              <Link key={h} href={h} className="text-neutral-600 hover:text-neutral-400 text-sm transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
