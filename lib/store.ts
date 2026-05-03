import fs   from "fs"
import path from "path"
import type { Withdrawal, BalanceAdjustment } from "./db"

const DIR  = path.join(process.cwd(), "data")
const FILE = path.join(DIR, "withdrawals.json")
const ADJ_FILE = path.join(DIR, "balance_adjustments.json")

function ensure() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })
}

export function readWithdrawals(): Withdrawal[] {
  try {
    ensure()
    if (!fs.existsSync(FILE)) return []
    return JSON.parse(fs.readFileSync(FILE, "utf-8")) as Withdrawal[]
  } catch { return [] }
}

export function writeWithdrawals(list: Withdrawal[]): void {
  try {
    ensure()
    fs.writeFileSync(FILE, JSON.stringify(list, null, 2), "utf-8")
  } catch {}
}

export function readAdjustments(): BalanceAdjustment[] {
  try {
    ensure()
    if (!fs.existsSync(ADJ_FILE)) return []
    return JSON.parse(fs.readFileSync(ADJ_FILE, "utf-8")) as BalanceAdjustment[]
  } catch { return [] }
}

export function writeAdjustments(list: BalanceAdjustment[]): void {
  try {
    ensure()
    fs.writeFileSync(ADJ_FILE, JSON.stringify(list, null, 2), "utf-8")
  } catch {}
}
