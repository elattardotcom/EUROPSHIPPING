import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  metadataBase: new URL("https://codship.com"),
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
    url: "https://codship.com",
    siteName: "CODShip",
    title: "CODShip — Plateforme COD Shopify en Europe",
    description:
      "Gérez vos commandes Cash on Delivery en Europe. Connectez Shopify, confirmez, livrez, encaissez en 48h.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CODShip — Plateforme Cash on Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CODShip — Plateforme COD Shopify en Europe",
    description:
      "Gérez vos commandes Cash on Delivery en Europe. Connectez Shopify, confirmez, livrez, encaissez en 48h.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://codship.com",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
