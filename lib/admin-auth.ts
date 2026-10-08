import { cookies } from "next/headers"
import { NextResponse } from "next/server"

/**
 * Verifies the caller holds a valid admin session cookie.
 * Returns a 401 response to short-circuit the route when unauthorized,
 * or null when the caller is authorized and the handler should proceed.
 *
 * Usage:
 *   const denied = await requireAdmin()
 *   if (denied) return denied
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies()
  const session = store.get("admin_session")?.value
  if (session !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
