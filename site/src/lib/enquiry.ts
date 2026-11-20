// Enquiry submission. Phase 3 replaces this with the Cloudflare Worker API (/api/enquiry -> D1 + email).
// Until then it posts to FormSubmit, the same service the current site uses.
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

export async function submitEnquiry(d: EnquiryInput): Promise<'ok' | 'failed'> {
  // Spam checks: honeypot filled, or form submitted implausibly fast. Report success silently.
  if (d.website || Date.now() - d.startedAt < 2500) return 'ok'
  const label = serviceOptions.find((s) => s.value === d.service)?.label ?? d.service
  try {
    const res = await fetch(ENQUIRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `New enquiry: ${label}`,
        _captcha: 'false',
        name: d.name.trim(),
        company: d.company.trim(),
        email: d.email.trim(),
        phone: d.phone.trim(),
        service: label,
        budget: d.budget,
        message: d.message.trim(),
      }),
    })
    return res.ok ? 'ok' : 'failed'
  } catch {
    return 'failed'
  }
}
