import type { Metadata } from "next"
import { ItalieContent } from "./ItalieContent"

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

export default function ItaliePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ItalieContent jsonLd={jsonLd} />
    </>
  )
}
