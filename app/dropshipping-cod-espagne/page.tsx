import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, ArrowRight, Truck, Phone, Banknote, Shield, Clock, Star, Users, BarChart3, Zap, Globe2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Dropshipping COD Espagne — Cash on Delivery Espagne | CODShipEurope",
  description: "Lancez votre dropshipping COD en Espagne avec CODShipEurope. Agents natifs espagnols, livraison 24-48h, taux de livraison 85%+, virement sous 48h. Intégration Shopify en 5 min.",
  keywords: ["dropshipping COD Espagne", "cash on delivery Espagne", "livraison contre remboursement Espagne", "dropshipping Shopify Espagne", "COD Spain dropshipping", "fulfillment Espagne COD"],
  alternates: { canonical: "https://www.codshipeurope.com/dropshipping-cod-espagne" },
  openGraph: {
    title: "Dropshipping COD Espagne — CODShipEurope",
    description: "Lancez votre dropshipping COD en Espagne. Agents natifs, livraison 24-48h, taux 85%+.",
    url: "https://www.codshipeurope.com/dropshipping-cod-espagne",
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
      name: "Quel est le taux de livraison COD en Espagne ?",
      acceptedAnswer: { "@type": "Answer", text: "Notre taux de livraison COD en Espagne dépasse 85%, grâce à nos agents de confirmation natifs hispanophones et à nos partenariats avec GLS España et DPD Espagne. La confirmation d'appel avant expédition réduit significativement les retours." },
    },
    {
      "@type": "Question",
      name: "Quel est le délai de livraison COD en Espagne ?",
      acceptedAnswer: { "@type": "Answer", text: "Les livraisons COD en Espagne s'effectuent en 24 à 48 heures ouvrables après confirmation de la commande. La péninsule ibérique est couverte en J+1 à J+2, les îles Canaries et Baléares en J+3 à J+5." },
    },
    {
      "@type": "Question",
      name: "Quels transporteurs livrent en COD en Espagne ?",
      acceptedAnswer: { "@type": "Answer", text: "CODShipEurope travaille avec GLS España, DPD Espagne et SEUR pour les livraisons Cash on Delivery en Espagne. Ces partenaires couvrent 100% du territoire espagnol, y compris les zones rurales et les îles." },
    },
    {
      "@type": "Question",
      name: "Comment fonctionne le paiement pour le COD Espagne ?",
      acceptedAnswer: { "@type": "Answer", text: "Une fois vos commandes livrées et le Cash on Delivery collecté, vous recevez votre virement bancaire sous 48 heures ouvrables. Aucune avance de trésorerie n'est requise de votre côté." },
    },
    {
      "@type": "Question",
      name: "Peut-on faire du dropshipping COD en Espagne depuis le Maroc ou la France ?",
      acceptedAnswer: { "@type": "Answer", text: "Oui, CODShipEurope permet à des vendeurs basés partout dans le monde de vendre en COD en Espagne. Vous gérez votre boutique Shopify depuis n'importe où, et nous nous occupons des confirmations et des livraisons en Espagne." },
    },
  ],
}

const STEPS = [
  { icon: Globe2,   n: "01", title: "Connectez Shopify",         desc: "Liez votre boutique Shopify en 5 minutes. Vos commandes arrivent automatiquement sur notre plateforme." },
  { icon: Phone,    n: "02", title: "Confirmation en espagnol",   desc: "Nos agents natifs hispanophones appellent chaque client pour confirmer la commande et l'adresse de livraison." },
  { icon: Truck,    n: "03", title: "Livraison COD en 24-48h",    desc: "GLS ou DPD livre votre colis en Espagne et collecte le Cash on Delivery directement chez le client." },
  { icon: Banknote, n: "04", title: "Virement sous 48h",          desc: "Votre argent est viré sur votre compte en 48 heures ouvrables après chaque livraison confirmée." },
]

const FEATURES = [
  { icon: Phone,    title: "Agents natifs hispanophones",       desc: "Nos agents parlent espagnol courant. Taux de confirmation supérieur de 30% vs agents non natifs." },
  { icon: Truck,    title: "Livraison 24-48h en péninsule",     desc: "Réseau GLS & DPD couvrant 100% de l'Espagne, y compris zones rurales et îles." },
  { icon: BarChart3,title: "85%+ de taux de livraison",         desc: "Confirmation avant expédition = moins de refus à la livraison = plus de revenus." },
  { icon: Banknote, title: "Virement 48h garanti",              desc: "Encaissez vos gains rapidement. Pas d'avance de trésorerie requise." },
  { icon: Zap,      title: "Intégration Shopify en 5 min",      desc: "Connectez votre boutique et vos commandes arrivent automatiquement, sans manipulation manuelle." },
  { icon: Shield,   title: "Protection anti-fraude",            desc: "Détection des adresses invalides et des faux numéros pour protéger votre chiffre d'affaires." },
]

