import fs   from "fs"
import path from "path"
import type { PaymentMethod } from "./db"

const DIR  = path.join(process.cwd(), "data")
const FILE = path.join(DIR, "payment_methods.json")

function ensure() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })
}

export function readPaymentMethods(): PaymentMethod[] {
  try {
    ensure()
    if (!fs.existsSync(FILE)) return []
    return JSON.parse(fs.readFileSync(FILE, "utf-8")) as PaymentMethod[]
  } catch { return [] }
}

export function writePaymentMethods(list: PaymentMethod[]): void {
  try {
    ensure()
    fs.writeFileSync(FILE, JSON.stringify(list, null, 2), "utf-8")
  } catch {}
}
