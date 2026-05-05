import { NextResponse }                   from "next/server"
import { cookies }                         from "next/headers"
import { exchangeCodeForToken, verifyOAuthCallback, registerWebhook } from "@/lib/shopify"
import { getSupabaseAdmin }                     from "@/lib/supabase"
import { canAddStore }                     from "@/lib/plan-limits"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cookieStore      = await cookies()
  const clientId         = cookieStore.get("client_id")?.value ?? "c1"

  const storedState = cookieStore.get("shopify_oauth_state")?.value
  const storedShop  = cookieStore.get("shopify_oauth_shop")?.value
  const code        = searchParams.get("code")
  const state       = searchParams.get("state")
  const shop        = searchParams.get("shop")

  // Vérifie que le state correspond (protection CSRF)
  if (!state || state !== storedState) {
    return NextResponse.json({ error: "State invalide" }, { status: 403 })
  }

  // Vérifie que le shop correspond
  if (!shop || shop !== storedShop) {
    return NextResponse.json({ error: "Shop invalide" }, { status: 403 })
  }

  // Vérifie la signature HMAC des query params
  if (!verifyOAuthCallback(searchParams)) {
    return NextResponse.json({ error: "Signature HMAC invalide" }, { status: 403 })
  }

  if (!code) {
    return NextResponse.json({ error: "Code OAuth manquant" }, { status: 400 })
  }

  // Échange le code contre un access token
  const accessToken = await exchangeCodeForToken(shop, code)

  const sb = getSupabaseAdmin()
  if (!sb) {
    return NextResponse.json({ error: "Base de données non configurée" }, { status: 500 })
  }

  // Check plan store limit
  const { data: clientRow } = await sb.from("clients").select("plan").eq("id", clientId).single()
  const plan = clientRow?.plan ?? "starter"
  const { count: existingCount } = await sb
    .from("stores").select("id", { count: "exact", head: true }).eq("client_id", clientId)

  if (!canAddStore(plan, existingCount ?? 0)) {
    const appUrl = "https://europs-shipping.vercel.app"
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
    return NextResponse.json({ error: "Erreur sauvegarde boutique", detail: storeErr?.message, clientId, shop }, { status: 500 })
  }

  // Enregistre les webhooks pour la sync automatique
  await Promise.allSettled([
    registerWebhook(shop, accessToken, "products/create"),
    registerWebhook(shop, accessToken, "products/update"),
    registerWebhook(shop, accessToken, "products/delete"),
  ])

  // Déclenche la sync initiale des produits
  const appUrl = "https://europs-shipping.vercel.app"
  fetch(`${appUrl}/api/shopify/sync`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ storeId: store.id, shop, accessToken }),
  }).catch(() => {}) // fire-and-forget, ne bloque pas la réponse

  // Supprime les cookies OAuth
  const response = NextResponse.redirect(`${appUrl}/dashboard/products?connected=1`)
  response.cookies.delete("shopify_oauth_state")
  response.cookies.delete("shopify_oauth_shop")

  return response
}
