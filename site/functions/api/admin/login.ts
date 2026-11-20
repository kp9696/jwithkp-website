import type { AdminUser, Ctx } from '../../_lib/types'
import { fail, hashIp, hasXhrHeader, json, readJson, sameOrigin, withinLimit } from '../../_lib/http'
import { DUMMY_HASH, createSession, verifyPassword } from '../../_lib/auth'

export const onRequestPost = async ({ request, env }: Ctx) => {
  if (!sameOrigin(request) || !hasXhrHeader(request)) return fail(403, 'Request not allowed.')
  const body = await readJson<{ email?: string; password?: string }>(request, 2000)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : ''
  const password = typeof body?.password === 'string' ? body.password.slice(0, 200) : ''
  if (!email || !password) return fail(400, 'Enter your email and password.')

  // 5 attempts per 15 minutes per connection and email.
  const ipHash = await hashIp(request, env)
  if (!(await withinLimit(env.DB, `login:${ipHash}:${email}`, 5, 900))) return fail(429, 'Too many attempts. Try again in a few minutes.')

  const row = await env.DB.prepare('SELECT id, email, name, role, password_hash FROM admin_users WHERE email = ?1').bind(email).first<AdminUser & { password_hash: string }>()
  const ok = await verifyPassword(password, row?.password_hash ?? DUMMY_HASH)
  if (!row || !ok) return fail(401, 'Email or password is incorrect.')

  const cookie = await createSession(env, request, row.id)
  await env.DB.prepare("UPDATE admin_users SET last_login = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?1").bind(row.id).run()
  return json({ ok: true, user: { id: row.id, email: row.email, name: row.name, role: row.role } }, 200, { 'Set-Cookie': cookie })
}
