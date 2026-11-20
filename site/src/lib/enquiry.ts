// Enquiry submission: POST /api/enquiry (Cloudflare Pages Function: Turnstile, D1, email).
// If the API is unreachable it falls back to FormSubmit, the service the previous site used, so no lead is lost.
export const ENQUIRY_ENDPOINT = 'https://formsubmit.co/ajax/info@jwithkp.com'

export const serviceOptions = [
  { value: 'call', label: 'A free 30-minute call (not sure yet)' },
  { value: 'it-infrastructure', label: 'IT Infrastructure' },
  { value: 'network-design', label: 'Network Design' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'open-source', label: 'Open-Source Solutions' },
  { value: 'commercial', label: 'Commercial IT Solutions' },
  { value: 'software-development', label: 'Web Application Development' },
  { value: 'website-development', label: 'Website Development' },
  { value: 'managed-it', label: 'Managed IT Services' },
]

export const budgetOptions = ['Not sure yet', 'Under ₹50,000', '₹50,000 – ₹2 lakh', '₹2 – ₹10 lakh', 'Above ₹10 lakh']

export interface EnquiryInput {
  name: string
  company: string
  email: string
  phone: string
  service: string
  budget: string
  message: string
  website: string // honeypot: must stay empty
  startedAt: number
}

export type EnquiryErrors = Partial<Record<'name' | 'email' | 'service' | 'message' | 'phone', string>>

export function validate(d: EnquiryInput): EnquiryErrors {
  const e: EnquiryErrors = {}
  if (d.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = 'Please enter a valid business email.'
  if (d.phone.trim() && !/^[+\d][\d\s()-]{6,}$/.test(d.phone.trim())) e.phone = 'Please enter a valid phone number.'
  if (!d.service) e.service = 'Please choose a service.'
  if (d.message.trim().length < 10) e.message = 'Please describe your requirement in a sentence or two.'
  return e
}

export type SubmitResult =
  | { status: 'ok'; reference?: string }
  | { status: 'invalid'; message: string; fields?: EnquiryErrors }
  | { status: 'failed'; message?: string }

/** Legacy path, used only when the API is unreachable, so a lead is never lost. */
async function submitViaFormSubmit(d: EnquiryInput, label: string): Promise<boolean> {
  try {
    const res = await fetch(ENQUIRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: `New enquiry: ${label}`, _captcha: 'false', name: d.name.trim(), company: d.company.trim(), email: d.email.trim(), phone: d.phone.trim(), service: label, budget: d.budget, message: d.message.trim() }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function submitEnquiry(d: EnquiryInput, turnstileToken = ''): Promise<SubmitResult> {
  const label = serviceOptions.find((s) => s.value === d.service)?.label ?? d.service
  try {
    const res = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...d, elapsedMs: Date.now() - d.startedAt, turnstileToken, sourcePage: window.location.pathname }),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; reference?: string; error?: string; fields?: EnquiryErrors }
    if (res.ok && data.ok) return { status: 'ok', reference: data.reference }
    // The visitor can fix these: show the message. Anything else falls through to the fallback below.
    if (res.status === 400 || res.status === 403 || res.status === 429) return { status: 'invalid', message: data.error ?? 'Please check the form and try again.', fields: data.fields }
  } catch {
    /* network error: use the fallback */
  }
  // Honeypot and speed checks already ran on the server; a bot would not reach here with real values.
  if (d.website) return { status: 'ok' }
  return (await submitViaFormSubmit(d, label)) ? { status: 'ok' } : { status: 'failed' }
}
