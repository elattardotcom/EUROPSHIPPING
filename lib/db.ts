import { getSupabase, getSupabaseAdmin } from "./supabase"
import { ALL_ORDERS, MOCK_CLIENT, MOCK_ADMIN_ORDERS, MOCK_ADMIN_LEADS, MOCK_STORES } from "./mock-data"
import { readWithdrawals, writeWithdrawals, readAdjustments, writeAdjustments } from "./store"
import { readClients, writeClients as _wc } from "./clients-store"

/* ── Types ─────────────────────────────────────────────────────────────── */

export type Plan        = "starter" | "pro" | "enterprise"
export type UserStatus  = "active" | "suspended" | "trial" | "cancelled"
export type LeadStatus  = "CONFIRMED" | "PENDING" | "UNREACHED" | "CANCELED" | "ERROR"
export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED" | "ERROR"
export type StoreStatus = "connected" | "syncing" | "error"
export type WithdrawalStatus = "pending" | "approved" | "rejected"

export interface BalanceAdjustment {
  id:        string
  clientId:  string
  amount:    number   // positive = credit, negative = debit
  reason:    string
  createdAt: string
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  country: string
  countryCode: string
  plan: Plan
  status: UserStatus
  joinedAt: string
  monthlyRevenue: number
  totalRevenue: number
  storesCount: number
  ordersCount: number
  leadsCount: number
  lastActive: string
  avatarColor: string
}

export interface AdminOrder {
  id: string
  clientId: string
  clientName: string
  customerName: string
  customerPhone: string
  country: string
  countryCode: string
  product: string
  value: number
  currency: string
  status: OrderStatus
  store: string
  trackingNumber?: string
  createdAt: string
}

export interface AdminLead {
  id: string
  clientId: string
  clientName: string
  customerName: string
  customerPhone: string
  country: string
  countryCode: string
  product: string
  value: number
  currency: string
  status: LeadStatus
  store: string
  createdAt: string
}

export interface AdminStore {
  id: string
  clientId: string
  name: string
  domain: string
  status: StoreStatus
  country: string
  ordersToday: number
  totalOrders: number
  currency: string
  lastSync: string
}

export interface Withdrawal {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  amount: number
  currency: string
  iban: string
  status: WithdrawalStatus
  requestedAt: string
  processedAt?: string
  adminNote?: string
}

/* ── Mappers ────────────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapClient = (r: any): Client => ({
  id:             r.id,
  firstName:      r.first_name,
  lastName:       r.last_name,
  email:          r.email,
  phone:          r.phone ?? "",
  company:        r.company ?? "",
  country:        r.country ?? "",
  countryCode:    r.country_code ?? "",
  plan:           r.plan,
  status:         r.status,
  joinedAt:       r.joined_at ?? "",
  monthlyRevenue: r.monthly_revenue ?? 0,
  totalRevenue:   r.total_revenue ?? 0,
  storesCount:    r.stores_count ?? 0,
  ordersCount:    r.orders_count ?? 0,
  leadsCount:     r.leads_count ?? 0,
  lastActive:     r.last_active ?? "",
  avatarColor:    r.avatar_color ?? "from-indigo-500 to-purple-600",
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapOrder = (r: any): AdminOrder => ({
  id:             r.id,
  clientId:       r.client_id,
  clientName:     r.client_name ?? "",
  customerName:   r.customer_name ?? "",
  customerPhone:  r.customer_phone ?? "",
  country:        r.country ?? "",
  countryCode:    r.country_code ?? "",
  product:        r.product ?? "",
  value:          r.value ?? 0,
  currency:       r.currency ?? "EUR",
  status:         r.status,
  store:          r.store ?? "",
  trackingNumber: r.tracking_number ?? undefined,
  createdAt:      r.created_at ?? "",
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapLead = (r: any): AdminLead => ({
  id:            r.id,
  clientId:      r.client_id,
  clientName:    r.client_name ?? "",
  customerName:  r.customer_name ?? "",
  customerPhone: r.customer_phone ?? "",
  country:       r.country ?? "",
  countryCode:   r.country_code ?? "",
  product:       r.product ?? "",
  value:         r.value ?? 0,
  currency:      r.currency ?? "EUR",
  status:        r.status,
  store:         r.store ?? "",
  createdAt:     r.created_at ?? "",
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapStore = (r: any): AdminStore => ({
  id:          r.id,
  clientId:    r.client_id,
  name:        r.name ?? "",
  domain:      r.domain ?? "",
  status:      r.status,
  country:     r.country ?? "",
  ordersToday: r.orders_today ?? 0,
  totalOrders: r.total_orders ?? 0,
  currency:    r.currency ?? "EUR",
  lastSync:    r.last_sync ?? "",
})

const frDate = (iso?: string | null): string => {
  if (!iso) return new Date().toLocaleString("fr-FR", {
    day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit",
  }).replace(",", " à")
  return new Date(iso).toLocaleString("fr-FR", {
    day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit",
  }).replace(",", " à")
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapWithdrawal = (r: any): Withdrawal => ({
  id:          r.id,
  clientId:    r.client_id,
  clientName:  r.client_name ?? "",
  clientEmail: r.client_email ?? "",
  amount:      r.amount ?? 0,
  currency:    r.currency ?? "EUR",
  iban:        r.iban ?? "",
  status:      r.status,
  requestedAt: frDate(r.requested_at),
  processedAt: r.processed_at ? frDate(r.processed_at) : undefined,
  adminNote:   r.admin_note ?? undefined,
})

/* ── Clients ────────────────────────────────────────────────────────────── */

