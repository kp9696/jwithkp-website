import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { CtaBanner, FaqList, PageHero, SectionHead } from '@/components/sections/common'
import { guideGroups, guidesFaq, situations } from '@/content/guides'

export default function Guides() {
  return (
    <Layout>
      <PageHero eyebrow="Guides" title="IT guides and tools" accent="for better decisions" lead="Plain-language guides for founders, operations leaders and small IT teams: open-source infrastructure, migration planning, security, collaboration platforms and HR software. Start with the tools below, or jump to the topic you need." crumbs={[{ label: 'Guides' }]} />
      {guideGroups.map((g, i) => (
        <section key={g.title} className={`section ${i % 2 ? '' : 'bg-slate-50'}`}>
          <div className="container">
            <SectionHead title={g.title} center={false}>{g.intro}</SectionHead>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {g.cards.map((c) => (
                <Card key={c.title}>
                  <CardContent className="flex h-full flex-col">
                    <CardTitle>{c.title}</CardTitle>
                    <p className="mt-2 flex-1 text-slate-600">{c.text}</p>
                    <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
                      <Link to={c.to} className="text-brand hover:underline">{c.cta}</Link>
                      {c.to2 && <Link to={c.to2} className="text-brand hover:underline">{c.cta2}</Link>}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ))}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Where to start" title="Pick the guide that" accent="matches your situation" />
          <ul className="mx-auto grid max-w-3xl gap-3">
            {situations.map((s) => (
              <li key={s.q} className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">
                <strong className="text-navy">{s.q}</strong>{' '}
                {s.a.map(([label, to], i) => (
                  <span key={to}>{i > 0 && ' · '}<Link to={to} className="font-semibold text-brand hover:underline">{label}</Link></span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section bg-slate-50">
        <div className="container">
          <SectionHead eyebrow="FAQ" title="Questions about" accent="our guides" />
          <FaqList items={guidesFaq} />
        </div>
      </section>
      <CtaBanner text="Need a custom guide for your environment? We can map your business goals to a practical infrastructure roadmap and help execute it end to end." />
    </Layout>
  )
}
