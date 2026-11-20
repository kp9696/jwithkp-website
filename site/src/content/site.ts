// Single source of business facts. Empty values are hidden everywhere they are used.
export const site = {
  name: 'JwithKP Technology',
  short: 'JwithKP',
  legalName: 'JwithKP Technology',
  origin: 'https://www.jwithkp.com',
  tagline: 'Technology That Builds Your Business.',
  subTagline: 'From Infrastructure to Innovation.',
  description:
    'JwithKP Technology is a founder-led IT consulting and technology solutions company for startups and growing businesses in India: IT infrastructure, network design, cybersecurity, open-source and commercial solutions, custom software and websites.',
  email: 'info@jwithkp.com',
  phone: '+91 79829 12207',
  phoneE164: '+917982912207',
  whatsapp: '917982912207',
  city: 'Bangalore',
  region: 'Karnataka',
  country: 'IN',
  address: '' as string, // add a real street address to include it in schema and the footer
  gstin: '' as string, // add a real GSTIN to show it in the footer
  hrmsUrl: 'https://hrms.jwithkp.com/',
  social: {
    x: 'https://x.com/jwithkp',
    linkedin: 'https://www.linkedin.com/in/jwithkp-it-consulting-2b2460270/',
  },
  ogImage: '/images/og-home-1200x630.jpg',
} as const