export async function getClients(): Promise<Client[]> {
  const sb = getSupabaseAdmin()
  if (!sb) {
    const file = readClients()
    return file.length > 0 ? file : [MOCK_CLIENT]
  }
  const { data, error } = await sb.from("clients").select("*")
  if (error) {
    console.error("getClients error:", error.message)
    const file = readClients()
    return file.length > 0 ? file : [MOCK_CLIENT]
  }
  const result = (data ?? []).map(mapClient)
  return result.length > 0 ? result : [MOCK_CLIENT]
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const sb = getSupabaseAdmin()
    if (!sb) {
      const file = readClients()
      return file.find(c => c.id === id) ?? (id === "c1" ? MOCK_CLIENT : null)
    }
    const { data, error } = await sb.from("clients").select("*").eq("id", id).single()
    if (error) throw error
    return data ? mapClient(data) : (id === "c1" ? MOCK_CLIENT : null)
  } catch {
    const file = readClients()
    return file.find(c => c.id === id) ?? (id === "c1" ? MOCK_CLIENT : null)
  }
}

/* ── Orders ─────────────────────────────────────────────────────────────── */

export async function getAllOrders(): Promise<AdminOrder[]> {
  try {
    const sb = getSupabaseAdmin(); if (!sb) return MOCK_ADMIN_ORDERS
    const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false })
    if (error) throw error
    const result = (data ?? []).map(mapOrder)
    return result.length > 0 ? result : MOCK_ADMIN_ORDERS
  } catch { return MOCK_ADMIN_ORDERS }
}

export async function getClientOrders(clientId: string): Promise<AdminOrder[]> {
  try {
    const sb = getSupabaseAdmin(); if (!sb) return []
    const { data, error } = await sb.from("orders").select("*").eq("client_id", clientId).order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapOrder)
  } catch { return [] }
}

/* ── Leads ──────────────────────────────────────────────────────────────── */

export async function getAllLeads(): Promise<AdminLead[]> {
  try {
    const sb = getSupabaseAdmin(); if (!sb) return MOCK_ADMIN_LEADS
    const { data, error } = await sb.from("leads").select("*").order("created_at", { ascending: false })
    if (error) throw error
    const result = (data ?? []).map(mapLead)
    return result.length > 0 ? result : MOCK_ADMIN_LEADS
  } catch { return MOCK_ADMIN_LEADS }
}

