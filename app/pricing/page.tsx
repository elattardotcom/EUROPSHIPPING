import type { Metadata } from "next"
import PricingClient from "./pricing-client"

export const metadata: Metadata = {
  title: "Tarifs CODShipEurope — Prix Dropshipping COD Europe | CODShipEurope",
  description: "Un seul plan à €31.99/mois. Boutiques Shopify illimitées, leads illimités, wallet 48h, programme affiliés. Tout inclus pour votre dropshipping COD en Europe.",
  keywords: ["tarif dropshipping COD", "prix plateforme COD Europe", "abonnement CODShipEurope", "coût dropshipping cash on delivery"],
  alternates: { canonical: "https://www.codshipeurope.com/pricing" },
  openGraph: {
    title: "Tarifs CODShipEurope — €31.99/mois tout inclus",
    description: "Un seul plan sans surprise. Boutiques illimitées, leads illimités, wallet 48h, support 7j/7.",
    url: "https://www.codshipeurope.com/pricing",
    type: "website",
    locale: "fr_FR",
    siteName: "CODShipEurope",
  },
}

export default function PricingPage() {
  return <PricingClient />
}