const STATS = [
  { value: "85%+",   label: "Taux de livraison" },
  { value: "24-48h", label: "Délai de livraison" },
  { value: "48h",    label: "Délai de virement" },
  { value: "1 200+", label: "Marchands en Espagne" },
]

export default function EspagnePage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Navbar */}
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
            <Link href="/?signup=1" className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6">
          <span className="text-base">🇪🇸</span> Marché Espagne
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          Dropshipping COD<br />
          <span style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Espagne</span>
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Vendez en <strong className="text-white">Cash on Delivery en Espagne</strong> avec des agents natifs hispanophones, une livraison en 24-48h et des virements sous 48h. Connectez votre boutique Shopify en 5 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/?signup=1" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm transition-all" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.35)" }}>
            S'inscrire — Marché Espagne <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-neutral-300 font-semibold text-sm border border-neutral-700 hover:border-neutral-500 transition-all">
            Voir la plateforme
          </Link>
        </div>
      </section>

      {/* Stats */}
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

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Comment fonctionne le COD en Espagne ?</h2>
          <p className="text-neutral-500">Un processus simple en 4 étapes pour vendre en Cash on Delivery en Espagne</p>
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

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Pourquoi choisir CODShipEurope pour l&apos;Espagne ?</h2>
          <p className="text-neutral-500">Tout ce dont vous avez besoin pour réussir votre dropshipping COD en Espagne</p>
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

      {/* Spain specific content */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🇪🇸</span>
            <h2 className="text-2xl font-black text-white">Le marché COD en Espagne</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 text-neutral-400 leading-relaxed">
            <div>
              <p className="mb-4">L&apos;Espagne est l&apos;un des marchés les plus dynamiques pour le <strong className="text-white">dropshipping COD en Europe</strong>. Avec 47 millions d&apos;habitants et une forte culture du paiement à la livraison, l&apos;Espagne offre un potentiel considérable pour les dropshippers.</p>
              <p className="mb-4">Les Espagnols apprécient particulièrement le Cash on Delivery car il leur offre une sécurité lors des achats en ligne. Les catégories les plus performantes sont la mode, l&apos;électronique, la beauté et les accessoires de maison.</p>
              <p>Les grandes villes comme <strong className="text-white">Madrid, Barcelone, Valence et Séville</strong> concentrent la majorité des commandes, mais notre réseau couvre l&apos;intégralité du territoire espagnol.</p>
            </div>
            <div>
              <p className="mb-4">Notre équipe d&apos;agents natifs hispanophones garantit des <strong className="text-white">confirmations d&apos;appel de qualité</strong> en espagnol. Cette étape est cruciale : une commande confirmée par un agent professionnel a 3x plus de chances d&apos;être livrée avec succès.</p>
              <p className="mb-4">Le partenariat avec <strong className="text-white">GLS España et DPD Espagne</strong> nous permet de proposer des délais de livraison compétitifs : 24h pour les grandes villes, 48h pour les zones rurales.</p>
              <p>Après chaque cycle de livraison, vos fonds sont virés sous 48 heures ouvrables, vous permettant de réinvestir rapidement dans vos campagnes publicitaires.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Questions fréquentes — COD Espagne</h2>
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

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl p-10 md:p-16 text-center" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(220,38,38,0.1))", border: "1px solid rgba(249,115,22,0.2)" }}>
          <div className="text-4xl mb-4">🇪🇸</div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Prêt à vous lancer en COD en Espagne ?</h2>
          <p className="text-neutral-400 text-lg mb-8">Rejoignez 1 200+ marchands qui génèrent des revenus en Cash on Delivery en Espagne avec CODShipEurope.</p>
          <Link href="/?signup=1" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-white font-bold text-base" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.4)" }}>
            Créer mon compte gratuitement <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Internal links */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-lg font-bold text-white mb-6">Autres marchés COD en Europe</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { href: "/dropshipping-cod-portugal", flag: "🇵🇹", label: "COD Portugal" },
            { href: "/dropshipping-cod-italie",   flag: "🇮🇹", label: "COD Italie" },
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

      {/* Footer */}
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
