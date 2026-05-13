import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.codshipeurope.com"),
  title: {
    default: "CODShip — Plateforme COD Shopify en Europe",
    template: "%s | CODShip",
  },
  description:
    "Gérez vos commandes Cash on Delivery en Europe. Connectez votre boutique Shopify, confirmez par appel, suivez les livraisons et recevez vos virements en 48h. 2 500+ marchands actifs.",
  keywords: [
    "COD dropshipping",
    "cash on delivery Europe",
    "Shopify COD",
    "livraison COD",
    "confirmations commandes",
    "dropshipping Maroc",
    "plateforme dropshipping",
    "gestion commandes Shopify",
    "virement dropshipping",
    "COD Espagne Portugal Italie",
  ],
  authors: [{ name: "CODShip" }],
  creator: "CODShip",
  publisher: "CODShip",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.codshipeurope.com",
    siteName: "CODShip",
    title: "CODShip — Plateforme COD Shopify en Europe",
    description:
      "Gérez vos commandes Cash on Delivery en Europe. Connectez Shopify, confirmez, livrez, encaissez en 48h.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CODShip — Plateforme COD Shopify en Europe",
    description:
      "Gérez vos commandes Cash on Delivery en Europe. Connectez Shopify, confirmez, livrez, encaissez en 48h.",
  },
  alternates: {
    canonical: "https://www.codshipeurope.com",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CODShip",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://www.codshipeurope.com",
  description:
    "Plateforme SaaS Cash on Delivery pour dropshippers Shopify en Europe. Gestion des commandes, confirmations d'appel, suivi des livraisons et virements en 48h.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "29",
    highPrice: "89",
    offerCount: "3",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "2500",
    bestRating: "5",
  },
  provider: {
    "@type": "Organization",
    name: "CODShip",
    url: "https://www.codshipeurope.com",
    logo: "https://www.codshipeurope.com/icon.svg",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@codshipeurope.com",
      contactType: "customer support",
      availableLanguage: ["French", "English", "Arabic"],
    },
    areaServed: ["ES", "IT", "PT", "RO", "BG", "HU", "GR", "SK", "SI", "CZ"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
