import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Mail, MessageCircle, Phone, Clock, CheckCircle2 } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHero } from '@/components/sections/common'
import { budgetOptions, serviceOptions, submitEnquiry, validate, type EnquiryErrors, type EnquiryInput } from '@/lib/enquiry'
import { site } from '@/content/site'

const empty: EnquiryInput = { name: '', company: '', email: '', phone: '', service: '', budget: '', message: '', website: '', startedAt: 0 }
const field = 'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-navy placeholder:text-slate-400 focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-brand'

function Field({ id, label, error, optional, children }: { id: string; label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label} {optional && <span className="font-normal text-slate-500">(optional)</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default function Contact() {
  const [data, setData] = useState<EnquiryInput>(empty)
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const started = useRef(0)

  useEffect(() => {
    started.current = Date.now()
    const q = new URLSearchParams(window.location.search)
    const service = q.get('service')
    const preset = service && serviceOptions.some((s) => s.value === service) ? service : q.get('intent') === 'call' ? 'call' : ''
    if (preset) setData((d) => ({ ...d, service: preset }))
  }, [])

  const set = (k: keyof EnquiryInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setData((d) => ({ ...d, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = { ...data, startedAt: started.current }
    const errs = validate(payload)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setStatus('sending')
    setStatus((await submitEnquiry(payload)) === 'ok' ? 'sent' : 'failed')
  }

  const err = (k: keyof EnquiryErrors) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `${k}-error` } : {})

  return (
    <Layout>
      <PageHero eyebrow="Contact JwithKP Technology" title="Let’s discuss your requirements:" accent="free 30-minute call" lead="Tell us what you are starting or working on. You talk directly to the engineer who would do the work, with no sales layer in between." crumbs={[{ label: 'Contact' }]} />
      <section className="section" id="enquiry">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-5">
            <h2 className="text-2xl">Talk to us</h2>
            <ul className="space-y-4 text-slate-700">
              <li className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 text-brand" aria-hidden="true" /><a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a></li>
              <li className="flex items-start gap-3"><Phone className="mt-0.5 h-5 w-5 text-brand" aria-hidden="true" /><a href={`tel:${site.phoneE164}`} className="hover:underline">{site.phone}</a></li>
              <li className="flex items-start gap-3"><MessageCircle className="mt-0.5 h-5 w-5 text-brand" aria-hidden="true" /><a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Chat on WhatsApp</a></li>
              <li className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 text-brand" aria-hidden="true" /><span>First response within 24 business hours.</span></li>
            </ul>
            <Card><CardContent className="text-sm text-slate-600">
              <p className="font-semibold text-navy">What happens next</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>We read your enquiry and reply by email.</li>
                <li>A free 30-minute call to understand your needs.</li>
                <li>A written scope and estimate before any work starts.</li>
              </ol>
            </CardContent></Card>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8">
              {status === 'sent' ? (
                <div role="status" className="py-10 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
                  <h2 className="mt-4 text-2xl">Thank you, we have your enquiry.</h2>
                  <p className="lead mt-2">We will reply by email, usually within 24 business hours.</p>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate aria-label="Enquiry form" className="grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="name" label="Name" error={errors.name}><input id="name" className={field} autoComplete="name" value={data.name} onChange={set('name')} required {...err('name')} /></Field>
                    <Field id="company" label="Company name" optional><input id="company" className={field} autoComplete="organization" value={data.company} onChange={set('company')} /></Field>
                    <Field id="email" label="Business email" error={errors.email}><input id="email" type="email" className={field} autoComplete="email" value={data.email} onChange={set('email')} required {...err('email')} /></Field>
                    <Field id="phone" label="Phone number" optional error={errors.phone}><input id="phone" type="tel" className={field} autoComplete="tel" value={data.phone} onChange={set('phone')} {...err('phone')} /></Field>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="service" label="Service required" error={errors.service}>
                      <select id="service" className={field} value={data.service} onChange={set('service')} required {...err('service')}>
                        <option value="" disabled>Choose one</option>
                        {serviceOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </Field>
                    <Field id="budget" label="Project budget" optional>
                      <select id="budget" className={field} value={data.budget} onChange={set('budget')}>
                        <option value="">Choose one</option>
                        {budgetOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field id="message" label="Project description" error={errors.message}>
                    <textarea id="message" rows={5} className={field} placeholder="For example: a team of 5 launching in two months, needing email, laptops, a firewall and backups." value={data.message} onChange={set('message')} required {...err('message')} />
                  </Field>
                  {/* Honeypot: hidden from people, filled by bots */}
                  <div className="absolute -left-[9999px]" aria-hidden="true">
                    <label>Website<input tabIndex={-1} autoComplete="off" value={data.website} onChange={set('website')} /></label>
                  </div>
                  <p className="text-xs text-slate-500">We use your details only to reply to this enquiry. See our <a className="underline" href="/privacy-policy">Privacy Policy</a>.</p>
                  {status === 'failed' && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Sorry, something went wrong. Please email {site.email} or call {site.phone}.</p>}
                  <Button type="submit" size="lg" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send enquiry'}</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  )
}
