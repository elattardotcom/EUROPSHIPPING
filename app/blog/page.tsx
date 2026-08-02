import type { Metadata } from "next"
import BlogClient from "./blog-client"

export const metadata: Metadata = {
  title: "Blog COD Dropshipping Europe — Guides & Conseils | CODShipEurope",
  description: "Guides pratiques, conseils et stratégies pour réussir votre dropshipping Cash on Delivery en Europe. Espagne, Portugal, Italie, taux de livraison, confirmations.",
  keywords: ["blog dropshipping COD", "guide dropshipping Europe", "cash on delivery guide", "conseils dropshipping COD", "stratégie COD dropshipping"],
  alternates: { canonical: "https://www.codshipeurope.com/blog" },
  openGraph: {
    title: "Blog COD Dropshipping Europe — CODShipEurope",
    description: "Guides et conseils pour réussir votre dropshipping Cash on Delivery en Europe.",
    url: "https://www.codshipeurope.com/blog",
    type: "website",
    locale: "fr_FR",
    siteName: "CODShipEurope",
  },
}

export default function BlogPage() {
  return <BlogClient />
}
