"use client"

import { useState } from "react"
import { useLang } from "@/hooks/useLang"
import Link from "next/link"
import { ArrowRight, Building2, Archive, Package, Phone, Truck, RotateCcw, CheckCircle, ChevronDown, Star, Zap, Globe2 } from "lucide-react"
import ProfitCalc from "@/components/fees/ProfitCalc"
import { NavHeader } from "@/components/NavHeader"

type Lang = "fr" | "en"

/* ── TRANSLATIONS ──────────────────────────────────────────────────── */
const T = {
  fr: {
    nav_pricing:   "Tarifs",
    nav_blog:      "Blog",
    nav_cta:       "Démarrer gratuitement",
    hero_badge:    "Transparent · Aucun frais caché",
    hero_h1a:      "6 frais.",
    hero_h1b:      "Rien d'autre.",
    hero_sub:      "Pas de frais d'installation, pas de minimum mensuel, pas de commission sur le chiffre d'affaires. Une structure de coûts limpide pour maximiser votre marge COD.",
    trust: ["Pas de frais d'installation", "Pas de minimum mensuel", "Pas de commission CA", "Paiement hebdomadaire automatique"],
    flow_badge:    "Flux des coûts",
    flow_h2:       "Quand chaque frais s'applique",
    flow_sub:      "Chaque euro dépensé est lié à une action précise. Aucune facturation surprise en fin de mois.",
    ship_badge:    "10 pays couverts",
    ship_h2:       "Tarifs de livraison par pays",
    ship_sub:      "Colis standard entre 300g et 1.5kg. Poids volumétrique et surcharges carburant inclus.",
    ship_cols:     ["Pays", "Transporteurs", "Délai", "Livraison", "Retour"],
    ship_note:     "Tarifs indicatifs pour colis standard (300g – 1.5kg). Contactez-nous pour les gabarits hors-norme, les zones insulaires ou les envois en palettes.",
    calc_badge:    "Simulateur",
    calc_h2:       "Calculez votre rentabilité",
    calc_sub:      "Entrez vos paramètres et obtenez une estimation de votre profit mensuel en tenant compte de tous les frais CODShipEurope.",
    cmp_h2:        "CODShipEurope vs gestion en solo",
    cmp_sub:       "Ce que vous évitez en rejoignant notre infrastructure.",
    cmp_col_you:   "En solo",
    cmp_col_us:    "CODShipEurope",
    cmp_col_what:  "Ce qu'il vous faut",
    cmp_rows: [
      ["Entrepôt européen",       "€800–3 000/mois",   "✓ Inclus gratuit"],
      ["Agents confirmation COD", "€1 500–5 000/mois", "✓ €1.20/lead"],
      ["Transporteurs COD",       "Contrats complexes","✓ Déjà négociés"],
      ["Dashboard + tracking",    "€200–800/mois SaaS","✓ Inclus plateforme"],
      ["Gestion des retours",     "Processus manuel",  "✓ Automatique"],
      ["Paiement hebdomadaire",   "30–60 jours",       "✓ Chaque lundi"],
    ],
    faq_h2: "Questions fréquentes",
    faq_sub: "Tout ce que vous devez savoir sur notre structure tarifaire.",
    faq: [
      { q: "L'abonnement inclut-il les frais de livraison ?", a: "Non. L'abonnement mensuel à €31.99 couvre l'accès à la plateforme (dashboard, API, wallet, support). Les frais de livraison, retour et centre d'appel sont facturés séparément par action." },
      { q: "Les frais de call center s'appliquent-ils aux leads non confirmés ?", a: "Oui. €1.20 s'applique à chaque lead traité par nos agents, confirmé ou non. Cela couvre le temps d'appel, le script multilingue et le suivi. Aucune commission sur le chiffre d'affaires." },
      { q: "Comment sont calculés les frais pour un colis hors-gabarit ?", a: "Les tarifs indiqués s'appliquent aux colis entre 300g et 1.5kg. Au-delà ou pour des dimensions spéciales, contactez notre équipe pour un devis. Les majorations poids sont transparentes et visibles avant expédition." },
      { q: "Y a-t-il des frais de stockage ou de palettisation ?", a: "Non. Le stockage dans nos entrepôts européens est entièrement gratuit. Aucun frais d'entrée marchandise, aucun frais de palettisation, aucune limite de durée." },
      { q: "Comment fonctionne le paiement hebdomadaire ?", a: "Chaque lundi, le montant COD collecté lors des livraisons de la semaine précédente est viré sur votre wallet. Vous pouvez ensuite le retirer vers votre compte bancaire (50+ banques supportées) en 1-2 jours ouvrés." },
      { q: "Peut-on avoir plusieurs pays dans le même abonnement ?", a: "Oui. Un seul abonnement à €31.99/mois couvre les 10 pays européens. Vous gérez toutes vos boutiques et tous vos marchés depuis un seul dashboard, sans frais additionnels par pays." },
    ],
    cta_stars:   "4.9 · 2 500+ marchands actifs",
    cta_h2a:     "Prêt à scaler votre",
    cta_h2b:     "business COD ?",
    cta_sub:     "Inscription en 2 minutes. Compte activé sous 24h. Première commande livrée dès cette semaine.",
    cta_primary: "Créer mon compte",
    cta_secondary:"Voir l'abonnement",
    cta_trust:   ["Compte activé sous 24h", "Sans engagement", "Support 7j/7", "Paiement chaque lundi"],
    footer_copy: "© 2025 CODShipEurope · Tous droits réservés.",
    footer_links:[["Accueil","/"],["Tarifs","/pricing"],["Frais","/fees"],["Blog","/blog"],["S'inscrire","/?signup=1"]],
  },
  en: {
    nav_pricing:   "Pricing",
    nav_blog:      "Blog",
    nav_cta:       "Start for free",
    hero_badge:    "Transparent · Zero hidden fees",
    hero_h1a:      "6 fees.",
    hero_h1b:      "Nothing else.",
    hero_sub:      "No setup fee, no monthly minimum, no revenue commission. A crystal-clear cost structure to maximise your COD margin.",
    trust: ["No setup fee", "No monthly minimum", "No revenue commission", "Automatic weekly payout"],
    flow_badge:    "Cost flow",
    flow_h2:       "When each fee applies",
    flow_sub:      "Every euro spent is tied to a specific action. No surprise invoices at end of month.",
    ship_badge:    "10 countries covered",
    ship_h2:       "Delivery rates by country",
    ship_sub:      "Standard parcels between 300g and 1.5kg. Volumetric weight and fuel surcharges included.",
    ship_cols:     ["Country", "Carriers", "Delay", "Delivery", "Return"],
    ship_note:     "Indicative rates for standard parcels (300g – 1.5kg). Contact us for oversized items, island zones or pallet shipments.",
    calc_badge:    "Simulator",
    calc_h2:       "Calculate your profitability",
    calc_sub:      "Enter your parameters and get a monthly profit estimate accounting for all CODShipEurope fees.",
    cmp_h2:        "CODShipEurope vs going solo",
    cmp_sub:       "What you avoid by joining our infrastructure.",
    cmp_col_you:   "Going solo",
    cmp_col_us:    "CODShipEurope",
    cmp_col_what:  "What you need",
    cmp_rows: [
      ["European warehouse",    "€800–3,000/mo",       "✓ Included free"],
      ["COD confirmation agents","€1,500–5,000/mo",    "✓ €1.20/lead"],
      ["COD carriers",          "Complex contracts",   "✓ Already negotiated"],
      ["Dashboard + tracking",  "€200–800/mo SaaS",    "✓ Included in plan"],
      ["Returns management",    "Manual process",      "✓ Fully automated"],
      ["Weekly payout",         "30–60 days",          "✓ Every Monday"],
    ],
    faq_h2: "Frequently asked questions",
    faq_sub: "Everything you need to know about our fee structure.",
    faq: [
      { q: "Does the subscription include shipping fees?", a: "No. The €31.99/month subscription covers platform access (dashboard, API, wallet, support). Delivery, return and call centre fees are billed separately per action." },
      { q: "Do call centre fees apply to unconfirmed leads?", a: "Yes. €1.20 applies to every lead handled by our agents, confirmed or not. This covers call time, multilingual scripting and follow-up. No revenue commission." },
      { q: "How are fees calculated for oversized parcels?", a: "Listed rates apply to parcels between 300g and 1.5kg. For larger dimensions or special sizes, contact our team for a quote. Weight surcharges are transparent and shown before dispatch." },
      { q: "Are there any storage or palletisation fees?", a: "No. Storage in our European warehouses is completely free. No inbound handling fees, no palletisation charges, no time limit." },
      { q: "How does the weekly payout work?", a: "Every Monday, the COD cash collected during the previous week's deliveries is credited to your CODShipEurope wallet. You can then withdraw to your bank account (50+ banks supported) within 1-2 business days." },
      { q: "Can I cover multiple countries under one subscription?", a: "Yes. A single €31.99/month subscription covers all 10 European countries. Manage all your stores and markets from one dashboard, with no extra charge per country." },
    ],
    cta_stars:    "4.9 · 2,500+ active merchants",
    cta_h2a:      "Ready to scale your",
    cta_h2b:      "COD business?",
    cta_sub:      "Sign up in 2 minutes. Account activated within 24h. First delivery this week.",
    cta_primary:  "Create my account",
    cta_secondary:"View subscription",
    cta_trust:    ["Account activated in 24h", "No commitment", "Support 7d/7", "Paid every Monday"],
    footer_copy:  "© 2025 CODShipEurope · All rights reserved.",
    footer_links: [["Home","/"],["Pricing","/pricing"],["Fees","/fees"],["Blog","/blog"],["Sign up","/?signup=1"]],
  },
} as const

