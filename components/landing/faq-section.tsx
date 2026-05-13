"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"
import { Lang } from "@/lib/landing-translations"

const FAQS = {
  en: [
    {
      q: "How does the 48h bank transfer work?",
      a: "As soon as a COD delivery is confirmed, the amount is credited to your CODShipEurope wallet. You can request a transfer at any time — we process all requests within 48 business hours directly to your bank account (IBAN, Wise or crypto).",
    },
    {
      q: "How many Shopify stores can I connect?",
      a: "With the Starter plan: 1 store. Pro: up to 3 stores. Enterprise: unlimited. Connection takes less than 2 minutes via our Shopify app — each new order appears instantly in your CODShipEurope dashboard.",
    },
    {
      q: "Which countries are covered?",
      a: "CODShipEurope currently covers 10 European countries: 🇪🇸 Spain, 🇵🇹 Portugal, 🇮🇹 Italy, 🇷🇴 Romania, 🇧🇬 Bulgaria, 🇭🇺 Hungary, 🇬🇷 Greece, 🇸🇰 Slovakia, 🇸🇮 Slovenia and 🇨🇿 Czech Republic. More markets are being integrated.",
    },
    {
      q: "Is the 14-day trial really free?",
      a: "Yes, 100% free. No credit card required to sign up. You get full access to all Pro plan features for 14 days. At the end of the trial, you freely choose your plan or stop — no commitment.",
    },
    {
      q: "How does CODShipEurope secure my data and transactions?",
      a: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Our servers are hosted in Europe (GDPR compliant). Financial transactions go through PCI-DSS certified partners. We never store your full banking details.",
    },
    {
      q: "Can I use CODShipEurope with multiple team members?",
      a: "Pro and Enterprise plans support multiple users with different access levels (admin, confirmation agent, accountant). You can invite your team and manage permissions from settings.",
    },
  ],
  fr: [
    {
      q: "Comment fonctionne le virement en 48h ?",
      a: "Dès qu'une livraison COD est confirmée, le montant est crédité sur votre wallet CODShipEurope. Vous pouvez demander un virement à tout moment — nous traitons toutes les demandes sous 48h ouvrées directement sur votre compte bancaire (IBAN, Wise ou crypto).",
    },
    {
      q: "Combien de boutiques Shopify puis-je connecter ?",
      a: "Avec le plan Starter : 1 boutique. Pro : jusqu'à 3 boutiques. Enterprise : illimité. La connexion se fait en moins de 2 minutes via notre app Shopify — chaque nouvelle commande arrive instantanément dans votre dashboard CODShipEurope.",
    },
    {
      q: "Quels pays sont couverts ?",
      a: "CODShipEurope couvre actuellement 10 pays européens : 🇪🇸 Espagne, 🇵🇹 Portugal, 🇮🇹 Italie, 🇷🇴 Roumanie, 🇧🇬 Bulgarie, 🇭🇺 Hongrie, 🇬🇷 Grèce, 🇸🇰 Slovaquie, 🇸🇮 Slovénie et 🇨🇿 République Tchèque. D'autres marchés sont en cours d'intégration.",
    },
    {
      q: "Est-ce que les essais de 14 jours sont vraiment gratuits ?",
      a: "Oui, 100% gratuit. Aucune carte bancaire requise à l'inscription. Vous accédez à toutes les fonctionnalités du plan Pro pendant 14 jours. À la fin de l'essai, vous choisissez librement votre plan ou vous arrêtez — sans engagement.",
    },
    {
      q: "Comment CODShipEurope sécurise mes données et mes transactions ?",
      a: "Toutes les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). Nos serveurs sont hébergés en Europe (conformité RGPD). Les transactions financières passent par des partenaires certifiés PCI-DSS. Nous ne stockons jamais vos informations bancaires complètes.",
    },
    {
      q: "Puis-je utiliser CODShipEurope avec plusieurs membres d'équipe ?",
      a: "Les plans Pro et Enterprise permettent plusieurs utilisateurs avec des niveaux d'accès différents (admin, agent de confirmation, comptable). Vous pouvez inviter votre équipe et gérer les permissions depuis les paramètres.",
    },
  ],
}

const FAQ_LABELS = {
  en: { badge: "FAQ", h2: "Frequently asked questions", sub: "Everything you need to know before getting started." },
  fr: { badge: "FAQ", h2: "Questions fréquentes", sub: "Tout ce qu'il faut savoir avant de commencer." },
}

export function FaqSection({ lang = "en" }: { lang?: Lang }) {
  const [open, setOpen] = useState<number | null>(null)
  const faqs  = FAQS[lang]
  const label = FAQ_LABELS[lang]

  return (
    <section className="py-28 px-6" style={{ background: "#080808" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-sky-400 text-xs font-bold border border-sky-500/20 bg-sky-500/8 px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            {label.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3">{label.h2}</h2>
          <p className="text-neutral-500 text-sm">{label.sub}</p>
        </div>

        <div className="space-y-2">
          {faqs.map((item, i) => (
            <div key={i}
              className="rounded-2xl border overflow-hidden transition-all duration-200"
              style={{
                border: open === i ? "1px solid rgba(249,115,22,0.25)" : "1px solid rgba(255,255,255,0.05)",
                background: open === i ? "rgba(249,115,22,0.04)" : "rgba(12,12,12,0.8)",
              }}>
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-white">{item.q}</span>
                <ChevronDown
                  className="w-4 h-4 text-neutral-500 flex-shrink-0 transition-transform duration-300"
                  style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: open === i ? "300px" : "0px" }}
              >
                <p className="px-6 pb-5 text-sm text-neutral-500 leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
