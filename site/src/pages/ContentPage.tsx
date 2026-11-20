import { Layout } from '@/components/layout/Layout'
import { HtmlContent } from '@/components/HtmlContent'
import { CtaBanner, PageHero } from '@/components/sections/common'
import { docs } from '@/content/docs'
import { useHtml } from '@/lib/content'

/** A long-form page whose body was converted from the previous site (projects, technologies, legal ...). */
export default function ContentPage({ slug, crumb, cta = true }: { slug: string; crumb: string; cta?: boolean }) {
  const d = docs[slug]
  const html = useHtml(slug)
  const h1 = d.hero.h1 ?? [d.meta.title, '']
  return (
    <Layout>
      <PageHero eyebrow={d.hero.badge || crumb} title={h1[0]} accent={h1[1] || undefined} lead={d.hero.lead ?? d.meta.description} crumbs={[{ label: crumb }]} />
      <section className="section">
        <div className="container max-w-4xl">{html ? <HtmlContent html={html} /> : <div className="min-h-[40vh]" aria-busy="true" />}</div>
      </section>
      {cta && <CtaBanner />}
    </Layout>
  )
}
