import crypto from "crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export const ADMIN_SESSION_COOKIE = "admin_session"
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12 // 12 hours

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

/**
 * Creates a new server-side admin session and returns the raw token to set
 * as the cookie value. Only a SHA-256 hash of the token is ever persisted —
 * the raw token is unguessable (256 bits of entropy) and never stored.
 * Returns null if the session could not be persisted (fail closed: the
 * caller must not fall back to an unauthenticated cookie).
 */
export async function createAdminSession(adminEmail: string): Promise<string | null> {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000).toISOString()

  const { error } = await sb.from("admin_sessions").insert({
    token_hash:  hashToken(token),
    admin_email: adminEmail,
    expires_at:  expiresAt,
  })

  if (error) return null
  return token
}

/**
 * Deletes a server-side admin session by its raw token (used on logout).
 * No-op if the token doesn't match any session.
 */
export async function destroyAdminSession(token: string): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) return
  await sb.from("admin_sessions").delete().eq("token_hash", hashToken(token))
}

/**
 * Verifies the caller holds a valid, non-expired, server-recorded admin
 * session. The cookie must match the hash of a real session row — a
 * forged cookie value (e.g. the literal "1") cannot pass this check,
 * since it won't hash to any row ever written by createAdminSession().
 *
 * Returns a 401 response to short-circuit the route when unauthorized,
 * or null when the caller is authorized and the handler should proceed.
 *
 * Usage:
 *   const denied = await requireAdmin()
 *   if (denied) return denied
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies()
  const token = store.get(ADMIN_SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sb = getSupabaseAdmin()
  if (!sb) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
  }

  const { data, error } = await sb
    .from("admin_sessions")
    .select("expires_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (new Date(data.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}
