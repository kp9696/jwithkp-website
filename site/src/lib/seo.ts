import { site } from '@/content/site'

export interface PageMeta {
  path: string
  title: string
  description: string
  noindex?: boolean
  image?: string
  breadcrumbs?: { name: string; path: string }[]
  faq?: { q: string; a: string }[]
  /** Extra schema.org nodes for this page (Service, Article, ItemList ...). */
  jsonLd?: Record<string, unknown>[]
}

export const fullTitle = (t: string) => (t.includes('JwithKP') ? t : `${t} | JwithKP`)
export const canonicalFor = (path: string) => `${site.origin}${path === '/' ? '/' : path}`
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c')

function organization() {
  const org: Record<string, unknown> = {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${site.origin}/#organization`,
    name: site.short,
    legalName: site.legalName,
    url: `${site.origin}/`,
    slogan: site.tagline,
    description: site.description,
    logo: { '@type': 'ImageObject', url: `${site.origin}/images/icons/icon-512.png`, width: 512, height: 512 },
    telephone: site.phoneE164,
    email: site.email,
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'City', name: site.city, containedInPlace: { '@type': 'State', name: site.region } },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: site.country,
      ...(site.address ? { streetAddress: site.address } : {}),
    },
    sameAs: [site.social.x, site.social.linkedin],
    contactPoint: { '@type': 'ContactPoint', telephone: site.phoneE164, email: site.email, contactType: 'customer service', areaServed: 'IN', availableLanguage: ['en', 'hi'] },
  }
  return org
}

export function graphFor(m: PageMeta) {
  const url = canonicalFor(m.path)
  const graph: Record<string, unknown>[] = [
    organization(),
    { '@type': 'WebSite', '@id': `${site.origin}/#website`, url: `${site.origin}/`, name: site.short, publisher: { '@id': `${site.origin}/#organization` } },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: fullTitle(m.title), description: m.description, isPartOf: { '@id': `${site.origin}/#website` }, about: { '@id': `${site.origin}/#organization` } },
  ]
  if (m.breadcrumbs?.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [{ name: 'Home', path: '/' }, ...m.breadcrumbs].map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: canonicalFor(b.path) })),
    })
  }
  if (m.faq?.length) {
    graph.push({ '@type': 'FAQPage', mainEntity: m.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })
  }
  if (m.jsonLd) graph.push(...m.jsonLd)
  return { '@context': 'https://schema.org', '@graph': graph }
}

/** The <head> tags for one page, as an HTML string (used at build time to prerender). */
export function headTags(m: PageMeta): string {
  const title = fullTitle(m.title)
  const url = canonicalFor(m.path)
  const image = `${site.origin}${m.image ?? site.ogImage}`
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<meta name="author" content="${site.short}" />`,
    `<meta name="robots" content="${m.noindex ? 'noindex, follow' : 'index, follow'}" />`,
  ]
  if (!m.noindex) {
    tags.push(
      `<link rel="canonical" href="${url}" />`,
      `<link rel="alternate" hreflang="en-IN" href="${url}" />`,
      `<link rel="alternate" hreflang="x-default" href="${url}" />`,
      `<meta property="og:title" content="${esc(title)}" />`,
      `<meta property="og:description" content="${esc(m.description)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:locale" content="en_IN" />`,
      `<meta property="og:site_name" content="${site.short}" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:image" content="${image}" />`,
      ...(m.image ? [] : [`<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`]),
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:site" content="@JwithKP" />`,
      `<meta name="twitter:title" content="${esc(title)}" />`,
      `<meta name="twitter:description" content="${esc(m.description)}" />`,
      `<meta name="twitter:image" content="${image}" />`,
      `<script type="application/ld+json">${json(graphFor(m))}</script>`,
    )
  }
  return tags.join('\n    ')
}
