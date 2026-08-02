import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "COD vs Prépayé Dropshipping Europe : Quel Modèle Choisir ? | CODShipEurope",
  description: "Comparatif complet COD vs prépayé en dropshipping Europe. Marges, taux de conversion, risques, marchés cibles. Tout pour choisir le bon modèle pour votre business.",
  keywords: ["COD vs prépayé dropshipping", "cash on delivery vs paiement en ligne", "avantages COD dropshipping", "dropshipping Europe quel modèle", "COD ou prépayé Europe"],
  alternates: { canonical: "https://www.codshipeurope.com/blog/avantages-cod-vs-prepaye-dropshipping" },
  openGraph: {
    title: "COD vs Prépayé en Dropshipping Europe — CODShipEurope",
    description: "Comparatif COD vs prépayé pour le dropshipping en Europe. Quel modèle est le plus rentable ?",
    url: "https://www.codshipeurope.com/blog/avantages-cod-vs-prepaye-dropshipping",
    type: "article",
    locale: "fr_FR",
    siteName: "CODShipEurope",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "COD vs Prépayé en dropshipping : quel modèle choisir en Europe ?",
  description: "Comparatif complet entre le Cash on Delivery et le paiement prépayé pour le dropshipping en Europe.",
  author: { "@type": "Organization", name: "CODShipEurope" },
  publisher: { "@type": "Organization", name: "CODShipEurope", logo: { "@type": "ImageObject", url: "https://www.codshipeurope.com/icon.svg" } },
  datePublished: "2025-01-22",
  dateModified: "2025-01-22",
}

