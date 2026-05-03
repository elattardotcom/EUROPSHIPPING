import fs     from "fs"
import path   from "path"
import crypto from "crypto"
import { getSupabase } from "./supabase"

interface AuthRecord {
  clientId: string
  email:    string
  hash:     string
}

const DIR  = path.join(process.cwd(), "data")
const FILE = path.join(DIR, "auth.json")

function ensure() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })
}

function readAuth(): AuthRecord[] {
  try {
    ensure()
    if (!fs.existsSync(FILE)) return []
    return JSON.parse(fs.readFileSync(FILE, "utf-8")) as AuthRecord[]
  } catch { return [] }
}

function writeAuth(list: AuthRecord[]): void {
  try {
    ensure()
    fs.writeFileSync(FILE, JSON.stringify(list, null, 2), "utf-8")
  } catch {}
}

export function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update(pw + "codship_salt").digest("hex")
}

// File-based fallback (local dev only — not reliable in serverless)
function createAuthRecord(clientId: string, email: string, password: string): void {
  const list = readAuth()
  const idx  = list.findIndex(a => a.email === email)
  const rec  = { clientId, email, hash: hashPassword(password) }
  if (idx >= 0) list[idx] = rec
  else list.push(rec)
  writeAuth(list)
}

function verifyAuthFile(email: string, password: string): string | null {
  const list = readAuth()
  const rec  = list.find(a => a.email === email)
  if (!rec || rec.hash !== hashPassword(password)) return null
  return rec.clientId
}

// ── Primary: save hash directly in clients table (most reliable) ──────────────
export async function createAuthRecordDb(clientId: string, email: string, password: string): Promise<void> {
  const hash = hashPassword(password)

  // Always write file as local dev fallback
  createAuthRecord(clientId, email, password)

  const sb = getSupabase()
  if (!sb) return

  // Primary: store hash in clients table (column added via migration)
  const { error: clientErr } = await sb
    .from("clients")
    .update({ password_hash: hash })
    .eq("id", clientId)

  if (clientErr) {
    // Column might not exist yet — fall back to auth_credentials table
    await sb
      .from("auth_credentials")
      .upsert({ client_id: clientId, email, hash }, { onConflict: "email" })
      .then(() => {}) // ignore error, file fallback covers local dev
  }
}

// ── Primary: verify from clients table, then auth_credentials, then file ──────
export async function verifyAuthDb(email: string, password: string): Promise<string | null> {
  const hash = hashPassword(password)
  const sb   = getSupabase()

  if (sb) {
    // 1. Check clients.password_hash (fastest and most reliable)
    const { data: clientData } = await sb
      .from("clients")
      .select("id, password_hash")
      .eq("email", email)
      .maybeSingle()

    if (clientData) {
      if (clientData.password_hash === hash) return clientData.id as string
      // Email found but wrong password — fail immediately (don't check other sources)
      return null
    }

    // 2. Fallback: auth_credentials table
    const { data: credData } = await sb
      .from("auth_credentials")
      .select("client_id")
      .eq("email", email)
      .eq("hash", hash)
      .maybeSingle()

    if (credData?.client_id) return credData.client_id as string
  }

  // 3. Last resort: local file (local dev only)
  return verifyAuthFile(email, password)
}

export async function findByEmailDb(email: string): Promise<AuthRecord | null> {
  const sb = getSupabase()
  if (sb) {
    const { data } = await sb
      .from("clients")
      .select("id, email")
      .eq("email", email)
      .maybeSingle()
    if (data) return { clientId: data.id, email: data.email, hash: "" }
  }
  const list = readAuth()
  return list.find(a => a.email === email) ?? null
}
