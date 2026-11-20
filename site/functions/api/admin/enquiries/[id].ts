import type { Ctx } from '../../../_lib/types'
import { STATUSES } from '../../../_lib/types'
import { fail, json, readJson } from '../../../_lib/http'
import { requireUser } from '../../../_lib/auth'

const idOf = (ctx: Ctx<'id'>) => {
  const n = Number(ctx.params.id)
  return Number.isInteger(n) && n > 0 ? n : 0
}

export const onRequestGet = async (ctx: Ctx<'id'>) => {
  const user = await requireUser(ctx.env, ctx.request)
  if (user instanceof Response) return user
  const id = idOf(ctx)
  if (!id) return fail(404, 'Not found.')
  const row = await ctx.env.DB.prepare('SELECT id, reference, created_at, updated_at, name, company, email, phone, service, budget, message, status, notes, updated_by, source_page FROM enquiries WHERE id = ?1').bind(id).first()
  return row ? json({ ok: true, item: row }) : fail(404, 'Not found.')
}

export const onRequestPatch = async (ctx: Ctx<'id'>) => {
  const user = await requireUser(ctx.env, ctx.request, { write: true })
  if (user instanceof Response) return user
  const id = idOf(ctx)
  if (!id) return fail(404, 'Not found.')
  const body = await readJson<{ status?: string; notes?: string }>(ctx.request, 10_000)
  if (!body) return fail(400, 'Invalid request.')

  const sets: string[] = []
  const args: unknown[] = []
  if (body.status !== undefined) {
    if (!(STATUSES as readonly string[]).includes(body.status)) return fail(400, 'Unknown status.')
    sets.push('status = ?'); args.push(body.status)
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== 'string' || body.notes.length > 5000) return fail(400, 'Notes are too long.')
    sets.push('notes = ?'); args.push(body.notes)
  }
  if (!sets.length) return fail(400, 'Nothing to update.')
  sets.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')", 'updated_by = ?'); args.push(user.email)

  const res = await ctx.env.DB.prepare(`UPDATE enquiries SET ${sets.join(', ')} WHERE id = ?`).bind(...args, id).run()
  return res.meta.changes ? json({ ok: true }) : fail(404, 'Not found.')
}
