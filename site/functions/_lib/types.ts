export interface Env {
  DB: D1Database
  SITE_ORIGIN?: string
  NOTIFY_EMAIL?: string
  FROM_EMAIL?: string
  TURNSTILE_SECRET?: string
  RESEND_API_KEY?: string
  IP_SALT?: string
}

export type Ctx<P extends string = string> = EventContext<Env, P, Record<string, unknown>>

export const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost', 'spam'] as const
export type Status = (typeof STATUSES)[number]
export type Role = 'admin' | 'sales'

export interface AdminUser {
  id: number
  email: string
  name: string
  role: Role
}
