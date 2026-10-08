import { cookies } from "next/headers"
import crypto from "crypto"
import { getSupabaseAdmin } from "@/lib/supabase"
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth"

/**
 * Resolves the admin_email tied to the current request's session cookie.
 * Returns null if there is no valid session (callers should already have
 * passed requireAdmin() before reaching this point).
 */
export async function getAdminEmail(): Promise<string | null> {
  const store = await cookies()
  const token = store.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null

  const sb = getSupabaseAdmin()
  if (!sb) return null

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  const { data } = await sb
    .from("admin_sessions")
    .select("admin_email")
    .eq("token_hash", tokenHash)
    .maybeSingle()

  return data?.admin_email ?? null
}

/**
 * Records a sensitive admin action for accountability. Fire-and-forget —
 * a logging failure must never block the real mutation it's attached to.
 */
export async function logAdminAction(
  adminEmail: string,
  action: string,
  targetType: string,
  targetId: string | null,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const sb = getSupabaseAdmin()
    if (!sb) return
    await sb.from("audit_logs").insert({
      admin_email: adminEmail,
      action,
      target_type: targetType,
      target_id:   targetId,
      metadata:    metadata ?? null,
    })
  } catch (err) {
    console.error("[audit-log] failed to record action:", err)
  }
}
