import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Truck, Phone, Banknote, Shield, Zap, BarChart3, Globe2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Dropshipping COD Portugal — Cash on Delivery Portugal | CODShipEurope",
  description: "Lancez votre dropshipping COD au Portugal avec CODShipEurope. Agents natifs lusophones, livraison 24-48h à Lisbonne, Porto et partout au Portugal, paiement chaque lundi.",
  keywords: ["dropshipping COD Portugal", "cash on delivery Portugal", "livraison contre remboursement Portugal", "dropshipping Shopify Portugal", "COD Portugal dropshipping"],
  alternates: { canonical: "https://www.codshipeurope.com/dropshipping-cod-portugal" },
  openGraph: {
    title: "Dropshipping COD Portugal — CODShipEurope",
    description: "Lancez votre dropshipping COD au Portugal. Agents natifs lusophones, livraison 24-48h, taux 82%+.",
    url: "https://www.codshipeurope.com/dropshipping-cod-portugal",
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
      name: "Quel est le taux de livraison COD au Portugal ?",
      acceptedAnswer: { "@type": "Answer", text: "Notre taux de livraison COD au Portugal atteint 82%, grâce à nos agents de confirmation natifs lusophones et nos partenariats avec DPD Portugal et CTT. La confirmation d'appel préalable réduit les retours à la livraison." },
    },
    {
      "@type": "Question",
      name: "Quel est le délai de livraison COD au Portugal ?",
      acceptedAnswer: { "@type": "Answer", text: "Les livraisons COD au Portugal s'effectuent en 24 à 48 heures ouvrables. Lisbonne et Porto sont livrées en J+1, les régions comme l'Alentejo ou le Nord en J+2. Madère et les Açores en J+5 à J+7." },
    },
    {
      "@type": "Question",
      name: "Quels transporteurs couvrent le Portugal en COD ?",
      acceptedAnswer: { "@type": "Answer", text: "CODShipEurope s'appuie sur DPD Portugal et CTT pour les livraisons Cash on Delivery. Ces partenaires couvrent 100% du territoire continental ainsi que les îles avec des délais optimisés." },
    },
    {
      "@type": "Question",
      name: "Peut-on vendre en COD au Portugal depuis l'étranger ?",
      acceptedAnswer: { "@type": "Answer", text: "Oui, de nombreux marchands basés en France, au Maroc ou ailleurs vendent en COD au Portugal via CODShipEurope. Vous gérez votre boutique Shopify de n'importe où, et nous gérons toute la logistique locale." },
    },
  ],
}

const STEPS = [
  { icon: Globe2,   n: "01", title: "Connectez Shopify",            desc: "Liez votre boutique en 5 minutes. Les commandes portugaises arrivent automatiquement." },
  { icon: Phone,    n: "02", title: "Confirmation en portugais",     desc: "Nos agents natifs lusophones confirment chaque commande par téléphone avant expédition." },
  { icon: Truck,    n: "03", title: "Livraison COD 24-48h Portugal", desc: "DPD ou CTT livre et collecte le Cash on Delivery directement chez votre client au Portugal." },
  { icon: Banknote, n: "04", title: "Paiement hebdomadaire",             desc: "Vos gains sont virés automatiquement chaque lundi." },
]

const FEATURES = [
  { icon: Phone,    title: "Agents natifs lusophones",    desc: "Nos agents parlent portugais courant. Taux de confirmation 30% supérieur aux agents non natifs." },
  { icon: Truck,    title: "Réseau DPD + CTT Portugal",   desc: "Couverture complète du Portugal, des grandes villes aux zones rurales et aux îles." },
  { icon: BarChart3,title: "82%+ taux de livraison",      desc: "Confirmation avant expédition pour maximiser les livraisons réussies." },
  { icon: Banknote, title: "Paiement hebdomadaire",                desc: "Paiement hebdomadaire automatique — sans avance de trésorerie." },
  { icon: Zap,      title: "Intégration Shopify 5 min",   desc: "Connexion rapide, synchronisation automatique des commandes, zéro manipulation manuelle." },
  { icon: Shield,   title: "Protection anti-fraude",      desc: "Vérification des adresses et numéros pour éviter les fausses commandes." },
]

const STATS = [
  { value: "82%+",   label: "Taux de livraison" },
  { value: "24-48h", label: "Délai de livraison" },
  { value: "7j", label: "Paiement hebdo" },
  { value: "600+",   label: "Marchands au Portugal" },
]

export default function PortugalPage() {
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
            <Link href="/?signup=1" className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
              Commencer
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6">
          <span className="text-base">🇵🇹</span> Marché Portugal
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          Dropshipping COD<br />
          <span style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Portugal</span>
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Vendez en <strong className="text-white">Cash on Delivery au Portugal</strong> avec des agents natifs lusophones, une livraison en 24-48h à Lisbonne, Porto et partout sur le territoire. Paiement hebdomadaire.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/?signup=1" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 8px 32px rgba(249,115,22,0.35)" }}>
            S'inscrire — Marché Portugal <ArrowRight className="w-4 h-4" />
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
          <h2 className="text-3xl font-black text-white mb-3">Comment fonctionne le COD au Portugal ?</h2>
          <p className="text-neutral-500">4 étapes simples pour vendre en Cash on Delivery au Portugal</p>
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
          <h2 className="text-3xl font-black text-white mb-3">Pourquoi CODShipEurope pour le Portugal ?</h2>
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
            <span className="text-4xl">🇵🇹</span>
            <h2 className="text-2xl font-black text-white">Le marché COD au Portugal</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 text-neutral-400 leading-relaxed">
            <div>
              <p className="mb-4">Le Portugal est un marché COD en forte croissance, notamment grâce à la montée du e-commerce post-pandémie. Les consommateurs portugais, concentrés à <strong className="text-white">Lisbonne, Porto et Braga</strong>, adoptent massivement le Cash on Delivery pour leurs achats en ligne.</p>
              <p className="mb-4">Les catégories les plus vendues en COD au Portugal sont la mode, la beauté, les produits pour enfants et les accessoires high-tech. Le panier moyen COD au Portugal est de 45 à 65€.</p>
              <p>Notre présence locale et notre connaissance du marché portugais nous permettent d&apos;adapter les scripts d&apos;appel aux codes culturels locaux, augmentant significativement les taux de confirmation.</p>
            </div>
            <div>
              <p className="mb-4">La <strong className="text-white">langue est un facteur clé</strong> au Portugal : les Portugais répondent mieux aux appels en portugais européen (et non en portugais brésilien). Nos agents sont formés spécifiquement pour ce marché.</p>
              <p className="mb-4">Grâce à notre partenariat avec <strong className="text-white">DPD Portugal et CTT</strong>, nous assurons une couverture complète du territoire, y compris les zones péri-urbaines et les petites villes de province.</p>
              <p>Le Portugal offre également des frais de livraison parmi les plus compétitifs d&apos;Europe du Sud, ce qui maximise vos marges sur chaque commande COD.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Questions fréquentes — COD Portugal</h2>
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
          <div className="text-4xl mb-4">🇵🇹</div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Prêt à vendre en COD au Portugal ?</h2>
          <p className="text-neutral-400 text-lg mb-8">Rejoignez 600+ marchands qui réussissent leur dropshipping COD au Portugal avec CODShipEurope.</p>
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
            { href: "/dropshipping-cod-italie",  flag: "🇮🇹", label: "COD Italie" },
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
