/**
 * Minimal in-memory, per-instance rate limiter — best effort only.
 * It resets on cold start and is not shared across serverless instances,
 * but it still raises the cost of a brute-force attempt against a single
 * warm instance without adding external infrastructure (Redis, etc).
 */

const attempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}
