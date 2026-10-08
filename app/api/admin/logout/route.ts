import { NextRequest, NextResponse } from "next/server"
import { destroyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth"

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (token) await destroyAdminSession(token)

  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 })
  return res
}
