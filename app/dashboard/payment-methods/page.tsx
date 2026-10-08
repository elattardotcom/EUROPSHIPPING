"use client"

import { GridBackground } from "@/components/dashboard/hud-accents"
import { PaymentMethodsManager } from "@/components/wallet/payment-methods-manager"

export default function PaymentMethodsPage() {
  return (
    <div className="relative p-4 md:p-6 space-y-4 md:space-y-6">
      <GridBackground />

      <div>
        <h1 className="text-2xl font-bold text-white">Payment methods</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage the bank, Wise, and crypto accounts your withdrawals can be paid to</p>
      </div>

      <PaymentMethodsManager />
    </div>
  )
}
