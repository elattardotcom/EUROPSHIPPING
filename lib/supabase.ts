import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "https://ckslvayvelkzghbufhea.supabase.co"
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrc2x2YXl2ZWxremdoYnVmaGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjgzNzgsImV4cCI6MjA5MzI0NDM3OH0.1GkPAu5gCE2opCHV3kXHilIWpmo37NsMvozUZ9k6eXY"

let _client:      SupabaseClient | null = null
let _adminClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client
  try {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON)
    return _client
  } catch {
    return null
  }
}

/** Service role client — bypasses RLS, server-side only */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (_adminClient) return _adminClient
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return getSupabase()
  try {
    _adminClient = createClient(SUPABASE_URL, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    return _adminClient
  } catch {
    return getSupabase()
  }
}
