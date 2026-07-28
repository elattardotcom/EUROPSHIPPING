"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronRight, ChevronDown, LayoutDashboard, Settings, Package,
  Users, ShoppingCart, Wallet, HelpCircle, Bell, RefreshCw,
  Link2, ListOrdered, Gift, Boxes, X, Menu, Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getClientIdFromCookie } from "@/lib/client-cookie"
import { Logo } from "@/components/logo"
import { useRealtime, type RealtimeEvent } from "@/hooks/useSse"
interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  badge?: number | string
  children?: { href: string; label: string }[]
}

function buildNavItems(leadsCount: number, ordersCount: number): NavItem[] {
  return [
    { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/products", icon: Package,         label: "Produits" },
    {
      href: "/dashboard/stores",
      icon: Link2,
      label: "Intégrations",
      children: [{ href: "/dashboard/stores", label: "Boutiques" }],
    },
    {
      href: "/dashboard/leads",
      icon: Users,
      label: "Leads",
      badge: leadsCount || undefined,
      children: [{ href: "/dashboard/leads", label: "Listes" }],
    },
    {
      href: "/dashboard/orders",
      icon: ShoppingCart,
      label: "Commandes",
      badge: ordersCount || undefined,
      children: [{ href: "/dashboard/orders", label: "Toutes les commandes" }],
    },
    {
      href: "/dashboard/affiliates",
      icon: Gift,
      label: "Affiliés",
      children: [{ href: "/dashboard/affiliates", label: "Offres" }],
    },
    {
      href: "/dashboard/cod-drop",
      icon: Boxes,
      label: "COD Drop",
      children: [{ href: "/dashboard/cod-drop", label: "Offres" }],
    },
    {
      href: "/dashboard/wallet",
      icon: Wallet,
      label: "Finances",
      children: [{ href: "/dashboard/wallet", label: "Mon Wallet" }],
    },
    {
      href: "/dashboard/sourcing",
      icon: Search,
      label: "Sourcing",
    },
  ]
}

interface Notif {
  id: string
  text: string
  time: string
  dot: string
  read: boolean
}

function relativeTime(isoOrFr: string): string {
  try {
    // Try ISO first
    let d = new Date(isoOrFr)
    if (isNaN(d.getTime())) {
      // Try "dd/mm/yyyy" French format
      const parts = isoOrFr.split("/")
      if (parts.length === 3) d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    }
    if (isNaN(d.getTime())) return isoOrFr
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return "À l'instant"
    if (mins < 60) return `Il y a ${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `Il y a ${hrs}h`
    return `Il y a ${Math.floor(hrs / 24)}j`
  } catch { return isoOrFr }
}

const BOTTOM_TABS = [
  { href: "/dashboard",        icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/leads",  icon: Users,           label: "Leads" },
  { href: "/dashboard/orders", icon: ShoppingCart,    label: "Commandes" },
  { href: "/dashboard/wallet", icon: Wallet,          label: "Finances" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()

  const [collapsed,      setCollapsed]      = useState(false)
  const [mobileOpen,     setMobileOpen]     = useState(false)
  const [expandedMenus,  setExpandedMenus]  = useState<string[]>(["leads", "orders", "affiliates", "cod-drop", "wallet", "stores"])
  const [showNotifs,     setShowNotifs]     = useState(false)
  const [notifs,         setNotifs]         = useState<Notif[]>([])
  const [readIds,        setReadIds]        = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set()
    try { return new Set(JSON.parse(localStorage.getItem("client_notif_read") ?? "[]")) } catch { return new Set() }
  })
  const [balance,        setBalance]        = useState<string | null>(null)
  const [refreshing,     setRefreshing]     = useState(false)
  const [clientId,       setClientId]       = useState(getClientIdFromCookie)
  const [leadsCount,     setLeadsCount]     = useState(0)
  const [ordersCount,    setOrdersCount]    = useState(0)

  const markRead = useCallback((id: string) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      try { localStorage.setItem("client_notif_read", JSON.stringify([...next])) } catch {}
      return next
    })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifs(prev => {
      const ids = prev.map(n => n.id)
      setReadIds(existing => {
        const next = new Set(existing)
        ids.forEach(id => next.add(id))
        try { localStorage.setItem("client_notif_read", JSON.stringify([...next])) } catch {}
        return next
      })
      return prev.map(n => ({ ...n, read: true }))
    })
  }, [])

  const unreadCount = notifs.filter(n => !n.read).length

  const pushNotif = useCallback((n: Omit<Notif, "id" | "read">) => {
    const id = `rt-${Date.now()}`
    setReadIds(prev => {
      const isRead = prev.has(id)
      setNotifs(existing => [{ ...n, id, read: isRead }, ...existing].slice(0, 20))
      return prev
    })
  }, [])

  const navItems = buildNavItems(leadsCount, ordersCount)

  const [clientName,     setClientName]     = useState("")
  const [clientPlan,     setClientPlan]     = useState("")
  const [clientInitials, setClientInitials] = useState("")
  const [clientColor,    setClientColor]    = useState("from-orange-500 to-red-600")
  const [suspended,      setSuspended]      = useState(false)

  const fetchBalance = (id: string) => {
    fetch(`/api/wallet/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.balance !== undefined) {
          setBalance(new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(d.balance))
        }
      })
      .catch(() => {})
  }

  const fetchCounts = useCallback(() => {
    Promise.all([
      fetch("/api/client/leads").then(r => r.json()),
      fetch("/api/client/orders").then(r => r.json()),
    ]).then(([leads, orders]) => {
      setReadIds(seen => {
        const newNotifs: Notif[] = []
        if (Array.isArray(leads)) {
          setLeadsCount(leads.length)
          leads
            .filter((l: { status: string }) => l.status === "CONFIRMED")
            .slice(0, 4)
            .forEach((l: { id: string; name: string; createdAt?: string }) => {
              const id = `lead-${l.id}`
              newNotifs.push({
                id,
                text: `Lead confirmé — ${l.name}`,
                time: l.createdAt ? relativeTime(l.createdAt) : "Récemment",
                dot:  "bg-emerald-500",
                read: seen.has(id),
              })
            })
        }
        if (Array.isArray(orders)) {
          setOrdersCount(orders.filter((o: { status: string }) => o.status === "PENDING" || o.status === "SHIPPED").length)
          orders
            .filter((o: { status: string }) => o.status === "DELIVERED")
            .slice(0, 3)
            .forEach((o: { id: string; name: string; createdAt?: string }) => {
              const id = `order-${o.id}`
              newNotifs.push({
                id,
                text: `Commande livrée — ${o.name}`,
                time: o.createdAt ? relativeTime(o.createdAt) : "Récemment",
                dot:  "bg-blue-500",
                read: seen.has(id),
              })
            })
        }
        setNotifs(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          const fresh = newNotifs.filter(n => !existingIds.has(n.id))
          return [...prev, ...fresh].slice(0, 20)
        })
        return seen
      })
    }).catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(client => {
        if (!client?.id) return
        if (client.status === "suspended") { setSuspended(true); return }
        const firstName = client.firstName ?? ""
        const lastName  = client.lastName  ?? ""
        setClientId(client.id)
        setClientName(firstName)
        setClientPlan(client.plan === "enterprise" ? "Enterprise" : client.plan === "pro" ? "Pro" : client.status === "trial" ? "Essai gratuit" : "Starter")
        setClientInitials((firstName[0] ?? "") + (lastName[0] ?? ""))
        setClientColor(client.avatarColor ?? "from-orange-500 to-red-600")
        fetchBalance(client.id)
        fetchCounts()
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = () => {
      if (clientId) fetchBalance(clientId)
    }
    window.addEventListener("wallet:updated", handler)
    return () => window.removeEventListener("wallet:updated", handler)
  }, [clientId])

  // Realtime notifications
  const onRealtimeEvent = useCallback((e: RealtimeEvent) => {
    const now = "À l'instant"
    if (e.type === "withdrawal_inserted") {
      pushNotif({ text: `Retrait demandé — €${e.row.amount.toFixed(2)}`, time: now, dot: "bg-orange-500" })
    } else if (e.type === "withdrawal_updated") {
      if (e.row.status === "approved") {
        pushNotif({ text: `Retrait approuvé — €${e.row.amount.toFixed(2)}`, time: now, dot: "bg-emerald-500" })
      } else if (e.row.status === "rejected") {
        pushNotif({ text: `Retrait rejeté — €${e.row.amount.toFixed(2)}`, time: now, dot: "bg-red-500" })
      }
    } else if (e.type === "balance_updated") {
      pushNotif({ text: `Solde mis à jour — €${e.row.amount.toFixed(2)}`, time: now, dot: "bg-teal-500" })
    } else if (e.type === "lead_inserted") {
      pushNotif({ text: `Nouveau lead — ${e.row.name}`, time: now, dot: "bg-purple-500" })
    } else if (e.type === "lead_updated" && e.row.status === "CONFIRMED") {
      pushNotif({ text: `Lead confirmé — ${e.row.name}`, time: now, dot: "bg-emerald-500" })
    } else if (e.type === "order_inserted") {
      pushNotif({ text: `Nouvelle commande — ${e.row.name}`, time: now, dot: "bg-blue-500" })
    } else if (e.type === "order_updated" && e.row.status === "DELIVERED") {
      pushNotif({ text: `Commande livrée — ${e.row.name}`, time: now, dot: "bg-emerald-500" })
    }
  }, [pushNotif])

  useRealtime(onRealtimeEvent)

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleRefresh = () => {
    setRefreshing(true)
    router.refresh()
    setTimeout(() => setRefreshing(false), 800)
  }

  const toggleMenu = (href: string) =>
    setExpandedMenus(prev => prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href])

  const isActive       = (href: string) => pathname === href
  const isParentActive = (item: NavItem) =>
    pathname === item.href || item.children?.some(c => pathname === c.href)

  const SidebarContent = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <>
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-neutral-800 h-16">
        {(!collapsed || inDrawer) && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo size={52} showBg={false} />
            <div>
              <p className="text-white font-bold text-base leading-none">CODShipEurope</p>
              <p className="text-neutral-400 text-xs">Pro Platform</p>
            </div>
          </Link>
        )}
        {inDrawer ? (
          <button onClick={() => setMobileOpen(false)} className="text-neutral-400 hover:text-orange-500 ml-auto">
            <X className="w-5 h-5" />
          </button>
        ) : (
          <Button
            variant="ghost" size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-neutral-400 hover:bg-neutral-800 hover:text-orange-500 flex-shrink-0"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {(!collapsed || inDrawer) && (
          <p className="text-neutral-600 text-[10px] uppercase tracking-widest px-3 py-2">Navigation</p>
        )}

        {navItems.map((item) => {
          const active = isParentActive(item)
          const showText = !collapsed || inDrawer
          return (
            <div key={item.href}>
              {item.children ? (
                <button
                  onClick={() => toggleMenu(item.href)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    active
                      ? "bg-orange-500/10 text-orange-400"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {showText && <span>{item.label}</span>}
                  </div>
                  {showText && (
                    <div className="flex items-center gap-2">
                      {item.badge !== undefined && (
                        <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedMenus.includes(item.href) ? "rotate-180" : ""}`} />
                    </div>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive(item.href)
                      ? "bg-orange-500/10 text-orange-400"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {showText && <span>{item.label}</span>}
                </Link>
              )}

              {/* Children */}
              {showText && item.children && expandedMenus.includes(item.href) && (
                <div className="ml-7 mt-0.5 space-y-0.5 border-l border-neutral-800 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors ${
                        isActive(child.href)
                          ? "text-orange-400 bg-orange-500/5"
                          : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      }`}
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Wallet balance */}
      {(!collapsed || inDrawer) && balance !== null && (
        <div className="mx-3 mb-2 px-3 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-[10px] uppercase tracking-wider text-orange-400/60 mb-0.5">Solde disponible</p>
          <p className="text-orange-400 font-bold text-base">{balance}</p>
        </div>
      )}

      {/* Bottom */}
      <div className="p-3 border-t border-neutral-800 space-y-0.5">
        {(!collapsed || inDrawer) && (
          <p className="text-neutral-600 text-[10px] uppercase tracking-widest px-3 py-1">Aide</p>
        )}
        <Link
          href="/dashboard/contact"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
            pathname === "/dashboard/contact"
              ? "bg-orange-500/10 text-orange-400"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
          }`}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || inDrawer) && <span>Contact</span>}
        </Link>
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
            pathname === "/dashboard/settings"
              ? "bg-orange-500/10 text-orange-400"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || inDrawer) && <span>Paramètres</span>}
        </Link>
      </div>
    </>
  )

  if (suspended) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Compte suspendu</h1>
        <p className="text-neutral-400 text-sm leading-relaxed mb-6">
          Votre compte a été temporairement suspendu. Veuillez contacter le support pour régulariser votre situation et réactiver l'accès.
        </p>
        <a href="mailto:support@codshipeurope.com"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
          Contacter le support
        </a>
      </div>
    </div>
  )

  return (
    <div data-dashboard className="flex h-screen bg-neutral-950 overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className={`${collapsed ? "w-16" : "w-64"} hidden md:flex flex-shrink-0 bg-neutral-900 border-r border-neutral-800 transition-all duration-300 flex-col h-full z-30`}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Drawer Backdrop ──────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ───────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-neutral-900 border-r border-neutral-800 flex flex-col z-50 md:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent inDrawer />
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-14 md:h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 md:px-6 flex-shrink-0 relative">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-neutral-400 hover:text-orange-500 p-1"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Mobile logo */}
            <Link href="/dashboard" className="md:hidden flex items-center gap-2">
              <Logo size={40} showBg={false} />
              <span className="text-white font-bold text-sm">CODShipEurope</span>
            </Link>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Refresh */}
            <Button
              variant="ghost" size="icon"
              onClick={handleRefresh}
              className="text-neutral-400 hover:bg-neutral-800 hover:text-orange-500"
              title="Actualiser"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost" size="icon"
                onClick={() => setShowNotifs(v => !v)}
                className="relative text-neutral-400 hover:bg-neutral-800 hover:text-orange-500"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-orange-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-neutral-600 rounded-full" />
                )}
              </Button>

              {showNotifs && (
                <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-[320px] bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    <button onClick={() => setShowNotifs(false)} className="text-neutral-400 hover:text-orange-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="py-2 max-h-80 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <p className="text-center text-neutral-500 text-sm py-6">Aucune notification</p>
                    ) : notifs.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-neutral-800 cursor-pointer transition-colors ${!n.read ? "bg-orange-500/5 border-l-2 border-orange-500" : "border-l-2 border-transparent"}`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm leading-snug ${!n.read ? "text-white font-medium" : "text-neutral-300"}`}>{n.text}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-neutral-800">
                    <button
                      onClick={markAllRead}
                      className="text-xs text-orange-400 hover:text-orange-300 font-medium"
                    >
                      Tout marquer comme lu
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <div className={`w-8 h-8 bg-gradient-to-br ${clientColor} rounded-full flex items-center justify-center text-white font-semibold text-xs uppercase`}>
                {clientInitials || "?"}
              </div>
              <div className="hidden sm:block">
                <p className="text-white text-sm font-medium leading-none">{clientName || "…"}</p>
                <p className="text-neutral-400 text-xs">{clientPlan}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-neutral-950 pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ───────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-neutral-900 border-t border-neutral-800 flex md:hidden z-30">
        {BOTTOM_TABS.map(tab => {
          const active = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href))
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-orange-400" : "text-neutral-500"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-neutral-500"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </nav>
    </div>
  )
}