export async function getClientLeads(clientId: string): Promise<AdminLead[]> {
  try {
    const sb = getSupabaseAdmin(); if (!sb) return []
    const { data, error } = await sb.from("leads").select("*").eq("client_id", clientId).order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapLead)
  } catch { return [] }
}

/* ── Stores ─────────────────────────────────────────────────────────────── */

export async function getClientStores(clientId: string): Promise<AdminStore[]> {
  try {
    const sb = getSupabaseAdmin(); if (!sb) return []
    const { data, error } = await sb.from("stores").select("*").eq("client_id", clientId)
    if (error) throw error
    return (data ?? []).map(mapStore)
  } catch { return [] }
}

/* ── File-backed withdrawal store (used when Supabase is not configured) ──── */

function memCreate(payload: Omit<Withdrawal, "id" | "status" | "requestedAt" | "processedAt" | "adminNote">): Withdrawal {
  const list = readWithdrawals()
  const w: Withdrawal = {
    id:          String(Date.now()),
    clientId:    payload.clientId,
    clientName:  payload.clientName,
    clientEmail: payload.clientEmail,
    amount:      payload.amount,
    currency:    payload.currency,
    iban:        payload.iban,
    status:      "pending",
    requestedAt: frDate(new Date().toISOString()),
  }
  list.unshift(w)
  writeWithdrawals(list)
  return w
}

/* ── Withdrawals ────────────────────────────────────────────────────────── */

