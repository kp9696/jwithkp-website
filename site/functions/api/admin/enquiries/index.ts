import type { Ctx } from '../../../_lib/types'
import { STATUSES } from '../../../_lib/types'
import { json } from '../../../_lib/http'
import { requireUser } from '../../../_lib/auth'

const COLUMNS = 'id, reference, created_at, updated_at, name, company, email, phone, service, budget, status, substr(message, 1, 160) AS preview'

export const onRequestGet = async ({ request, env }: Ctx) => {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user

  const url = new URL(request.url)
  const status = url.searchParams.get('status') ?? ''
  const q = (url.searchParams.get('q') ?? '').trim().slice(0, 100)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const pageSize = 25

  const where: string[] = []
  const args: unknown[] = []
  if ((STATUSES as readonly string[]).includes(status)) { where.push('status = ?'); args.push(status) }
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`
    where.push("(reference LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\' OR company LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR message LIKE ? ESCAPE '\\')")
    args.push(like, like, like, like, like)
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const [rows, total, counts] = await Promise.all([
    env.DB.prepare(`SELECT ${COLUMNS} FROM enquiries ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...args, pageSize, (page - 1) * pageSize).all(),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM enquiries ${clause}`).bind(...args).first<{ n: number }>(),
    env.DB.prepare('SELECT status, COUNT(*) AS n FROM enquiries GROUP BY status').all<{ status: string; n: number }>(),
  ])
  return json({ ok: true, items: rows.results, total: total?.n ?? 0, page, pageSize, counts: Object.fromEntries((counts.results ?? []).map((c) => [c.status, c.n])) })
}
