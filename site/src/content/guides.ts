export interface GuideCard { title: string; text: string; to: string; cta: string; to2?: string; cta2?: string }
export interface GuideGroup { title: string; intro: string; cards: GuideCard[] }

export const guideGroups: GuideGroup[] = [
  { title: 'Start here: tools you can use today', intro: 'Three free tools to get a first picture before you talk to anyone. Each one is a planning aid, not a quote.', cards: [
    { title: 'Checklist: Startup IT Basics', text: 'Thirty plain-language items for founders: owning your accounts, email sign-in, devices, backups and everyday security. Tick them off as you go.', to: '/startup-it-checklist', cta: 'Open the checklist', to2: '/services/managed-it', cta2: 'Managed IT services' },
    { title: 'Tool: IT Cost Estimator', text: 'A first idea of what your IT could cost, with enterprise and open-source options side by side.', to: '/it-cost-estimator', cta: 'Open the estimator', to2: '/services/it-infrastructure', cta2: 'IT infrastructure' },
    { title: 'Tool: IT Cost and ROI Calculator', text: 'Compare what you pay for licences today with what could change, in rupees.', to: '/roi-calculator', cta: 'Open the calculator', to2: '/solutions/open-source', cta2: 'Open-source solutions' },
  ] },
  { title: 'Infrastructure and cost', intro: 'Decisions about servers, virtualization, monitoring and licensing, where open source can lower recurring cost when it is set up and looked after properly.', cards: [
    { title: 'Guide: Open-Source Stack for Early Stage Startups', text: 'A low-licensing architecture using Linux, Proxmox, PostgreSQL and Wazuh, with options for scaling later.', to: '/blog-open-source-startup-cost-savings', cta: 'Read guide', to2: '/solutions/open-source', cta2: 'Open-source solutions' },
    { title: 'Guide: VMware to Proxmox Migration Planning', text: 'A phased migration approach that reduces downtime risk, validates backups and plans rollback before cutover.', to: '/blog-proxmox-vmware-alternative', cta: 'Read guide', to2: '/services/it-infrastructure', cta2: 'Migration support' },
    { title: 'Guide: Network Traffic Monitoring with ntopng', text: 'How to see what is using your bandwidth, spot unusual activity and improve visibility across your network.', to: '/blog-ntopng-network-monitoring', cta: 'Read guide', to2: '/services/network-design', cta2: 'Network design' },
  ] },
  { title: 'Security', intro: 'Practical security for small teams: what to do first, and how to get visibility without an enterprise budget.', cards: [
    { title: 'Guide: 10 Cybersecurity Best Practices for 2026', text: 'Multi-factor sign-in, endpoint security, ransomware protection, network security and monitoring, in plain language.', to: '/blog-cybersecurity-best-practices-2026', cta: 'Read guide', to2: '/services/cybersecurity', cta2: 'Cybersecurity services' },
    { title: 'Guide: Affordable Security Monitoring with Wazuh', text: 'Define alert ownership, tune rules and set dashboard priorities so a SIEM stays useful instead of noisy.', to: '/blog-wazuh-security-smb', cta: 'Read guide', to2: '/services/cybersecurity', cta2: 'Security services' },
  ] },
  { title: 'Collaboration and HR software', intro: 'Choosing how your team shares files and manages people, with the trade-offs laid out.', cards: [
    { title: 'Guide: Nextcloud vs Microsoft 365', text: 'Compare recurring cloud licences with self-hosted collaboration across cost, control, maintenance and support.', to: '/blog-nextcloud-vs-microsoft365', cta: 'Read guide', to2: '/roi-calculator', cta2: 'Estimate savings' },
    { title: 'Guide: Top 15 HRMS Features Every Company Needs', text: 'The payroll, attendance, leave and compliance features worth checking in any HRMS.', to: '/blog-top-15-hrms-features', cta: 'Read guide', to2: '/blog-jwithkp-hrms-pricing', cta2: 'HRMS pricing' },
  ] },
]

export const situations = [
  { q: 'Just starting a company?', a: [['Startup IT Checklist', '/startup-it-checklist'], ['open-source startup guide', '/blog-open-source-startup-cost-savings']] },
  { q: 'Paying too much for licences?', a: [['ROI calculator', '/roi-calculator'], ['moving from VMware to Proxmox', '/blog-proxmox-vmware-alternative'], ['Nextcloud versus Microsoft 365', '/blog-nextcloud-vs-microsoft365']] },
  { q: 'Worried about security?', a: [['2026 best-practices guide', '/blog-cybersecurity-best-practices-2026'], ['Wazuh monitoring', '/blog-wazuh-security-smb']] },
  { q: 'Network feels slow or opaque?', a: [['ntopng traffic monitoring', '/blog-ntopng-network-monitoring'], ['network design', '/services/network-design']] },
  { q: 'Choosing HR software?', a: [['the features that matter', '/blog-top-15-hrms-features'], ['HRMS plans and costs', '/blog-jwithkp-hrms-pricing']] },
] as const

export const guidesFaq = [
  { q: 'Are the guides free?', a: 'Yes. The guides, the checklist and the calculators are free to read and use, and they do not require you to sign up.' },
  { q: 'Are the cost figures quotes?', a: 'No. The estimator and calculator give planning baselines based on public list prices and your inputs. Actual costs depend on your environment, and we agree scope and price in writing before any work starts.' },
  { q: 'Can you help me apply a guide to my business?', a: 'Yes. Book a free 30-minute call and we will map the guide to your team, tools and budget, and tell you honestly what to do first.' },
]
