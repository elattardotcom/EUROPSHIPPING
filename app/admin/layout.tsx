"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Shield, LayoutDashboard, Users, ShoppingCart, UserCheck,
  BarChart3, Settings, LogOut, ChevronRight, Bell, Store, ArrowDownLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const NAV = [
  { href: "/admin",           icon: LayoutDashboard, label: "Vue d'ensemble" },
  { href: "/admin/clients",   icon: Users,           label: "Clients",    badge: 10 },
  { href: "/admin/orders",    icon: ShoppingCart,    label: "Commandes",  badge: 15 },
  { href: "/admin/leads",        icon: UserCheck,     label: "Leads",      badge: 10 },
  { href: "/admin/withdrawals",  icon: ArrowDownLeft, label: "Retraits",   badge: 3  },
  { href: "/admin/analytics",    icon: BarChart3,     label: "Analytiques" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [auth, setAuth] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (pathname === "/admin/login") { setAuth(true); return }
    const ok = localStorage.getItem("admin_auth") === "true"
    if (!ok) router.replace("/admin/login")
    else setAuth(true)
  }, [pathname, router])

  const logout = () => {
    localStorage.removeItem("admin_auth")
    router.push("/admin/login")
  }

  if (!auth) return null
  if (pathname === "/admin/login") return <>{children}</>

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  return (
    <div className="flex h-screen bg-neutral-950 overflow-hidden">

      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-64"} flex-shrink-0 bg-[#0f0f1a] border-r border-indigo-900/30 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-900/30">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">CODShip</p>
                <p className="text-indigo-400/60 text-[10px]">Admin Panel</p>
              </div>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}
            className="text-neutral-500 hover:text-white hover:bg-white/5 flex-shrink-0">
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-indigo-400/40 text-[10px] uppercase tracking-widest px-3 py-2">Gestion</p>
          )}
          {NAV.map(item => {
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm group ${
                  active
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
                    : "text-neutral-500 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-indigo-400" : ""}`} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="bg-indigo-600/30 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-indigo-900/30 space-y-1">
          <Link href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all text-sm">
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Paramètres</span>}
          </Link>
          <Link href="/dashboard" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all text-sm">
            <Store className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Voir le site</span>}
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-[#0f0f1a] border-b border-indigo-900/30 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-400/60 uppercase tracking-widest">Admin</span>
            <ChevronRight className="w-3 h-3 text-neutral-700" />
            <span className="text-sm text-white font-medium">
              {NAV.find(n => isActive(n.href))?.label ?? "Panel"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-neutral-500 hover:text-white hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </Button>
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                A
              </div>
              {!collapsed && (
                <div className="hidden sm:block">
                  <p className="text-white text-sm font-medium leading-none">Admin</p>
                  <p className="text-indigo-400/60 text-xs">Super Admin</p>
                </div>
              )}
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
