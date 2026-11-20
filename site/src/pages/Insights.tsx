import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { CtaBanner, PageHero } from '@/components/sections/common'
import { docs, postCards } from '@/content/docs'

const fmt = (iso?: string | null) => (iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '')

export default function Insights() {
  return (
    <Layout>
      <PageHero eyebrow="Insights" title="Plain-language notes on" accent="IT cost, security and tools" lead="Practical articles on infrastructure, security, collaboration and HR software for startups and growing businesses." crumbs={[{ label: 'Insights' }]} />
      <section className="section">
        <div className="container grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {postCards.map((c) => (
            <Card key={c.slug} className="flex flex-col overflow-hidden">
              {c.image && <img src={c.image} alt={c.alt} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover" />}
              <CardContent className="flex flex-1 flex-col">
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-brand/10 px-2.5 py-0.5 font-semibold text-brand">{c.tag}</span>
                  <span className="text-slate-500">{fmt(docs[c.slug]?.article.datePublished)}</span>
                </div>
                <CardTitle className="mt-3"><Link to={`/${c.slug}`} className="hover:underline">{c.title}</Link></CardTitle>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{c.excerpt}</p>
                <Link to={`/${c.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                  Read article<span className="sr-only"> {c.title}</span> <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <CtaBanner />
    </Layout>
  )
}
