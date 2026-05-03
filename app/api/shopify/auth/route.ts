import { NextResponse } from "next/server"
import crypto from "crypto"
import { buildAuthUrl } from "@/lib/shopify"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const shop = searchParams.get("shop")

  if (!shop || !shop.endsWith(".myshopify.com")) {
    return NextResponse.json({ error: "Domaine Shopify invalide" }, { status: 400 })
  }

  // Génère un nonce aléatoire pour protéger contre les attaques CSRF
  const state = crypto.randomBytes(16).toString("hex")

  const authUrl = buildAuthUrl(shop, state)

  // Stocke le nonce et le shop dans un cookie sécurisé (durée 10 min)
  const response = NextResponse.redirect(authUrl)
  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    maxAge:   600,
    path:     "/",
  })
  response.cookies.set("shopify_oauth_shop", shop, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    maxAge:   600,
    path:     "/",
  })

  return response
}
