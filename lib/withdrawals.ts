export type WithdrawalStatus = "pending" | "approved" | "rejected"

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

export type SseEvent =
  | { type: "withdrawal_created"; withdrawal: Withdrawal }
  | { type: "withdrawal_updated"; withdrawal: Withdrawal; balance: number }

/* ── Balances par client ──────────────────────────────────────────────── */
const INITIAL_BALANCES: Record<string, number> = {
  c1:  3847.75,
  c2:  2100.00,
  c3:  1560.50,
  c4:  2890.00,
  c5:   340.00,
  c6:   780.25,
  c7:  5230.00,
  c8:   120.00,
  c9:     0.00,
  c10:  95.00,
}

/* ── Singleton serveur ────────────────────────────────────────────────── */
const g = globalThis as typeof globalThis & {
  _codship_withdrawals?: Withdrawal[]
  _codship_balances?: Record<string, number>
  _codship_subscribers?: Map<string, (data: string) => void>
}

if (!g._codship_withdrawals) {
  g._codship_withdrawals = [
    {
      id: "w1", clientId: "c1", clientName: "Soufiane Attar",  clientEmail: "soufiane@codship.com",
      amount: 500,   currency: "EUR", iban: "PT50 0002 0000 0001 2345 6781 4",
      status: "pending",  requestedAt: "10 Mai 2025 à 14:32",
    },
    {
      id: "w2", clientId: "c2", clientName: "Karim Benali",    clientEmail: "karim@dropkb.com",
      amount: 300,   currency: "EUR", iban: "PT50 0003 0000 0002 3456 7892 5",
      status: "pending",  requestedAt: "10 Mai 2025 à 11:15",
    },
    {
      id: "w3", clientId: "c7", clientName: "Ilham Berrada",   clientEmail: "ilham@speedit.com",
      amount: 1000,  currency: "EUR", iban: "PT50 0007 0000 0007 8901 2343 8",
      status: "approved", requestedAt: "8 Mai 2025 à 09:00", processedAt: "9 Mai 2025 à 10:20",
      adminNote: "Virement effectué avec succès",
    },
    {
      id: "w4", clientId: "c3", clientName: "Sara Mansouri",   clientEmail: "sara@modafr.com",
      amount: 200,   currency: "EUR", iban: "FR76 3000 6000 0100 1234 5678 910",
      status: "rejected", requestedAt: "7 Mai 2025 à 16:45", processedAt: "8 Mai 2025 à 09:00",
      adminNote: "IBAN incorrect, merci de le vérifier",
    },
    {
      id: "w5", clientId: "c4", clientName: "Ahmed Rifai",     clientEmail: "ahmed@codespa.com",
      amount: 750,   currency: "EUR", iban: "ES91 2100 0418 4502 0005 1332",
      status: "pending",  requestedAt: "9 Mai 2025 à 18:00",
    },
  ]
  g._codship_balances = { ...INITIAL_BALANCES }
}

if (!g._codship_subscribers) g._codship_subscribers = new Map()

/* ── SSE broadcast ────────────────────────────────────────────────────── */
export function addSubscriber(id: string, send: (data: string) => void) {
  g._codship_subscribers!.set(id, send)
}

export function removeSubscriber(id: string) {
  g._codship_subscribers!.delete(id)
}

function broadcast(event: SseEvent) {
  const msg = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
  for (const [id, send] of g._codship_subscribers!) {
    try { send(msg) } catch { g._codship_subscribers!.delete(id) }
  }
}

/* ── Data functions ───────────────────────────────────────────────────── */
export function getWithdrawals(): Withdrawal[] {
  return g._codship_withdrawals!
}

export function getBalance(clientId: string): number {
  return g._codship_balances![clientId] ?? 0
}

export function createWithdrawal(data: Omit<Withdrawal, "id" | "status" | "requestedAt">): Withdrawal {
  const w: Withdrawal = {
    ...data,
    id: `w${Date.now()}`,
    status: "pending",
    requestedAt: new Date().toLocaleString("fr-FR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }).replace(",", " à"),
  }
  g._codship_withdrawals!.unshift(w)
  broadcast({ type: "withdrawal_created", withdrawal: w })
  return w
}

export function processWithdrawal(id: string, status: "approved" | "rejected", adminNote?: string): Withdrawal | null {
  const list = g._codship_withdrawals!
  const idx  = list.findIndex(w => w.id === id)
  if (idx === -1) return null

  const w = list[idx]
  if (w.status !== "pending") return null

  w.status      = status
  w.processedAt = new Date().toLocaleString("fr-FR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }).replace(",", " à")
  w.adminNote   = adminNote

  if (status === "approved") {
    g._codship_balances![w.clientId] = Math.max(0, (g._codship_balances![w.clientId] ?? 0) - w.amount)
  }

  broadcast({ type: "withdrawal_updated", withdrawal: w, balance: g._codship_balances![w.clientId] ?? 0 })
  return w
}

export function getClientWithdrawals(clientId: string): Withdrawal[] {
  return g._codship_withdrawals!.filter(w => w.clientId === clientId)
}
