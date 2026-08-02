"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronRight, ChevronDown, LayoutDashboard, Settings, Package,
  Users, ShoppingCart, Wallet, HelpCircle, Bell, RefreshCw,
  Link2, ListOrdered, Gift, Boxes, X, Menu, Search,
  CheckCircle2, UserPlus, Truck, DollarSign, AlertTriangle, Info,
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

type NotifType = "lead_new" | "lead_confirmed" | "order_new" | "order_delivered" | "wallet_approved" | "wallet_rejected" | "wallet_update" | "wallet_requested" | "system"

interface Notif {
  id:       string
  type:     NotifType
  title:    string
  sub?:     string
  time:     string
  read:     boolean
  href?:    string
}

const NOTIF_CFG: Record<NotifType, { Icon: React.ElementType; iconBg: string; iconColor: string; badge: string; badgeBg: string }> = {
  lead_new:        { Icon: UserPlus,      iconBg: "bg-purple-500/15",  iconColor: "text-purple-400",  badge: "Lead",     badgeBg: "bg-purple-500/15 text-purple-400"  },
  lead_confirmed:  { Icon: CheckCircle2,  iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", badge: "Lead",     badgeBg: "bg-emerald-500/15 text-emerald-400" },
  order_new:       { Icon: ShoppingCart,  iconBg: "bg-blue-500/15",    iconColor: "text-blue-400",    badge: "Commande", badgeBg: "bg-blue-500/15 text-blue-400"       },
  order_delivered: { Icon: Truck,         iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", badge: "Commande", badgeBg: "bg-emerald-500/15 text-emerald-400" },
  wallet_approved: { Icon: CheckCircle2,  iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", badge: "Wallet",   badgeBg: "bg-emerald-500/15 text-emerald-400" },
  wallet_rejected: { Icon: AlertTriangle, iconBg: "bg-red-500/15",     iconColor: "text-red-400",     badge: "Wallet",   badgeBg: "bg-red-500/15 text-red-400"         },
  wallet_requested:{ Icon: DollarSign,    iconBg: "bg-orange-500/15",  iconColor: "text-orange-400",  badge: "Wallet",   badgeBg: "bg-orange-500/15 text-orange-400"   },
  wallet_update:   { Icon: DollarSign,    iconBg: "bg-teal-500/15",    iconColor: "text-teal-400",    badge: "Wallet",   badgeBg: "bg-teal-500/15 text-teal-400"       },
  system:          { Icon: Info,          iconBg: "bg-neutral-500/15", iconColor: "text-neutral-400", badge: "Système",  badgeBg: "bg-neutral-500/15 text-neutral-400" },
}

/* ── Toast for real-time events ─────────────────────────────── */
interface Toast { id: string; type: NotifType; title: string; sub?: string }

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => {
        const cfg = NOTIF_CFG[t.type]
        return (
          <div key={t.id}
            className="pointer-events-auto flex items-start gap-3 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 shadow-2xl max-w-[300px] animate-in slide-in-from-right-4 fade-in duration-300">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
              <cfg.Icon className={`w-4 h-4 ${cfg.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium leading-snug">{t.title}</p>
              {t.sub && <p className="text-neutral-400 text-xs mt-0.5">{t.sub}</p>}
            </div>
            <button onClick={() => onDismiss(t.id)} className="text-neutral-600 hover:text-neutral-400 flex-shrink-0 mt-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
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
  const [toasts,         setToasts]         = useState<Toast[]>([])
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

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const pushNotif = useCallback((n: Omit<Notif, "id" | "read">) => {
    const id = `rt-${Date.now()}`
    setReadIds(prev => {
      const isRead = prev.has(id)
      setNotifs(existing => [{ ...n, id, read: isRead }, ...existing].slice(0, 30))
      return prev
    })
    // Also show a toast
    const toast: Toast = { id, type: n.type, title: n.title, sub: n.sub }
    setToasts(prev => [...prev.slice(-2), toast]) // max 3 toasts
    setTimeout(() => dismissToast(id), 4000)
  }, [dismissToast])

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
            .slice(0, 5)
            .forEach((l: { id: string; name: string; product?: string; createdAt?: string }) => {
              const id = `lead-${l.id}`
              newNotifs.push({
                id, type: "lead_confirmed",
                title: `Lead confirmé`,
                sub:   l.name + (l.product ? ` · ${l.product}` : ""),
                time:  l.createdAt ? relativeTime(l.createdAt) : "Récemment",
                href:  "/dashboard/leads",
                read:  seen.has(id),
              })
            })
        }
        if (Array.isArray(orders)) {
          setOrdersCount(orders.filter((o: { status: string }) => o.status === "PENDING" || o.status === "SHIPPED").length)
          orders
            .filter((o: { status: string }) => o.status === "DELIVERED")
            .slice(0, 4)
            .forEach((o: { id: string; customerName?: string; product?: string; createdAt?: string }) => {
              const id = `order-${o.id}`
              newNotifs.push({
                id, type: "order_delivered",
                title: `Commande livrée`,
                sub:   (o.customerName ?? "") + (o.product ? ` · ${o.product}` : ""),
                time:  o.createdAt ? relativeTime(o.createdAt) : "Récemment",
                href:  "/dashboard/orders",
                read:  seen.has(id),
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
    const fmt = (n: number) => `€${n.toFixed(2)}`
    if (e.type === "withdrawal_inserted") {
      pushNotif({ type: "wallet_requested", title: "Retrait en cours de traitement", sub: fmt(e.row.amount), time: "À l'instant", href: "/dashboard/wallet" })
    } else if (e.type === "withdrawal_updated") {
      if (e.row.status === "approved") {
        pushNotif({ type: "wallet_approved", title: "Retrait approuvé ✓", sub: `${fmt(e.row.amount)} envoyé sur votre compte`, time: "À l'instant", href: "/dashboard/wallet" })
        if (e.row.amount) fetchBalance(clientId)
      } else if (e.row.status === "rejected") {
        pushNotif({ type: "wallet_rejected", title: "Retrait refusé", sub: `${fmt(e.row.amount)} — contactez le support`, time: "À l'instant", href: "/dashboard/wallet" })
      }
    } else if (e.type === "balance_updated") {
      pushNotif({ type: "wallet_update", title: "Solde mis à jour", sub: fmt(e.row.amount), time: "À l'instant", href: "/dashboard/wallet" })
      fetchBalance(clientId)
    } else if (e.type === "lead_inserted") {
      pushNotif({ type: "lead_new", title: "Nouveau lead reçu", sub: e.row.name, time: "À l'instant", href: "/dashboard/leads" })
      setLeadsCount(c => c + 1)
    } else if (e.type === "lead_updated" && e.row.status === "CONFIRMED") {
      pushNotif({ type: "lead_confirmed", title: "Lead confirmé", sub: e.row.name, time: "À l'instant", href: "/dashboard/leads" })
    } else if (e.type === "order_inserted") {
      pushNotif({ type: "order_new", title: "Nouvelle commande", sub: e.row.name, time: "À l'instant", href: "/dashboard/orders" })
    } else if (e.type === "order_updated" && e.row.status === "DELIVERED") {
      pushNotif({ type: "order_delivered", title: "Commande livrée", sub: e.row.name, time: "À l'instant", href: "/dashboard/orders" })
    }
  }, [pushNotif, clientId, fetchBalance])

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
      <div className="px-3 flex items-center justify-between border-b border-neutral-800 h-16 overflow-hidden">
        {(!collapsed || inDrawer) && (
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <Logo size={40} showBg={false} />
            <p className="text-white font-bold text-sm leading-none truncate">CODShipEurope</p>
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
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                  <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-[360px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-orange-400" />
                        <p className="text-sm font-semibold text-white">Notifications</p>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-orange-500 text-white font-bold rounded-full px-1.5 py-0.5 leading-none">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors">
                            Tout lire
                          </button>
                        )}
                        <button onClick={() => setShowNotifs(false)} className="text-neutral-500 hover:text-white transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[420px] overflow-y-auto">
                      {notifs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                          <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-neutral-600" />
                          </div>
                          <p className="text-neutral-500 text-sm">Aucune notification</p>
                        </div>
                      ) : notifs.map(n => {
                        const cfg = NOTIF_CFG[n.type]
                        const Inner = (
                          <div onClick={() => markRead(n.id)}
                            className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-neutral-800/60 ${!n.read ? "bg-orange-500/[0.04]" : ""}`}>
                            {/* Icon */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                              <cfg.Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.badgeBg}`}>{cfg.badge}</span>
                                {!n.read && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />}
                              </div>
                              <p className={`text-sm leading-snug ${!n.read ? "text-white font-medium" : "text-neutral-300"}`}>{n.title}</p>
                              {n.sub && <p className="text-xs text-neutral-500 mt-0.5 truncate">{n.sub}</p>}
                              <p className="text-[11px] text-neutral-600 mt-1">{n.time}</p>
                            </div>
                            {n.href && <ChevronRight className="w-3.5 h-3.5 text-neutral-700 flex-shrink-0 mt-1" />}
                          </div>
                        )
                        return n.href ? (
                          <Link key={n.id} href={n.href} onClick={() => { markRead(n.id); setShowNotifs(false) }}>
                            {Inner}
                          </Link>
                        ) : (
                          <div key={n.id}>{Inner}</div>
                        )
                      })}
                    </div>
                  </div>
                </>
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

      {/* ── Toast notifications ─────────────────────────────── */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

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
