/**
 * Read client_id from the browser cookie synchronously — no network fetch needed.
 * Works only client-side; returns "c1" (demo) during SSR.
 */
export function getClientIdFromCookie(): string {
  if (typeof document === "undefined") return "c1"
  const match = document.cookie.match(/(?:^|;)\s*client_id=([^;]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : "c1"
}
