import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { CtaBanner, FaqList, PageHero, SectionHead } from '@/components/sections/common'
import { DATA, compute, inr, money, range, verdict } from '@/lib/estimatorEngine'

const asOf = new Date(`${DATA.asOf}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
const sizes: [string, string][] = [['just-me', 'Just me'], ['2-10', '2–10'], ['11-25', '11–25'], ['26-50', '26–50'], ['51-200', '51–200'], ['200+', '200+']]
const select = 'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-navy focus-visible:border-brand'

const faq = [
  { q: 'Is this a quote?', a: 'No. It is a planning estimate based on published list prices. Final costs depend on the plans you choose, discounts, how much you use and exchange rates. We confirm real numbers in a written estimate after a free call.' },
  { q: 'Why is open source not always cheaper?', a: 'Open-source tools have no licence fee, but someone has to host, secure and maintain them. For a small team, a cloud server for monitoring can cost more each month than per-user licences. It gets cheaper as the team grows, or when you already own the hardware.' },
  { q: 'What is left out?', a: 'Hardware, backup storage, Veeam and enterprise SIEM licences, firewalls, GST and our own fees. Some of these vendors do not publish prices, so we do not guess them.' },
  { q: 'How current are the prices?', a: 'Each price was read from the vendor’s page on the date shown in the sources table. Vendors change prices without notice, so treat the figures as a starting point and check the vendor page before buying.' },
  { q: 'Want these numbers worked out for your team?', a: 'Book a free 30-minute call. Tell us your team, tools and budget, and we will give you a written estimate you can rely on.' },
]

export default function Estimator() {
  const [size, setSize] = useState('2-10')
  const [work, setWork] = useState('hybrid')
  const [hosting, setHosting] = useState('cloud')
  const [security, setSecurity] = useState('standard')
  const [apps, setApps] = useState(false)
  const [copilot, setCopilot] = useState(false)

  const r = useMemo(() => compute({ size, work, hosting, apps, copilot: apps && copilot, security }), [size, work, hosting, apps, copilot, security])
  const unpriced = Array.from(new Set<string>(r.unpriced))

  return (
    <Layout>
      <PageHero eyebrow="IT Cost Estimator" title="What could your IT cost?" accent="An honest estimate" lead="Enterprise and open-source tools side by side, priced from vendors’ own published list prices. A planning estimate, not a quote." crumbs={[{ label: 'IT Cost Estimator' }]} />

      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardContent>
              <h2 className="text-xl">Your team</h2>
              <form className="mt-5 grid gap-5" onSubmit={(e) => e.preventDefault()}>
                <label className="text-sm font-semibold text-navy">Team size
                  <select className={select} value={size} onChange={(e) => setSize(e.target.value)}>{sizes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                </label>
                <label className="text-sm font-semibold text-navy">How does the team work?
                  <select className={select} value={work} onChange={(e) => setWork(e.target.value)}>
                    <option value="remote">Remote</option><option value="office">In an office</option><option value="hybrid">Hybrid</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-navy">Where would self-hosted tools run?
                  <select className={select} value={hosting} onChange={(e) => setHosting(e.target.value)}>
                    <option value="cloud">On rented cloud servers</option><option value="own">On servers we already own</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-navy">Security level
                  <select className={select} value={security} onChange={(e) => setSecurity(e.target.value)}>
                    <option value="essential">Essential: email and a password manager</option>
                    <option value="standard">Standard: plus device security</option>
                    <option value="strong">Strong: plus security monitoring</option>
                  </select>
                </label>
                <label className="flex items-start gap-3 text-sm text-slate-700">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-brand" checked={apps} onChange={(e) => setApps(e.target.checked)} />
                  We need Microsoft Word, Excel and Outlook on our laptops
                </label>
                {apps && (
                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input type="checkbox" className="mt-1 h-4 w-4 accent-brand" checked={copilot} onChange={(e) => setCopilot(e.target.checked)} />
                    Optional: include Microsoft 365 Copilot (priced as Microsoft’s Copilot bundle, which costs more per user)
                  </label>
                )}
                <p className="text-sm text-slate-500">Results update as you change an option.</p>
              </form>
            </CardContent>
          </Card>

          <div className="min-w-0">
            <h2 className="text-xl">Estimated monthly cost for {r.band[2]}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2" aria-live="polite">
              <Card><CardContent>
                <CardTitle>Enterprise tools</CardTitle>
                <p className="mt-3 text-2xl font-bold text-navy">{range(r.ent.lo, r.ent.hi)} <span className="text-sm font-medium text-slate-500">per month</span></p>
                <p className="mt-1 text-sm text-slate-600">About {range(r.ent.lo * 12, r.ent.hi * 12)} per year</p>
              </CardContent></Card>
              <Card><CardContent>
                <CardTitle>Open-source tools</CardTitle>
                <p className="mt-3 text-2xl font-bold text-navy">{range(r.os.lo, r.os.hi)} <span className="text-sm font-medium text-slate-500">per month</span></p>
                <p className="mt-1 text-sm text-slate-600">About {range(r.os.lo * 12, r.os.hi * 12)} per year</p>
              </CardContent></Card>
            </div>
            <p className="mt-4 rounded-xl bg-brand/10 p-4 text-sm font-medium text-navy">{verdict(r)}</p>
            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-navy"><tr><th scope="col" className="p-3">Line item</th><th scope="col" className="p-3">Enterprise</th><th scope="col" className="p-3">Open source</th><th scope="col" className="p-3">Basis</th></tr></thead>
                <tbody className="divide-y divide-slate-200 align-top">
                  {r.rows.map((row: { label: string; ent: string; os: string; basis: string }) => (
                    <tr key={row.label}><th scope="row" className="p-3 font-semibold text-navy">{row.label}</th><td className="p-3">{row.ent}</td><td className="p-3">{row.os}</td><td className="p-3 text-slate-600">{row.basis}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-slate-600">Monthly figures exclude GST and are shown as ranges because plans and team size vary. Open-source tools have no licence fee, but someone has to set them up, secure them and keep them updated. That effort is not in this table. Items priced in US dollars use the exchange rate shown below.</p>
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl">What is not in this estimate</h2>
            <ul className="mt-4 space-y-2 text-slate-700">
              {unpriced.map((u) => <li key={u} className="flex items-start gap-2"><X className="mt-1 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />{u}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-lg">One-time costs and our fees</h3>
            <p className="mt-2 text-slate-600">The tools above are subscriptions, so there is no one-time licence cost in the table. Your one-time costs are the hardware you buy and the setup work.</p>
            <p className="mt-3 text-slate-600">IT retainers and larger projects are quoted after a free call. Our fees are separate from the tool costs above.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="text-2xl">Where the numbers come from</h2>
          <p className="mt-3 max-w-3xl text-slate-600">Every price below was read from the vendor’s own page on {asOf}. Vendors change prices, so check before you buy. Microsoft 365 prices are the standard with-Teams plans, paid yearly and excluding GST; Copilot is only included if you tick that option. Items priced in US dollars are converted at {DATA.fx.label}.</p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-navy"><tr><th scope="col" className="p-3">Vendor</th><th scope="col" className="p-3">Plan</th><th scope="col" className="p-3">Price</th><th scope="col" className="p-3">Notes</th><th scope="col" className="p-3">Source</th></tr></thead>
              <tbody className="divide-y divide-slate-200 align-top">
                {(Object.values(DATA.prices) as { vendor: string; plan: string; amount: number; cur: string; unit: string; note: string; url: string }[]).map((p) => (
                  <tr key={p.vendor + p.plan}>
                    <th scope="row" className="p-3 font-semibold text-navy">{p.vendor}</th>
                    <td className="p-3">{p.plan}</td>
                    <td className="p-3">{p.cur === 'INR' ? `₹${p.amount.toLocaleString('en-IN')}` : `US$${p.amount.toFixed(2)} (about ${money(inr(p))})`} {p.unit}</td>
                    <td className="p-3 text-slate-600">{p.note}</td>
                    <td className="p-3"><a className="text-brand hover:underline" href={p.url} target="_blank" rel="noopener noreferrer">Vendor page</a></td>
                  </tr>
                ))}
                <tr><th scope="row" className="p-3 font-semibold text-navy">Exchange rate</th><td className="p-3">US$ to INR</td><td className="p-3">₹{DATA.fx.usdInr.toFixed(4)} per US$</td><td className="p-3 text-slate-600">{DATA.fx.note}</td><td className="p-3"><a className="text-brand hover:underline" href={DATA.fx.url} target="_blank" rel="noopener noreferrer">RBI</a></td></tr>
                {(DATA.facts as { vendor: string; plan: string; note: string; url?: string }[]).map((f) => (
                  <tr key={f.vendor + f.plan}><th scope="row" className="p-3 font-semibold text-navy">{f.vendor}</th><td className="p-3">{f.plan}</td><td className="p-3">—</td><td className="p-3 text-slate-600">{f.note}</td><td className="p-3">{f.url ? <a className="text-brand hover:underline" href={f.url} target="_blank" rel="noopener noreferrer">Source</a> : '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container">
          <SectionHead eyebrow="FAQ" title="Questions about" accent="this estimate" />
          <FaqList items={faq} />
        </div>
      </section>
      <CtaBanner text="Book a free 30-minute call. Tell us your team, tools and budget, and we will give you a written estimate you can rely on." />
    </Layout>
  )
}
