import type { Metadata } from "next"
import { GuideContent } from "./GuideContent"

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideContent jsonLd={jsonLd} />
    </>
  )
}
