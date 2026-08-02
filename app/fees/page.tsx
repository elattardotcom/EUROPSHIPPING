import type { Metadata } from "next"
import FeesClient from "./fees-client"

export const metadata: Metadata = {
  title: "Fees & Pricing — Transparent. No surprises. | CODShipEurope",
  description: "6 fees. That's it. €31.99/month subscription, call centre €1.20/lead, delivery from €3.80. Zero hidden fees for your COD dropshipping in Europe.",
  keywords: ["COD dropshipping fees", "COD delivery Europe pricing", "CODShipEurope fees", "call centre COD cost"],
  alternates: { canonical: "https://www.codshipeurope.com/fees" },
  openGraph: {
    title: "CODShipEurope Fees — 6 fees. Nothing else.",
    description: "100% transparent cost structure. Subscription, call centre, delivery, returns — all detailed.",
    url: "https://www.codshipeurope.com/fees",
    type: "website",
  },
}

export default function FeesPage() {
  return <FeesClient />
}
