"use client"

import Link from "next/link"
import { ArrowRight, ArrowLeft, Clock, CheckCircle } from "lucide-react"
import { ArticleHeader } from "@/components/blog/ArticleHeader"
import { useLang } from "@/hooks/useLang"

const T = {
  fr: {
    backLabel: "Retour au blog",
    tag: "Guide",
    readTime: "12 min de lecture",
    date: "15 janvier 2025",
    h1: "Guide complet du dropshipping COD en Europe (2025)",
    intro: "Le dropshipping Cash on Delivery (COD) en Europe est l'une des opportunités business les plus sous-estimées de 2025. Ce guide vous donne toutes les clés pour comprendre ce modèle, choisir vos marchés et maximiser vos revenus.",
    tocTitle: "Sommaire",
    toc: [
      "Qu'est-ce que le dropshipping COD ?",
      "Pourquoi le COD est-il si populaire en Europe ?",
      "Les meilleurs marchés COD en Europe",
      "Comment fonctionne la confirmation d'appel ?",
      "Choisir ses transporteurs pour le COD",
      "Comment calculer ses marges en COD ?",
      "Les erreurs à éviter en dropshipping COD",
      "Comment démarrer avec CODShipEurope ?",
    ],
    s1Title: "1. Qu'est-ce que le dropshipping COD ?",
    s1p1: <>Le <strong className="text-white">dropshipping COD (Cash on Delivery)</strong> est un modèle de commerce électronique où votre client paie sa commande au moment de la livraison, en espèces. Contrairement au e-commerce classique où le paiement se fait en ligne par carte, le COD permet de vendre à des clients qui ne font pas confiance aux paiements en ligne.</>,
    s1p2: <>Dans ce modèle, vous créez une boutique en ligne (généralement sur Shopify), vous diffusez des publicités (Facebook Ads, TikTok Ads), et lorsqu&apos;un client commande, votre partenaire COD appelle le client pour confirmer la commande, puis expédie le colis avec collecte du paiement à la livraison.</>,
    s1p3: <>Le COD vous permet de toucher un segment de marché énorme — les personnes qui achètent en ligne mais paient en espèces — qui représente dans certains pays européens plus de 30% des transactions e-commerce.</>,
    s2Title: "2. Pourquoi le COD est-il si populaire en Europe ?",
    s2p1: <>Contrairement aux idées reçues, le Cash on Delivery n&apos;est pas uniquement une pratique des pays en développement. En Europe du Sud, les habitudes de paiement sont fondamentalement différentes de l&apos;Europe du Nord.</>,
    countryStats: [
      { country: "🇮🇹 Italie", stat: "30%", desc: "des achats en ligne en COD" },
      { country: "🇪🇸 Espagne", stat: "18%", desc: "des achats en ligne en COD" },
      { country: "🇵🇹 Portugal", stat: "15%", desc: "des achats en ligne en COD" },
    ],
    s2p2: <>Les raisons de cette popularité sont multiples : méfiance culturelle envers les paiements en ligne, habitudes historiques d&apos;achat en espèces, protection contre la fraude perçue par les acheteurs, et accessibilité aux personnes sans carte bancaire.</>,
    s2p3: <>Pour les dropshippers, cela représente un <strong className="text-white">marché inexploité</strong> où la concurrence est largement inférieure à celle du e-commerce traditionnel.</>,
    s3Title: "3. Les meilleurs marchés COD en Europe",
    s3intro: "Tous les marchés européens ne se valent pas pour le COD. Voici notre classement basé sur le volume, les marges et la facilité d'entrée :",
    markets: [
      {
        flag: "🇮🇹", country: "Italie", score: "9.5/10",
        pros: ["Plus grand marché COD d'Europe", "60M d'habitants", "30% des achats en COD", "Panier moyen élevé (55-80€)"],
        cons: ["Taux de retour Sud plus élevé", "Délais J+3 pour le Sud"],
        scoreLabel: "Score COD :",
        prosLabel: "✅ Avantages",
        consLabel: "⚠️ Points d'attention",
        guideLabel: "Guide COD",
      },
      {
        flag: "🇪🇸", country: "Espagne", score: "9/10",
        pros: ["85%+ taux de livraison", "Livraison 24-48h", "Très bonne couverture réseau", "Marché stable et mature"],
        cons: ["Concurrence COD en hausse", "Coût pub en augmentation"],
        scoreLabel: "Score COD :",
        prosLabel: "✅ Avantages",
        consLabel: "⚠️ Points d'attention",
        guideLabel: "Guide COD",
      },
      {
        flag: "🇵🇹", country: "Portugal", score: "8/10",
        pros: ["Moins de concurrence", "Marché en croissance", "82%+ taux de livraison", "Clients très fidèles"],
        cons: ["Volume plus faible", "Îles coûtent plus cher"],
        scoreLabel: "Score COD :",
        prosLabel: "✅ Avantages",
        consLabel: "⚠️ Points d'attention",
        guideLabel: "Guide COD",
      },
    ],
    marketGuide: "complet",
    s4Title: "4. Comment fonctionne la confirmation d'appel ?",
    s4p1: <>La <strong className="text-white">confirmation d&apos;appel</strong> est l&apos;étape la plus critique du dropshipping COD. C&apos;est un appel téléphonique passé au client entre sa commande et l&apos;expédition du colis, pour confirmer qu&apos;il est bien conscient de son achat et qu&apos;il sera présent pour recevoir et payer le colis.</>,
    s4p2: <>Sans confirmation, le taux de retour peut atteindre 40-60% — ce qui signifie que vous payez les frais de port dans les deux sens sans encaisser rien. Avec une bonne confirmation, on descend à 10-20% de retours.</>,
    s4p3: "Les éléments d'une bonne confirmation d'appel :",
    s4items: [
      "Agent natif dans la langue du pays cible (espagnol natif, non traduit)",
      "Script d'appel professionnel et rassurant",
      "Confirmation de l'adresse exacte de livraison",
      "Rappel du montant à payer à la livraison",
      "Option de reprogrammation si le client n'est pas disponible",
    ],
    s4p4: "Chez CODShipEurope, nos agents natifs atteignent un taux de confirmation moyen de 75-85%, contre 50-60% pour des agents non natifs.",
    s5Title: "5. Choisir ses transporteurs pour le COD",
    s5p1: "Tous les transporteurs ne font pas du Cash on Delivery. Voici les meilleurs par pays :",
    tableHeaders: ["Pays", "Transporteurs COD", "Délai"],
    carriers: [
      { pays: "🇮🇹 Italie",    transporteurs: "BRT, GLS Italy, DPD", delai: "24-72h" },
      { pays: "🇪🇸 Espagne",   transporteurs: "GLS España, DPD, SEUR", delai: "24-48h" },
      { pays: "🇵🇹 Portugal",  transporteurs: "DPD Portugal, CTT", delai: "24-48h" },
      { pays: "🇷🇴 Roumanie",  transporteurs: "FAN Courier, Cargus, DPD", delai: "24-48h" },
      { pays: "🇧🇬 Bulgarie",  transporteurs: "Speedy, Econt, DPD", delai: "24-48h" },
    ],
    s6Title: "6. Comment calculer ses marges en COD ?",
    s6p1: "Le calcul de rentabilité en COD est différent du e-commerce classique. Voici la formule :",
    s6FormulaTitle: "Formule de rentabilité COD",
    s6rows: [
      { label: "Prix de vente", value: "+ 60€", positive: true },
      { label: "Coût produit + shipping fournisseur", value: "- 15€", positive: false },
      { label: "Frais de livraison COD", value: "- 6€", positive: false },
      { label: "Coût confirmation d'appel", value: "- 1.5€", positive: false },
      { label: "Coût pub (CPO publicitaire)", value: "- 8€", positive: false },
      { label: "Frais retour (taux 20%)", value: "- 2.4€", positive: false },
    ],
    s6netLabel: "Marge nette / commande livrée",
    s6netValue: "= 27.1€",
    s6p2: <>Avec un taux de livraison de 85% et 20 commandes/jour, cela représente <strong className="text-white">17 commandes livrées × 27€ = 459€ de profit quotidien</strong>.</>,
    s7Title: "7. Les erreurs à éviter en dropshipping COD",
    s7errors: [
      { title: "❌ Utiliser des agents non natifs", desc: "Un agent marocain qui appelle en espagnol avec un accent étranger divise le taux de confirmation par 2. Toujours utiliser des natifs." },
      { title: "❌ Expédier sans confirmer", desc: "C'est l'erreur la plus coûteuse. Sans confirmation, attendez-vous à 40-60% de retours. Toujours confirmer avant d'expédier." },
      { title: "❌ Ignorer les taux de retour par région", desc: "Le Sud de l'Italie et certaines régions d'Espagne ont des taux de retour plus élevés. Adaptez vos CPO pub en conséquence." },
      { title: "❌ Mauvais calcul de marge", desc: "Ne pas inclure les frais de retour dans vos calculs fausse complètement votre rentabilité. Comptez toujours 15-25% de retours." },
      { title: "❌ Produit inadapté au COD", desc: "Les produits trop chers (+150€) ont des taux de retour très élevés en COD. La zone de confort est 30-80€." },
    ],
    s8Title: "8. Comment démarrer avec CODShipEurope ?",
    s8intro: "Démarrer en dropshipping COD avec CODShipEurope prend moins de 24 heures :",
    s8steps: [
      { n: "1", title: "Créez votre compte", desc: "Inscrivez-vous sur CODShipEurope et choisissez votre plan selon votre volume de commandes." },
      { n: "2", title: "Connectez votre boutique Shopify", desc: "En 5 minutes, vos commandes sont synchronisées automatiquement. Aucune manipulation manuelle." },
      { n: "3", title: "Lancez vos publicités", desc: "Démarrez vos campagnes Facebook ou TikTok Ads. Les commandes arrivent directement sur notre plateforme." },
      { n: "4", title: "Encaissez sous 48h", desc: "Après chaque cycle de livraisons confirmées, votre virement arrive sous 48 heures ouvrables." },
    ],
    ctaTitle: "Prêt à démarrer votre dropshipping COD ?",
    ctaDesc: "Rejoignez 2 500+ marchands qui vendent en Cash on Delivery en Europe avec CODShipEurope.",
    ctaBtn: "Créer mon compte gratuitement",
    relatedTitle: "Articles liés",
    relatedLinks: [
      { href: "/dropshipping-cod-espagne",  flag: "🇪🇸", label: "COD Espagne — Guide complet" },
      { href: "/dropshipping-cod-italie",   flag: "🇮🇹", label: "COD Italie — Le marché #1" },
      { href: "/dropshipping-cod-portugal", flag: "🇵🇹", label: "COD Portugal — Opportunités" },
    ],
    footerCopy: "© 2025 CODShipEurope. Tous droits réservés.",
    footerLinks: [["Accueil", "/"], ["Blog", "/blog"], ["Connexion", "/connect"], ["Conditions", "/conditions"]] as [string, string][],
  },
  en: {
    backLabel: "Back to blog",
    tag: "Guide",
    readTime: "12 min read",
    date: "January 15, 2025",
    h1: "Complete guide to COD dropshipping in Europe (2025)",
    intro: "COD (Cash on Delivery) dropshipping in Europe is one of the most underrated business opportunities of 2025. This guide gives you all the keys to understand the model, choose your markets and maximise your revenue.",
    tocTitle: "Table of contents",
    toc: [
      "What is COD dropshipping?",
      "Why is COD so popular in Europe?",
      "The best COD markets in Europe",
      "How does call confirmation work?",
      "Choosing carriers for COD",
      "How to calculate your COD margins?",
      "Mistakes to avoid in COD dropshipping",
      "How to get started with CODShipEurope?",
    ],
    s1Title: "1. What is COD dropshipping?",
    s1p1: <><strong className="text-white">COD (Cash on Delivery) dropshipping</strong> is an e-commerce model where your customer pays for their order at the time of delivery, in cash. Unlike standard e-commerce where payment is made online by card, COD lets you sell to customers who don&apos;t trust online payments.</>,
    s1p2: <>In this model, you create an online store (usually on Shopify), run ads (Facebook Ads, TikTok Ads), and when a customer orders, your COD partner calls the customer to confirm the order, then ships the parcel with cash collection on delivery.</>,
    s1p3: <>COD lets you reach a huge market segment — people who shop online but pay in cash — which in some European countries accounts for more than 30% of e-commerce transactions.</>,
    s2Title: "2. Why is COD so popular in Europe?",
    s2p1: <>Contrary to popular belief, Cash on Delivery is not only a practice in developing countries. In Southern Europe, payment habits are fundamentally different from Northern Europe.</>,
    countryStats: [
      { country: "🇮🇹 Italy",    stat: "30%", desc: "of online purchases in COD" },
      { country: "🇪🇸 Spain",    stat: "18%", desc: "of online purchases in COD" },
      { country: "🇵🇹 Portugal", stat: "15%", desc: "of online purchases in COD" },
    ],
    s2p2: <>The reasons for this popularity are multiple: cultural distrust of online payments, historical cash-buying habits, perceived fraud protection for buyers, and accessibility for people without a bank card.</>,
    s2p3: <>For dropshippers, this represents an <strong className="text-white">untapped market</strong> where competition is significantly lower than traditional e-commerce.</>,
    s3Title: "3. The best COD markets in Europe",
    s3intro: "Not all European markets are equal for COD. Here is our ranking based on volume, margins and ease of entry:",
    markets: [
      {
        flag: "🇮🇹", country: "Italy", score: "9.5/10",
        pros: ["Largest COD market in Europe", "60M inhabitants", "30% of purchases in COD", "High average basket (€55-80)"],
        cons: ["Higher return rate in the South", "D+3 delays for the South"],
        scoreLabel: "COD Score:",
        prosLabel: "✅ Advantages",
        consLabel: "⚠️ Watch points",
        guideLabel: "Full COD guide",
      },
      {
        flag: "🇪🇸", country: "Spain", score: "9/10",
        pros: ["85%+ delivery rate", "24-48h delivery", "Very good network coverage", "Stable and mature market"],
        cons: ["Rising COD competition", "Increasing ad costs"],
        scoreLabel: "COD Score:",
        prosLabel: "✅ Advantages",
        consLabel: "⚠️ Watch points",
        guideLabel: "Full COD guide",
      },
      {
        flag: "🇵🇹", country: "Portugal", score: "8/10",
        pros: ["Less competition", "Growing market", "82%+ delivery rate", "Very loyal customers"],
        cons: ["Lower volume", "Islands cost more"],
        scoreLabel: "COD Score:",
        prosLabel: "✅ Advantages",
        consLabel: "⚠️ Watch points",
        guideLabel: "Full COD guide",
      },
    ],
    marketGuide: "",
    s4Title: "4. How does call confirmation work?",
    s4p1: <><strong className="text-white">Call confirmation</strong> is the most critical step in COD dropshipping. It&apos;s a phone call made to the customer between their order and shipment, to confirm they are aware of their purchase and will be available to receive and pay for the parcel.</>,
    s4p2: <>Without confirmation, the return rate can reach 40-60% — meaning you pay shipping costs in both directions without collecting anything. With good confirmation, returns drop to 10-20%.</>,
    s4p3: "Elements of a good call confirmation:",
    s4items: [
      "Native agent in the language of the target country (native Spanish, not translated)",
      "Professional and reassuring call script",
      "Confirmation of the exact delivery address",
      "Reminder of the amount to be paid on delivery",
      "Rescheduling option if the customer is unavailable",
    ],
    s4p4: "At CODShipEurope, our native agents achieve an average confirmation rate of 75-85%, versus 50-60% for non-native agents.",
    s5Title: "5. Choosing carriers for COD",
    s5p1: "Not all carriers offer Cash on Delivery. Here are the best ones by country:",
    tableHeaders: ["Country", "COD Carriers", "Delay"],
    carriers: [
      { pays: "🇮🇹 Italy",    transporteurs: "BRT, GLS Italy, DPD",  delai: "24-72h" },
      { pays: "🇪🇸 Spain",    transporteurs: "GLS España, DPD, SEUR", delai: "24-48h" },
      { pays: "🇵🇹 Portugal", transporteurs: "DPD Portugal, CTT",     delai: "24-48h" },
      { pays: "🇷🇴 Romania",  transporteurs: "FAN Courier, Cargus, DPD", delai: "24-48h" },
      { pays: "🇧🇬 Bulgaria", transporteurs: "Speedy, Econt, DPD",    delai: "24-48h" },
    ],
    s6Title: "6. How to calculate your COD margins?",
    s6p1: "The profitability calculation for COD is different from standard e-commerce. Here is the formula:",
    s6FormulaTitle: "COD profitability formula",
    s6rows: [
      { label: "Sale price",                        value: "+ €60",   positive: true },
      { label: "Product cost + supplier shipping",  value: "- €15",   positive: false },
      { label: "COD delivery fee",                  value: "- €6",    positive: false },
      { label: "Call confirmation cost",            value: "- €1.50", positive: false },
      { label: "Ad cost (advertising CPO)",         value: "- €8",    positive: false },
      { label: "Return costs (20% rate)",           value: "- €2.40", positive: false },
    ],
    s6netLabel: "Net margin / delivered order",
    s6netValue: "= €27.10",
    s6p2: <>With a delivery rate of 85% and 20 orders/day, that equals <strong className="text-white">17 delivered orders × €27 = €459 daily profit</strong>.</>,
    s7Title: "7. Mistakes to avoid in COD dropshipping",
    s7errors: [
      { title: "❌ Using non-native agents", desc: "A Moroccan agent calling in Spanish with a foreign accent halves the confirmation rate. Always use native speakers." },
      { title: "❌ Shipping without confirming", desc: "This is the most costly mistake. Without confirmation, expect 40-60% returns. Always confirm before shipping." },
      { title: "❌ Ignoring return rates by region", desc: "Southern Italy and some Spanish regions have higher return rates. Adjust your advertising CPOs accordingly." },
      { title: "❌ Poor margin calculation", desc: "Not including return costs in your calculations completely distorts your profitability. Always count 15-25% returns." },
      { title: "❌ Product unsuitable for COD", desc: "Products that are too expensive (+€150) have very high return rates in COD. The comfort zone is €30-80." },
    ],
    s8Title: "8. How to get started with CODShipEurope?",
    s8intro: "Getting started with COD dropshipping via CODShipEurope takes less than 24 hours:",
    s8steps: [
      { n: "1", title: "Create your account",           desc: "Sign up on CODShipEurope and choose your plan based on your order volume." },
      { n: "2", title: "Connect your Shopify store",    desc: "In 5 minutes, your orders are automatically synchronised. No manual handling." },
      { n: "3", title: "Launch your ads",               desc: "Start your Facebook or TikTok Ads campaigns. Orders arrive directly on our platform." },
      { n: "4", title: "Get paid within 48h",           desc: "After each cycle of confirmed deliveries, your bank transfer arrives within 48 business hours." },
    ],
    ctaTitle: "Ready to start your COD dropshipping?",
    ctaDesc: "Join 2,500+ merchants selling Cash on Delivery in Europe with CODShipEurope.",
    ctaBtn: "Create my free account",
    relatedTitle: "Related articles",
    relatedLinks: [
      { href: "/dropshipping-cod-espagne",  flag: "🇪🇸", label: "COD Spain — Complete guide" },
      { href: "/dropshipping-cod-italie",   flag: "🇮🇹", label: "COD Italy — The #1 market" },
      { href: "/dropshipping-cod-portugal", flag: "🇵🇹", label: "COD Portugal — Opportunities" },
    ],
    footerCopy: "© 2025 CODShipEurope. All rights reserved.",
    footerLinks: [["Home", "/"], ["Blog", "/blog"], ["Login", "/connect"], ["Terms", "/conditions"]] as [string, string][],
  },
}

