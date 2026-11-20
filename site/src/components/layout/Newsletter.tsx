import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { ENQUIRY_ENDPOINT } from '@/lib/enquiry'

/** Footer newsletter signup. Same service and behaviour as the previous site (FormSubmit, with consent). */
export function Newsletter() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [trap, setTrap] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error' | 'fast'>('idle')
  const loaded = useRef(Date.now())

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (trap) return
    if (Date.now() - loaded.current < 2500) return setState('fast')
    setState('sending')
    try {
      const res = await fetch(ENQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, consent: 'yes', _subject: 'New Newsletter Subscription - JwithKP', _captcha: 'false', page: window.location.pathname }),
      })
      const data = (await res.json().catch(() => ({}))) as { success?: boolean | string }
      if (!res.ok || data.success === false || data.success === 'false') throw new Error('not accepted')
      setEmail('')
      setConsent(false)
      setState('ok')
    } catch {
      setState('error')
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white">Newsletter</h2>
      <p className="mb-3 text-sm">Practical IT and security tips for founders and small teams, about once a month.</p>
      <form onSubmit={submit} className="grid gap-2" aria-label="Newsletter signup">
        <div className="flex gap-2">
          <input type="email" required placeholder="Business email" aria-label="Business email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:border-cyan2" />
          <Button type="submit" size="sm" disabled={state === 'sending'}>{state === 'sending' ? 'Subscribing…' : 'Subscribe'}</Button>
        </div>
        <div className="absolute -left-[9999px]" aria-hidden="true"><input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></div>
        <label className="flex items-start gap-2 text-xs text-slate-400">
          <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand" />
          <span>I agree to receive the newsletter by email and can unsubscribe at any time. See the <a href="/privacy-policy" className="underline hover:text-white">Privacy Policy</a>.</span>
        </label>
        <p role="status" aria-live="polite" className={`text-xs ${state === 'error' || state === 'fast' ? 'text-red-300' : 'text-emerald-300'}`}>
          {state === 'ok' && 'Thanks. Your email is on the list. You can unsubscribe at any time by writing to us.'}
          {state === 'error' && 'Sorry, that did not go through. Please try again, or email us and we will add you.'}
          {state === 'fast' && 'That was quick. Please try again in a moment.'}
        </p>
      </form>
    </div>
  )
}
