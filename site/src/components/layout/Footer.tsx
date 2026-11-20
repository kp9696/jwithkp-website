import { Link } from 'react-router-dom'
import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react'
import { Logo } from './Logo'
import { Newsletter } from './Newsletter'
import { COOKIE_SETTINGS_EVENT } from '@/components/Analytics'
import { serviceLinks, solutionLinks } from '@/content/nav'
import { site } from '@/content/site'

const resources = [
  { label: 'Insights', to: '/insights' },
  { label: 'Guides', to: '/guides' },
  { label: 'Projects', to: '/projects' },
  { label: 'Startup IT Checklist', to: '/startup-it-checklist' },
  { label: 'ROI Calculator', to: '/roi-calculator' },
  { label: 'Industries', to: '/industries' },
]
const legal = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Security Practices', to: '/security-practices' },
]

function Col({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{title}</h2>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-slate-300 hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-navy text-slate-300">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            <strong className="text-white">{site.tagline}</strong> IT consulting, infrastructure, cybersecurity and software development for startups and growing businesses in India.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-cyan2" aria-hidden="true" /><a className="hover:text-white" href={`mailto:${site.email}`}>{site.email}</a></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan2" aria-hidden="true" /><a className="hover:text-white" href={`tel:${site.phoneE164}`}>{site.phone}</a></li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan2" aria-hidden="true" /><span>{site.address || `${site.city}, ${site.region}`}</span></li>
          </ul>
          <div className="mt-5 flex items-center gap-4 text-sm">
            <a className="hover:text-white" href={site.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a className="hover:text-white" href={site.social.x} target="_blank" rel="noopener noreferrer">X</a>
            <a className="inline-flex items-center gap-1 hover:text-white" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </div>
        <Col title="Services" links={serviceLinks} />
        <Col title="Solutions" links={[...solutionLinks, { label: 'JwithKP HRMS', to: site.hrmsUrl }]} />
        <Col title="Resources" links={resources} />
      </div>
      <div className="border-t border-white/10">
        <div className="container grid gap-6 py-8 md:grid-cols-[1fr_1.2fr] md:items-start"><Newsletter /></div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {site.legalName}. All rights reserved.
            {site.gstin ? ` GSTIN ${site.gstin}.` : ''}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legal.map((l) => (
              <li key={l.to}><Link to={l.to} className="hover:text-white">{l.label}</Link></li>
            ))}
            <li><button type="button" className="hover:text-white" onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}>Cookie Settings</button></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