/* ── FEES DATA ─────────────────────────────────────────────────────── */
const FEES = [
  {
    icon: Building2,
    label:   { fr:"MENSUEL",     en:"MONTHLY"    },
    name:    { fr:"Abonnement plateforme",   en:"Platform subscription" },
    amount:  "€31.99",
    period:  { fr:"/ mois", en:"/ month" },
    tag:     { fr:"Fixe",   en:"Fixed"  },
    tagColor:"#f97316", accentColor:"#f97316",
    glowColor:"rgba(249,115,22,0.15)", borderColor:"rgba(249,115,22,0.22)",
    when: { fr:"Accès illimité — boutiques, leads, commandes, analytics", en:"Unlimited access — stores, leads, orders, analytics" },
    desc: { fr:"Dashboard complet, intégration Shopify, wallet hebdomadaire, API, support 7j/7. Aucun surcoût lié au volume.", en:"Full dashboard, Shopify integration, weekly wallet, API, 24/7 support. No volume surcharge." },
  },
  {
    icon: Archive,
    label:   { fr:"STOCKAGE",   en:"STORAGE"  },
    name:    { fr:"Entreposage",             en:"Warehousing"       },
    amount:  { fr:"Gratuit",    en:"Free"     },
    period:  { fr:"",           en:""         },
    tag:     { fr:"GRATUIT",    en:"FREE"     },
    tagColor:"#10b981", accentColor:"#10b981",
    glowColor:"rgba(16,185,129,0.12)", borderColor:"rgba(16,185,129,0.20)",
    when: { fr:"Pour tous vos produits sans limite", en:"For all your products, no limit" },
    desc: { fr:"Vos produits stockés dans nos entrepôts européens. Zéro frais d'entrée, zéro frais de palettisation, zéro frais de gestion.", en:"Your products stored in our European warehouses. Zero inbound fee, zero palletisation, zero handling charge." },
  },
  {
    icon: Package,
    label:   { fr:"FULFILLMENT",  en:"FULFILLMENT" },
    name:    { fr:"Préparation commande",    en:"Order preparation"  },
    amount:  { fr:"Gratuit",      en:"Free"        },
    period:  { fr:"",             en:""            },
    tag:     { fr:"GRATUIT",      en:"FREE"        },
    tagColor:"#10b981", accentColor:"#10b981",
    glowColor:"rgba(16,185,129,0.12)", borderColor:"rgba(16,185,129,0.20)",
    when: { fr:"Inclus dans le prix de livraison", en:"Included in the delivery price" },
    desc: { fr:"Picking, packing, impression des étiquettes et remise transporteur. Tout inclus, aucune ligne de frais additionnelle.", en:"Picking, packing, label printing and handover to carrier. All included, no extra line item." },
  },
  {
    icon: Phone,
    label:   { fr:"PAR LEAD",   en:"PER LEAD" },
    name:    { fr:"Centre d'appel COD",      en:"COD call centre"   },
    amount:  "€1.20",
    period:  { fr:"/ lead", en:"/ lead" },
    tag:     { fr:"Par action", en:"Per action" },
    tagColor:"#f59e0b", accentColor:"#f59e0b",
    glowColor:"rgba(245,158,11,0.12)", borderColor:"rgba(245,158,11,0.20)",
    when: { fr:"Appliqué à tous les leads — confirmés ou non", en:"Applied to all leads — confirmed or not" },
    desc: { fr:"Agents natifs multilingues, scripts optimisés COD, horaires larges. Confirmés et non-confirmés facturés au même tarif.", en:"Native multilingual agents, COD-optimised scripts, wide operating hours. Confirmed and unconfirmed leads billed at the same rate." },
  },
  {
    icon: Truck,
    label:   { fr:"PAR COLIS",   en:"PER PARCEL" },
    name:    { fr:"Livraison COD",           en:"COD delivery"      },
    amount:  { fr:"Dès €3.80",   en:"From €3.80" },
    period:  { fr:"/ colis", en:"/ parcel" },
    tag:     { fr:"Variable", en:"Variable" },
    tagColor:"#6366f1", accentColor:"#6366f1",
    glowColor:"rgba(99,102,241,0.12)", borderColor:"rgba(99,102,241,0.20)",
    when: { fr:"Appliqué aux commandes confirmées expédiées", en:"Applied to confirmed orders dispatched" },
    desc: { fr:"Livraison 24-48h avec collecte du cash à la porte. Tarif selon pays et poids.", en:"24-48h delivery with cash collected at the door. Rate varies by country and weight." },
  },
  {
    icon: RotateCcw,
    label:   { fr:"PAR RETOUR",  en:"PER RETURN" },
    name:    { fr:"Retour colis",            en:"Parcel return"     },
    amount:  { fr:"Dès €2.50",   en:"From €2.50" },
    period:  { fr:"/ retour", en:"/ return" },
    tag:     { fr:"Variable", en:"Variable" },
    tagColor:"#f43f5e", accentColor:"#f43f5e",
    glowColor:"rgba(244,63,94,0.12)", borderColor:"rgba(244,63,94,0.20)",
    when: { fr:"Uniquement sur retours effectifs", en:"Only on actual returns" },
    desc: { fr:"Retour entrepôt en cas de refus ou d'absence. Suivi automatique dans votre dashboard, aucune démarche manuelle.", en:"Return to warehouse on refusal or absence. Automatically tracked in your dashboard, no manual process." },
  },
]

