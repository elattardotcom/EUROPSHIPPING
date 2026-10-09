"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, ShoppingCart, UserCheck,
  BarChart3, LogOut, ChevronRight, Bell, Store,
  ArrowDownLeft, Settings, Radio, ClipboardList, Menu, X, Search, Package, Gift, Wallet, Percent,
  ShieldCheck, Truck, Plug, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminI18nProvider, useI18n } from "@/lib/admin-i18n"
import { Logo } from "@/components/logo"
import { useRealtime, type RealtimeEvent } from "@/hooks/useSse"

interface Counts { clients: number; orders: number; leads: number; withdrawals: number; requests: number }

interface NavItem { href: string; icon: React.ElementType; label: string; badge: number }
interface NavGroup { label: string; items: NavItem[] }

const TIMEOUT_MS  = 30 * 60 * 1000  // 30 min
const WARNING_MS  = 25 * 60 * 1000  // warn at 25 min (5 min left)

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const { t } = useI18n()
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
  const [navSearch,    setNavSearch]    = useState("")
  const [live,         setLive]         = useState(false)
  const drawerRef      = useRef<HTMLDivElement>(null)
  const notifRef       = useRef<HTMLDivElement>(null)
  const idleTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadCounts = useCallback(() => {
    fetch("/api/admin/counts")
      .then(r => r.json())
      .then(d => setCounts(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadCounts()
    // Fallback poll in case a realtime event is ever missed
    const interval = setInterval(loadCounts, 30_000)
    return () => clearInterval(interval)
  }, [loadCounts])

  // ── Live sync with client dashboards ───────────────────────────
  const onRealtimeEvent = useCallback((_e: RealtimeEvent) => {
    setLive(true)
    setTimeout(() => setLive(false), 2000)
    loadCounts()
  }, [loadCounts])

  useRealtime(onRealtimeEvent)

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

  const NAV_GROUPS: NavGroup[] = [
    {
      label: "Overview",
      items: [
        { href: "/admin",            icon: LayoutDashboard, label: t("nav_overview"), badge: 0 },
        { href: "/admin/exceptions", icon: AlertTriangle,   label: "Exceptions",      badge: 0 },
      ],
    },
    {
      label: "Merchants",
      items: [
        { href: "/admin/clients",   icon: Users,         label: t("nav_clients"),  badge: counts.clients },
        { href: "/admin/requests",  icon: ClipboardList, label: t("nav_requests"), badge: counts.requests },
      ],
    },
    {
      label: "Orders",
      items: [
        { href: "/admin/orders", icon: ShoppingCart, label: t("nav_orders"), badge: counts.orders },
      ],
    },
    {
      label: "Call Center",
      items: [
        { href: "/admin/leads", icon: UserCheck, label: t("nav_leads"), badge: counts.leads },
      ],
    },
    {
      label: "Integrations",
      items: [
        { href: "/admin/stores", icon: Store, label: t("nav_stores"), badge: 0 },
      ],
    },
    {
      label: "Finance",
      items: [
        { href: "/admin/withdrawals",     icon: ArrowDownLeft, label: t("nav_withdrawals"), badge: counts.withdrawals },
        { href: "/admin/payment-methods", icon: Wallet,        label: "Payment Methods",    badge: 0 },
        { href: "/admin/fee-rates",       icon: Percent,       label: "Fee Rates",          badge: 0 },
      ],
    },
    {
      label: "Fulfillment",
      items: [
        { href: "/admin/fulfillment", icon: Truck, label: "Fulfillment & Tracking", badge: 0 },
        { href: "/admin/providers",   icon: Plug,  label: "Providers",              badge: 0 },
      ],
    },
    {
      label: "Catalog",
      items: [
        { href: "/admin/sourcing",         icon: Search, label: "Sourcing",   badge: 0 },
        { href: "/admin/cod-products",     icon: Package, label: "COD Drop",  badge: 0 },
        { href: "/admin/affiliate-offers", icon: Gift,    label: "Affiliates", badge: 0 },
      ],
    },
    {
      label: "Insights",
      items: [
        { href: "/admin/analytics",   icon: BarChart3,   label: t("nav_analytics"), badge: 0 },
        { href: "/admin/audit-logs",  icon: ShieldCheck, label: "Audit Logs",       badge: 0 },
      ],
    },
  ]

  const NAV = NAV_GROUPS.flatMap(g => g.items)

  const filteredNavGroups = navSearch.trim()
    ? NAV_GROUPS
        .map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(navSearch.trim().toLowerCase())) }))
        .filter(g => g.items.length > 0)
    : NAV_GROUPS

  // Bottom tabs: 4 main + more
  const BOTTOM_TABS = [
    { href: "/admin",          icon: LayoutDashboard, label: "Home",     badge: 0 },
    { href: "/admin/clients",  icon: Users,           label: "Clients",  badge: 0 },
    { href: "/admin/orders",   icon: ShoppingCart,    label: "Orders",   badge: counts.orders },
    { href: "/admin/requests", icon: ClipboardList,   label: t("nav_requests"), badge: counts.requests },
  ]

  const currentPage = NAV.find(n => isActive(n.href))?.label
    ?? (pathname.startsWith("/admin/settings") ? t("nav_settings") : "Panel")

  const NavLink = ({ item, onClick }: { item: NavItem; onClick?: () => void }) => {
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
          <h2 className="text-white font-bold text-lg mb-2">Session about to expire</h2>
          <p className="text-neutral-400 text-sm mb-1">You will be signed out in</p>
          <p className="text-4xl font-black text-orange-400 mb-5 tabular-nums">{fmtCountdown(countdown)}</p>
          <div className="flex gap-3">
            <button
              onClick={doLogout}
              className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
            >
              Sign out
            </button>
            <button
              onClick={resetTimers}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-colors"
            >
              Stay signed in
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className={`hidden md:flex ${collapsed ? "w-16" : "w-60"} flex-shrink-0 bg-[#17191D] border-r border-black/20 transition-all duration-300 flex-col`}>

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

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              <input
                value={navSearch}
                onChange={e => setNavSearch(e.target.value)}
                placeholder="Search"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/60 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {filteredNavGroups.map(group => (
            <div key={group.label} className="space-y-0.5">
              {!collapsed && (
                <p className="text-neutral-600 text-[10px] uppercase tracking-widest px-3 py-1">{group.label}</p>
              )}
              {group.items.map(item => {
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
            </div>
          ))}
          {filteredNavGroups.length === 0 && (
            <p className="text-neutral-600 text-sm text-center py-6">No results</p>
          )}
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
          <div ref={drawerRef} className="relative w-72 max-w-[85vw] bg-[#17191D] border-r border-black/20 flex flex-col h-full">

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

            {/* Drawer search */}
            <div className="px-3 pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                <input
                  value={navSearch}
                  onChange={e => setNavSearch(e.target.value)}
                  placeholder="Search"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/60 transition-colors"
                />
              </div>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
              {filteredNavGroups.map(group => (
                <div key={group.label} className="space-y-0.5">
                  <p className="text-neutral-600 text-[10px] uppercase tracking-widest px-3 py-1">{group.label}</p>
                  {group.items.map(item => <NavLink key={item.href} item={item} />)}
                </div>
              ))}
              {filteredNavGroups.length === 0 && (
                <p className="text-neutral-600 text-sm text-center py-6">No results</p>
              )}
            </nav>

            {/* Drawer bottom */}
            <div className="p-3 border-t border-neutral-800 space-y-0.5">
              <NavLink item={{ href: "/admin/settings", icon: Settings, label: t("nav_settings"), badge: 0 }} />
              <button onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>{t("nav_logout")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-14 md:h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          {/* Left: hamburger (mobile) + breadcrumb */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button onClick={() => setDrawerOpen(true)}
              className="md:hidden w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-[#17191D] flex-shrink-0">
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="hidden sm:block text-xs text-neutral-400 uppercase tracking-widest">Admin</span>
              <ChevronRight className="hidden sm:block w-3 h-3 text-neutral-300" />
              <span className="text-sm text-[#17191D] font-medium truncate">{currentPage}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <span className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all duration-500 ${
              live ? "text-emerald-400 bg-emerald-500/20 border-emerald-500/30" : "text-emerald-400/70 bg-emerald-500/10 border-emerald-500/20"
            }`}>
              <Radio className="w-3 h-3 animate-pulse" />{live ? "Synced" : t("live")}
            </span>

            <div className="relative" ref={notifRef}>
              <Button variant="ghost" size="icon"
                onClick={() => setShowNotifs(v => !v)}
                className="relative text-neutral-500 hover:text-[#17191D] hover:bg-neutral-100 w-9 h-9">
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-orange-500 rounded-full animate-pulse border border-white flex items-center justify-center text-[9px] font-black text-white px-0.5">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </Button>

              {showNotifs && (
                <div className="absolute right-0 top-11 w-80 rounded-2xl z-50 overflow-hidden bg-white border border-neutral-200 shadow-xl">
                  {/* Header */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-sm font-bold text-[#17191D]">Notifications</span>
                    </div>
                    {totalUnread > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                        {totalUnread} new
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  <div className="py-1">
                    {[
                      { key: "requests",    label: "Signup requests", count: counts.requests,    unreadCount: unread.requests,    href: "/admin/requests",    color: "#8b5cf6", dot: "#f5f3ff", desc: "Awaiting approval" },
                      { key: "withdrawals", label: "Pending withdrawals", count: counts.withdrawals, unreadCount: unread.withdrawals, href: "/admin/withdrawals", color: "#d97706", dot: "#fffbeb", desc: "To process" },
                      { key: "orders",      label: "New orders",     count: counts.orders,      unreadCount: unread.orders,      href: "/admin/orders",      color: "#f97316", dot: "#fff7ed", desc: "Recent orders" },
                      { key: "leads",       label: "Pending leads",        count: counts.leads,       unreadCount: unread.leads,       href: "/admin/leads",       color: "#2563eb", dot: "#eff6ff", desc: "To confirm" },
                    ].map(item => (
                      <Link key={item.href} href={item.href}
                        onClick={() => { markSeen(item.key); setShowNotifs(false) }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors group relative">
                        {item.unreadCount > 0 && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full" style={{ background: item.color }} />
                        )}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: item.unreadCount > 0 ? item.dot : "#f5f5f5" }}>
                          <span className="text-sm font-black" style={{ color: item.unreadCount > 0 ? item.color : "#9ca3af" }}>
                            {item.count > 0 ? item.count : "—"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium transition-colors group-hover:text-orange-500 ${item.unreadCount > 0 ? "text-[#17191D]" : "text-neutral-400"}`}>
                            {item.label}
                          </p>
                          <p className="text-[10px] text-neutral-400">{item.unreadCount > 0 ? `${item.unreadCount} unread` : item.desc}</p>
                        </div>
                        {item.unreadCount > 0
                          ? <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: item.dot, color: item.color }}>{item.unreadCount}</span>
                          : <span className="text-[10px] text-neutral-300">✓ Read</span>
                        }
                      </Link>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-neutral-100">
                    {totalUnread === 0
                      ? <p className="text-xs text-neutral-400 text-center py-1">All caught up ✓</p>
                      : <button onClick={() => { ["requests","withdrawals","orders","leads"].forEach(markSeen); setShowNotifs(false) }}
                          className="block w-full text-center text-xs font-bold text-neutral-500 hover:text-neutral-700 py-1 transition-colors">
                          Mark all as read
                        </button>
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">A</div>
              <div className="hidden sm:block">
                <p className="text-[#17191D] text-sm font-medium leading-none">Admin</p>
                <p className="text-orange-500/70 text-xs">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-[#F3F4F6] relative pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ───────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#17191D] border-t border-black/20 flex items-stretch h-16 safe-area-bottom">
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
