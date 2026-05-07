import fs from "fs"
import path from "path"

export interface ResetToken {
  token: string
  clientId: string
  email: string
  expiresAt: string
  used: boolean
}

const FILE = path.join(process.cwd(), "data", "reset_tokens.json")

export function readTokens(): ResetToken[] {
  try {
    if (!fs.existsSync(FILE)) return []
    return JSON.parse(fs.readFileSync(FILE, "utf-8"))
  } catch { return [] }
}

export function writeTokens(list: ResetToken[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2))
}

export function createResetToken(clientId: string, email: string): string {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1h
  const list = readTokens().filter(t => t.email !== email) // one active token per email
  list.push({ token, clientId, email, expiresAt, used: false })
  writeTokens(list)
  return token
}

export function consumeResetToken(token: string): ResetToken | null {
  const list = readTokens()
  const idx = list.findIndex(t => t.token === token)
  if (idx === -1) return null
  const t = list[idx]
  if (t.used) return null
  if (new Date(t.expiresAt) < new Date()) return null
  list[idx] = { ...t, used: true }
  writeTokens(list)
  return t
}