const COUNTRIES = [
  { flag:"🇮🇹", fr:"Italie",    en:"Italy",    sub:"BRT · GLS · DPD",       delay:"24-72h", ship:5.50, ret:3.20, noteFr:"Grande ville: 24h / Sud: 48-72h",     noteEn:"Major cities: 24h / South: 48-72h" },
  { flag:"🇪🇸", fr:"Espagne",   en:"Spain",    sub:"GLS · DPD · SEUR",      delay:"24-48h", ship:5.20, ret:3.50, noteFr:"Îles Canaries sur devis",              noteEn:"Canary Islands on request" },
  { flag:"🇵🇹", fr:"Portugal",  en:"Portugal", sub:"DPD · CTT Expresso",    delay:"24-48h", ship:6.20, ret:4.00, noteFr:"Madère / Açores sur devis",            noteEn:"Madeira / Azores on request" },
  { flag:"🇫🇷", fr:"France",    en:"France",   sub:"Colissimo · DPD",       delay:"24-48h", ship:5.80, ret:3.80, noteFr:"DOM-TOM sur devis",                    noteEn:"Overseas territories on request" },
  { flag:"🇷🇴", fr:"Roumanie",  en:"Romania",  sub:"FAN Courier · Cargus",  delay:"24-48h", ship:4.20, ret:2.80, noteFr:"Zones rurales: +0.80€",                noteEn:"Rural areas: +€0.80" },
  { flag:"🇧🇬", fr:"Bulgarie",  en:"Bulgaria", sub:"Speedy · Econt · DPD",  delay:"24-48h", ship:3.80, ret:2.50, noteFr:"Tarifs les plus compétitifs",          noteEn:"Most competitive rates" },
  { flag:"🇬🇷", fr:"Grèce",     en:"Greece",   sub:"ACS · Courier Center",  delay:"24-48h", ship:6.00, ret:4.20, noteFr:"Îles: +1.50€",                         noteEn:"Islands: +€1.50" },
  { flag:"🇭🇺", fr:"Hongrie",   en:"Hungary",  sub:"GLS Hungary · DPD",     delay:"24-48h", ship:4.50, ret:3.00, noteFr:"Livraison J+1 capitale",               noteEn:"Capital next-day delivery" },
  { flag:"🇨🇿", fr:"Tchéquie",  en:"Czechia",  sub:"DPD · PPL Parcel",      delay:"24-48h", ship:4.80, ret:3.20, noteFr:"Prague J+1 garanti",                   noteEn:"Prague next-day guaranteed" },
  { flag:"🇸🇰", fr:"Slovaquie", en:"Slovakia", sub:"DPD · GLS Slovakia",    delay:"24-48h", ship:4.80, ret:3.20, noteFr:"Livraison J+1 capitale",               noteEn:"Capital next-day delivery" },
]