export default function CodVsPrePayePage() {
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

      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-300 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs px-2.5 py-1 rounded-full border font-medium bg-purple-500/15 text-purple-400 border-purple-500/25">Stratégie</span>
          <span className="text-neutral-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> 8 min de lecture</span>
          <span className="text-neutral-500 text-xs">22 janvier 2025</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
          COD vs Prépayé en dropshipping : quel modèle choisir en Europe ?
        </h1>

        <p className="text-neutral-400 text-lg leading-relaxed mb-10 border-l-2 border-purple-500 pl-4">
          La question que se pose tout dropshipper qui envisage de vendre en Europe : faut-il opter pour le Cash on Delivery ou le paiement prépayé ? Les deux modèles ont leurs avantages. Ce comparatif vous aide à faire le bon choix.
        </p>

        <div className="space-y-10 text-neutral-300 leading-relaxed">

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Les différences fondamentales</h2>
            <p className="mb-6">Avant de comparer, voici la définition de chaque modèle :</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-900 border border-orange-500/30 rounded-2xl p-5">
                <h3 className="text-orange-400 font-bold mb-2">💵 Cash on Delivery (COD)</h3>
                <p className="text-neutral-400 text-sm">Le client commande en ligne mais paie en espèces au moment de la livraison. Un agent téléphonique confirme la commande avant expédition.</p>
              </div>
              <div className="bg-neutral-900 border border-blue-500/30 rounded-2xl p-5">
                <h3 className="text-blue-400 font-bold mb-2">💳 Prépayé (CB en ligne)</h3>
                <p className="text-neutral-400 text-sm">Le client paie par carte bancaire au moment de la commande. Vous encaissez immédiatement via Stripe, PayPal ou Shopify Payments.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Comparatif complet : COD vs Prépayé</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left p-4 text-neutral-500 font-medium">Critère</th>
                    <th className="text-left p-4 text-orange-400 font-bold">COD</th>
                    <th className="text-left p-4 text-blue-400 font-bold">Prépayé</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { critere: "Taux de conversion", cod: "3-8%", pre: "1-3%" },
                    { critere: "Taux de retour", cod: "15-25%", pre: "5-10%" },
                    { critere: "Délai d'encaissement", cod: "48-72h", pre: "Immédiat" },
                    { critere: "Risque chargeback", cod: "Aucun", pre: "2-5%" },
                    { critere: "Marché Italie", cod: "✅ Idéal", pre: "⚠️ Limité" },
                    { critere: "Marché Espagne", cod: "✅ Très bon", pre: "✅ Bon" },
                    { critere: "Clientèle sans CB", cod: "✅ Incluse", pre: "❌ Exclue" },
                    { critere: "Coût confirmation", cod: "~1.5€/cmd", pre: "0€" },
                    { critere: "Concurrence", cod: "Faible", pre: "Très élevée" },
                  ].map(row => (
                    <tr key={row.critere} className="border-b border-neutral-800 last:border-0">
                      <td className="p-4 text-neutral-300 font-medium">{row.critere}</td>
                      <td className="p-4 text-neutral-400">{row.cod}</td>
                      <td className="p-4 text-neutral-400">{row.pre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Les avantages du COD en Europe</h2>
            <div className="space-y-3">
              {[
                { title: "Taux de conversion 2 à 3x supérieur", desc: "Le client n'a pas à sortir sa carte, il n'y a pas de page de paiement à traverser. Le parcours d'achat est plus simple, ce qui booste massivement les conversions." },
                { title: "Clientèle plus large", desc: "En Italie, 30% des achats sont en COD. Ces acheteurs sont totalement exclus du prépayé. Le COD vous ouvre un marché inaccessible à vos concurrents." },
                { title: "Zéro risque de chargeback", desc: "Le client paye en espèces à la livraison. Impossible pour lui de contester le paiement après coup. Vos revenus sont sécurisés." },
                { title: "Moins de concurrence", desc: "La plupart des dropshippers utilisent le prépayé car c'est plus simple à mettre en place. Le COD nécessite un partenaire comme CODShipEurope, ce qui crée une barrière à l'entrée en votre faveur." },
              ].map(a => (
                <div key={a.title} className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{a.title}</h3>
                    <p className="text-neutral-400 text-sm">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Les inconvénients du COD</h2>
            <div className="space-y-3">
              {[
                { title: "Taux de retour plus élevé", desc: "Entre 15 et 25% des colis sont refusés à la livraison. C'est pourquoi la confirmation d'appel est essentielle avant d'expédier." },
                { title: "Délai d'encaissement de 48-72h", desc: "Contrairement au prépayé où vous encaissez immédiatement, en COD vous attendez que la livraison soit effectuée et que les fonds soient rapatriés." },
                { title: "Processus plus complexe", desc: "Le COD nécessite un partenaire spécialisé (comme CODShipEurope), des agents de confirmation, et une logistique adaptée. Ce n'est pas aussi simple que d'ouvrir un compte Stripe." },
              ].map(a => (
                <div key={a.title} className="flex gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{a.title}</h3>
                    <p className="text-neutral-400 text-sm">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Notre recommandation</h2>
            <div className="bg-neutral-900 border border-orange-500/30 rounded-2xl p-6">
              <p className="text-white font-bold mb-3">Pour les marchés Europe du Sud (Italie, Espagne, Portugal) : <span className="text-orange-400">COD en priorité</span></p>
              <p className="text-neutral-400 text-sm mb-4">Le taux de conversion supérieur et l&apos;accès à un marché plus large compensent largement le taux de retour plus élevé. Sur ces marchés, le COD génère en moyenne 40% de revenus supplémentaires versus le prépayé.</p>
              <p className="text-neutral-500 text-xs">La combinaison idéale : lancer en COD, puis ajouter une option prépayé pour capter les clients qui préfèrent payer en ligne. Vous maximisez ainsi votre couverture marché.</p>
            </div>
          </section>

        </div>

        <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(220,38,38,0.1))", border: "1px solid rgba(249,115,22,0.2)" }}>
          <h2 className="text-2xl font-black text-white mb-3">Lancez votre dropshipping COD en Europe</h2>
          <p className="text-neutral-400 mb-6 text-sm">Connectez votre boutique Shopify et commencez à vendre en Cash on Delivery en Espagne, Portugal et Italie.</p>
          <Link href="/?signup=1" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
            S'inscrire gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-bold text-white mb-6">Articles liés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { href: "/blog/guide-dropshipping-cod-europe-2025", flag: "📖", label: "Guide complet COD Europe 2025" },
              { href: "/dropshipping-cod-espagne",                 flag: "🇪🇸", label: "Dropshipping COD Espagne" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-orange-500/30 transition-colors">
                <span className="text-xl">{l.flag}</span>
                <span className="text-neutral-300 text-sm font-medium">{l.label}</span>
                <ArrowRight className="w-4 h-4 text-neutral-600 ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </article>

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
