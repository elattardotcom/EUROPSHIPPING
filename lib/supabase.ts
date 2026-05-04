import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _client:      SupabaseClient | null = null
let _adminClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url === "YOUR_SUPABASE_URL" || !url.startsWith("http")) return null
  try {
    _client = createClient(url, key)
    return _client
  } catch {
    return null
  }
}

/** Service role client — bypasses RLS, server-side only */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (_adminClient) return _adminClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url === "YOUR_SUPABASE_URL" || !url.startsWith("http")) {
    return getSupabase() // fallback to anon if no service key
  }
  try {
    _adminClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    return _adminClient
  } catch {
    return getSupabase()
  }
}