const FLOW = [
  {
    step:"01",
    titleFr:"Lead reçu",       titleEn:"Lead received",
    subFr:"Form, WhatsApp, Shopify", subEn:"Form, WhatsApp, Shopify",
    fees:[{ nameFr:"Centre d'appel", nameEn:"Call centre", amount:"€1.20", color:"#f59e0b" }],
    descFr:"Chaque lead est appelé par nos agents. Le frais de confirmation s'applique qu'il soit accepté ou refusé.",
    descEn:"Every lead is called by our agents. The confirmation fee applies whether accepted or refused.",
    dot:"#f59e0b",
  },
  {
    step:"02",
    titleFr:"Commande confirmée", titleEn:"Order confirmed",
    subFr:"≈ 60% des leads",      subEn:"≈ 60% of leads",
    fees:[{ nameFr:"Livraison", nameEn:"Delivery", amount:"€3.80–6.20", color:"#6366f1" }],
    descFr:"La commande est préparée et expédiée. Fulfillment inclus dans le tarif de livraison.",
    descEn:"The order is prepared and dispatched. Fulfilment is included in the delivery rate.",
    dot:"#6366f1",
  },
  {
    step:"03",
    titleFr:"Commande livrée",    titleEn:"Order delivered",
    subFr:"≈ 72% des confirmées", subEn:"≈ 72% of confirmed",
    fees:[{ nameFr:"Paiement hebdo", nameEn:"Weekly payout", amount:"+ votre cash", color:"#10b981" }],
    descFr:"Le transporteur collecte le cash à la porte. Vous êtes payé chaque lundi automatiquement.",
    descEn:"The carrier collects cash at the door. You are paid every Monday automatically.",
    dot:"#10b981",
  },
  {
    step:"↩",
    titleFr:"Retour",             titleEn:"Return",
    subFr:"≈ 28% des confirmées", subEn:"≈ 28% of confirmed",
    fees:[{ nameFr:"Frais retour", nameEn:"Return fee", amount:"€2.50–4.20", color:"#f43f5e" }],
    descFr:"En cas de refus ou d'absence, le colis revient à l'entrepôt. Suivi automatique dans le dashboard.",
    descEn:"On refusal or absence, the parcel returns to the warehouse. Automatically tracked in the dashboard.",
    dot:"#f43f5e",
  },
]

