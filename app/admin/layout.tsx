"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Shield, LayoutDashboard, Users, ShoppingCart, UserCheck,
  BarChart3, LogOut, ChevronRight, Bell, Store, ArrowDownLeft, Settings, Radio,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminI18nProvider, useI18n } from "@/lib/admin-i18n"
import { Logo } from "@/components/logo"

interface Counts { clients: number; orders: number; leads: number; withdrawals: number }

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const { t, lang, toggle } = useI18n()
  const [collapsed, setCollapsed] = useState(false)
  const [counts,    setCounts]    = useState<Counts>({ clients: 0, orders: 0, leads: 0, withdrawals: 0 })

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

  if (pathname === "/admin/login") return <>{children}</>

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
    { href: "/admin/withdrawals", icon: ArrowDownLeft,   label: t("nav_withdrawals"), badge: counts.withdrawals },
    { href: "/admin/analytics",   icon: BarChart3,       label: t("nav_analytics"),   badge: 0 },
  ]

  return (
    <div className="flex h-screen bg-neutral-950 overflow-hidden">

      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-60"} flex-shrink-0 bg-neutral-900 border-r border-neutral-800 transition-all duration-300 flex flex-col`}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2.5">
              <Logo size={36} showBg={false} />
              <div>
                <p className="text-white font-bold text-sm leading-none">CODShip</p>
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-600 uppercase tracking-widest">Admin</span>
            <ChevronRight className="w-3 h-3 text-neutral-700" />
            <span className="text-sm text-white font-medium">
              {NAV.find(n => isActive(n.href))?.label ?? "Panel"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <Radio className="w-3 h-3 animate-pulse" />{t("live")}
            </span>
            {/* Language toggle */}
            <button onClick={toggle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 transition-colors text-xs font-bold text-neutral-300 hover:text-white">
              <span className="text-base leading-none">{lang === "en" ? "🇫🇷" : "🇬🇧"}</span>
              {lang === "en" ? "FR" : "EN"}
            </button>
            <Button variant="ghost" size="icon" className="relative text-neutral-500 hover:text-white hover:bg-neutral-800">
              <Bell className="w-5 h-5" />
              {(counts.orders + counts.withdrawals) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
              )}
            </Button>
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">A</div>
              <div className="hidden sm:block">
                <p className="text-white text-sm font-medium leading-none">Admin</p>
                <p className="text-orange-400/60 text-xs">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-neutral-950">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminI18nProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminI18nProvider>
  )
}
