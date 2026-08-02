import type { Metadata } from "next"
import { PortugalContent } from "./PortugalContent"

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

export default function PortugalPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PortugalContent jsonLd={jsonLd} />
    </>
  )
}
