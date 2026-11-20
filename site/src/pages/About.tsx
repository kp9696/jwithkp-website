import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/Icon'
import { CtaBanner, PageHero, SectionHead } from '@/components/sections/common'
import { Link } from 'react-router-dom'
import { site } from '@/content/site'

const pillars = [
  { icon: 'Server', title: 'Infrastructure', text: 'Servers, cloud, virtualization, networks and backup, built and managed.', to: '/services/it-infrastructure' },
  { icon: 'ShieldCheck', title: 'Security', text: 'Firewalls, monitoring, access control and data protection.', to: '/services/cybersecurity' },
  { icon: 'Terminal', title: 'Development', text: 'Custom applications, websites, ERP and HRMS.', to: '/services/software-development' },
  { icon: 'Headset', title: 'Support', text: 'Managed IT, AMC and ongoing technical assistance.', to: '/services/managed-it' },
]
const promises = [
  { icon: 'Lock', title: 'No lock-in', text: 'You keep every configuration, runbook and admin access. Credentials are handed over securely at the end of the project.' },
  { icon: 'Scale', title: 'No unnecessary tools', text: 'We only recommend what your stage and budget need. If a free or cheaper option does the job, we say so.' },
  { icon: 'Info', title: 'No borrowed proof', text: 'We have no client logos or testimonials to show yet, so we show none. Our example scenarios are clearly labelled as illustrations, not past results.' },
  { icon: 'Headset', title: 'No overpromising', text: 'We do not promise that nothing will ever go wrong, and we do not run a 24x7 security operations centre. We write what we can do into your agreement.' },
]

export default function About() {
  return (
    <Layout>
      <PageHero
        eyebrow="About JwithKP Technology"
        title="Your complete IT partner,"
        accent="from infrastructure to software"
        lead="JwithKP Technology is a founder-led IT consulting and technology solutions company based in Bangalore. We help startups, growing businesses and new enterprises set up their IT infrastructure, secure their networks, adopt open-source and commercial solutions, and build custom digital products."
        crumbs={[{ label: 'About' }]}
      />
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Who we are" title="One technology partner," accent="from first office to custom software">
            We understand business technology requirements, provide both open-source and commercial solutions, and manage everything from infrastructure to software development.
          </SectionHead>
          <div className="grid gap-6 md:grid-cols-2">
            <Card><CardContent>
              <CardTitle>Why we exist</CardTitle>
              <p className="mt-3 text-slate-600">JwithKP stands for <em>Journey with Knowledge &amp; Practice</em>. Many teams either overspend on enterprise tools they do not need yet, or run on a patchwork that is not safe. We exist to give founders and growing businesses honest, right-sized IT, with infrastructure, security and software under one roof.</p>
              <p className="mt-3 text-slate-600">We recommend commercial platforms such as Microsoft 365, Fortinet or Cisco when they fit, and open source such as Proxmox, Wazuh, pfSense or Nextcloud when it is better. The right answer depends on your requirements, security, scalability and budget.</p>
            </CardContent></Card>
            <Card><CardContent>
              <CardTitle>How a project runs</CardTitle>
              <p className="mt-3 text-slate-600">We understand your requirements, plan the technology and approach, implement in stages, then secure and test before handover. You get configurations, runbooks and admin access, with credentials handed over securely at the end of the project.</p>
              <p className="mt-3 text-slate-600">Support runs during agreed hours, with first response within 24 business hours.</p>
            </CardContent></Card>
          </div>
        </div>
      </section>
      <section className="section bg-slate-50">
        <div className="container">
          <SectionHead eyebrow="What we do" title="Build. Secure." accent="Innovate." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <Card key={p.title}><CardContent>
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name={p.icon} className="h-6 w-6" /></span>
                <CardTitle>{p.title}</CardTitle>
                <p className="mt-2 text-slate-600">{p.text}</p>
                <Link to={p.to} className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">Learn more<span className="sr-only"> about {p.title}</span></Link>
              </CardContent></Card>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Our promises" title="What we will" accent="not do" />
          <div className="grid gap-6 sm:grid-cols-2">
            {promises.map((p) => (
              <Card key={p.title}><CardContent className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name={p.icon} className="h-5 w-5" /></span>
                <div><CardTitle>{p.title}</CardTitle><p className="mt-1 text-slate-600">{p.text}</p></div>
              </CardContent></Card>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-slate-200 p-6 text-sm">
            <h3 className="mb-3 text-base font-semibold">Company details</h3>
            <dl className="space-y-1">
              <div className="flex gap-3"><dt className="w-28 font-medium text-navy">Legal name</dt><dd>{site.legalName} (IT Consulting)</dd></div>
              {site.gstin && <div className="flex gap-3"><dt className="w-28 font-medium text-navy">GSTIN</dt><dd>{site.gstin}</dd></div>}
              {site.address && <div className="flex gap-3"><dt className="w-28 font-medium text-navy">Address</dt><dd>{site.address}</dd></div>}
            </dl>
          </div>
        </div>
      </section>
      <CtaBanner text="Not sure if we are the right fit? Book a free 30-minute call and we will tell you honestly what we would do, and whether you need us at all." />
    </Layout>
  )
}
