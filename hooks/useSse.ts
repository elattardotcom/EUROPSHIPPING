"use client"

import { useEffect } from "react"
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
  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return
    const channel = sb
      .channel("codship-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "withdrawals" },
        (p) => onEvent({ type: "withdrawal_inserted", row: p.new as WithdrawalRow }))
      .on("postgres_changes", { event: "UPDATE",  schema: "public", table: "withdrawals" },
        (p) => onEvent({ type: "withdrawal_updated",  row: p.new as WithdrawalRow }))
      .on("postgres_changes", { event: "UPDATE",  schema: "public", table: "balances" },
        (p) => onEvent({ type: "balance_updated",     row: p.new as BalanceRow }))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" },
        (p) => onEvent({ type: "lead_inserted", row: p.new as LeadRow }))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leads" },
        (p) => onEvent({ type: "lead_updated",  row: p.new as LeadRow }))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" },
        (p) => onEvent({ type: "order_inserted", row: p.new as OrderRow }))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" },
        (p) => onEvent({ type: "order_updated",  row: p.new as OrderRow }))
      .subscribe()

    return () => { sb.removeChannel(channel) }
  }, [onEvent])
}
