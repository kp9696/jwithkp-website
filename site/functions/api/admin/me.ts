import type { Ctx } from '../../_lib/types'
import { json } from '../../_lib/http'
import { requireUser } from '../../_lib/auth'

export const onRequestGet = async ({ request, env }: Ctx) => {
  const user = await requireUser(env, request)
  return user instanceof Response ? user : json({ ok: true, user })
}
