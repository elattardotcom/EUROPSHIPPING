import { NextRequest, NextResponse } from "next/server"

// Convenience/early-rejection layer only — redirects obviously-unauthenticated
// browser navigation to the login page so the admin UI doesn't flash protected
// pages before a client-side fetch 401s. This is NOT the authorization
// boundary: it only checks that a cookie is present, never whether it's a
// valid, non-expired, server-recorded session. Every privileged API route
// independently verifies the session via requireAdmin() (lib/admin-auth.ts),
// which is the real boundary — a request with a forged or stale cookie value
// still gets 401 there even if it slips past this check.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = req.cookies.get("admin_session")?.value
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
