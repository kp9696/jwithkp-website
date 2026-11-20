import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/Icon'
import { CtaBanner, FaqList, PageHero, SectionHead } from '@/components/sections/common'
import { homeServices, homeFaq } from '@/content/home'

const extras = [
  { icon: 'Zap', title: 'Startup Launch Pack', text: 'Day-1 IT setup for new teams: email, devices, sign-in, backups and the basics done right. Scope and price agreed in writing.' },
  { icon: 'Headset', title: 'IT Retainer', text: 'Ongoing IT help and a part-time IT head, with support terms agreed in writing.' },
  { icon: 'LineChart', title: 'Cost & Migration', text: 'Cut licence costs and move off VMware or Splunk with a phased, tested plan and rollback.' },
]

export default function Services() {
  return (
    <Layout>
      <PageHero
        eyebrow="Services"
        title="From infrastructure"
        accent="to innovation"
        lead="JwithKP Technology helps startups and growing businesses build secure IT infrastructure, develop applications and websites, and adopt the right technology, open source or commercial, whichever fits."
        crumbs={[{ label: 'Services' }]}
      />
      <section className="section bg-slate-50">
        <div className="container">
          <SectionHead eyebrow="Core services" title="Six ways we" accent="help">Each service has its own page with what we deliver, the tools we use and common questions.</SectionHead>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homeServices.map((s) => (
              <Card key={s.title}>
                <CardContent className="flex h-full flex-col">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name={s.icon} className="h-6 w-6" /></span>
                  <CardTitle>{s.title}</CardTitle>
                  <p className="mt-2 flex-1 text-slate-600">{s.text}</p>
                  <Link to={s.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                    Learn more<span className="sr-only"> about {s.title}</span> <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Packages" title="Ways to" accent="engage" />
          <div className="grid gap-6 md:grid-cols-3">
            {extras.map((s) => (
              <Card key={s.title}>
                <CardContent>
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name={s.icon} className="h-6 w-6" /></span>
                  <CardTitle>{s.title}</CardTitle>
                  <p className="mt-2 text-slate-600">{s.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-slate-50">
        <div className="container">
          <SectionHead eyebrow="FAQ" title="Questions we" accent="often hear" />
          <FaqList items={homeFaq} />
        </div>
      </section>
      <CtaBanner />
    </Layout>
  )
}
