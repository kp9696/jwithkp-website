import type { Env } from './types'

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } })

export const fail = (status: number, message: string, extra: Record<string, unknown> = {}) => json({ ok: false, error: message, ...extra }, status)

/** Reads a small JSON body. Returns null if it is missing, too large or not valid JSON. */
export async function readJson<T>(request: Request, maxBytes = 20_000): Promise<T | null> {
  const text = await request.text()
  if (!text || text.length > maxBytes) return null
  try {
    const v = JSON.parse(text)
    return v && typeof v === 'object' ? (v as T) : null
  } catch {
    return null
  }
}

/** Browsers send Origin on cross-site writes. If it is present it must match this site. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin')
  if (!origin) return true
  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}

/** Extra CSRF guard for the admin API: cookie is SameSite=Strict, and writes also need this header. */
export const hasXhrHeader = (request: Request) => request.headers.get('X-Requested-With') === 'fetch'

export const clientIp = (request: Request) => request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || '0.0.0.0'

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** IP addresses are never stored in clear: only a salted hash, used for rate limiting and abuse review. */
export const hashIp = (request: Request, env: Env) => sha256Hex(`${env.IP_SALT ?? 'jwithkp'}|${clientIp(request)}`)

/** Fixed-window counter. Returns true while the caller is still within the limit. */
export async function withinLimit(db: D1Database, key: string, limit: number, windowSec: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000)
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN reset_at < ?3 THEN 1 ELSE count + 1 END,
         reset_at = CASE WHEN reset_at < ?3 THEN ?2 ELSE reset_at END
       RETURNING count`,
    )
    .bind(key, now + windowSec, now)
    .first<{ count: number }>()
  return (row?.count ?? 1) <= limit
}
