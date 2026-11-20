import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/Icon'
import { CtaBanner, FaqList, SectionHead } from '@/components/sections/common'
import { ecosystem, homeFaq, homeServices, pillars, process, projectCategories, why } from '@/content/home'

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-navy bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.4),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.14),transparent_50%)]">
        <div className="container grid items-center gap-12 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:py-28">
          <div>
            <span className="eyebrow eyebrow-dark">IT consulting &amp; solutions</span>
            <h1 className="text-4xl text-white sm:text-5xl lg:text-6xl">
              Technology That <span className="text-cyan2">Builds Your Business.</span>
            </h1>
            <p className="mt-5 text-xl font-semibold text-cyan2">From Infrastructure to Innovation.</p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              We help startups and growing businesses build secure IT infrastructure, develop powerful applications, and adopt the right technology with open-source and commercial solutions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/services">Explore Services <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </Button>
              <Button asChild size="lg" variant="onDark">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-400">Free consultation · No obligation · Scope and price agreed in writing</p>
          </div>
          <ul className="grid gap-4">
            {pillars.map((p) => (
              <li key={p.title}>
                <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
                  <Link to={p.to} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors hover:border-cyan2/50">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan2/15 text-cyan2"><Icon name={p.icon} className="h-6 w-6" /></span>
                    <span>
                      <span className="block text-lg font-semibold text-white">{p.title}</span>
                      <span className="text-sm text-slate-400">{p.text}</span>
                    </span>
                  </Link>
                </motion.div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What we do */}
      <section className="section bg-slate-50">
        <div className="container">
          <SectionHead eyebrow="What we do" title="Complete IT solutions" accent="for your business">
            From setting up your first office network to developing enterprise applications, we provide the technology services your business needs.
          </SectionHead>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homeServices.map((s) => (
              <motion.div key={s.title} whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name={s.icon} className="h-6 w-6" /></span>
                    <CardTitle>{s.title}</CardTitle>
                    <p className="mt-2 flex-1 text-slate-600">{s.text}</p>
                    <Link to={s.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                      Learn more<span className="sr-only"> about {s.title}</span> <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open source vs commercial */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Open source & commercial" title="The right technology." accent="The right investment.">
            We help businesses choose between open-source and commercial technology based on their requirements, security, scalability and budget.
          </SectionHead>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { icon: 'GitMerge', title: 'Open-source solutions', sub: 'Flexible & cost-effective', items: ['Proxmox VE', 'pfSense / OPNsense', 'Zabbix', 'Wazuh', 'Nextcloud', 'GLPI'], note: 'Licensing and support costs depend on the selected product and deployment.', to: '/solutions/open-source', cta: 'Explore open-source solutions' },
              { icon: 'Building2', title: 'Commercial solutions', sub: 'Enterprise support', items: ['Microsoft Azure', 'Microsoft 365', 'VMware', 'Fortinet', 'Sophos', 'Cisco'], note: 'Licensed platforms with vendor support and enterprise capabilities.', to: '/solutions/commercial', cta: 'Explore commercial solutions' },
            ].map((c) => (
              <Card key={c.title}>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name={c.icon} className="h-5 w-5" /></span>
                    <div>
                      <CardTitle>{c.title}</CardTitle>
                      <p className="text-sm text-slate-500">{c.sub}</p>
                    </div>
                  </div>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {c.items.map((i) => <li key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">{i}</li>)}
                  </ul>
                  <p className="mt-4 text-sm text-slate-500">{c.note}</p>
                  <Link to={c.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">{c.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="section bg-navy text-slate-300">
        <div className="container">
          <SectionHead dark eyebrow="Why JwithKP Technology" title="Technology should solve business problems," accent="not create new ones" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {why.map((w) => (
              <div key={w.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan2/15 text-cyan2"><Icon name={w.icon} className="h-5 w-5" /></span>
                <h3 className="text-lg font-semibold text-white">{w.title}</h3>
                <p className="mt-2 text-slate-400">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Technology ecosystem" title="Platforms we" accent="implement and support">
            Grouped by category. <Link to="/technologies" className="font-semibold text-brand hover:underline">See the full technology overview</Link>.
          </SectionHead>
          <div className="grid gap-6 md:grid-cols-3">
            {ecosystem.map((g) => (
              <Card key={g.title}>
                <CardContent>
                  <CardTitle>{g.title}</CardTitle>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {g.items.map((i) => <li key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">{i}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-slate-50">
        <div className="container">
          <SectionHead eyebrow="How we work" title="Five steps" accent="from idea to support" />
          <ol className="grid gap-6 md:grid-cols-5">
            {process.map((p, i) => (
              <li key={p.title} className="relative text-center">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand bg-white text-lg font-bold text-brand">{i + 1}</span>
                <h3 className="text-base font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Projects */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Projects" title="The kind of work" accent="we take on">
            Project categories we deliver. Our projects page shows illustrative scenarios; verified client projects will be added as they are published with permission.
          </SectionHead>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projectCategories.map((p) => (
              <Card key={p.title}>
                <CardContent className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name={p.icon} className="h-5 w-5" /></span>
                  <span className="font-semibold text-navy">{p.title}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center">
            <Button asChild variant="secondary"><Link to="/projects">See projects <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-slate-50">
        <div className="container">
          <SectionHead eyebrow="FAQ" title="Questions we" accent="often hear">Short, honest answers. If yours is not here, ask on a free call.</SectionHead>
          <FaqList items={homeFaq} />
        </div>
      </section>

      <CtaBanner />
    </Layout>
  )
}
