import { NextResponse }    from "next/server"
import { cookies }          from "next/headers"
import { getSupabaseAdmin } from "@/lib/supabase"

const API_KEY    = process.env.SHOPIFY_API_KEY    ?? "88caa8d1ae4239a40202741f700a57ff"
const API_SECRET = process.env.SHOPIFY_API_SECRET ?? ""
const APP_URL    = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.codshipeurope.com"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code  = searchParams.get("code")
    const state = searchParams.get("state")
    const shop  = searchParams.get("shop")

    const errRedirect = (msg: string) =>
      NextResponse.redirect(`${APP_URL}/dashboard/stores?error=${encodeURIComponent(msg)}`)

    if (!code || !state || !shop) return errRedirect("params_manquants")

    // Read cookies
    let storedState: string | undefined
    let clientId = "c1"
    try {
      const cookieStore = await cookies()
      storedState = cookieStore.get("shopify_oauth_state")?.value
      clientId    = cookieStore.get("client_id")?.value ?? "c1"
    } catch { /* cookies might not be available */ }

    if (!storedState || state !== storedState) return errRedirect("state_invalide")

    // Exchange code for token
    let accessToken = ""
    try {
      const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ client_id: API_KEY, client_secret: API_SECRET, code }),
      })
      if (!res.ok) {
        let body = ""
        try { body = await res.text() } catch { /* ignore */ }
        return errRedirect(`token_${res.status}_${body.slice(0, 60)}`)
      }
      const data = await res.json()
      accessToken = data.access_token as string
    } catch (e) {
      return errRedirect(`token_error_${String(e).slice(0, 50)}`)
    }

    if (!accessToken) return errRedirect("token_vide")

    // Save store
    const sb = getSupabaseAdmin()
    if (!sb) return errRedirect("db_non_configuree")

    const storeName = shop.replace(".myshopify.com", "")

    const { error: storeErr } = await sb
      .from("stores")
      .upsert({
        client_id:    clientId,
        name:         storeName,
        domain:       shop,
        status:       "connected",
        access_token: accessToken,
        last_sync:    null,
      }, { onConflict: "domain" })

    if (storeErr) return errRedirect(`db_error`)

    const response = NextResponse.redirect(`${APP_URL}/dashboard/stores?connected=1`)
    try {
      response.cookies.delete("shopify_oauth_state")
      response.cookies.delete("shopify_oauth_shop")
    } catch { /* ignore */ }
    return response

  } catch (e) {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.codshipeurope.com"
    return NextResponse.redirect(`${APP_URL}/dashboard/stores?error=crash_${String(e).slice(0, 40)}`)
  }
}
