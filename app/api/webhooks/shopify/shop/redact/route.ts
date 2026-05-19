import { NextResponse } from "next/server"
import { verifyWebhookHmac } from "@/lib/shopify"

export async function POST(req: Request) {
  const rawBody = await req.text()
  const hmac    = req.headers.get("X-Shopify-Hmac-Sha256") ?? ""

  if (!verifyWebhookHmac(rawBody, hmac)) {
    return NextResponse.json({ error: "HMAC invalide" }, { status: 401 })
  }

  // GDPR: shop redact — remove any stored shop data
  return NextResponse.json({ ok: true })
}
