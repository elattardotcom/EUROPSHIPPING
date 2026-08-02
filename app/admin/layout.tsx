"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, ShoppingCart, UserCheck,
  BarChart3, LogOut, ChevronRight, Bell, Store,
  ArrowDownLeft, Settings, Radio, ClipboardList, Menu, X, Search, Package, Gift, Wallet, Percent,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminI18nProvider, useI18n } from "@/lib/admin-i18n"
import { Logo } from "@/components/logo"

interface Counts { clients: number; orders: number; leads: number; withdrawals: number; requests: number }

const TIMEOUT_MS  = 30 * 60 * 1000  // 30 min
const WARNING_MS  = 25 * 60 * 1000  // warn at 25 min (5 min left)

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const { t, lang, toggle } = useI18n()
  const [collapsed,    setCollapsed]    = useState(false)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [showNotifs,   setShowNotifs]   = useState(false)
  const [counts,       setCounts]       = useState<Counts>({ clients: 0, orders: 0, leads: 0, withdrawals: 0, requests: 0 })
  const [seenCounts,   setSeenCounts]   = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {}
    try { return JSON.parse(localStorage.getItem("admin_notif_seen") ?? "{}") } catch { return {} }
  })
  const [showWarning,  setShowWarning]  = useState(false)
  const [countdown,    setCountdown]    = useState(300) // seconds remaining when warning shows
  const drawerRef      = useRef<HTMLDivElement>(null)
  const notifRef       = useRef<HTMLDivElement>(null)
  const idleTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const load = () =>
      fetch("/api/admin/counts")
        .then(r => r.json())
        .then(d => setCounts(d))
        .catch(() => {})
    load()
    const interval = setInterval(load, 5_000)
    return () => clearInterval(interval)
  }, [])

  // ── Inactivity auto-logout ────────────────────────────────────
  const doLogout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }, [router])

  const resetTimers = useCallback(() => {
    setShowWarning(false)
    if (idleTimer.current)    clearTimeout(idleTimer.current)
    if (warningTimer.current) clearTimeout(warningTimer.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    warningTimer.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(300)
      countdownRef.current = setInterval(() => {
        setCountdown(s => {
          if (s <= 1) {
            clearInterval(countdownRef.current!)
            return 0
          }
          return s - 1
        })
      }, 1_000)
    }, WARNING_MS)

    idleTimer.current = setTimeout(doLogout, TIMEOUT_MS)
  }, [doLogout])

  useEffect(() => {
    if (pathname === "/admin/login") return
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"]
    const onActivity = () => resetTimers()
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }))
    resetTimers()
    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity))
      if (idleTimer.current)    clearTimeout(idleTimer.current)
      if (warningTimer.current) clearTimeout(warningTimer.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [pathname, resetTimers])

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  // Close notif panel on outside click
  useEffect(() => {
    if (!showNotifs) return
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showNotifs])

  if (pathname === "/admin/login") return <>{children}</>

  const markSeen = (key: string) => {
    const count = (counts as unknown as Record<string, number>)[key] ?? 0
    setSeenCounts(prev => {
      const next = { ...prev, [key]: count }
      try { localStorage.setItem("admin_notif_seen", JSON.stringify(next)) } catch {}
      return next
    })
  }

  const unread = {
    requests:    Math.max(0, counts.requests    - (seenCounts.requests    ?? 0)),
    withdrawals: Math.max(0, counts.withdrawals - (seenCounts.withdrawals ?? 0)),
    orders:      Math.max(0, counts.orders      - (seenCounts.orders      ?? 0)),
    leads:       Math.max(0, counts.leads       - (seenCounts.leads       ?? 0)),
  }
  const totalUnread = unread.requests + unread.withdrawals + unread.orders + unread.leads

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  const NAV = [
    { href: "/admin",             icon: LayoutDashboard, label: t("nav_overview"),    badge: 0 },
    { href: "/admin/clients",     icon: Users,           label: t("nav_clients"),     badge: counts.clients },
    { href: "/admin/leads",       icon: UserCheck,       label: t("nav_leads"),       badge: counts.leads },
    { href: "/admin/orders",      icon: ShoppingCart,    label: t("nav_orders"),      badge: counts.orders },
    { href: "/admin/stores",      icon: Store,           label: t("nav_stores"),      badge: 0 },
    { href: "/admin/withdrawals",      icon: ArrowDownLeft, label: t("nav_withdrawals"),    badge: counts.withdrawals },
    { href: "/admin/payment-methods",  icon: Wallet,        label: "Méthodes paiement",     badge: 0 },
    { href: "/admin/fee-rates",        icon: Percent,       label: "Frais de service",       badge: 0 },
    { href: "/admin/requests",    icon: ClipboardList,   label: t("nav_requests"),    badge: counts.requests },
    { href: "/admin/sourcing",          icon: Search,          label: "Sourcing",       badge: 0 },
    { href: "/admin/cod-products",      icon: Package,         label: "COD Drop",       badge: 0 },
    { href: "/admin/affiliate-offers",  icon: Gift,            label: "Affiliés",       badge: 0 },
    { href: "/admin/analytics",         icon: BarChart3,       label: t("nav_analytics"), badge: 0 },
  ]

  // Bottom tabs: 4 main + more
  const BOTTOM_TABS = [
    { href: "/admin",          icon: LayoutDashboard, label: "Accueil",   badge: 0 },
    { href: "/admin/clients",  icon: Users,           label: "Clients",   badge: 0 },
    { href: "/admin/orders",   icon: ShoppingCart,    label: "Commandes", badge: counts.orders },
    { href: "/admin/requests", icon: ClipboardList,   label: t("nav_requests"),  badge: counts.requests },
  ]

  const currentPage = NAV.find(n => isActive(n.href))?.label
    ?? (pathname.startsWith("/admin/settings") ? t("nav_settings") : "Panel")

  const NavLink = ({ item, onClick }: { item: typeof NAV[0]; onClick?: () => void }) => {
    const active = isActive(item.href)
    return (
      <Link href={item.href} onClick={onClick}
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm group ${
          active
            ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
            : "text-neutral-500 hover:text-white hover:bg-neutral-800 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-orange-400" : ""}`} />
          <span>{item.label}</span>
        </div>
        {item.badge > 0 && (
          <span className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded-full font-medium min-w-[18px] text-center">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  const fmtCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  return (
    <>
    {/* ── Session expiry warning (portal to escape overflow-hidden) */}
    {showWarning && typeof document !== "undefined" && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative w-full max-w-sm bg-neutral-900 border border-orange-500/30 rounded-2xl shadow-2xl p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-6 h-6 text-orange-400" />
          </div>
          <h2 className="text-white font-bold text-lg mb-2">Session sur le point d'expirer</h2>
          <p className="text-neutral-400 text-sm mb-1">Vous serez déconnecté dans</p>
          <p className="text-4xl font-black text-orange-400 mb-5 tabular-nums">{fmtCountdown(countdown)}</p>
          <div className="flex gap-3">
            <button
              onClick={doLogout}
              className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
            >
              Se déconnecter
            </button>
            <button
              onClick={resetTimers}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-colors"
            >
              Rester connecté
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    <div className="flex h-screen bg-neutral-950 overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className={`hidden md:flex ${collapsed ? "w-16" : "w-60"} flex-shrink-0 bg-neutral-900 border-r border-neutral-800 transition-all duration-300 flex-col`}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2.5">
              <Logo size={52} showBg={false} />
              <div>
                <p className="text-white font-bold text-sm leading-none">CODShipEurope</p>
                <p className="text-orange-400/60 text-[10px]">Admin Panel</p>
              </div>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}
            className="text-neutral-500 hover:text-white hover:bg-white/5 flex-shrink-0">
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm group ${
                  active
                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                    : "text-neutral-500 hover:text-white hover:bg-neutral-800 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-orange-400" : ""}`} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.badge > 0 && (
                  <span className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded-full font-medium min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-neutral-800 space-y-0.5">
          <Link href="/admin/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
              pathname.startsWith("/admin/settings")
                ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                : "text-neutral-500 hover:text-white hover:bg-neutral-800 border border-transparent"
            }`}>
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{t("nav_settings")}</span>}
          </Link>

          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{t("nav_logout")}</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer overlay ───────────────────────────────── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div ref={drawerRef} className="relative w-72 max-w-[85vw] bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">

            {/* Drawer header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Logo size={44} showBg={false} />
                <div>
                  <p className="text-white font-bold text-sm leading-none">CODShipEurope</p>
                  <p className="text-orange-400/60 text-[10px]">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {NAV.map(item => <NavLink key={item.href} item={item} />)}
            </nav>

            {/* Drawer bottom */}
            <div className="p-3 border-t border-neutral-800 space-y-0.5">
              <NavLink item={{ href: "/admin/settings", icon: Settings, label: t("nav_settings"), badge: 0 }} />
              <button onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>{t("nav_logout")}</span>
              </button>

              {/* Language toggle in drawer */}
              <button onClick={toggle}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all text-sm">
                <span className="text-base leading-none">{lang === "en" ? "🇫🇷" : "🇬🇧"}</span>
                <span>{lang === "en" ? "Passer en Français" : "Switch to English"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-14 md:h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          {/* Left: hamburger (mobile) + breadcrumb */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button onClick={() => setDrawerOpen(true)}
              className="md:hidden w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white flex-shrink-0">
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="hidden sm:block text-xs text-neutral-600 uppercase tracking-widest">Admin</span>
              <ChevronRight className="hidden sm:block w-3 h-3 text-neutral-700" />
              <span className="text-sm text-white font-medium truncate">{currentPage}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <Radio className="w-3 h-3 animate-pulse" />{t("live")}
            </span>

            {/* Language toggle — desktop only */}
            <button onClick={toggle}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 transition-colors text-xs font-bold text-neutral-300 hover:text-white">
              <span className="text-base leading-none">{lang === "en" ? "🇫🇷" : "🇬🇧"}</span>
              {lang === "en" ? "FR" : "EN"}
            </button>

            <div className="relative" ref={notifRef}>
              <Button variant="ghost" size="icon"
                onClick={() => setShowNotifs(v => !v)}
                className="relative text-neutral-500 hover:text-white hover:bg-neutral-800 w-9 h-9">
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-orange-500 rounded-full animate-pulse border border-neutral-900 flex items-center justify-center text-[9px] font-black text-white px-0.5">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </Button>

              {showNotifs && (
                <div className="absolute right-0 top-11 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 48px rgba(0,0,0,0.8)" }}>
                  {/* Header */}
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-sm font-bold text-white">Notifications</span>
                    </div>
                    {totalUnread > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {totalUnread} nouvelle{totalUnread > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  <div className="py-1">
                    {[
                      { key: "requests",    label: "Demandes d'inscription", count: counts.requests,    unreadCount: unread.requests,    href: "/admin/requests",    color: "#8b5cf6", dot: "rgba(139,92,246,0.15)", desc: "En attente d'approbation" },
                      { key: "withdrawals", label: "Retraits en attente",     count: counts.withdrawals, unreadCount: unread.withdrawals, href: "/admin/withdrawals", color: "#f59e0b", dot: "rgba(245,158,11,0.15)", desc: "À traiter" },
                      { key: "orders",      label: "Nouvelles commandes",     count: counts.orders,      unreadCount: unread.orders,      href: "/admin/orders",      color: "#f97316", dot: "rgba(249,115,22,0.15)", desc: "Commandes récentes" },
                      { key: "leads",       label: "Leads en attente",        count: counts.leads,       unreadCount: unread.leads,       href: "/admin/leads",       color: "#3b82f6", dot: "rgba(59,130,246,0.15)", desc: "À confirmer" },
                    ].map(item => (
                      <Link key={item.href} href={item.href}
                        onClick={() => { markSeen(item.key); setShowNotifs(false) }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group relative">
                        {item.unreadCount > 0 && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full" style={{ background: item.color }} />
                        )}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: item.unreadCount > 0 ? item.dot : "rgba(255,255,255,0.04)" }}>
                          <span className="text-sm font-black" style={{ color: item.unreadCount > 0 ? item.color : "#4b5563" }}>
                            {item.count > 0 ? item.count : "—"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium transition-colors group-hover:text-orange-400 ${item.unreadCount > 0 ? "text-white" : "text-neutral-500"}`}>
                            {item.label}
                          </p>
                          <p className="text-[10px] text-neutral-600">{item.unreadCount > 0 ? `${item.unreadCount} non lu${item.unreadCount > 1 ? "s" : ""}` : item.desc}</p>
                        </div>
                        {item.unreadCount > 0
                          ? <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: item.dot, color: item.color }}>{item.unreadCount}</span>
                          : <span className="text-[10px] text-neutral-700">✓ Lu</span>
                        }
                      </Link>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    {totalUnread === 0
                      ? <p className="text-xs text-neutral-600 text-center py-1">Tout est à jour ✓</p>
                      : <button onClick={() => { ["requests","withdrawals","orders","leads"].forEach(markSeen); setShowNotifs(false) }}
                          className="block w-full text-center text-xs font-bold text-neutral-500 hover:text-neutral-300 py-1 transition-colors">
                          Tout marquer comme lu
                        </button>
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">A</div>
              <div className="hidden sm:block">
                <p className="text-white text-sm font-medium leading-none">Admin</p>
                <p className="text-orange-400/60 text-xs">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-neutral-950 relative pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ───────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-neutral-900 border-t border-neutral-800 flex items-stretch h-16 safe-area-bottom">
        {BOTTOM_TABS.map(tab => {
          const active = isActive(tab.href)
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                active ? "text-orange-400" : "text-neutral-600 hover:text-neutral-400"
              }`}
            >
              {tab.badge > 0 && (
                <span className="absolute top-2 right-1/2 translate-x-3 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge > 9 ? "9+" : tab.badge}
                </span>
              )}
              <tab.icon className={`w-5 h-5 ${active ? "text-orange-400" : ""}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}

        {/* More button */}
        <button onClick={() => setDrawerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-neutral-600 hover:text-neutral-400 transition-colors">
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </nav>

    </div>
    </>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminI18nProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminI18nProvider>
  )
}
