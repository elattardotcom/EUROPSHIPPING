"use client"

import Link from "next/link"
import { ArrowRight, ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react"
import { ArticleHeader } from "@/components/blog/ArticleHeader"
import { useLang } from "@/hooks/useLang"

const T = {
  fr: {
    backLabel: "Retour au blog",
    tag: "Stratégie",
    readTime: "8 min de lecture",
    date: "22 janvier 2025",
    h1: "COD vs Prépayé en dropshipping : quel modèle choisir en Europe ?",
    intro: "La question que se pose tout dropshipper qui envisage de vendre en Europe : faut-il opter pour le Cash on Delivery ou le paiement prépayé ? Les deux modèles ont leurs avantages. Ce comparatif vous aide à faire le bon choix.",
    s1Title: "Les différences fondamentales",
    s1intro: "Avant de comparer, voici la définition de chaque modèle :",
    codTitle: "💵 Cash on Delivery (COD)",
    codDesc: "Le client commande en ligne mais paie en espèces au moment de la livraison. Un agent téléphonique confirme la commande avant expédition.",
    prepaidTitle: "💳 Prépayé (CB en ligne)",
    prepaidDesc: "Le client paie par carte bancaire au moment de la commande. Vous encaissez immédiatement via Stripe, PayPal ou Shopify Payments.",
    s2Title: "Comparatif complet : COD vs Prépayé",
    tableHeaders: ["Critère", "COD", "Prépayé"],
    tableRows: [
      { critere: "Taux de conversion",    cod: "3-8%",       pre: "1-3%" },
      { critere: "Taux de retour",        cod: "15-25%",     pre: "5-10%" },
      { critere: "Délai d'encaissement",  cod: "48-72h",     pre: "Immédiat" },
      { critere: "Risque chargeback",     cod: "Aucun",      pre: "2-5%" },
      { critere: "Marché Italie",         cod: "✅ Idéal",   pre: "⚠️ Limité" },
      { critere: "Marché Espagne",        cod: "✅ Très bon", pre: "✅ Bon" },
      { critere: "Clientèle sans CB",     cod: "✅ Incluse", pre: "❌ Exclue" },
      { critere: "Coût confirmation",     cod: "~1.5€/cmd",  pre: "0€" },
      { critere: "Concurrence",           cod: "Faible",     pre: "Très élevée" },
    ],
    s3Title: "Les avantages du COD en Europe",
    advantages: [
      { title: "Taux de conversion 2 à 3x supérieur", desc: "Le client n'a pas à sortir sa carte, il n'y a pas de page de paiement à traverser. Le parcours d'achat est plus simple, ce qui booste massivement les conversions." },
      { title: "Clientèle plus large", desc: "En Italie, 30% des achats sont en COD. Ces acheteurs sont totalement exclus du prépayé. Le COD vous ouvre un marché inaccessible à vos concurrents." },
      { title: "Zéro risque de chargeback", desc: "Le client paye en espèces à la livraison. Impossible pour lui de contester le paiement après coup. Vos revenus sont sécurisés." },
      { title: "Moins de concurrence", desc: "La plupart des dropshippers utilisent le prépayé car c'est plus simple à mettre en place. Le COD nécessite un partenaire comme CODShipEurope, ce qui crée une barrière à l'entrée en votre faveur." },
    ],
    s4Title: "Les inconvénients du COD",
    disadvantages: [
      { title: "Taux de retour plus élevé", desc: "Entre 15 et 25% des colis sont refusés à la livraison. C'est pourquoi la confirmation d'appel est essentielle avant d'expédier." },
      { title: "Délai d'encaissement de 48-72h", desc: "Contrairement au prépayé où vous encaissez immédiatement, en COD vous attendez que la livraison soit effectuée et que les fonds soient rapatriés." },
      { title: "Processus plus complexe", desc: "Le COD nécessite un partenaire spécialisé (comme CODShipEurope), des agents de confirmation, et une logistique adaptée. Ce n'est pas aussi simple que d'ouvrir un compte Stripe." },
    ],
    s5Title: "Notre recommandation",
    recommendationBold: "Pour les marchés Europe du Sud (Italie, Espagne, Portugal) : ",
    recommendationHighlight: "COD en priorité",
    recommendationDesc: "Le taux de conversion supérieur et l'accès à un marché plus large compensent largement le taux de retour plus élevé. Sur ces marchés, le COD génère en moyenne 40% de revenus supplémentaires versus le prépayé.",
    recommendationTip: "La combinaison idéale : lancer en COD, puis ajouter une option prépayé pour capter les clients qui préfèrent payer en ligne. Vous maximisez ainsi votre couverture marché.",
    ctaTitle: "Lancez votre dropshipping COD en Europe",
    ctaDesc: "Connectez votre boutique Shopify et commencez à vendre en Cash on Delivery en Espagne, Portugal et Italie.",
    ctaBtn: "S'inscrire gratuitement",
    relatedTitle: "Articles liés",
    relatedLinks: [
      { href: "/blog/guide-dropshipping-cod-europe-2025", flag: "📖", label: "Guide complet COD Europe 2025" },
      { href: "/dropshipping-cod-espagne",                flag: "🇪🇸", label: "Dropshipping COD Espagne" },
    ],
    footerCopy: "© 2025 CODShipEurope. Tous droits réservés.",
    footerLinks: [["Accueil", "/"], ["Blog", "/blog"], ["Connexion", "/connect"], ["Conditions", "/conditions"]] as [string, string][],
  },
  en: {
    backLabel: "Back to blog",
    tag: "Strategy",
    readTime: "8 min read",
    date: "January 22, 2025",
    h1: "COD vs Prepaid dropshipping: which model to choose in Europe?",
    intro: "The question every dropshipper asks when considering selling in Europe: should you go for Cash on Delivery or prepaid payment? Both models have their advantages. This comparison helps you make the right choice.",
    s1Title: "The fundamental differences",
    s1intro: "Before comparing, here is the definition of each model:",
    codTitle: "💵 Cash on Delivery (COD)",
    codDesc: "The customer orders online but pays in cash at the time of delivery. A phone agent confirms the order before shipment.",
    prepaidTitle: "💳 Prepaid (online card payment)",
    prepaidDesc: "The customer pays by bank card at the time of ordering. You collect immediately via Stripe, PayPal or Shopify Payments.",
    s2Title: "Full comparison: COD vs Prepaid",
    tableHeaders: ["Criterion", "COD", "Prepaid"],
    tableRows: [
      { critere: "Conversion rate",      cod: "3-8%",       pre: "1-3%" },
      { critere: "Return rate",          cod: "15-25%",     pre: "5-10%" },
      { critere: "Collection delay",     cod: "48-72h",     pre: "Immediate" },
      { critere: "Chargeback risk",      cod: "None",       pre: "2-5%" },
      { critere: "Italy market",         cod: "✅ Ideal",   pre: "⚠️ Limited" },
      { critere: "Spain market",         cod: "✅ Very good", pre: "✅ Good" },
      { critere: "Customers without card", cod: "✅ Included", pre: "❌ Excluded" },
      { critere: "Confirmation cost",    cod: "~€1.50/order", pre: "€0" },
      { critere: "Competition",          cod: "Low",        pre: "Very high" },
    ],
    s3Title: "The advantages of COD in Europe",
    advantages: [
      { title: "Conversion rate 2 to 3x higher", desc: "The customer doesn't need to get their card out, there's no payment page to navigate. The purchase journey is simpler, which massively boosts conversions." },
      { title: "Wider customer base", desc: "In Italy, 30% of purchases are in COD. These buyers are completely excluded from prepaid. COD opens up a market that's inaccessible to your competitors." },
      { title: "Zero chargeback risk", desc: "The customer pays in cash on delivery. It's impossible for them to dispute the payment afterwards. Your revenue is secured." },
      { title: "Less competition", desc: "Most dropshippers use prepaid because it's simpler to set up. COD requires a partner like CODShipEurope, which creates a barrier to entry in your favour." },
    ],
    s4Title: "The disadvantages of COD",
    disadvantages: [
      { title: "Higher return rate", desc: "Between 15 and 25% of parcels are refused on delivery. That's why call confirmation is essential before shipping." },
      { title: "48-72h collection delay", desc: "Unlike prepaid where you collect immediately, with COD you wait for the delivery to be completed and funds to be repatriated." },
      { title: "More complex process", desc: "COD requires a specialised partner (like CODShipEurope), confirmation agents, and adapted logistics. It's not as simple as opening a Stripe account." },
    ],
    s5Title: "Our recommendation",
    recommendationBold: "For Southern European markets (Italy, Spain, Portugal): ",
    recommendationHighlight: "COD as a priority",
    recommendationDesc: "The higher conversion rate and access to a wider market more than compensate for the higher return rate. On these markets, COD generates on average 40% more revenue versus prepaid.",
    recommendationTip: "The ideal combination: launch with COD, then add a prepaid option to capture customers who prefer to pay online. This maximises your market coverage.",
    ctaTitle: "Launch your COD dropshipping in Europe",
    ctaDesc: "Connect your Shopify store and start selling Cash on Delivery in Spain, Portugal and Italy.",
    ctaBtn: "Sign up for free",
    relatedTitle: "Related articles",
    relatedLinks: [
      { href: "/blog/guide-dropshipping-cod-europe-2025", flag: "📖", label: "Complete COD Europe 2025 guide" },
      { href: "/dropshipping-cod-espagne",                flag: "🇪🇸", label: "COD Dropshipping Spain" },
    ],
    footerCopy: "© 2025 CODShipEurope. All rights reserved.",
    footerLinks: [["Home", "/"], ["Blog", "/blog"], ["Login", "/connect"], ["Terms", "/conditions"]] as [string, string][],
  },
}

interface Props {
  jsonLd: unknown
}

export function AvantagesContent({ jsonLd: _jsonLd }: Props) {
  const [lang] = useLang()
  const t = T[lang]

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <ArticleHeader />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-300 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t.backLabel}
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs px-2.5 py-1 rounded-full border font-medium bg-purple-500/15 text-purple-400 border-purple-500/25">{t.tag}</span>
          <span className="text-neutral-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {t.readTime}</span>
          <span className="text-neutral-500 text-xs">{t.date}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
          {t.h1}
        </h1>

        <p className="text-neutral-400 text-lg leading-relaxed mb-10 border-l-2 border-purple-500 pl-4">
          {t.intro}
        </p>

        <div className="space-y-10 text-neutral-300 leading-relaxed">

          <section>
            <h2 className="text-2xl font-black text-white mb-4">{t.s1Title}</h2>
            <p className="mb-6">{t.s1intro}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-900 border border-orange-500/30 rounded-2xl p-5">
                <h3 className="text-orange-400 font-bold mb-2">{t.codTitle}</h3>
                <p className="text-neutral-400 text-sm">{t.codDesc}</p>
              </div>
              <div className="bg-neutral-900 border border-blue-500/30 rounded-2xl p-5">
                <h3 className="text-blue-400 font-bold mb-2">{t.prepaidTitle}</h3>
                <p className="text-neutral-400 text-sm">{t.prepaidDesc}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">{t.s2Title}</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left p-4 text-neutral-500 font-medium">{t.tableHeaders[0]}</th>
                    <th className="text-left p-4 text-orange-400 font-bold">{t.tableHeaders[1]}</th>
                    <th className="text-left p-4 text-blue-400 font-bold">{t.tableHeaders[2]}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.tableRows.map(row => (
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
            <h2 className="text-2xl font-black text-white mb-4">{t.s3Title}</h2>
            <div className="space-y-3">
              {t.advantages.map(a => (
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
            <h2 className="text-2xl font-black text-white mb-4">{t.s4Title}</h2>
            <div className="space-y-3">
              {t.disadvantages.map(a => (
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
            <h2 className="text-2xl font-black text-white mb-4">{t.s5Title}</h2>
            <div className="bg-neutral-900 border border-orange-500/30 rounded-2xl p-6">
              <p className="text-white font-bold mb-3">
                {t.recommendationBold}<span className="text-orange-400">{t.recommendationHighlight}</span>
              </p>
              <p className="text-neutral-400 text-sm mb-4">{t.recommendationDesc}</p>
              <p className="text-neutral-500 text-xs">{t.recommendationTip}</p>
            </div>
          </section>

        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(220,38,38,0.1))", border: "1px solid rgba(249,115,22,0.2)" }}>
          <h2 className="text-2xl font-black text-white mb-3">{t.ctaTitle}</h2>
          <p className="text-neutral-400 mb-6 text-sm">{t.ctaDesc}</p>
          <Link href="/?signup=1" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
            {t.ctaBtn} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related articles */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-white mb-6">{t.relatedTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.relatedLinks.map(l => (
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
