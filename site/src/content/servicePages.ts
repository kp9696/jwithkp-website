// Service and solution pages. Each entry renders one page at its URL.
export interface DeliverCard { icon: string; title: string; text: string }
export interface ServicePageData {
  kind: 'services' | 'solutions'
  slug: string
  path: string
  key: string
  crumb: string
  icon: string
  title: string
  description: string
  badge: string
  h1: [string, string]
  lede: string
  h2: [string, string]
  sub: string
  cards: DeliverCard[]
  open: string[] | null
  comm: string[] | null
  faq: { q: string; a: string }[]
  related: { label: string; to: string }[]
  cta: string
}

export const servicePages: ServicePageData[] = [
  {
    "kind": "services",
    "slug": "it-infrastructure",
    "path": "/services/it-infrastructure",
    "key": "it-infrastructure",
    "crumb": "IT Infrastructure",
    "icon": "Server",
    "title": "IT Infrastructure & Cloud Services",
    "description": "Server management, cloud infrastructure, virtualization, Microsoft 365 and backup for startups and growing businesses in India. Book a free consultation.",
    "badge": "IT Infrastructure & Cloud",
    "h1": [
      "IT infrastructure",
      "built to last"
    ],
    "lede": "Servers, cloud, virtualization, Microsoft 365 and backup, set up around how your business works and documented so you are never dependent on us to understand it.",
    "h2": [
      "Infrastructure that",
      "runs without drama"
    ],
    "sub": "From a first office setup to moving off an expensive hypervisor, we plan it, build it in stages and hand it over.",
    "cards": [
      {
        "icon": "Server",
        "title": "Server management",
        "text": "Physical and virtual servers installed, hardened, patched and documented."
      },
      {
        "icon": "Cloud",
        "title": "Cloud infrastructure",
        "text": "Workloads on AWS or Azure when pay-as-you-go suits you, or on your own servers when costs should stay flat."
      },
      {
        "icon": "Layers",
        "title": "Virtualization",
        "text": "Proxmox or VMware environments designed, built and migrated, including VMware to Proxmox moves."
      },
      {
        "icon": "Mail",
        "title": "Microsoft 365 & email",
        "text": "Tenant setup, mailboxes, identity, device management and migration from existing email."
      },
      {
        "icon": "HardDrive",
        "title": "Backup & recovery",
        "text": "Backup design with restore tests, so you know recovery works before you need it."
      },
      {
        "icon": "FileText",
        "title": "Documentation & handover",
        "text": "Configurations, runbooks and admin access handed over at the end of every project."
      }
    ],
    "open": [
      "Proxmox VE",
      "Proxmox Backup Server",
      "Linux",
      "Nextcloud"
    ],
    "comm": [
      "Microsoft 365",
      "Microsoft Azure",
      "AWS",
      "VMware",
      "Windows Server",
      "Hyper-V"
    ],
    "faq": [
      {
        "q": "Should we use the cloud or our own servers?",
        "a": "It depends on how predictable your workloads are and who will look after the hardware. Cloud suits fast-changing or unpredictable demand; your own servers often cost less for steady workloads. We recommend based on your numbers, not a default."
      },
      {
        "q": "Can you migrate us off VMware?",
        "a": "Yes. We plan VMware to Proxmox migrations in phases, validate backups first and agree a rollback plan before any production cutover."
      },
      {
        "q": "Do we keep control of our systems?",
        "a": "Yes. You keep every configuration, runbook and admin access. Credentials are handed over securely at the end of the project."
      }
    ],
    "related": [
      {
        "label": "Managed IT Services",
        "to": "/services/managed-it"
      },
      {
        "label": "Open-source solutions",
        "to": "/solutions/open-source"
      },
      {
        "label": "Commercial solutions",
        "to": "/solutions/commercial"
      }
    ],
    "cta": "Planning a new office, a migration or a cloud move? Tell us what you need and we will tell you what to do first."
  },
  {
    "kind": "services",
    "slug": "network-design",
    "path": "/services/network-design",
    "key": "network-design",
    "crumb": "Network Design",
    "icon": "Network",
    "title": "Network Design & Security Services",
    "description": "LAN, WAN, Wi-Fi, firewall, VPN and VLAN design and implementation for offices and branches. Planned, staged and documented. Book a free consultation.",
    "badge": "Network Design & Security",
    "h1": [
      "Networks and firewalls",
      "planned properly"
    ],
    "lede": "Wired and wireless networks, firewalls, VPN and links between sites, designed around your layout and team, built in stages and documented.",
    "h2": [
      "Secure networks for",
      "offices and branches"
    ],
    "sub": "Design first, then installation, so the network fits the business and not the other way round.",
    "cards": [
      {
        "icon": "Network",
        "title": "LAN & WAN design",
        "text": "Network architecture for offices and multiple sites, including links between them."
      },
      {
        "icon": "Wifi",
        "title": "Wi-Fi",
        "text": "Coverage planning and controlled, secure wireless for staff and guests."
      },
      {
        "icon": "Flame",
        "title": "Firewall setup & review",
        "text": "Firewalls chosen with you, configured, with the rules written down."
      },
      {
        "icon": "Lock",
        "title": "VPN & secure access",
        "text": "Site-to-site and remote-access VPN for branches and remote staff."
      },
      {
        "icon": "Workflow",
        "title": "VLANs & segmentation",
        "text": "Separating staff, guest, server and device traffic to limit the damage of any one problem."
      },
      {
        "icon": "LineChart",
        "title": "Monitoring",
        "text": "Visibility into traffic and device health so problems are found early."
      }
    ],
    "open": [
      "pfSense",
      "OPNsense",
      "Zabbix",
      "ntopng"
    ],
    "comm": [
      "Fortinet",
      "Sophos",
      "Cisco",
      "Aruba",
      "Omada"
    ],
    "faq": [
      {
        "q": "Which firewall should we choose?",
        "a": "Fortinet or Sophos suit teams that want a vendor support contract and a polished console. pfSense or OPNsense suit hands-on teams that want flexibility without per-device licences. We help you pick on your requirements and budget."
      },
      {
        "q": "Can you secure our branch offices and remote staff?",
        "a": "Yes. We design site-to-site links and remote-access VPN, then document how each is configured."
      },
      {
        "q": "Will the cutover disrupt work?",
        "a": "We plan cutovers to avoid business-hours downtime and agree a rollback plan first."
      }
    ],
    "related": [
      {
        "label": "Cybersecurity",
        "to": "/services/cybersecurity"
      },
      {
        "label": "IT infrastructure",
        "to": "/services/it-infrastructure"
      },
      {
        "label": "Commercial solutions",
        "to": "/solutions/commercial"
      }
    ],
    "cta": "Setting up a new office or replacing an ageing firewall? Let’s discuss your requirements."
  },
  {
    "kind": "services",
    "slug": "cybersecurity",
    "path": "/services/cybersecurity",
    "key": "cybersecurity",
    "crumb": "Cybersecurity",
    "icon": "ShieldCheck",
    "title": "Cybersecurity Solutions for Businesses",
    "description": "Endpoint security, SIEM, access control, vulnerability assessment and data protection for startups and growing businesses in India. Start with a free call.",
    "badge": "Cybersecurity",
    "h1": [
      "Security built in,",
      "not bolted on"
    ],
    "lede": "Endpoint security, monitoring, access control and data protection that fit a small team’s budget and are honest about what they do and do not cover.",
    "h2": [
      "Practical security for",
      "growing businesses"
    ],
    "sub": "We focus on the controls that reduce real risk first, and tell you plainly what is out of scope.",
    "cards": [
      {
        "icon": "Laptop",
        "title": "Endpoint security",
        "text": "Protection and management for laptops, desktops and servers."
      },
      {
        "icon": "Eye",
        "title": "SIEM & monitoring",
        "text": "Centralised log monitoring and alerting with Wazuh, without the cost of larger SIEM platforms."
      },
      {
        "icon": "KeyRound",
        "title": "Access control",
        "text": "Multi-factor sign-in, least-privilege access and sensible admin practices."
      },
      {
        "icon": "SearchCheck",
        "title": "Vulnerability assessment",
        "text": "Finding and prioritising weaknesses in your systems so fixes go to the right place first."
      },
      {
        "icon": "Database",
        "title": "Data protection",
        "text": "Backups, encryption and access rules for the data that matters most."
      },
      {
        "icon": "ClipboardList",
        "title": "Policies & guidance",
        "text": "Plain-language security practices your team can actually follow."
      }
    ],
    "open": [
      "Wazuh",
      "pfSense",
      "OPNsense"
    ],
    "comm": [
      "Fortinet",
      "Sophos",
      "Microsoft Defender",
      "Microsoft 365 security"
    ],
    "faq": [
      {
        "q": "Do you guarantee we will not be breached?",
        "a": "No. No one can. We reduce risk, improve visibility and help you respond, and we are clear about what each control does and does not cover."
      },
      {
        "q": "Is Wazuh enough for a small business?",
        "a": "For many small teams it is a strong, affordable start for visibility and alerting. It needs to be set up and tuned properly, which is where we help."
      },
      {
        "q": "Do you hold security certifications?",
        "a": "We do not claim certifications we do not hold. Our security practices are described on our Security Practices page."
      }
    ],
    "related": [
      {
        "label": "Network design",
        "to": "/services/network-design"
      },
      {
        "label": "Security practices",
        "to": "/security-practices"
      },
      {
        "label": "Open-source solutions",
        "to": "/solutions/open-source"
      }
    ],
    "cta": "Want to know where your biggest security gaps are? Let’s start with a conversation."
  },
  {
    "kind": "services",
    "slug": "software-development",
    "path": "/services/software-development",
    "key": "software-development",
    "crumb": "Software Development",
    "icon": "GitBranch",
    "title": "Custom Software & Web App Development",
    "description": "Custom web applications, ERP, CRM, HRMS and SaaS platforms built around your workflow, from a written scope to handover. Book a free consultation.",
    "badge": "Software Development",
    "h1": [
      "Software built",
      "around your workflow"
    ],
    "lede": "Custom web applications, ERP, CRM, HRMS and SaaS platforms, built from a written scope and handed over with documentation.",
    "h2": [
      "Applications that",
      "fit how you work"
    ],
    "sub": "We replace spreadsheets and manual steps with tools your team will actually use.",
    "cards": [
      {
        "icon": "AppWindow",
        "title": "Custom web applications",
        "text": "Business applications designed around your process, from scope to handover."
      },
      {
        "icon": "Workflow",
        "title": "ERP & CRM",
        "text": "ERP and CRM set up or extended around your sales, stock, finance and customer processes."
      },
      {
        "icon": "UserCog",
        "title": "HRMS",
        "text": "Payroll and attendance tooling, including our own product, JwithKP HRMS."
      },
      {
        "icon": "Boxes",
        "title": "SaaS platforms",
        "text": "Multi-tenant products designed to scale from the first customer."
      },
      {
        "icon": "Plug",
        "title": "Integrations & APIs",
        "text": "Connecting your tools so data is entered once."
      },
      {
        "icon": "Wrench",
        "title": "Maintenance & support",
        "text": "Updates, fixes and improvements after launch."
      }
    ],
    "open": [
      "Python",
      "FastAPI",
      "Node.js",
      "PostgreSQL",
      "React",
      "Odoo",
      "ERPNext"
    ],
    "comm": [
      "Microsoft Azure",
      "AWS",
      "Cloudflare"
    ],
    "faq": [
      {
        "q": "How do you scope a project?",
        "a": "We agree a written scope, timeline and cost estimate before work starts, and build in stages so you see progress early."
      },
      {
        "q": "Do we own the code?",
        "a": "Ownership and handover terms are agreed in writing before work starts. You receive the source and documentation as agreed."
      },
      {
        "q": "Do you also offer a ready-made HRMS?",
        "a": "Yes. JwithKP HRMS is our own payroll and attendance product, available at hrms.jwithkp.com."
      }
    ],
    "related": [
      {
        "label": "Website development",
        "to": "/services/website-development"
      },
      {
        "label": "Technologies",
        "to": "/technologies"
      },
      {
        "label": "Managed IT",
        "to": "/services/managed-it"
      }
    ],
    "cta": "Planning a custom application or replacing spreadsheets with a proper tool? Let’s discuss your requirements."
  },
  {
    "kind": "services",
    "slug": "website-development",
    "path": "/services/website-development",
    "key": "website-development",
    "crumb": "Website Development",
    "icon": "ShoppingCart",
    "title": "Business Website & E-commerce Development",
    "description": "Corporate websites, e-commerce stores and business portals that load fast and are built to be found. Book a free consultation with JwithKP Technology.",
    "badge": "Website Development",
    "h1": [
      "Websites that",
      "work for your business"
    ],
    "lede": "Corporate websites, online stores and business portals, built to load quickly, work on every device and be found in search.",
    "h2": [
      "Websites, stores and",
      "portals"
    ],
    "sub": "Designed around what your customers need to do, then built and handed over cleanly.",
    "cards": [
      {
        "icon": "Building2",
        "title": "Corporate websites",
        "text": "Clear, fast company websites that explain what you do and make it easy to get in touch."
      },
      {
        "icon": "ShoppingCart",
        "title": "E-commerce",
        "text": "Online stores on Shopify, WooCommerce or custom builds, set up around your catalogue and payments."
      },
      {
        "icon": "DoorOpen",
        "title": "Business portals",
        "text": "Customer and partner portals with sign-in and role-based access."
      },
      {
        "icon": "Search",
        "title": "SEO foundations",
        "text": "Page structure, metadata and speed that give search engines what they need."
      },
      {
        "icon": "Gauge",
        "title": "Performance & hosting",
        "text": "Fast hosting with a CDN and HTTPS from day one."
      },
      {
        "icon": "Wrench",
        "title": "Ongoing care",
        "text": "Updates, backups and small changes after launch."
      }
    ],
    "open": [
      "WordPress",
      "React",
      "Node.js"
    ],
    "comm": [
      "Shopify",
      "Cloudflare"
    ],
    "faq": [
      {
        "q": "Will my website be found on Google?",
        "a": "We build in the technical SEO foundations: structure, metadata, speed and mobile layout. Rankings also depend on content and competition, so we cannot promise a position."
      },
      {
        "q": "Can you build an online store?",
        "a": "Yes. We set up e-commerce with the platform that suits your catalogue, payments and budget."
      },
      {
        "q": "Who looks after the site after launch?",
        "a": "We can, on a small support plan, or you can take it over with full documentation."
      }
    ],
    "related": [
      {
        "label": "Software development",
        "to": "/services/software-development"
      },
      {
        "label": "IT infrastructure",
        "to": "/services/it-infrastructure"
      },
      {
        "label": "Projects",
        "to": "/projects"
      }
    ],
    "cta": "Need a new website or an online store? Tell us about your business and we will suggest the right approach."
  },
  {
    "kind": "services",
    "slug": "managed-it",
    "path": "/services/managed-it",
    "key": "managed-it",
    "crumb": "Managed IT Services",
    "icon": "Headset",
    "title": "Managed IT Services & Support",
    "description": "Remote support, AMC, monitoring, maintenance and IT consulting for startups and growing teams, with a first response within 24 business hours.",
    "badge": "Managed IT Services",
    "h1": [
      "Ongoing IT support,",
      "without a full-time team"
    ],
    "lede": "Remote support, annual maintenance, monitoring and IT consulting, so your team has someone to call and your systems stay healthy.",
    "h2": [
      "Support that keeps",
      "your business moving"
    ],
    "sub": "Support terms are agreed in writing: what is covered, how to reach us and how quickly we respond.",
    "cards": [
      {
        "icon": "Headset",
        "title": "Remote support",
        "text": "Help for your team with everyday IT problems, by phone, email or remote session."
      },
      {
        "icon": "ScrollText",
        "title": "AMC",
        "text": "Annual maintenance contracts for your infrastructure, with scope and response terms agreed in writing."
      },
      {
        "icon": "HeartPulse",
        "title": "Monitoring",
        "text": "Visibility into servers, network and security so issues are caught early."
      },
      {
        "icon": "RefreshCw",
        "title": "Maintenance",
        "text": "Patching, updates and backup checks on a regular schedule."
      },
      {
        "icon": "Briefcase",
        "title": "IT consulting",
        "text": "A part-time IT head for planning, vendor choices and budgets."
      },
      {
        "icon": "Users",
        "title": "Onboarding & offboarding",
        "text": "Accounts, devices and access set up and removed properly as people join and leave."
      }
    ],
    "open": [
      "Zabbix",
      "GLPI",
      "Wazuh"
    ],
    "comm": [
      "Microsoft 365",
      "Fortinet",
      "Cisco"
    ],
    "faq": [
      {
        "q": "How fast do you respond?",
        "a": "Support terms include a first response within 24 business hours. Exact hours, escalation and response targets are set out in your support agreement."
      },
      {
        "q": "Can you act as our part-time IT head?",
        "a": "Yes. Our retainer covers ongoing help and planning without hiring a full-time IT team."
      },
      {
        "q": "What is covered under AMC?",
        "a": "The scope is agreed in writing before you sign: which systems, what is included and how requests are handled."
      }
    ],
    "related": [
      {
        "label": "IT infrastructure",
        "to": "/services/it-infrastructure"
      },
      {
        "label": "Cybersecurity",
        "to": "/services/cybersecurity"
      },
      {
        "label": "Services overview",
        "to": "/services"
      }
    ],
    "cta": "Want someone reliable to look after your IT? Let’s talk about what you need covered."
  },
  {
    "kind": "solutions",
    "slug": "open-source",
    "path": "/solutions/open-source",
    "key": "open-source",
    "crumb": "Open-Source Solutions",
    "icon": "GitMerge",
    "title": "Open-Source IT Solutions for Business",
    "description": "Proxmox, pfSense, Zabbix, Wazuh, Nextcloud and GLPI: flexible, cost-effective open-source IT solutions, implemented and supported by JwithKP Technology.",
    "badge": "Open-Source Solutions",
    "h1": [
      "Open source that is",
      "flexible and cost-effective"
    ],
    "lede": "We deploy and support open-source platforms for virtualization, firewalls, monitoring, security and collaboration, so you avoid per-seat licensing where it makes sense.",
    "h2": [
      "The open-source stack",
      "we implement"
    ],
    "sub": "Licensing costs are lower or nil, but you still need setup, updates and support. We provide that.",
    "cards": [
      {
        "icon": "Layers",
        "title": "Proxmox VE",
        "text": "Virtualization and backup on your own hardware, a common alternative to VMware."
      },
      {
        "icon": "Flame",
        "title": "pfSense / OPNsense",
        "text": "Flexible firewall and VPN on standard hardware."
      },
      {
        "icon": "LineChart",
        "title": "Zabbix",
        "text": "Monitoring for servers, network devices and services."
      },
      {
        "icon": "ShieldCheck",
        "title": "Wazuh",
        "text": "Security monitoring, log analysis and alerting."
      },
      {
        "icon": "Cloud",
        "title": "Nextcloud",
        "text": "File sync, sharing and collaboration on servers you control."
      },
      {
        "icon": "Ticket",
        "title": "GLPI",
        "text": "IT asset management and a service desk."
      }
    ],
    "open": null,
    "comm": null,
    "faq": [
      {
        "q": "Is open source really free?",
        "a": "The software licence is free or low cost, but setup, hardening, updates and support take time and skill. We help you weigh the total cost, not just the licence."
      },
      {
        "q": "Will we be locked into you?",
        "a": "No. You keep every configuration, runbook and admin access, and the software is open and portable."
      },
      {
        "q": "When should we choose commercial instead?",
        "a": "When you want a vendor support contract, a polished console or built-in compliance features. See our commercial solutions."
      }
    ],
    "related": [
      {
        "label": "Commercial solutions",
        "to": "/solutions/commercial"
      },
      {
        "label": "Technologies",
        "to": "/technologies"
      },
      {
        "label": "IT infrastructure",
        "to": "/services/it-infrastructure"
      }
    ],
    "cta": "Not sure whether open source fits? We will give you an honest recommendation."
  },
  {
    "kind": "solutions",
    "slug": "commercial",
    "path": "/solutions/commercial",
    "key": "commercial",
    "crumb": "Commercial Solutions",
    "icon": "Building2",
    "title": "Commercial IT Solutions & Enterprise Support",
    "description": "Microsoft 365, Azure, VMware, Fortinet, Sophos and Cisco: licensed platforms with vendor support, implemented by JwithKP Technology. Book a free call.",
    "badge": "Commercial Solutions",
    "h1": [
      "Enterprise platforms,",
      "with vendor support"
    ],
    "lede": "When a licensed platform and a vendor support contract are the right call, we help you choose, implement and run it.",
    "h2": [
      "Commercial platforms",
      "we implement"
    ],
    "sub": "Licensed platforms with vendor support and enterprise capabilities, chosen to fit your budget and requirements.",
    "cards": [
      {
        "icon": "Mail",
        "title": "Microsoft 365",
        "text": "Email, collaboration, identity and device management."
      },
      {
        "icon": "Cloud",
        "title": "Microsoft Azure",
        "text": "Cloud infrastructure and services for fast-changing workloads."
      },
      {
        "icon": "Layers",
        "title": "VMware",
        "text": "Virtualization where an existing environment or vendor requirement calls for it."
      },
      {
        "icon": "Flame",
        "title": "Fortinet",
        "text": "Firewalls and secure networking with a polished console."
      },
      {
        "icon": "ShieldCheck",
        "title": "Sophos",
        "text": "Firewall and endpoint protection."
      },
      {
        "icon": "Network",
        "title": "Cisco & Aruba",
        "text": "Enterprise switching and wireless networks."
      }
    ],
    "open": null,
    "comm": null,
    "faq": [
      {
        "q": "Why choose a commercial platform?",
        "a": "For a vendor support contract, purpose-built hardware, a polished console, or compliance features. The licence cost needs to fit your budget."
      },
      {
        "q": "Can you help us reduce licensing costs?",
        "a": "Yes. We review what you pay for and what you use, and suggest right-sizing or alternatives where they make sense."
      },
      {
        "q": "Do you resell licences?",
        "a": "Pricing and licensing arrangements are agreed in writing per project. Ask us on a free call."
      }
    ],
    "related": [
      {
        "label": "Open-source solutions",
        "to": "/solutions/open-source"
      },
      {
        "label": "Technologies",
        "to": "/technologies"
      },
      {
        "label": "Network design",
        "to": "/services/network-design"
      }
    ],
    "cta": "Comparing platforms or planning a purchase? We will help you choose on facts."
  }
]
