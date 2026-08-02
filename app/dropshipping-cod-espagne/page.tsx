import type { Metadata } from "next"
import { EspagneContent } from "./EspagneContent"

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

export default function EspagnePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EspagneContent jsonLd={jsonLd} />
    </>
  )
}
