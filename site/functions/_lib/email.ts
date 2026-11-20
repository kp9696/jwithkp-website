import type { Env } from './types'
import { SERVICE_LABELS, type EnquiryInput } from './validate'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

interface Mail { to: string; subject: string; text: string; html: string; replyTo?: string }

/** Sends through Resend. Never throws: a mail problem must not lose or delay an enquiry that is already saved. */
export async function sendMail(env: Env, mail: Mail): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.FROM_EMAIL ?? 'JwithKP Technology <enquiries@jwithkp.com>', to: [mail.to], subject: mail.subject, text: mail.text, html: mail.html, reply_to: mail.replyTo }),
    })
    return res.ok
  } catch {
    return false
  }
}

export function acknowledgement(e: EnquiryInput, reference: string): Mail {
  const service = SERVICE_LABELS[e.service] ?? e.service
  const text = `Hello ${e.name},\n\nThank you for contacting JwithKP Technology. We have received your enquiry and will reply by email, usually within 24 business hours.\n\nYour reference: ${reference}\nService: ${service}\n\nYou can reply to this email if you want to add anything.\n\nJwithKP Technology\nTechnology That Builds Your Business.\nhttps://www.jwithkp.com`
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;color:#172B4D"><h2 style="color:#0B1428">Thank you, ${esc(e.name)}.</h2><p>We have received your enquiry and will reply by email, usually within 24 business hours.</p><p style="background:#f1f5f9;padding:12px 16px;border-radius:8px"><strong>Reference:</strong> ${esc(reference)}<br><strong>Service:</strong> ${esc(service)}</p><p>You can reply to this email if you want to add anything.</p><p style="color:#64748b;font-size:13px">JwithKP Technology &middot; Technology That Builds Your Business.<br><a href="https://www.jwithkp.com">www.jwithkp.com</a></p></div>`
  return { to: e.email, subject: `We received your enquiry (${reference})`, text, html }
}

export function salesNotice(env: Env, e: EnquiryInput, reference: string): Mail {
  const service = SERVICE_LABELS[e.service] ?? e.service
  const admin = `${env.SITE_ORIGIN ?? 'https://www.jwithkp.com'}/admin`
  const rows: [string, string][] = [['Reference', reference], ['Name', e.name], ['Company', e.company || '-'], ['Email', e.email], ['Phone', e.phone || '-'], ['Service', service], ['Budget', e.budget || '-'], ['Page', e.sourcePage || '-']]
  const text = `New enquiry ${reference}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMessage:\n${e.message}\n\nOpen the dashboard: ${admin}`
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;color:#172B4D"><h2 style="color:#0B1428">New enquiry ${esc(reference)}</h2><table style="border-collapse:collapse;width:100%">${rows.map(([k, v]) => `<tr><td style="padding:6px 10px;border:1px solid #e2e8f0;background:#f8fafc;width:120px"><strong>${esc(k)}</strong></td><td style="padding:6px 10px;border:1px solid #e2e8f0">${esc(v)}</td></tr>`).join('')}</table><h3>Message</h3><p style="white-space:pre-wrap">${esc(e.message)}</p><p><a href="${admin}">Open the dashboard</a></p></div>`
  return { to: env.NOTIFY_EMAIL ?? 'info@jwithkp.com', subject: `New enquiry: ${service} (${reference})`, text, html, replyTo: e.email }
}
