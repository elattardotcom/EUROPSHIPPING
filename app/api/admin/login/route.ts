import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createAdminSession, ADMIN_SESSION_COOKIE, ADMIN_SESSION_TTL_SECONDS } from "@/lib/admin-auth"
import { checkRateLimit } from "@/lib/rate-limit"

const RATE_LIMIT_MAX        = 8
const RATE_LIMIT_WINDOW_MS  = 10 * 60 * 1000 // 10 minutes

// Constant-time string comparison that also hides the input length —
// both sides are first hashed to a fixed 32-byte digest before comparing,
// so a shorter/longer guess can't be distinguished by timing.
function safeEqual(a: string, b: string): boolean {
  const ah = crypto.createHash("sha256").update(a).digest()
  const bh = crypto.createHash("sha256").update(b).digest()
  return crypto.timingSafeEqual(ah, bh)
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const { allowed, retryAfterSeconds } = checkRateLimit(`admin-login:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    )
  }

  const adminEmail    = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: "Admin login not configured" }, { status: 500 })
  }

  const { email, password } = await req.json().catch(() => ({ email: "", password: "" }))

  const emailOk = typeof email === "string" && safeEqual(email, adminEmail)
  const passOk  = typeof password === "string" && safeEqual(password, adminPassword)

  // Same generic error for both cases — never reveal which field was wrong.
  if (!emailOk || !passOk) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
  }

  const token = await createAdminSession(adminEmail)
  if (!token) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   ADMIN_SESSION_TTL_SECONDS,
  })
  return res
}
