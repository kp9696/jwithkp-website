import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { CtaBanner, FaqList, PageHero, SectionHead } from '@/components/sections/common'

const safePercent = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : 0)
const inr = (n: number) => (n >= 1e7 ? `${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `${(n / 1e5).toFixed(2)} L` : Math.round(n).toLocaleString('en-IN'))

const cats = [
  { key: 'virt', label: 'Virtualization (VMware) Annual Cost', short: 'Virtualization', cost: 2500000, step: 100000 },
  { key: 'mon', label: 'Monitoring (SolarWinds/PRTG)', short: 'Monitoring', cost: 1500000, step: 100000 },
  { key: 'sec', label: 'Security (SIEM/EDR)', short: 'Security', cost: 2000000, step: 100000 },
  { key: 'fw', label: 'Firewall Subscriptions', short: 'Firewall', cost: 800000, step: 50000 },
  { key: 'email', label: 'Email / Collaboration', short: 'Email/Collaboration', cost: 1200000, step: 50000 },
] as const

const faq = [
  { q: 'Is lower licensing cost the only ROI factor?', a: 'No. Better visibility, less vendor lock-in, lower operational friction, and a cleaner long-term architecture also affect ROI.' },
  { q: 'Can you turn this estimate into a real quote?', a: 'Yes. Once we review your current environment, we can translate the estimate into a phased scope and an exact INR proposal.' },
]
const field = 'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-navy focus-visible:border-brand'

export default function Roi() {
  const [cost, setCost] = useState<Record<string, number>>(() => Object.fromEntries(cats.map((c) => [c.key, c.cost])))
  const [pct, setPct] = useState<Record<string, number>>(() => Object.fromEntries(cats.map((c) => [c.key, 30])))
  const [size, setSize] = useState('2-10')

  const res = useMemo(() => {
    const rows = cats.map((c) => {
      const spend = cost[c.key] || 0
      const keep = 1 - Math.min(Math.max(pct[c.key] || 0, 0), 90) / 100
      const optimized = spend * keep
      const saving = Math.max(Math.round(spend - optimized), 0)
      return { ...c, spend, optimized, saving, p: safePercent(saving, spend) }
    })
    const current = rows.reduce((a, r) => a + r.spend, 0)
    const optimized = rows.reduce((a, r) => a + r.optimized, 0)
    const savings = Math.max(current - optimized, 0)
    return { rows, current, optimized, savings, p: safePercent(savings, current) }
  }, [cost, pct])

  return (
    <Layout>
      <PageHero eyebrow="ROI Calculator (INR)" title="See what your IT licences cost," accent="and what could change" lead="Enter your current annual spending and how much lower you expect each cost to be after a change. The result comes from your own numbers, not a headline figure." crumbs={[{ label: 'ROI Calculator' }]} />
      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardContent>
              <h2 className="text-xl">IT Cost Optimizer</h2>
              <p className="mt-2 text-sm text-slate-600">Enter your current annual spending in INR, and how much lower you expect each cost to be after a change. The pre-filled numbers are examples: replace them with your own. We pre-fill 30% as an illustration only. It is not a market average or a promise, so replace it with figures from your own quotes.</p>
              <form className="mt-6 grid gap-5" onSubmit={(e) => e.preventDefault()}>
                {cats.map((c) => (
                  <div key={c.key} className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
                    <label className="text-sm font-semibold text-navy">{c.label}
                      <input type="number" inputMode="numeric" min={0} step={c.step} className={field} value={cost[c.key]} onChange={(e) => setCost({ ...cost, [c.key]: parseFloat(e.target.value) || 0 })} />
                    </label>
                    <label className="text-sm font-semibold text-navy">Assumed reduction (%)
                      <input type="number" inputMode="numeric" min={0} max={90} step={5} className={field} value={pct[c.key]} onChange={(e) => setPct({ ...pct, [c.key]: parseFloat(e.target.value) || 0 })} />
                    </label>
                  </div>
                ))}
                <label className="text-sm font-semibold text-navy">Team size
                  <select className={field} value={size} onChange={(e) => setSize(e.target.value)}>
                    {[['just-me', 'Just me'], ['2-10', '2–10'], ['11-25', '11–25'], ['26-50', '26–50'], ['51-200', '51–200'], ['200+', '200+']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <span className="mt-1 block text-xs font-normal text-slate-500">Only used to pre-select your team size on the contact form. It does not change the result.</span>
                </label>
              </form>
            </CardContent>
          </Card>

          <Card className="h-fit min-w-0">
            <CardContent>
              <h2 className="text-xl">Your Savings Estimate</h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-3" aria-live="polite">
                <div><dt className="text-xs uppercase tracking-wider text-slate-500">Current spend</dt><dd className="text-xl font-bold text-navy">₹{inr(res.current)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-slate-500">Optimized spend</dt><dd className="text-xl font-bold text-navy">₹{inr(res.optimized)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-slate-500">Annual savings</dt><dd className="text-xl font-bold text-brand">₹{inr(res.savings)}</dd></div>
              </dl>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${res.p}% lower`}><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.min(res.p, 100)}%` }} /></div>
              <p className="mt-2 text-sm text-slate-600">{res.p}% lower, based on your assumptions</p>
              <h3 className="mt-6 text-sm font-semibold text-navy">Savings by category</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {res.rows.map((r) => (
                  <li key={r.key} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />{r.short}: Save ₹{inr(r.saving)} ({r.p}%)</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">Based on the reductions you assume. It is not a promise of results, and not a result from a past client. Final savings depend on architecture, scale, support model and migration scope.</p>
              <div className="mt-5"><Link to={`/contact?intent=call&size=${encodeURIComponent(size)}#enquiry`} className="inline-flex h-11 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark">Talk to us about these numbers</Link></div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container grid gap-6 md:grid-cols-2">
          <Card><CardContent>
            <CardTitle>How we calculate it</CardTitle>
            <p className="mt-2 text-slate-600">There is no headline saving on this page. The result comes from your own spend and the reductions you assume. For a VMware to Proxmox move, we compare your current annual VMware subscription with a Proxmox VE support subscription for the same number of CPU sockets, before one-time migration effort, using your actual renewal quote, edition and core count. Some environments depend on VMware-specific features and are not good candidates for a move.</p>
          </CardContent></Card>
          <Card><CardContent>
            <CardTitle>What it leaves out</CardTitle>
            <p className="mt-2 text-slate-600">One-time migration and setup effort, training, hardware changes, downtime risk, GST, and any change in how much you use. These can move the real number up or down. This calculator is best used as an early planning baseline; it does not replace architecture review, migration planning or rollout costing.</p>
          </CardContent></Card>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="FAQ" title="FAQ about" accent="estimating IT savings" />
          <FaqList items={faq} />
        </div>
      </section>
      <CtaBanner text="We can turn this rough estimate into a practical recommendation with migration phases, budget range, rollout risks and operational support options." />
    </Layout>
  )
}
