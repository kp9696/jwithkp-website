import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { HtmlContent } from '@/components/HtmlContent'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { CtaBanner, PageHero } from '@/components/sections/common'
import { docs, postCards, postSlugs } from '@/content/docs'
import { useHtml } from '@/lib/content'

export default function BlogPost({ slug }: { slug: string }) {
  const d = docs[slug]
  const html = useHtml(slug)
  const related = postCards.filter((c) => c.slug !== slug && postSlugs.includes(c.slug)).slice(0, 3)
  const h1 = d.hero.h1 ?? [d.article.headline ?? d.meta.title, '']
  return (
    <Layout>
      <PageHero eyebrow={d.hero.badge || 'Insights'} title={`${h1[0]} ${h1[1]}`.trim()} lead={d.hero.lead ?? d.meta.description} crumbs={[{ label: 'Insights', to: '/insights' }, { label: h1[0].length > 48 ? `${h1[0].slice(0, 45)}…` : h1[0] }]}>
        {d.hero.meta && <p className="text-sm text-slate-400">{d.hero.meta}</p>}
      </PageHero>
      <article className="section">
        <div className="container max-w-3xl">{html ? <HtmlContent html={html} /> : <div className="min-h-[40vh]" aria-busy="true" />}</div>
      </article>
      {related.length > 0 && (
        <section className="section bg-slate-50">
          <div className="container">
            <h2 className="mb-8 text-center text-2xl">Keep reading</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Card key={r.slug}>
                  <CardContent>
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand">{r.tag}</span>
                    <CardTitle className="mt-2 text-base"><Link to={`/${r.slug}`} className="hover:underline">{r.title}</Link></CardTitle>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">{r.excerpt}</p>
                    <Link to={`/${r.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                      Read<span className="sr-only"> {r.title}</span> <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBanner />
    </Layout>
  )
}
