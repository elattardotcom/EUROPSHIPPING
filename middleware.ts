import { NextRequest, NextResponse } from "next/server"

const SESSION_SECONDS = 60 * 30 // 30 minutes

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = req.cookies.get("admin_session")?.value
    if (session !== "1") {
      const url = req.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }
    // Sliding window: refresh cookie on every admin page navigation
    const res = NextResponse.next()
    res.cookies.set("admin_session", "1", {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   SESSION_SECONDS,
    })
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
