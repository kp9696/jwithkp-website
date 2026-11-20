import type { ReactElement } from 'react'
import type { PageMeta } from '@/lib/seo'
import { site } from '@/content/site'
import { servicePages } from '@/content/servicePages'
import Home from '@/pages/Home'
import About from '@/pages/About'
import Services from '@/pages/Services'
import ServicePage from '@/pages/ServicePage'
import Contact from '@/pages/Contact'
import NotFound from '@/pages/NotFound'

export interface RouteDef {
  meta: PageMeta
  element: ReactElement
  lastmod: string
}

const TODAY = '2026-11-20'

const base: RouteDef[] = [
  {
    meta: { path: '/', title: 'JwithKP Technology | IT Consulting & Software Solutions', description: 'IT consulting, network infrastructure, cybersecurity, open-source and commercial solutions, web apps and websites for startups and growing businesses in India.' },
    element: <Home />,
    lastmod: TODAY,
  },
  {
    meta: { path: '/about', title: 'About JwithKP Technology | IT Consulting & Solutions', description: 'JwithKP Technology is a founder-led IT consulting company in Bangalore: infrastructure, cybersecurity, software and websites for startups and growing teams.', breadcrumbs: [{ name: 'About', path: '/about' }] },
    element: <About />,
    lastmod: TODAY,
  },
  {
    meta: { path: '/services', title: 'IT Services: Infrastructure, Security & Software | JwithKP', description: 'IT infrastructure, network design, cybersecurity, software and website development, plus managed IT for startups and growing businesses. Book a free call.', breadcrumbs: [{ name: 'Services', path: '/services' }] },
    element: <Services />,
    lastmod: TODAY,
  },
  {
    meta: { path: '/contact', title: 'Book a Free 30-Minute Call | JwithKP', description: 'Book a free 30-minute call with the engineer who would do the work. Tell us what you are starting or working on; first response within 24 business hours.', breadcrumbs: [{ name: 'Contact', path: '/contact' }] },
    element: <Contact />,
    lastmod: TODAY,
  },
]

const service: RouteDef[] = servicePages.map((p) => ({
  meta: {
    path: p.path,
    title: p.title,
    description: p.description,
    breadcrumbs: [p.kind === 'services' ? { name: 'Services', path: '/services' } : { name: 'Solutions', path: '/solutions/open-source' }, { name: p.crumb, path: p.path }],
    faq: p.faq,
    jsonLd: [{ '@type': 'Service', name: p.badge, serviceType: p.badge, description: p.description, provider: { '@id': `${site.origin}/#organization` }, areaServed: { '@type': 'Country', name: 'India' }, url: `${site.origin}${p.path}` }],
  },
  element: <ServicePage page={p} />,
  lastmod: TODAY,
}))

export const routes: RouteDef[] = [...base, ...service]

export const notFound: RouteDef = {
  meta: { path: '/404', title: 'Page Not Found', description: 'The page you are looking for does not exist or has moved.', noindex: true },
  element: <NotFound />,
  lastmod: TODAY,
}
