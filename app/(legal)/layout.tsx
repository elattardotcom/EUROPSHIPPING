import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header
        className="sticky top-0 z-40 h-16 border-b border-white/[0.05]"
        style={{ background: "rgba(8,8,8,0.95)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Logo size={32} showBg={true} />
            <span className="font-black text-lg tracking-tight">CODShip</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">{children}</main>

      <footer className="border-t border-white/[0.04] py-8 text-center text-xs text-neutral-700">
        <div className="flex items-center justify-center gap-6 mb-3">
          {[
            ["Conditions", "/conditions"],
            ["Confidentialité", "/confidentialite"],
            ["RGPD", "/rgpd"],
            ["Mentions légales", "/mentions-legales"],
          ].map(([l, h]) => (
            <Link key={h} href={h} className="hover:text-neutral-400 transition-colors">
              {l}
            </Link>
          ))}
        </div>
        © 2025 CODShip. Tous droits réservés.
      </footer>
    </div>
  )
}