interface Props {
  jsonLd: unknown
}

export function GuideContent({ jsonLd: _jsonLd }: Props) {
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
          <span className="text-xs px-2.5 py-1 rounded-full border font-medium bg-orange-500/15 text-orange-400 border-orange-500/25">{t.tag}</span>
          <span className="text-neutral-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {t.readTime}</span>
          <span className="text-neutral-500 text-xs">{t.date}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
          {t.h1}
        </h1>

        <p className="text-neutral-400 text-lg leading-relaxed mb-10 border-l-2 border-orange-500 pl-4">
          {t.intro}
        </p>

        {/* Table of contents */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-10">
          <h2 className="text-white font-bold mb-4">{t.tocTitle}</h2>
          <ol className="space-y-2 text-sm">
            {t.toc.map((item, i) => (
              <li key={i} className="text-neutral-400 hover:text-orange-400 transition-colors cursor-pointer">
                <span className="text-orange-500 font-bold">{i + 1}.</span> {item}
              </li>
            ))}
          </ol>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-neutral-300 leading-relaxed">

          <section>
            <h2 className="text-2xl font-black text-white mb-4">{t.s1Title}</h2>
            <p className="mb-4">{t.s1p1}</p>
            <p className="mb-4">{t.s1p2}</p>
            <p>{t.s1p3}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">{t.s2Title}</h2>
            <p className="mb-4">{t.s2p1}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              {t.countryStats.map(c => (
                <div key={c.country} className="bg-neutral-800 rounded-xl p-4 text-center">
                  <div className="text-lg mb-1">{c.country}</div>
                  <div className="text-2xl font-black text-orange-400 mb-1">{c.stat}</div>
                  <div className="text-neutral-500 text-xs">{c.desc}</div>
                </div>
              ))}
            </div>
            <p className="mb-4">{t.s2p2}</p>
            <p>{t.s2p3}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">{t.s3Title}</h2>
            <p className="mb-6">{t.s3intro}</p>
            <div className="space-y-4">
              {t.markets.map(m => (
                <div key={m.country} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{m.flag}</span>
                    <div>
                      <h3 className="text-white font-bold">{m.country}</h3>
                      <span className="text-orange-400 text-sm font-bold">{m.scoreLabel} {m.score}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-emerald-400 font-semibold mb-2">{m.prosLabel}</p>
                      <ul className="space-y-1">{m.pros.map(p => <li key={p} className="text-neutral-400 text-xs flex gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />{p}</li>)}</ul>
                    </div>
                    <div>
                      <p className="text-xs text-red-400 font-semibold mb-2">{m.consLabel}</p>
                      <ul className="space-y-1">{m.cons.map(c => <li key={c} className="text-neutral-400 text-xs">• {c}</li>)}</ul>
                    </div>
                  </div>
                  <Link href={`/dropshipping-cod-${m.country.toLowerCase()}`} className="inline-flex items-center gap-1 text-orange-400 text-xs font-semibold mt-4 hover:text-orange-300 transition-colors">
                    {m.guideLabel} {m.country} {t.marketGuide} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">{t.s4Title}</h2>
            <p className="mb-4">{t.s4p1}</p>
            <p className="mb-4">{t.s4p2}</p>
            <p className="mb-4">{t.s4p3}</p>
            <ul className="space-y-2 mb-4">
              {t.s4items.map(item => (
                <li key={item} className="flex items-start gap-2 text-neutral-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <p>{t.s4p4}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">{t.s5Title}</h2>
            <p className="mb-4">{t.s5p1}</p>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800">
                    {t.tableHeaders.map(h => (
                      <th key={h} className="text-left p-4 text-neutral-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.carriers.map(row => (
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
            <h2 className="text-2xl font-black text-white mb-4">{t.s6Title}</h2>
            <p className="mb-4">{t.s6p1}</p>
            <div className="bg-neutral-900 border border-orange-500/30 rounded-2xl p-6 my-6">
              <p className="text-orange-400 font-bold mb-3">{t.s6FormulaTitle}</p>
              <div className="space-y-2 text-sm">
                {t.s6rows.map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-neutral-400">{row.label}</span>
                    <span className={row.positive ? "text-white font-bold" : "text-red-400"}>{row.value}</span>
                  </div>
                ))}
                <div className="h-px bg-neutral-700 my-2" />
                <div className="flex justify-between">
                  <span className="text-white font-bold">{t.s6netLabel}</span>
                  <span className="text-emerald-400 font-black">{t.s6netValue}</span>
                </div>
              </div>
            </div>
            <p>{t.s6p2}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">{t.s7Title}</h2>
            <div className="space-y-3">
              {t.s7errors.map(e => (
                <div key={e.title} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                  <h3 className="text-white font-bold mb-1 text-sm">{e.title}</h3>
                  <p className="text-neutral-500 text-sm">{e.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">{t.s8Title}</h2>
            <p className="mb-6">{t.s8intro}</p>
            <div className="space-y-4">
              {t.s8steps.map(s => (
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
          <h2 className="text-2xl font-black text-white mb-3">{t.ctaTitle}</h2>
          <p className="text-neutral-400 mb-6 text-sm">{t.ctaDesc}</p>
          <Link href="/?signup=1" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
            {t.ctaBtn} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related articles */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-white mb-6">{t.relatedTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
