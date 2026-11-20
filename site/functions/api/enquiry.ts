import type { Ctx } from '../_lib/types'
import { fail, hashIp, json, readJson, sameOrigin, clientIp, withinLimit } from '../_lib/http'
import { newReference, parseEnquiry } from '../_lib/validate'
import { verifyTurnstile } from '../_lib/turnstile'
import { acknowledgement, salesNotice, sendMail } from '../_lib/email'

export const onRequestPost = async (ctx: Ctx) => {
  const { request, env } = ctx
  if (!sameOrigin(request)) return fail(403, 'Request not allowed.')
  const raw = await readJson<Record<string, unknown>>(request)
  if (!raw) return fail(400, 'Invalid request.')

  // Spam traps: a filled honeypot or an implausibly fast submit gets a normal-looking success and is dropped.
  const elapsed = Number(raw.elapsedMs)
  if ((typeof raw.website === 'string' && raw.website !== '') || (Number.isFinite(elapsed) && elapsed < 2500)) return json({ ok: true, reference: newReference() })

  const parsed = parseEnquiry(raw)
  if (!parsed.ok) return fail(400, 'Please check the highlighted fields.', { fields: parsed.errors })

  const ipHash = await hashIp(request, env)
  if (!(await withinLimit(env.DB, `enq:${ipHash}`, 5, 3600))) return fail(429, 'Too many enquiries from this connection. Please email info@jwithkp.com instead.')

  if (env.TURNSTILE_SECRET) {
    const token = typeof raw.turnstileToken === 'string' ? raw.turnstileToken : ''
    if (!(await verifyTurnstile(env.TURNSTILE_SECRET, token, clientIp(request)))) return fail(400, 'Spam check failed. Please reload the page and try again.')
  }

  const e = parsed.value
  let reference = ''
  for (let i = 0; i < 4 && !reference; i++) {
    const candidate = newReference()
    try {
      await env.DB.prepare(
        `INSERT INTO enquiries (reference, name, company, email, phone, service, budget, message, source_page, ip_hash, user_agent)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`,
      )
        .bind(candidate, e.name, e.company, e.email, e.phone, e.service, e.budget, e.message, e.sourcePage, ipHash, (request.headers.get('User-Agent') ?? '').slice(0, 200))
        .run()
      reference = candidate
    } catch (err) {
      if (!String(err).includes('UNIQUE')) throw err
    }
  }
  if (!reference) return fail(500, 'Could not save your enquiry. Please email info@jwithkp.com.')

  // The enquiry is saved. Emails go out in the background and can never fail the request.
  ctx.waitUntil(Promise.all([sendMail(env, acknowledgement(e, reference)), sendMail(env, salesNotice(env, e, reference))]))
  return json({ ok: true, reference })
}
