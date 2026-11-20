import { servicePages } from './servicePages'

export interface NavItem { label: string; to: string; description?: string; external?: boolean }

export const serviceLinks: NavItem[] = servicePages
  .filter((p) => p.kind === 'services')
  .map((p) => ({ label: p.crumb, to: p.path, description: p.sub }))

export const solutionLinks: NavItem[] = [
  { label: 'Open-Source Solutions', to: '/solutions/open-source', description: 'Flexible and cost-effective' },
  { label: 'Commercial Solutions', to: '/solutions/commercial', description: 'Vendor-supported enterprise platforms' },
  { label: 'Technologies', to: '/technologies', description: 'The platforms we implement and support' },
  { label: 'IT Cost Estimator', to: '/it-cost-estimator', description: 'Plan your IT budget' },
]

export const mainNav: { label: string; to: string; children?: NavItem[] }[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services', children: serviceLinks },
  { label: 'Solutions', to: '/solutions/open-source', children: solutionLinks },
  { label: 'Projects', to: '/projects' },
  { label: 'Insights', to: '/insights' },
  { label: 'Contact', to: '/contact' },
]

export const ctaLink = '/contact?intent=call#enquiry'
