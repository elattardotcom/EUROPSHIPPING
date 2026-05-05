import crypto from "crypto"

const API_VERSION  = "2024-01"
const SCOPES       = "read_products,write_products,read_orders,write_orders,read_customers"
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL ?? "https://europs-shipping.vercel.app"
const API_KEY      = process.env.SHOPIFY_API_KEY     ?? "e8be12f3fba0f60638139a6e62d956ea"
const API_SECRET   = process.env.SHOPIFY_API_SECRET  ?? ""

/* ── OAuth ──────────────────────────────────────────────────────────────── */

export function buildAuthUrl(shop: string, state: string): string {
  const params = new URLSearchParams({
    client_id:    API_KEY,
    scope:        SCOPES,
    redirect_uri: `${APP_URL}/api/shopify/callback`,
    state,
  })
  return `https://${shop}/admin/oauth/authorize?${params}`
}

export async function exchangeCodeForToken(shop: string, code: string): Promise<string> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ client_id: API_KEY, client_secret: API_SECRET, code }),
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`)
  const data = await res.json()
  return data.access_token as string
}

export function verifyOAuthCallback(query: URLSearchParams): boolean {
  const hmac = query.get("hmac")
  if (!hmac) return false
  const params = [...query.entries()]
    .filter(([k]) => k !== "hmac")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&")
  const computed = crypto.createHmac("sha256", API_SECRET).update(params).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hmac))
}

/* ── API Shopify ────────────────────────────────────────────────────────── */

/** Récupère tous les produits d'une boutique (max 250 par page) */
export async function fetchShopifyProducts(shop: string, accessToken: string) {
  const allProducts: ShopifyProduct[] = []
  let url: string | null =
    `https://${shop}/admin/api/${API_VERSION}/products.json?limit=250&fields=id,title,images,variants`

  while (url) {
    const res = await fetch(url, {
      headers: { "X-Shopify-Access-Token": accessToken },
    })
    if (!res.ok) throw new Error(`Shopify API error: ${res.status}`)

    const data = await res.json()
    allProducts.push(...(data.products ?? []))

    // Pagination via Link header
    const linkHeader = res.headers.get("Link") ?? ""
    const nextMatch  = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
    url = nextMatch ? nextMatch[1] : null
  }

  return allProducts
}

/** Enregistre un webhook Shopify */
export async function registerWebhook(shop: string, accessToken: string, topic: string) {
  const address = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify/products`
  await fetch(`https://${shop}/admin/api/${API_VERSION}/webhooks.json`, {
    method:  "POST",
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type":           "application/json",
    },
    body: JSON.stringify({ webhook: { topic, address, format: "json" } }),
  })
}

/* ── Webhooks ───────────────────────────────────────────────────────────── */

/** Vérifie la signature HMAC d'un webhook Shopify */
export function verifyWebhookHmac(rawBody: string, hmacHeader: string): boolean {
  const computed = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(rawBody, "utf8")
    .digest("base64")
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hmacHeader))
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

/** Extrait le prix de base et les presentment_prices d'un variant Shopify */
export function extractPricing(product: ShopifyProduct) {
  const variant = product.variants?.[0]
  const price    = parseFloat(variant?.price ?? "0")
  const currency = "EUR"

  const presentmentPrices: PresentmentPrice[] =
    variant?.presentment_prices?.map((pp) => ({
      amount:       parseFloat(pp.price.amount),
      currencyCode: pp.price.currency_code,
    })) ?? []

  return { price, currency, presentmentPrices }
}

/** Retourne le prix adapté à la devise du visiteur (fallback sur le prix de base) */
export function getLocalizedPrice(
  presentmentPrices: PresentmentPrice[],
  currencyCode: string,
): PresentmentPrice | null {
  return (
    presentmentPrices.find((p) => p.currencyCode === currencyCode) ?? null
  )
}

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface ShopifyProduct {
  id:       number
  title:    string
  images:   { src: string }[]
  variants: {
    price:              string
    presentment_prices: {
      price: { amount: string; currency_code: string }
    }[]
  }[]
}

export interface PresentmentPrice {
  amount:       number
  currencyCode: string
}

/** Map pays ISO → devise */
export const COUNTRY_CURRENCY: Record<string, string> = {
  FR: "EUR", DE: "EUR", ES: "EUR", IT: "EUR", BE: "EUR", NL: "EUR",
  PT: "EUR", US: "USD", GB: "GBP", CA: "CAD", AU: "AUD",
  MA: "MAD", TN: "TND", DZ: "DZD", AE: "AED", SA: "SAR",
}