/* ── HELPERS ──────────────────────────────────────────────────────── */
function tx<T extends { fr: string; en: string }>(obj: T | string, lang: Lang): string {
  if (typeof obj === "string") return obj
  return obj[lang]
}

/* ── MAIN CLIENT COMPONENT ────────────────────────────────────────── */
export default function FeesClient() {
  const [lang, setLang] = useLang()
  const t = T[lang]

  return (
    <div className="min-h-screen text-white" style={{ background: "#050505" }}>

      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]" style={{
        backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundRepeat:"repeat", backgroundSize:"256px",
      }} />

      <NavHeader lang={lang} setLang={setLang} activePage="fees" />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20"
            style={{ background:"radial-gradient(ellipse at 50% 0%, #f97316 0%, transparent 65%)" }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold uppercase tracking-widest"
            style={{ background:"rgba(249,115,22,0.08)", border:"1px solid rgba(249,115,22,0.22)", color:"#fb923c" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            {t.hero_badge}
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight mb-6">
            <span className="text-white">{t.hero_h1a}</span><br />
            <span style={{ background:"linear-gradient(135deg,#f97316 0%,#dc2626 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {t.hero_h1b}
            </span>
          </h1>
          <p className="text-neutral-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">{t.hero_sub}</p>
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-sm text-neutral-500">
            {t.trust.map((txt) => (
              <div key={txt} className="flex items-center gap-2">
                <span className="text-orange-500 text-xs">✦</span>
                <span>{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6 FEE CARDS ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEES.map((fee) => {
            const Icon = fee.icon
            const amount = tx(fee.amount, lang)
            const period = tx(fee.period, lang)
            const name   = tx(fee.name,   lang)
            const label  = tx(fee.label,  lang)
            const tag    = tx(fee.tag,    lang)
            const desc   = tx(fee.desc,   lang)
            const when   = tx(fee.when,   lang)
            return (
              <div key={name}
                className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{ background:`linear-gradient(135deg, ${fee.glowColor} 0%, rgba(5,5,5,0) 100%)`, border:`1px solid ${fee.borderColor}` }}>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow:`0 8px 40px ${fee.glowColor}`, background:`radial-gradient(ellipse at 50% 0%, ${fee.glowColor}, transparent 70%)` }} />

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background:fee.glowColor, border:`1px solid ${fee.borderColor}` }}>
                      <Icon style={{ width:17, height:17, color:fee.accentColor }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:fee.accentColor, opacity:0.7 }}>{label}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background:fee.glowColor, color:fee.tagColor, border:`1px solid ${fee.borderColor}` }}>
                    {tag}
                  </span>
                </div>

                <div className="mb-1">
                  <span className="text-3xl sm:text-4xl font-black leading-none" style={{ color:fee.accentColor }}>{amount}</span>
                  {period && <span className="text-sm text-neutral-600 ml-1">{period}</span>}
                </div>
                <h3 className="text-white font-bold text-base mb-3">{name}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed mb-4">{desc}</p>
                <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.055)" }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 flex-shrink-0" style={{ color:fee.accentColor }}>
                    {lang === "fr" ? "Quand" : "When"}
                  </span>
                  <span className="text-neutral-500 text-xs leading-relaxed">{when}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── COST FLOW ── */}
      <section className="py-20" style={{ background:"rgba(8,8,10,1)", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-widest"
              style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", color:"#818cf8" }}>
              <Zap style={{ width:12, height:12 }} />{t.flow_badge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{t.flow_h2}</h2>
            <p className="text-neutral-500 text-base max-w-xl mx-auto">{t.flow_sub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FLOW.map((f) => (
              <div key={f.step} className="rounded-2xl p-5 h-full flex flex-col"
                style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black"
                    style={{ background:f.dot + "18", border:`1.5px solid ${f.dot}44`, color:f.dot }}>
                    {f.step}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{lang === "fr" ? f.titleFr : f.titleEn}</p>
                    <p className="text-neutral-600 text-xs">{lang === "fr" ? f.subFr : f.subEn}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {f.fees.map(fee => (
                    <span key={fee.amount} className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background:fee.color + "14", border:`1px solid ${fee.color}30`, color:fee.color }}>
                      {lang === "fr" ? fee.nameFr : fee.nameEn} · {fee.amount}
                    </span>
                  ))}
                </div>
                <p className="text-neutral-600 text-xs leading-relaxed mt-auto">{lang === "fr" ? f.descFr : f.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHIPPING TABLE ── */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-widest"
            style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", color:"#818cf8" }}>
            <Globe2 style={{ width:12, height:12 }} />{t.ship_badge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{t.ship_h2}</h2>
          <p className="text-neutral-500 text-base max-w-xl mx-auto">{t.ship_sub}</p>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.07)" }}>
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-4"
            style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            {t.ship_cols.map(h => (
              <span key={h} className="text-xs font-bold text-neutral-600 uppercase tracking-widest">{h}</span>
            ))}
          </div>
          {COUNTRIES.map((c, i) => (
            <div key={c.en}
              className="group grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 transition-colors duration-150 hover:bg-white/[0.015]"
              style={{ borderBottom: i < COUNTRIES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">{c.flag}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{lang === "fr" ? c.fr : c.en}</p>
                  <p className="text-neutral-600 text-xs mt-0.5">{lang === "fr" ? c.noteFr : c.noteEn}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.sub.split(" · ").map(carrier => (
                  <span key={carrier} className="text-[10px] font-medium px-2 py-0.5 rounded-md text-neutral-500"
                    style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}>
                    {carrier}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-sm font-medium text-emerald-400">{c.delay}</span>
              </div>
              <div>
                <span className="text-base font-black text-white tabular-nums">€{c.ship.toFixed(2)}</span>
                <span className="text-neutral-600 text-xs ml-1">{lang === "fr" ? "/ colis" : "/ parcel"}</span>
              </div>
              <div>
                <span className="text-sm font-bold tabular-nums" style={{ color:"#f43f5e" }}>€{c.ret.toFixed(2)}</span>
                <span className="text-neutral-600 text-xs ml-1">{lang === "fr" ? "/ retour" : "/ return"}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-neutral-700 text-xs mt-4 text-center">{t.ship_note}</p>
      </section>

      {/* ── PROFIT CALCULATOR ── */}
      <section className="py-20" style={{ background:"rgba(8,8,10,1)", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-widest"
              style={{ background:"rgba(249,115,22,0.08)", border:"1px solid rgba(249,115,22,0.2)", color:"#fb923c" }}>
              <Star style={{ width:12, height:12 }} />{t.calc_badge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{t.calc_h2}</h2>
            <p className="text-neutral-500 text-base max-w-xl mx-auto">{t.calc_sub}</p>
          </div>
          <ProfitCalc lang={lang} />
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{t.cmp_h2}</h2>
          <p className="text-neutral-500 text-base max-w-xl mx-auto">{t.cmp_sub}</p>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.07)" }}>
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-6 py-4"
            style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">{t.cmp_col_what}</span>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-center">{t.cmp_col_you}</span>
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background:"rgba(249,115,22,0.12)", border:"1px solid rgba(249,115,22,0.3)", color:"#fb923c" }}>
                {t.cmp_col_us}
              </div>
            </div>
          </div>
          {t.cmp_rows.map(([feature, solo, us], i) => (
            <div key={feature} className="grid grid-cols-[2fr_1fr_1fr] gap-4 items-center px-6 py-4"
              style={{ borderBottom: i < t.cmp_rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <span className="text-sm text-neutral-300 font-medium">{feature}</span>
              <span className="text-sm text-neutral-600 text-center">{solo}</span>
              <span className="text-sm font-semibold text-center text-emerald-400">{us}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20" style={{ background:"rgba(8,8,10,1)", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{t.faq_h2}</h2>
            <p className="text-neutral-500">{t.faq_sub}</p>
          </div>
          <div className="space-y-3">
            {t.faq.map((item) => (
              <details key={item.q} className="group rounded-2xl overflow-hidden cursor-pointer"
                style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)" }}>
                <summary className="flex items-center justify-between gap-4 px-6 py-5 list-none select-none">
                  <span className="text-white font-semibold text-sm sm:text-base">{item.q}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-600 flex-shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-5">
                  <div className="h-px mb-4" style={{ background:"rgba(255,255,255,0.05)" }} />
                  <p className="text-neutral-400 text-sm leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
            style={{ background:"linear-gradient(135deg,rgba(249,115,22,0.08) 0%,rgba(220,38,38,0.06) 100%)", border:"1px solid rgba(249,115,22,0.18)" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px"
              style={{ background:"linear-gradient(90deg,transparent,rgba(249,115,22,0.5),transparent)" }} />
            <div className="flex items-center justify-center gap-1 mb-5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} style={{ width:16, height:16 }} className="text-orange-400 fill-orange-400" />
              ))}
              <span className="text-neutral-500 text-sm ml-2">{t.cta_stars}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              {t.cta_h2a}<br />
              <span style={{ background:"linear-gradient(135deg,#f97316,#dc2626)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                {t.cta_h2b}
              </span>
            </h2>
            <p className="text-neutral-400 text-lg mb-8 max-w-lg mx-auto">{t.cta_sub}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/?signup=1"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-white font-bold text-base transition-all hover:scale-105"
                style={{ background:"linear-gradient(135deg,#f97316,#dc2626)", boxShadow:"0 8px 40px rgba(249,115,22,0.4)" }}>
                {t.cta_primary} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-neutral-400 font-semibold text-base transition-colors hover:text-white"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                {t.cta_secondary}
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 mt-8 text-xs text-neutral-600">
              {t.cta_trust.map(txt => (
                <div key={txt} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-neutral-700" />
                  {txt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }} className="py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-700 text-sm">{t.footer_copy}</p>
          <div className="flex items-center gap-6">
            {t.footer_links.map(([l, h]) => (
              <Link key={h} href={h} className="text-neutral-700 hover:text-neutral-400 text-sm transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
