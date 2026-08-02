import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Clock, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Guide Dropshipping COD Europe 2025 — Cash on Delivery Complet | CODShipEurope",
  description: "Guide complet du dropshipping COD en Europe 2025 : marchés à cibler, taux de livraison, confirmations d'appel, transporteurs, marges. Tout pour réussir votre business COD.",
  keywords: ["guide dropshipping COD Europe", "dropshipping cash on delivery Europe 2025", "COD dropshipping guide", "comment faire dropshipping COD", "dropshipping COD Shopify Europe"],
  alternates: { canonical: "https://www.codshipeurope.com/blog/guide-dropshipping-cod-europe-2025" },
  openGraph: {
    title: "Guide Dropshipping COD Europe 2025 — CODShipEurope",
    description: "Guide complet pour lancer et scaler votre dropshipping Cash on Delivery en Europe en 2025.",
    url: "https://www.codshipeurope.com/blog/guide-dropshipping-cod-europe-2025",
    type: "article",
    locale: "fr_FR",
    siteName: "CODShipEurope",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Guide complet du dropshipping COD en Europe (2025)",
  description: "Tout ce que vous devez savoir pour lancer et scaler votre business de dropshipping Cash on Delivery en Europe.",
  author: { "@type": "Organization", name: "CODShipEurope" },
  publisher: { "@type": "Organization", name: "CODShipEurope", logo: { "@type": "ImageObject", url: "https://www.codshipeurope.com/icon.svg" } },
  datePublished: "2025-01-15",
  dateModified: "2025-01-15",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.codshipeurope.com/blog/guide-dropshipping-cod-europe-2025" },
}

