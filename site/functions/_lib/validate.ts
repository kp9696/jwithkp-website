export const SERVICES = ['call', 'it-infrastructure', 'network-design', 'cybersecurity', 'open-source', 'commercial', 'software-development', 'website-development', 'managed-it'] as const
export const SERVICE_LABELS: Record<string, string> = {
  call: 'A free 30-minute call',
  'it-infrastructure': 'IT Infrastructure',
  'network-design': 'Network Design',
  cybersecurity: 'Cybersecurity',
  'open-source': 'Open-Source Solutions',
  commercial: 'Commercial IT Solutions',
  'software-development': 'Web Application Development',
  'website-development': 'Website Development',
  'managed-it': 'Managed IT Services',
}
export const BUDGETS = ['', 'Not sure yet', 'Under ₹50,000', '₹50,000 – ₹2 lakh', '₹2 – ₹10 lakh', 'Above ₹10 lakh']

export interface EnquiryInput {
  name: string
  company: string
  email: string
  phone: string
  service: string
  budget: string
  message: string
  sourcePage: string
}

// eslint-disable-next-line no-control-regex
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max) : '')

export function parseEnquiry(raw: Record<string, unknown>): { ok: true; value: EnquiryInput } | { ok: false; errors: Record<string, string> } {
  const v: EnquiryInput = {
    name: clean(raw.name, 120),
    company: clean(raw.company, 160),
    email: clean(raw.email, 200).toLowerCase(),
    phone: clean(raw.phone, 40),
    service: clean(raw.service, 40),
    budget: clean(raw.budget, 40),
    message: clean(raw.message, 4000),
    sourcePage: clean(raw.sourcePage, 200),
  }
  const errors: Record<string, string> = {}
  if (v.name.length < 2) errors.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) errors.email = 'Please enter a valid email address.'
  if (v.phone && !/^[+\d][\d\s()-]{6,}$/.test(v.phone)) errors.phone = 'Please enter a valid phone number.'
  if (!(SERVICES as readonly string[]).includes(v.service)) errors.service = 'Please choose a service.'
  if (!BUDGETS.includes(v.budget)) v.budget = ''
  if (v.message.length < 10) errors.message = 'Please describe your requirement in a sentence or two.'
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: v }
}

/** Human-friendly unique reference, e.g. JWK-20261120-7K3QX. No look-alike characters. */
export function newReference(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(5))
  const tail = [...bytes].map((b) => alphabet[b % alphabet.length]).join('')
  return `JWK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${tail}`
}
