import { NextResponse }    from "next/server"
import { cookies }          from "next/headers"
import { exchangeCodeForToken } from "@/lib/shopify"
import { getSupabaseAdmin } from "@/lib/supabase"
import { canAddStore }      from "@/lib/plan-limits"

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

  if (!state || state !== storedState) return errRedirect("state_invalide")
  if (!shop  || shop  !== storedShop)  return errRedirect("shop_invalide")
  if (!code) return errRedirect("code_manquant")

  let accessToken: string
  try {
    accessToken = await exchangeCodeForToken(shop, code)
  } catch {
    return errRedirect("token_exchange_failed")
  }

  const sb = getSupabaseAdmin()
  if (!sb) return errRedirect("db_non_configuree")

  const { data: clientRow } = await sb
    .from("clients").select("plan").eq("id", clientId).single()
  const plan = clientRow?.plan ?? "starter"

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

  if (storeErr || !store) return errRedirect("erreur_sauvegarde")

  const response = NextResponse.redirect(`${appUrl}/dashboard/stores?connected=1`)
  response.cookies.delete("shopify_oauth_state")
  response.cookies.delete("shopify_oauth_shop")
  return response
}
