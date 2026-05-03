import fs   from "fs"
import path from "path"
import type { Client } from "./db"

const DIR  = path.join(process.cwd(), "data")
const FILE = path.join(DIR, "clients.json")

function ensure() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })
}

export function readClients(): Client[] {
  try {
    ensure()
    if (!fs.existsSync(FILE)) return []
    return JSON.parse(fs.readFileSync(FILE, "utf-8")) as Client[]
  } catch { return [] }
}

export function writeClients(list: Client[]): void {
  try {
    ensure()
    fs.writeFileSync(FILE, JSON.stringify(list, null, 2), "utf-8")
  } catch {}
}
