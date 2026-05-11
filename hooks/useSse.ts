"use client"

import { useEffect, useRef } from "react"
import { getSupabase } from "@/lib/supabase"

type WithdrawalRow = {
  id: string
  client_id: string
  status: string
  amount: number
  requested_at: string
  processed_at?: string
  admin_note?: string
}

type BalanceRow = {
  client_id: string
  amount: number
}

type LeadRow = {
  id: string
  client_id: string
  status: string
  name: string
  product?: string
}

type OrderRow = {
  id: string
  client_id: string
  status: string
  name: string
  product?: string
  order_value?: number
}

export type RealtimeWithdrawalEvent =
  | { type: "withdrawal_inserted"; row: WithdrawalRow }
  | { type: "withdrawal_updated";  row: WithdrawalRow }

export type RealtimeBalanceEvent = {
  type: "balance_updated"
  row: BalanceRow
}

export type RealtimeLeadEvent =
  | { type: "lead_inserted"; row: LeadRow }
  | { type: "lead_updated";  row: LeadRow }

export type RealtimeOrderEvent =
  | { type: "order_inserted"; row: OrderRow }
  | { type: "order_updated";  row: OrderRow }

export type RealtimeEvent =
  | RealtimeWithdrawalEvent
  | RealtimeBalanceEvent
  | RealtimeLeadEvent
  | RealtimeOrderEvent

export function useRealtime(onEvent: (e: RealtimeEvent) => void) {
  // Keep a stable ref so the channel is only created once (no deps on onEvent)
  const cbRef = useRef(onEvent)
  useEffect(() => { cbRef.current = onEvent })

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return

    // Unique channel name prevents collision when hook is used in multiple components
    const channelId = Math.random().toString(36).slice(2, 8)
    const channel = sb
      .channel(`codship-rt-${channelId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "withdrawals" },
        (p) => cbRef.current({ type: "withdrawal_inserted", row: p.new as WithdrawalRow }))
      .on("postgres_changes", { event: "UPDATE",  schema: "public", table: "withdrawals" },
        (p) => cbRef.current({ type: "withdrawal_updated",  row: p.new as WithdrawalRow }))
      .on("postgres_changes", { event: "UPDATE",  schema: "public", table: "balances" },
        (p) => cbRef.current({ type: "balance_updated",     row: p.new as BalanceRow }))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" },
        (p) => cbRef.current({ type: "lead_inserted", row: p.new as LeadRow }))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leads" },
        (p) => cbRef.current({ type: "lead_updated",  row: p.new as LeadRow }))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" },
        (p) => cbRef.current({ type: "order_inserted", row: p.new as OrderRow }))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" },
        (p) => cbRef.current({ type: "order_updated",  row: p.new as OrderRow }))
      .subscribe()

    return () => { sb.removeChannel(channel) }
  }, []) // runs once on mount — cbRef always has the latest callback
}
