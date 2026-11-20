import type { Ctx } from '../../_lib/types'
import { fail, hasXhrHeader, json, sameOrigin } from '../../_lib/http'
import { endSession } from '../../_lib/auth'

export const onRequestPost = async ({ request, env }: Ctx) => {
  if (!sameOrigin(request) || !hasXhrHeader(request)) return fail(403, 'Request not allowed.')
  return json({ ok: true }, 200, { 'Set-Cookie': await endSession(env, request) })
}
