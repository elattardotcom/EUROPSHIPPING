import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const SALT         = "admin_key"
const EMAIL_HASH   = "9697b395208864ad2355ac569ad452a1a26de5f93b0a3f7b565b02fbff1195c8"
const PASS_HASH    = "892b482860da2944c6f1b4c32e5b643b6d0331f686678c36d25a3ec213380862"

function h(s: string) {
  return crypto.createHash("sha256").update(s + SALT).digest("hex")
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  // Support env vars override (optional), fallback to embedded hashes
  const adminEmail    = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  const emailOk = adminEmail
    ? email === adminEmail
    : h(email) === EMAIL_HASH

  const passOk = adminPassword
    ? password === adminPassword
    : h(password) === PASS_HASH

  if (!emailOk || !passOk) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set("admin_session", "1", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 8,
  })
  return res
}
