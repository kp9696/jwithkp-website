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
import ContentPage from '@/pages/ContentPage'
import BlogPost from '@/pages/BlogPost'
import Insights from '@/pages/Insights'
import Guides from '@/pages/Guides'
import Estimator from '@/pages/Estimator'
import Roi from '@/pages/Roi'
import Checklist from '@/pages/Checklist'
import { docs, postSlugs } from '@/content/docs'
import { lastmodByPath, pageMeta } from '@/content/meta'

export interface RouteDef {
  meta: PageMeta
  element: ReactElement
  lastmod: string
  /** Body files (src/content/generated/<slug>.json) that must be loaded before this page can render. */
  content?: string[]
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

const lm = (path: string) => lastmodByPath[path] ?? TODAY

const tools: RouteDef[] = [
  { meta: { path: '/guides', ...pageMeta.guides, breadcrumbs: [{ name: 'Guides', path: '/guides' }] }, element: <Guides />, lastmod: TODAY },
  { meta: { path: '/it-cost-estimator', ...pageMeta['it-cost-estimator'], breadcrumbs: [{ name: 'IT Cost Estimator', path: '/it-cost-estimator' }] }, element: <Estimator />, lastmod: lm('/it-cost-estimator') },
  { meta: { path: '/roi-calculator', ...pageMeta['roi-calculator'], breadcrumbs: [{ name: 'ROI Calculator', path: '/roi-calculator' }] }, element: <Roi />, lastmod: lm('/roi-calculator') },
  { meta: { path: '/startup-it-checklist', ...pageMeta['startup-it-checklist'], breadcrumbs: [{ name: 'Startup IT Checklist', path: '/startup-it-checklist' }] }, element: <Checklist />, lastmod: lm('/startup-it-checklist') },
  { meta: { path: '/insights', ...pageMeta.insights, breadcrumbs: [{ name: 'Insights', path: '/insights' }] }, element: <Insights />, lastmod: TODAY },
]

// Pages whose body was converted from the previous site.
const converted: { slug: string; crumb: string; cta?: boolean }[] = [
  { slug: 'projects', crumb: 'Projects' },
  { slug: 'technologies', crumb: 'Technologies' },
  { slug: 'industries', crumb: 'Industries' },
  { slug: 'security-practices', crumb: 'Security Practices' },
  { slug: 'privacy-policy', crumb: 'Privacy Policy', cta: false },
  { slug: 'terms', crumb: 'Terms & Conditions', cta: false },
]
const contentRoutes: RouteDef[] = converted.map((c) => {
  const d = docs[c.slug]
  const path = `/${c.slug}`
  return {
    meta: { path, title: d.meta.title, description: d.meta.description, breadcrumbs: [{ name: c.crumb, path }], faq: d.faq },
    element: <ContentPage slug={c.slug} crumb={c.crumb} cta={c.cta} />,
    lastmod: lm(path),
    content: [c.slug],
  }
})

const postRoutes: RouteDef[] = postSlugs.map((slug) => {
  const d = docs[slug]
  const path = `/${slug}`
  const url = `${site.origin}${path}`
  const image = d.article.image ?? `${site.origin}${site.ogImage}`
  return {
    meta: {
      path,
      title: d.meta.title,
      description: d.meta.description,
      image: d.meta.image || undefined,
      breadcrumbs: [{ name: 'Insights', path: '/insights' }, { name: d.article.headline ?? d.meta.title, path }],
      faq: d.faq,
      jsonLd: [{
        '@type': 'Article',
        headline: d.article.headline ?? d.meta.title,
        description: d.meta.description,
        image: [image],
        author: { '@id': `${site.origin}/#organization` },
        publisher: { '@id': `${site.origin}/#organization` },
        datePublished: d.article.datePublished,
        dateModified: d.article.dateModified ?? d.article.datePublished,
        mainEntityOfPage: url,
      }],
    },
    element: <BlogPost slug={slug} />,
    lastmod: d.article.dateModified ?? d.article.datePublished ?? lm(path),
    content: [slug],
  }
})

export const routes: RouteDef[] = [...base, ...service, ...tools, ...contentRoutes, ...postRoutes]

export const notFound: RouteDef = {
  meta: { path: '/404', title: 'Page Not Found', description: 'The page you are looking for does not exist or has moved.', noindex: true },
  element: <NotFound />,
  lastmod: TODAY,
}
