import { NextResponse } from "next/server"
import { COUNTRY_CURRENCY } from "@/lib/shopify"

export async function GET(req: Request) {
  // Récupère l'IP réelle (CDN / proxy aware)
  const forwarded = req.headers.get("x-forwarded-for")
  const ip        = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1"

  // En local, utilise une valeur par défaut
  if (ip === "127.0.0.1" || ip === "::1") {
    return NextResponse.json({ countryCode: "FR", currencyCode: "EUR" })
  }

  try {
    const res  = await fetch(`https://ipapi.co/${ip}/json/`, { next: { revalidate: 3600 } })
    const data = await res.json()
    const countryCode  = data.country_code ?? "FR"
    const currencyCode = COUNTRY_CURRENCY[countryCode] ?? "EUR"
    return NextResponse.json({ countryCode, currencyCode })
  } catch {
    return NextResponse.json({ countryCode: "FR", currencyCode: "EUR" })
  }
}
