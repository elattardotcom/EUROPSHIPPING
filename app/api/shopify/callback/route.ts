import { NextResponse }        from "next/server"
import { cookies }              from "next/headers"
import crypto                   from "crypto"
import {
  exchangeCodeForToken,
  fetchShopifyProducts, fetchShopifyOrders, extractPricing,
} from "@/lib/shopify"
import { getSupabaseAdmin }     from "@/lib/supabase"
import { canAddStore }          from "@/lib/plan-limits"

function verifyOAuthHmacRaw(rawQuery: string): boolean {
  const secret = process.env.SHOPIFY_API_SECRET
  if (!secret) return false
  const pairs = rawQuery.split("&").filter(p => !p.startsWith("hmac="))
  pairs.sort()
  const msg      = pairs.join("&")
  const computed = crypto.createHmac("sha256", secret).update(msg).digest("hex")
  const received = rawQuery.split("&").find(p => p.startsWith("hmac="))?.slice(5) ?? ""
  try {
    const a = Buffer.from(computed, "hex")
    const b = Buffer.from(received, "hex")
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch { return false }
}

export const maxDuration = 60

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cookieStore      = await cookies()
  const clientId         = cookieStore.get("client_id")?.value ?? "c1"

  const storedState = cookieStore.get("shopify_oauth_state")?.value
  const storedShop  = cookieStore.get("shopify_oauth_shop")?.value
  const code        = searchParams.get("code")
  const state       = searchParams.get("state")
  const shop        = searchParams.get("shop")

  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.codshipeurope.com"
  const errRedirect = (msg: string) =>
    NextResponse.redirect(`${appUrl}/dashboard/stores?error=${encodeURIComponent(msg)}`)

  if (!state || state !== storedState)  return errRedirect("state_invalide")
  if (!shop  || shop  !== storedShop)   return errRedirect("shop_invalide")
  if (!code) return errRedirect("code_manquant")

  // Verify HMAC on the raw query string to avoid URLSearchParams decoding issues
  const rawQuery = new URL(req.url).search.slice(1)
  if (!verifyOAuthHmacRaw(rawQuery)) return errRedirect("hmac_invalide")

  const accessToken = await exchangeCodeForToken(shop, code)

  const sb = getSupabaseAdmin()
  if (!sb) return errRedirect("db_non_configuree")

  const { data: clientRow } = await sb
    .from("clients").select("plan, first_name, last_name").eq("id", clientId).single()
  const plan       = clientRow?.plan ?? "starter"
  const clientName = clientRow ? `${clientRow.first_name ?? ""} ${clientRow.last_name ?? ""}`.trim() : ""

  const { count: existingCount } = await sb
    .from("stores").select("id", { count: "exact", head: true }).eq("client_id", clientId)

  if (!canAddStore(plan, existingCount ?? 0)) {
    return NextResponse.redirect(`${appUrl}/dashboard/stores?error=plan_limit`)
  }

  const storeName = shop.replace(".myshopify.com", "")

  const { data: store, error: storeErr } = await sb
    .from("stores")
    .upsert({
      client_id:    clientId,
      name:         storeName,
      domain:       shop,
      status:       "connected",
      access_token: accessToken,
      last_sync:    null,
    }, { onConflict: "domain" })
    .select("id")
    .single()

  if (storeErr || !store) {
    return errRedirect("erreur_sauvegarde")
  }

  // ── Sync produits ────────────────────────────────────────────────────────
  try {
    const shopifyProducts = await fetchShopifyProducts(shop, accessToken)
    const productRows = shopifyProducts.map(p => {
      const { price, currency } = extractPricing(p)
      return {
        store_id: store.id, shopify_id: String(p.id), title: p.title,
        image_url: p.images?.[0]?.src ?? null, price, currency,
        updated_at: new Date().toISOString(),
      }
    })
    if (productRows.length > 0) {
      await sb.from("products").upsert(productRows, { onConflict: "store_id,shopify_id" })
    }
    await sb.from("stores").update({ last_sync: new Date().toISOString() }).eq("id", store.id)
  } catch { /* silent */ }

  // ── Sync historique commandes ────────────────────────────────────────────
  try {
    const orders = await fetchShopifyOrders(shop, accessToken)
    const leadRows = orders.map(order => {
      const customer  = order.customer  as Record<string, string> | undefined
      const billing   = order.billing_address  as Record<string, string> | undefined
      const shipping  = order.shipping_address as Record<string, string> | undefined
      const lineItems = order.line_items as Array<{ title: string }> | undefined
      const fn = customer?.first_name ?? ""
      const ln = customer?.last_name  ?? ""
      return {
        id:             `shopify_${order.id}`,
        client_id:      clientId,
        client_name:    clientName,
        customer_name:  `${fn} ${ln}`.trim() || billing?.name || "Client",
        customer_phone: customer?.phone ?? billing?.phone ?? shipping?.phone ?? "",
        country:        billing?.country      ?? shipping?.country      ?? "",
        country_code:   billing?.country_code ?? shipping?.country_code ?? "",
        product:        lineItems?.[0]?.title ?? "Produit",
        value:          parseFloat((order.total_price as string) ?? "0"),
        currency:       (order.currency as string) ?? "EUR",
        status:         "PENDING",
        store:          storeName,
        attempts:       0,
        created_at:     (order.created_at as string) ?? new Date().toISOString(),
      }
    })
    const CHUNK = 100
    for (let i = 0; i < leadRows.length; i += CHUNK) {
      await sb.from("leads").upsert(leadRows.slice(i, i + CHUNK), { onConflict: "id" })
    }
  } catch { /* silent */ }

  // Supprime les cookies OAuth et redirige
  const response = NextResponse.redirect(`${appUrl}/dashboard/stores?connected=1`)
  response.cookies.delete("shopify_oauth_state")
  response.cookies.delete("shopify_oauth_shop")
  return response
}
