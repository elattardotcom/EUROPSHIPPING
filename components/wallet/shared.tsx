import { Clock, CheckCircle, XCircle } from "lucide-react"
import type { Withdrawal, WithdrawalStatus } from "@/lib/db"

export const CURRENCIES = ["EUR", "USD", "GBP", "MAD"]

export const STATUS_CFG: Record<WithdrawalStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  pending:  { label: "Pending",  color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/25",    Icon: Clock },
  approved: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25", Icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-red-400",     bg: "bg-red-500/15 border-red-500/25",         Icon: XCircle },
}

export function getWithdrawalLabel(w: Withdrawal): string {
  if (w.paymentMethodType === "wise" && w.paymentDetails) {
    return `Wise withdrawal — ${w.paymentDetails.split("|")[0]}`
  }
  if (w.paymentMethodType === "crypto" && w.paymentDetails) {
    const [network, addr] = w.paymentDetails.split("|")
    return `Crypto withdrawal (${network ?? ""}) — ${addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ""}`
  }
  const raw = (w.paymentDetails || w.iban).replace(/\s/g, "")
  return `Bank transfer — IBAN ***${raw.slice(-4)}`
}

export function WiseLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="#9FE870"/>
      <path fill="#163300" d="M8,17 L12,9.5 L23,9.5 L27,14 L23,18.5 L18,18.5 L18,25 L13,25 L13,18.5 Z"/>
    </svg>
  )
}

export function BinanceLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
      <path
        fillRule="evenodd"
        fill="white"
        d="M16,3 L22,9 L16,15 L10,9 Z M9,10 L15,16 L9,22 L3,16 Z M16,10 L22,16 L16,22 L10,16 Z M23,10 L29,16 L23,22 L17,16 Z M16,17 L22,23 L16,29 L10,23 Z"
      />
    </svg>
  )
}

export function PaymentMethodIcon({ type, size = 18 }: { type: string; size?: number }) {
  if (type === "wise") return <WiseLogo size={size} />
  if (type === "crypto") return <BinanceLogo size={size} />
  return null
}
