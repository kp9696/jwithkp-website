import type { AdminUser, Env, Role } from './types'
import { fail, hasXhrHeader, sameOrigin, sha256Hex } from './http'

// Passwords: PBKDF2-SHA256. 100,000 iterations is the maximum Cloudflare Workers allow.
// scripts/create-admin.mjs produces hashes in exactly this format.
const ITERATIONS = 100_000
const SESSION_DAYS = 7
const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b)))
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
const b64url = (b: Uint8Array) => b64(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(await derive(password, salt, ITERATIONS))}`
}

/** Constant-time comparison of two equal-length byte strings. */
function equal(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iter, salt, hash] = stored.split('$')
  if (scheme !== 'pbkdf2' || !iter || !salt || !hash) return false
  const derived = new Uint8Array(await derive(password, unb64(salt), Number(iter)))
  return equal(derived, unb64(hash))
}

// A fixed hash to compare against when the email is unknown, so timing does not reveal which emails exist.
export const DUMMY_HASH = 'pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='

const cookieName = (request: Request) => (new URL(request.url).protocol === 'https:' ? '__Host-jwkp_session' : 'jwkp_session')

export function sessionCookie(request: Request, token: string, maxAgeSec: number): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `${cookieName(request)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSec}${secure}`
}

export async function createSession(env: Env, request: Request, userId: number): Promise<string> {
  const token = b64url(crypto.getRandomValues(new Uint8Array(32)))
  const now = Math.floor(Date.now() / 1000)
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)')
    .bind(await sha256Hex(token), userId, now, now + SESSION_DAYS * 86400)
    .run()
  // Tidy expired sessions occasionally so the table stays small.
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?1').bind(now).run()
  return sessionCookie(request, token, SESSION_DAYS * 86400)
}

function readToken(request: Request): string {
  const name = cookieName(request)
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return ''
}

export async function currentUser(env: Env, request: Request): Promise<AdminUser | null> {
  const token = readToken(request)
  if (!token) return null
  const now = Math.floor(Date.now() / 1000)
  return env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN admin_users u ON u.id = s.user_id
     WHERE s.token_hash = ?1 AND s.expires_at > ?2`,
  )
    .bind(await sha256Hex(token), now)
    .first<AdminUser>()
}

export async function endSession(env: Env, request: Request): Promise<string> {
  const token = readToken(request)
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(await sha256Hex(token)).run()
  return sessionCookie(request, '', 0)
}

/** Guard for admin endpoints: signed in, allowed role, and (for writes) same-origin with the CSRF header. */
export async function requireUser(env: Env, request: Request, opts: { roles?: Role[]; write?: boolean } = {}): Promise<AdminUser | Response> {
  if (opts.write && (!sameOrigin(request) || !hasXhrHeader(request))) return fail(403, 'Request not allowed.')
  const user = await currentUser(env, request)
  if (!user) return fail(401, 'Please sign in.')
  if (opts.roles && !opts.roles.includes(user.role)) return fail(403, 'You do not have access to this.')
  return user
}
