import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ctaLink } from '@/content/nav'

export function SectionHead({ eyebrow, title, accent, children, center = true, dark = false }: { eyebrow?: string; title: string; accent?: string; children?: ReactNode; center?: boolean; dark?: boolean }) {
  return (
    <div className={center ? 'mx-auto mb-10 max-w-3xl text-center' : 'mb-10 max-w-3xl'}>
      {eyebrow && <span className={`eyebrow ${dark ? 'eyebrow-dark' : ''}`}>{eyebrow}</span>}
      <h2 className={`h2 ${dark ? 'text-white' : ''}`}>
        {title} {accent && <span className={dark ? 'text-cyan2' : 'text-brand'}>{accent}</span>}
      </h2>
      {children && <p className={`lead mt-4 ${dark ? '!text-slate-300' : ''}`}>{children}</p>}
    </div>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-300">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link to="/" className="text-cyan2 hover:underline">Home</Link></li>
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {i.to ? <Link to={i.to} className="text-cyan2 hover:underline">{i.label}</Link> : <span aria-current="page">{i.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Dark hero used by inner pages. */
export function PageHero({ eyebrow, title, accent, lead, crumbs, children }: { eyebrow: string; title: string; accent?: string; lead: string; crumbs?: { label: string; to?: string }[]; children?: ReactNode }) {
  return (
    <section className="bg-navy bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.35),transparent_55%)] py-16 sm:py-20">
      <div className="container">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <span className="eyebrow eyebrow-dark">{eyebrow}</span>
        <h1 className="max-w-3xl text-4xl text-white sm:text-5xl">
          {title} {accent && <span className="text-cyan2">{accent}</span>}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">{lead}</p>
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  )
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Accordion type="single" collapsible className="mx-auto max-w-3xl space-y-3">
      {items.map((f, i) => (
        <AccordionItem key={f.q} value={`q${i}`}>
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionContent>{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export function CtaBanner({ text = 'Starting a new business? Need reliable IT infrastructure? Planning a custom application? Let’s discuss your requirements.' }: { text?: string }) {
  return (
    <section className="section">
      <div className="container">
        <div className="rounded-3xl bg-navy bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.22),transparent_50%)] px-6 py-14 text-center sm:px-12">
          <h2 className="text-3xl text-white sm:text-4xl">Let’s Build Something Great Together.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">{text}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="accent">
              <Link to={ctaLink}>Start Your Project <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </Button>
            <Button asChild size="lg" variant="onDark">
              <Link to="/it-cost-estimator"><Calculator className="h-4 w-4" aria-hidden="true" /> Estimate my IT cost</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
