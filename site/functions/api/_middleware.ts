import { fail } from '../_lib/http'
import type { Env } from '../_lib/types'

// Every /api response is uncacheable, and an unexpected error becomes a clean JSON 500 instead of a stack trace.
export const onRequest: PagesFunction<Env> = async (ctx) => {
  try {
    const res = await ctx.next()
    const out = new Response(res.body, res)
    out.headers.set('Cache-Control', 'no-store')
    out.headers.set('X-Content-Type-Options', 'nosniff')
    return out
  } catch (err) {
    console.error('api error', err instanceof Error ? err.message : err)
    return fail(500, 'Something went wrong. Please try again.')
  }
}
