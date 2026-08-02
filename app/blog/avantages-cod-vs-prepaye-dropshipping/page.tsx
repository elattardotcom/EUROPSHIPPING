import type { Metadata } from "next"
import { AvantagesContent } from "./AvantagesContent"

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AvantagesContent jsonLd={jsonLd} />
    </>
  )
}