export async function getWithdrawals(): Promise<Withdrawal[]> {
  const sb = getSupabaseAdmin()
  if (!sb) return readWithdrawals()
  try {
    const { data, error } = await sb.from("withdrawals").select("*").order("requested_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapWithdrawal)
  } catch { return readWithdrawals() }
}

export async function getClientWithdrawals(clientId: string): Promise<Withdrawal[]> {
  const sb = getSupabaseAdmin()
  if (!sb) return readWithdrawals().filter(w => w.clientId === clientId)
  try {
    const { data, error } = await sb.from("withdrawals").select("*").eq("client_id", clientId).order("requested_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapWithdrawal)
  } catch { return readWithdrawals().filter(w => w.clientId === clientId) }
}

/* Gross revenue = sum of all DELIVERED orders for this client */
async function getDeliveredRevenue(clientId: string): Promise<number> {
  if (clientId === "c1") {
    const raw = ALL_ORDERS.filter(o => o.status === "DELIVERED").reduce((s, o) => s + o.orderValue, 0)
    return Math.round(raw * 100) / 100
  }
  const sb = getSupabaseAdmin()
  if (!sb) return 0
  try {
    const { data } = await sb.from("orders").select("value").eq("client_id", clientId).eq("status", "DELIVERED")
    const raw = (data ?? []).reduce((s: number, r: { value: number }) => s + (r.value ?? 0), 0)
    return Math.round(raw * 100) / 100
  } catch { return 0 }
}

export interface BalanceSummary {
  grossRevenue: number
  adjustments:  number
  approved:     number
  pending:      number
  available:    number
}

export async function getClientAdjustments(clientId: string): Promise<BalanceAdjustment[]> {
  const sb = getSupabaseAdmin()
  if (sb) {
    try {
      const { data } = await sb
        .from("balance_adjustments")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
      if (data) return data.map((r: Record<string, unknown>) => ({
        id:        r.id as string,
        clientId:  r.client_id as string,
        amount:    r.amount as number,
        reason:    (r.reason as string) ?? "",
        createdAt: r.created_at as string,
      }))
    } catch {}
  }
  return readAdjustments().filter(a => a.clientId === clientId)
}

export async function createAdjustment(
  clientId: string, amount: number, reason: string,
): Promise<BalanceAdjustment> {
  const adj: BalanceAdjustment = {
    id:        `adj_${Date.now()}`,
    clientId,
    amount:    Math.round(amount * 100) / 100,
    reason,
    createdAt: new Date().toISOString(),
  }
  const sb = getSupabaseAdmin()
  if (sb) {
    try {
      const { data } = await sb
        .from("balance_adjustments")
        .insert({ client_id: clientId, amount: adj.amount, reason })
        .select()
        .single()
      if (data) return { id: data.id, clientId: data.client_id, amount: data.amount, reason: data.reason ?? "", createdAt: data.created_at }
    } catch {}
  }
  const list = readAdjustments()
  list.unshift(adj)
  writeAdjustments(list)
  return adj
}

export async function getBalanceSummary(clientId: string): Promise<BalanceSummary> {
  const [grossRevenue, adjList] = await Promise.all([
    getDeliveredRevenue(clientId),
    getClientAdjustments(clientId),
  ])
  const sb = getSupabaseAdmin()

  const rows: { amount: number; status: string }[] = sb
    ? await sb.from("withdrawals").select("amount, status").eq("client_id", clientId)
        .then(r => r.data ?? []).catch(() => readWithdrawals().filter(w => w.clientId === clientId))
    : readWithdrawals().filter(w => w.clientId === clientId)

  const adjustments = Math.round(adjList.reduce((s, a) => s + a.amount, 0) * 100) / 100
  const approved    = Math.round(rows.filter(r => r.status === "approved").reduce((s, r) => s + r.amount, 0) * 100) / 100
  const pending     = Math.round(rows.filter(r => r.status === "pending").reduce((s, r) => s + r.amount, 0) * 100) / 100
  const available   = Math.round(Math.max(0, grossRevenue + adjustments - approved - pending) * 100) / 100
  return { grossRevenue, adjustments, approved, pending, available }
}

export async function getBalance(clientId: string): Promise<number> {
  return (await getBalanceSummary(clientId)).available
}

export async function createWithdrawal(
  payload: Omit<Withdrawal, "id" | "status" | "requestedAt" | "processedAt" | "adminNote">
): Promise<Withdrawal | null> {
  const summary = await getBalanceSummary(payload.clientId)
  if (payload.amount > summary.available) return null

  const sb = getSupabaseAdmin()
  if (!sb) return memCreate(payload)

  try {
    const { data, error } = await sb.from("withdrawals").insert({
      client_id:    payload.clientId,
      client_name:  payload.clientName,
      client_email: payload.clientEmail,
      amount:       payload.amount,
      currency:     payload.currency,
      iban:         payload.iban,
    }).select().single()
    if (error || !data) return memCreate(payload)
    return mapWithdrawal(data)
  } catch { return memCreate(payload) }
}

export async function processWithdrawal(
  id: string,
  status: "approved" | "rejected",
  adminNote?: string,
): Promise<Withdrawal | null> {
  const sb = getSupabaseAdmin()
  if (!sb) {
    const list = readWithdrawals()
    const idx = list.findIndex(w => w.id === id && w.status === "pending")
    if (idx === -1) return null
    list[idx] = { ...list[idx], status, adminNote, processedAt: frDate(new Date().toISOString()) }
    writeWithdrawals(list)
    return list[idx]
  }
  try {
    const { data: existing, error: fetchErr } = await sb.from("withdrawals").select("*").eq("id", id).single()
    if (fetchErr || !existing || existing.status !== "pending") return null
    const { data, error } = await sb
      .from("withdrawals")
      .update({ status, admin_note: adminNote ?? null, processed_at: new Date().toISOString() })
      .eq("id", id).select().single()
    if (error || !data) return null
    return mapWithdrawal(data)
  } catch { return null }
}

/* ── Admin stats ────────────────────────────────────────────────────────── */

export async function getAdminStats() {
  const [clients, orders, leads] = await Promise.all([getClients(), getAllOrders(), getAllLeads()])
  const mrr   = clients.filter(c => c.status === "active").reduce((s, c) => s + c.monthlyRevenue, 0)
  const active = clients.filter(c => c.status === "active").length
  return { totalClients: clients.length, activeClients: active, totalOrders: orders.length, totalLeads: leads.length, mrr }
}
