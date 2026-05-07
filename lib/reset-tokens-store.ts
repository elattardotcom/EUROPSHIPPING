import crypto from "crypto"

// Token = base64url(payload) + "." + base64url(HMAC-SHA256 signature)
// No file/DB storage needed — token is self-contained and cryptographically signed.
// Trade-off: can't mark as "used" server-side, but changing the password makes re-use harmless.

const SECRET = process.env.RESET_TOKEN_SECRET ?? "codship_reset_salt_2025"

interface TokenPayload {
  clientId: string
  email: string
  exp: number
}

export interface ResetToken {
  token: string
  clientId: string
  email: string
  expiresAt: string
  used: boolean
}

export function createResetToken(clientId: string, email: string): string {
  const payload: TokenPayload = {
    clientId,
    email,
    exp: Date.now() + 60 * 60 * 1000, // 1 hour
  }
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const sig  = crypto.createHmac("sha256", SECRET).update(data).digest("base64url")
  return `${data}.${sig}`
}

export function consumeResetToken(token: string): ResetToken | null {
  const parts = token.split(".")
  if (parts.length !== 2) return null
  const [data, sig] = parts

  const expectedSig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url")
  if (sig !== expectedSig) return null

  let payload: TokenPayload
  try {
    payload = JSON.parse(Buffer.from(data, "base64url").toString()) as TokenPayload
  } catch { return null }

  if (Date.now() > payload.exp) return null

  return {
    token,
    clientId:  payload.clientId,
    email:     payload.email,
    expiresAt: new Date(payload.exp).toISOString(),
    used:      false,
  }
}
