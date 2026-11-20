import type { Ctx } from '../../_lib/types'
import { requireUser } from '../../_lib/auth'

// Spreadsheet programs run cells that start with = + - @ as formulas, so those are prefixed with an apostrophe.
const cell = (v: unknown) => {
  let s = String(v ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export const onRequestGet = async ({ request, env }: Ctx) => {
  const user = await requireUser(env, request, { roles: ['admin'] })
  if (user instanceof Response) return user
  const { results } = await env.DB.prepare('SELECT reference, created_at, name, company, email, phone, service, budget, status, message, notes FROM enquiries ORDER BY created_at DESC').all()
  const cols = ['reference', 'created_at', 'name', 'company', 'email', 'phone', 'service', 'budget', 'status', 'message', 'notes']
  const csv = [cols.join(','), ...results.map((r) => cols.map((c) => cell((r as Record<string, unknown>)[c])).join(','))].join('\r\n')
  return new Response(`﻿${csv}`, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="enquiries-${new Date().toISOString().slice(0, 10)}.csv"`, 'Cache-Control': 'no-store' } })
}
