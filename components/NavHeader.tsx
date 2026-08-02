"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, X, Menu } from "lucide-react"
import { Logo } from "@/components/logo"
import type { Lang } from "@/hooks/useLang"

type Page = "home" | "fees" | "pricing" | "blog"

const NAV: Record<Lang, { href: string; label: string; page: Page }[]> = {
  fr: [
    { href: "/",        label: "Accueil", page: "home"    },
    { href: "/pricing", label: "Tarifs",  page: "pricing" },
    { href: "/fees",    label: "Frais",   page: "fees"    },
    { href: "/blog",    label: "Blog",    page: "blog"    },
  ],
  en: [
    { href: "/",        label: "Home",    page: "home"    },
    { href: "/pricing", label: "Pricing", page: "pricing" },
    { href: "/fees",    label: "Fees",    page: "fees"    },
    { href: "/blog",    label: "Blog",    page: "blog"    },
  ],
}

export function NavHeader({
  lang,
  setLang,
  activePage,
  ctaNode,
}: {
  lang: Lang
  setLang: (l: Lang | ((p: Lang) => Lang)) => void
  activePage?: Page
  ctaNode?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const links = NAV[lang]

  return (
    <>
      <header
        className="sticky top-0 z-50 h-14 sm:h-16 flex items-center"
        style={{
          background: "rgba(6,6,6,0.88)",
          backdropFilter: "blur(24px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between gap-3">

          {/* Logo + name */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Logo size={36} />
            <span className="font-bold text-xs sm:text-sm tracking-tight text-white">CODShipEurope</span>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/25 bg-emerald-500/[0.08] px-2.5 py-1 rounded-full uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-500">
            {links.map(l => (
              <Link
                key={l.href} href={l.href}
                className={l.page === activePage ? "text-orange-400 font-semibold" : "hover:text-white transition-colors"}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right: lang toggle + CTA + hamburger */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setLang(l => l === "fr" ? "en" : "fr")}
              className="hidden sm:flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 transition-all"
            >
              {lang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
            </button>

            {ctaNode ?? (
              <Link
                href="/?signup=1"
                className="hidden sm:flex text-sm font-bold text-white px-4 py-2 rounded-lg items-center gap-1.5"
                style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 4px 20px rgba(249,115,22,0.3)" }}
              >
                {lang === "fr" ? "Démarrer" : "Get started"} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setOpen(v => !v)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              aria-label="Menu"
            >
              {open ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col"
          style={{ background: "rgba(5,5,5,0.97)", backdropFilter: "blur(24px)" }}
        >
          {/* Close tap area at top */}
          <div className="h-14" onClick={() => setOpen(false)} />

          {/* Nav links */}
          <div className="flex-1 flex flex-col items-center justify-center gap-10">
            {links.map(l => (
              <Link
                key={l.href} href={l.href}
                onClick={() => setOpen(false)}
                className="text-xl font-bold transition-colors"
                style={{ color: l.page === activePage ? "#fb923c" : "white" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Bottom: lang + CTA */}
          <div className="flex flex-col items-center gap-3 pb-14 px-6">
            <button
              onClick={() => setLang(l => l === "fr" ? "en" : "fr")}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-3 rounded-xl border border-white/15 text-neutral-300"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              {lang === "fr" ? "🇬🇧 Switch to English" : "🇫🇷 Passer en français"}
            </button>
            <Link
              href="/?signup=1"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white py-3.5 rounded-xl"
              style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 4px 24px rgba(249,115,22,0.4)" }}
            >
              {lang === "fr" ? "Créer mon compte" : "Create my account"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