export default function GuidePage() {
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
          <span className="text-xs px-2.5 py-1 rounded-full border font-medium bg-orange-500/15 text-orange-400 border-orange-500/25">Guide</span>
          <span className="text-neutral-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> 12 min de lecture</span>
          <span className="text-neutral-500 text-xs">15 janvier 2025</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
          Guide complet du dropshipping COD en Europe (2025)
        </h1>

        <p className="text-neutral-400 text-lg leading-relaxed mb-10 border-l-2 border-orange-500 pl-4">
          Le dropshipping Cash on Delivery (COD) en Europe est l&apos;une des opportunités business les plus sous-estimées de 2025. Ce guide vous donne toutes les clés pour comprendre ce modèle, choisir vos marchés et maximiser vos revenus.
        </p>

        {/* Table of contents */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-10">
          <h2 className="text-white font-bold mb-4">Sommaire</h2>
          <ol className="space-y-2 text-sm">
            {[
              "Qu'est-ce que le dropshipping COD ?",
              "Pourquoi le COD est-il si populaire en Europe ?",
              "Les meilleurs marchés COD en Europe",
              "Comment fonctionne la confirmation d'appel ?",
              "Choisir ses transporteurs pour le COD",
              "Comment calculer ses marges en COD ?",
              "Les erreurs à éviter en dropshipping COD",
              "Comment démarrer avec CODShipEurope ?",
            ].map((item, i) => (
              <li key={i} className="text-neutral-400 hover:text-orange-400 transition-colors cursor-pointer">
                <span className="text-orange-500 font-bold">{i + 1}.</span> {item}
              </li>
            ))}
          </ol>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-neutral-300 leading-relaxed">

          <section>
            <h2 className="text-2xl font-black text-white mb-4">1. Qu&apos;est-ce que le dropshipping COD ?</h2>
            <p className="mb-4">Le <strong className="text-white">dropshipping COD (Cash on Delivery)</strong> est un modèle de commerce électronique où votre client paie sa commande au moment de la livraison, en espèces. Contrairement au e-commerce classique où le paiement se fait en ligne par carte, le COD permet de vendre à des clients qui ne font pas confiance aux paiements en ligne.</p>
            <p className="mb-4">Dans ce modèle, vous créez une boutique en ligne (généralement sur Shopify), vous diffusez des publicités (Facebook Ads, TikTok Ads), et lorsqu&apos;un client commande, votre partenaire COD appelle le client pour confirmer la commande, puis expédie le colis avec collecte du paiement à la livraison.</p>
            <p>Le COD vous permet de toucher un segment de marché énorme — les personnes qui achètent en ligne mais paient en espèces — qui représente dans certains pays européens plus de 30% des transactions e-commerce.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">2. Pourquoi le COD est-il si populaire en Europe ?</h2>
            <p className="mb-4">Contrairement aux idées reçues, le Cash on Delivery n&apos;est pas uniquement une pratique des pays en développement. En Europe du Sud, les habitudes de paiement sont fondamentalement différentes de l&apos;Europe du Nord.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              {[
                { country: "🇮🇹 Italie", stat: "30%", desc: "des achats en ligne en COD" },
                { country: "🇪🇸 Espagne", stat: "18%", desc: "des achats en ligne en COD" },
                { country: "🇵🇹 Portugal", stat: "15%", desc: "des achats en ligne en COD" },
              ].map(c => (
                <div key={c.country} className="bg-neutral-800 rounded-xl p-4 text-center">
                  <div className="text-lg mb-1">{c.country}</div>
                  <div className="text-2xl font-black text-orange-400 mb-1">{c.stat}</div>
                  <div className="text-neutral-500 text-xs">{c.desc}</div>
                </div>
              ))}
            </div>
            <p className="mb-4">Les raisons de cette popularité sont multiples : méfiance culturelle envers les paiements en ligne, habitudes historiques d&apos;achat en espèces, protection contre la fraude perçue par les acheteurs, et accessibilité aux personnes sans carte bancaire.</p>
            <p>Pour les dropshippers, cela représente un <strong className="text-white">marché inexploité</strong> où la concurrence est largement inférieure à celle du e-commerce traditionnel.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">3. Les meilleurs marchés COD en Europe</h2>
            <p className="mb-6">Tous les marchés européens ne se valent pas pour le COD. Voici notre classement basé sur le volume, les marges et la facilité d&apos;entrée :</p>

            <div className="space-y-4">
              {[
                { flag: "🇮🇹", country: "Italie", score: "9.5/10", pros: ["Plus grand marché COD d'Europe", "60M d'habitants", "30% des achats en COD", "Panier moyen élevé (55-80€)"], cons: ["Taux de retour Sud plus élevé", "Délais J+3 pour le Sud"] },
                { flag: "🇪🇸", country: "Espagne", score: "9/10", pros: ["85%+ taux de livraison", "Livraison 24-48h", "Très bonne couverture réseau", "Marché stable et mature"] , cons: ["Concurrence COD en hausse", "Coût pub en augmentation"] },
                { flag: "🇵🇹", country: "Portugal", score: "8/10", pros: ["Moins de concurrence", "Marché en croissance", "82%+ taux de livraison", "Clients très fidèles"] , cons: ["Volume plus faible", "Îles coûtent plus cher"] },
              ].map(m => (
                <div key={m.country} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{m.flag}</span>
                    <div>
                      <h3 className="text-white font-bold">{m.country}</h3>
                      <span className="text-orange-400 text-sm font-bold">Score COD : {m.score}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-emerald-400 font-semibold mb-2">✅ Avantages</p>
                      <ul className="space-y-1">{m.pros.map(p => <li key={p} className="text-neutral-400 text-xs flex gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />{p}</li>)}</ul>
                    </div>
                    <div>
                      <p className="text-xs text-red-400 font-semibold mb-2">⚠️ Points d&apos;attention</p>
                      <ul className="space-y-1">{m.cons.map(c => <li key={c} className="text-neutral-400 text-xs">• {c}</li>)}</ul>
                    </div>
                  </div>
                  <Link href={`/dropshipping-cod-${m.country.toLowerCase()}`} className="inline-flex items-center gap-1 text-orange-400 text-xs font-semibold mt-4 hover:text-orange-300 transition-colors">
                    Guide COD {m.country} complet <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">4. Comment fonctionne la confirmation d&apos;appel ?</h2>
            <p className="mb-4">La <strong className="text-white">confirmation d&apos;appel</strong> est l&apos;étape la plus critique du dropshipping COD. C&apos;est un appel téléphonique passé au client entre sa commande et l&apos;expédition du colis, pour confirmer qu&apos;il est bien conscient de son achat et qu&apos;il sera présent pour recevoir et payer le colis.</p>
            <p className="mb-4">Sans confirmation, le taux de retour peut atteindre 40-60% — ce qui signifie que vous payez les frais de port dans les deux sens sans encaisser rien. Avec une bonne confirmation, on descend à 10-20% de retours.</p>
            <p className="mb-4">Les éléments d&apos;une bonne confirmation d&apos;appel :</p>
            <ul className="space-y-2 mb-4">
              {[
                "Agent natif dans la langue du pays cible (espagnol natif, non traduit)",
                "Script d'appel professionnel et rassurant",
                "Confirmation de l'adresse exacte de livraison",
                "Rappel du montant à payer à la livraison",
                "Option de reprogrammation si le client n'est pas disponible",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-neutral-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <p>Chez CODShipEurope, nos agents natifs atteignent un taux de confirmation moyen de 75-85%, contre 50-60% pour des agents non natifs.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">5. Choisir ses transporteurs pour le COD</h2>
            <p className="mb-4">Tous les transporteurs ne font pas du Cash on Delivery. Voici les meilleurs par pays :</p>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left p-4 text-neutral-500 font-medium">Pays</th>
                    <th className="text-left p-4 text-neutral-500 font-medium">Transporteurs COD</th>
                    <th className="text-left p-4 text-neutral-500 font-medium">Délai</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { pays: "🇮🇹 Italie", transporteurs: "BRT, GLS Italy, DPD", delai: "24-72h" },
                    { pays: "🇪🇸 Espagne", transporteurs: "GLS España, DPD, SEUR", delai: "24-48h" },
                    { pays: "🇵🇹 Portugal", transporteurs: "DPD Portugal, CTT", delai: "24-48h" },
                    { pays: "🇷🇴 Roumanie", transporteurs: "FAN Courier, Cargus, DPD", delai: "24-48h" },
                    { pays: "🇧🇬 Bulgarie", transporteurs: "Speedy, Econt, DPD", delai: "24-48h" },
                  ].map(row => (
                    <tr key={row.pays} className="border-b border-neutral-800 last:border-0">
                      <td className="p-4 text-neutral-300">{row.pays}</td>
                      <td className="p-4 text-neutral-400">{row.transporteurs}</td>
                      <td className="p-4 text-orange-400 font-medium">{row.delai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">6. Comment calculer ses marges en COD ?</h2>
            <p className="mb-4">Le calcul de rentabilité en COD est différent du e-commerce classique. Voici la formule :</p>
            <div className="bg-neutral-900 border border-orange-500/30 rounded-2xl p-6 my-6">
              <p className="text-orange-400 font-bold mb-3">Formule de rentabilité COD</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-neutral-400">Prix de vente</span><span className="text-white font-bold">+ 60€</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Coût produit + shipping fournisseur</span><span className="text-red-400">- 15€</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Frais de livraison COD</span><span className="text-red-400">- 6€</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Coût confirmation d&apos;appel</span><span className="text-red-400">- 1.5€</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Coût pub (CPO publicitaire)</span><span className="text-red-400">- 8€</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Frais retour (taux 20%)</span><span className="text-red-400">- 2.4€</span></div>
                <div className="h-px bg-neutral-700 my-2" />
                <div className="flex justify-between"><span className="text-white font-bold">Marge nette / commande livrée</span><span className="text-emerald-400 font-black">= 27.1€</span></div>
              </div>
            </div>
            <p>Avec un taux de livraison de 85% et 20 commandes/jour, cela représente <strong className="text-white">17 commandes livrées × 27€ = 459€ de profit quotidien</strong>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">7. Les erreurs à éviter en dropshipping COD</h2>
            <div className="space-y-3">
              {[
                { title: "❌ Utiliser des agents non natifs", desc: "Un agent marocain qui appelle en espagnol avec un accent étranger divise le taux de confirmation par 2. Toujours utiliser des natifs." },
                { title: "❌ Expédier sans confirmer", desc: "C'est l'erreur la plus coûteuse. Sans confirmation, attendez-vous à 40-60% de retours. Toujours confirmer avant d'expédier." },
                { title: "❌ Ignorer les taux de retour par région", desc: "Le Sud de l'Italie et certaines régions d'Espagne ont des taux de retour plus élevés. Adaptez vos CPO pub en conséquence." },
                { title: "❌ Mauvais calcul de marge", desc: "Ne pas inclure les frais de retour dans vos calculs fausse complètement votre rentabilité. Comptez toujours 15-25% de retours." },
                { title: "❌ Produit inadapté au COD", desc: "Les produits trop chers (+150€) ont des taux de retour très élevés en COD. La zone de confort est 30-80€." },
              ].map(e => (
                <div key={e.title} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                  <h3 className="text-white font-bold mb-1 text-sm">{e.title}</h3>
                  <p className="text-neutral-500 text-sm">{e.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">8. Comment démarrer avec CODShipEurope ?</h2>
            <p className="mb-6">Démarrer en dropshipping COD avec CODShipEurope prend moins de 24 heures :</p>
            <div className="space-y-4">
              {[
                { n: "1", title: "Créez votre compte", desc: "Inscrivez-vous sur CODShipEurope et choisissez votre plan selon votre volume de commandes." },
                { n: "2", title: "Connectez votre boutique Shopify", desc: "En 5 minutes, vos commandes sont synchronisées automatiquement. Aucune manipulation manuelle." },
                { n: "3", title: "Lancez vos publicités", desc: "Démarrez vos campagnes Facebook ou TikTok Ads. Les commandes arrivent directement sur notre plateforme." },
                { n: "4", title: "Encaissez sous 48h", desc: "Après chaque cycle de livraisons confirmées, votre virement arrive sous 48 heures ouvrables." },
              ].map(s => (
                <div key={s.n} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-sm" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>{s.n}</div>
                  <div>
                    <h3 className="text-white font-bold mb-1">{s.title}</h3>
                    <p className="text-neutral-400 text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(220,38,38,0.1))", border: "1px solid rgba(249,115,22,0.2)" }}>
          <h2 className="text-2xl font-black text-white mb-3">Prêt à démarrer votre dropshipping COD ?</h2>
          <p className="text-neutral-400 mb-6 text-sm">Rejoignez 2 500+ marchands qui vendent en Cash on Delivery en Europe avec CODShipEurope.</p>
          <Link href="/?signup=1" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
            Créer mon compte gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related articles */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-white mb-6">Articles liés</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: "/dropshipping-cod-espagne", flag: "🇪🇸", label: "COD Espagne — Guide complet" },
              { href: "/dropshipping-cod-italie",  flag: "🇮🇹", label: "COD Italie — Le marché #1" },
              { href: "/dropshipping-cod-portugal",flag: "🇵🇹", label: "COD Portugal — Opportunités" },
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
