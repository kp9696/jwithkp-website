import { useEffect, useState } from 'react'
import { Printer, RotateCcw } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { CtaBanner, FaqList, PageHero, SectionHead } from '@/components/sections/common'
import { CHECKLIST_KEY, checklist } from '@/content/checklist'

const total = checklist.reduce((a, g) => a + g.items.length, 0)
const faq = [
  { q: 'Is this a security audit?', a: 'No. It is a general checklist of basics, not an assessment of your business. It does not replace advice about the rules that apply to your sector.' },
  { q: 'Do I need to do everything at once?', a: 'No. Start with owning your accounts, email sign-in and backups. Those protect you from the most damaging problems. Work through the rest as the team grows.' },
  { q: 'Is my progress saved or shared?', a: 'Your ticks are stored only in this browser on this device. They are not sent to us or anyone else, and clearing your browser data removes them.' },
  { q: 'Can you set this up for me?', a: 'Yes. The Startup Launch Pack covers many of these basics for small teams: business email, device security, a password manager and two-step sign-in, backups and written handover. Scope and price are agreed in writing.' },
  { q: 'Want a second pair of eyes on your setup?', a: 'Book a free 30-minute call. Tell us what you use today and we will point out the gaps that matter most.' },
]

function load(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}') || {} } catch { return {} }
}
function save(s: Record<string, number>) {
  try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(s)) } catch { /* storage unavailable: the list still works */ }
}

export default function Checklist() {
  const [done, setDone] = useState<Record<string, number>>({})
  useEffect(() => setDone(load()), [])
  const count = Object.keys(done).length

  function toggle(id: string, on: boolean) {
    const next = { ...done }
    if (on) next[id] = 1
    else delete next[id]
    setDone(next)
    save(next)
  }

  return (
    <Layout>
      <PageHero eyebrow="Startup IT Checklist" title="The IT basics to get right" accent="early" lead="Thirty plain-language items for founders: owning your accounts, email sign-in, devices, backups and everyday security. Tick them off as you go. Your ticks stay in this browser only." crumbs={[{ label: 'Startup IT Checklist' }]} />
      <section className="section">
        <div className="container max-w-3xl">
          <div className="sticky top-16 z-10 -mx-2 mb-8 rounded-xl border border-slate-200 bg-white/95 p-4 backdrop-blur print:static">
            <p className="text-sm font-semibold text-navy" aria-live="polite">Progress: {count} of {total} done</p>
            <progress className="mt-2 h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-brand [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-brand" max={total} value={count} />
            <div className="mt-3 flex flex-wrap gap-2 print:hidden">
              <Button size="sm" variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden="true" /> Print or save as PDF</Button>
              <Button size="sm" variant="ghost" onClick={() => { setDone({}); save({}) }}><RotateCcw className="h-4 w-4" aria-hidden="true" /> Clear ticks</Button>
            </div>
          </div>
          <p className="mb-8 text-slate-600">You do not need all of this on day one. If you only have an hour, start with the first two groups, then backups. Those protect you from the problems that hurt soonest.</p>
          {checklist.map((g) => {
            const n = g.items.filter((i) => done[i.id]).length
            return (
              <section key={g.id} className="mb-10" aria-labelledby={`g-${g.id}`}>
                <h2 id={`g-${g.id}`} className="flex items-baseline justify-between text-2xl">{g.title}<span className="text-sm font-medium text-slate-500">{n} of {g.items.length}</span></h2>
                <ul className="mt-4 space-y-3">
                  {g.items.map((i) => (
                    <li key={i.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-brand" checked={!!done[i.id]} onChange={(e) => toggle(i.id, e.target.checked)} />
                        <span className="text-slate-700 [&_small]:mt-1 [&_small]:block [&_small]:text-sm [&_small]:text-slate-500 [&_strong]:text-navy [&_a]:text-brand [&_a]:underline" dangerouslySetInnerHTML={{ __html: i.html }} />
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </section>
      <section className="section bg-slate-50 print:hidden">
        <div className="container">
          <SectionHead eyebrow="FAQ" title="Questions about" accent="this checklist" />
          <FaqList items={faq} />
        </div>
      </section>
      <div className="print:hidden"><CtaBanner text="Book a free 30-minute call. Tell us what you use today and we will point out the gaps that matter most." /></div>
    </Layout>
  )
}
