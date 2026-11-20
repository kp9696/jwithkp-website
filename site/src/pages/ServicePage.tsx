import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/Icon'
import { CtaBanner, FaqList, PageHero, SectionHead } from '@/components/sections/common'
import { process } from '@/content/home'
import type { ServicePageData } from '@/content/servicePages'

function Chips({ title, icon, items }: { title: string; icon: string; items: string[] }) {
  return (
    <Card>
      <CardContent>
        <CardTitle className="flex items-center gap-2"><Icon name={icon} className="h-5 w-5 text-brand" /> {title}</CardTitle>
        <ul className="mt-4 flex flex-wrap gap-2">
          {items.map((i) => <li key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">{i}</li>)}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function ServicePage({ page }: { page: ServicePageData }) {
  const parent = page.kind === 'services' ? { label: 'Services', to: '/services' } : { label: 'Solutions', to: '/solutions/open-source' }
  const hasTech = Boolean(page.open || page.comm)
  return (
    <Layout>
      <PageHero eyebrow={page.badge} title={page.h1[0]} accent={page.h1[1]} lead={page.lede} crumbs={[parent, { label: page.crumb }]}>
        <Button asChild size="lg">
          <Link to="/contact?intent=call#enquiry">Get a Free Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </Button>
        <Button asChild size="lg" variant="onDark">
          <Link to={`/contact?service=${page.key}#enquiry`}>Send an enquiry</Link>
        </Button>
      </PageHero>

      <section className="section bg-slate-50">
        <div className="container">
          <SectionHead eyebrow="What we deliver" title={page.h2[0]} accent={page.h2[1]}>{page.sub}</SectionHead>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {page.cards.map((c) => (
              <Card key={c.title}>
                <CardContent>
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name={c.icon} className="h-6 w-6" /></span>
                  <CardTitle>{c.title}</CardTitle>
                  <p className="mt-2 text-slate-600">{c.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {hasTech && (
        <section className="section">
          <div className="container">
            <SectionHead eyebrow="Technology" title="Tools we" accent="work with">
              We recommend based on your requirements, security, scalability and budget, not on what is fashionable. Licensing and support costs depend on the product and deployment.
            </SectionHead>
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
              {page.open && <Chips title="Open source" icon="GitMerge" items={page.open} />}
              {page.comm && <Chips title="Commercial" icon="Building2" items={page.comm} />}
            </div>
          </div>
        </section>
      )}

      <section className={`section ${hasTech ? 'bg-slate-50' : ''}`}>
        <div className="container">
          <SectionHead eyebrow="How we work" title="From requirements" accent="to handover" />
          <ol className="grid gap-6 md:grid-cols-5">
            {process.map((p, i) => (
              <li key={p.title} className="text-center">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand bg-white text-lg font-bold text-brand">{i + 1}</span>
                <h3 className="text-base font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`section ${hasTech ? '' : 'bg-slate-50'}`}>
        <div className="container">
          <SectionHead eyebrow="FAQ" title="Common" accent="questions" />
          <FaqList items={page.faq} />
          <p className="mt-8 text-center text-sm text-slate-600">
            Related:{' '}
            {page.related.map((r, i) => (
              <span key={r.to}>
                {i > 0 && ' · '}
                <Link to={r.to} className="font-semibold text-brand hover:underline">{r.label}</Link>
              </span>
            ))}
          </p>
        </div>
      </section>

      <CtaBanner text={page.cta} />
    </Layout>
  )
}
