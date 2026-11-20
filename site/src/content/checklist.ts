// Startup IT checklist items. Ticks are stored in the browser only (key below).
export const CHECKLIST_KEY = 'jwkp-startup-checklist-v1'
export interface CheckItem { id: string; html: string }
export interface CheckGroup { id: string; title: string; items: CheckItem[] }
export const checklist: CheckGroup[] = [
 {
  "id": "own",
  "title": "Own your accounts",
  "items": [
   {
    "id": "own-domain",
    "html": "<strong>Register your domain in the company’s name, with a login the company controls.</strong><small>If the person who bought the domain leaves or forgets the password, you can lose your website and your email.</small>"
   },
   {
    "id": "own-two-admins",
    "html": "<strong>Have at least two admins on every important account: email, domain, cloud, payments.</strong><small>One person on holiday, ill or leaving should never lock the business out.</small>"
   },
   {
    "id": "own-company-email",
    "html": "<strong>Sign up to business tools with a company email address, not a personal one.</strong><small>Accounts tied to a personal inbox are hard to recover and hard to hand over.</small>"
   },
   {
    "id": "own-tool-list",
    "html": "<strong>Keep a short list of every tool you pay for: who owns it, what it costs, when it renews.</strong><small>You cannot secure, or cut, what you do not know about. The <a href=\"/it-cost-estimator\">IT cost estimator</a> can help you sanity-check the numbers.</small>"
   }
  ]
 },
 {
  "id": "email",
  "title": "Email and sign-in",
  "items": [
   {
    "id": "email-domain",
    "html": "<strong>Run business email on your own domain (Google Workspace, Microsoft 365 or similar).</strong><small>It looks professional, and you control who has access when people join or leave.</small>"
   },
   {
    "id": "email-mfa",
    "html": "<strong>Turn on multi-factor authentication (MFA) for everyone, starting with email and admin accounts.</strong><small>With MFA, a stolen password alone is not enough to get in.</small>"
   },
   {
    "id": "email-spf-dkim-dmarc",
    "html": "<strong>Set up SPF, DKIM and DMARC for your domain.</strong><small>These records make it harder for others to send email that pretends to be you, and help your own email reach inboxes.</small>"
   },
   {
    "id": "email-password-manager",
    "html": "<strong>Give the team a password manager, and stop sharing passwords in chat or spreadsheets.</strong><small>Strong, unique passwords are only realistic when nobody has to remember them.</small>"
   }
  ]
 },
 {
  "id": "devices",
  "title": "Laptops and phones",
  "items": [
   {
    "id": "dev-encryption",
    "html": "<strong>Turn on disk encryption on every laptop (BitLocker on Windows, FileVault on Mac).</strong><small>A lost or stolen laptop then does not mean lost customer data.</small>"
   },
   {
    "id": "dev-updates-lock",
    "html": "<strong>Switch on automatic updates and a screen lock.</strong><small>Most attacks use known problems that an update already fixes.</small>"
   },
   {
    "id": "dev-protection",
    "html": "<strong>Make sure each device has working malware protection.</strong><small>The protection built into current Windows and macOS is a reasonable start. Managed tools add central visibility.</small>"
   },
   {
    "id": "dev-list",
    "html": "<strong>Keep a simple list of who has which device.</strong><small>You need it when someone leaves, or when a device goes missing.</small>"
   },
   {
    "id": "dev-lost",
    "html": "<strong>Know how you would lock or wipe a lost phone or laptop.</strong><small>Decide this before it happens, not after.</small>"
   }
  ]
 },
 {
  "id": "people",
  "title": "People joining and leaving",
  "items": [
   {
    "id": "ppl-least-access",
    "html": "<strong>Give each person only the access their job needs.</strong><small>Fewer people with admin rights means fewer ways for a mistake or a stolen login to do serious damage.</small>"
   },
   {
    "id": "ppl-leaver",
    "html": "<strong>Write a short leaver checklist: disable email, remove tool access, collect devices, change shared secrets.</strong><small>Most access problems come from accounts that nobody remembered to switch off.</small>"
   },
   {
    "id": "ppl-review",
    "html": "<strong>Review who has admin access every few months.</strong><small>Put it in the calendar. Access tends to build up and never shrink.</small>"
   }
  ]
 },
 {
  "id": "backup",
  "title": "Backups",
  "items": [
   {
    "id": "bkp-list",
    "html": "<strong>List what you could not afford to lose: customer data, code, finance records, contracts.</strong><small>Back up what matters first, rather than everything equally.</small>"
   },
   {
    "id": "bkp-321",
    "html": "<strong>Keep more than one copy, with one stored away from your main systems.</strong><small>A common rule of thumb is 3-2-1: three copies, on two kinds of storage, with one off-site.</small>"
   },
   {
    "id": "bkp-restore",
    "html": "<strong>Test a restore, not just the backup.</strong><small>A backup you have never restored is only a hope.</small>"
   },
   {
    "id": "bkp-saas",
    "html": "<strong>Check how long your email and file tools keep deleted items, and whether you need a separate backup.</strong><small>Do not assume a cloud tool keeps old versions forever. Read what your plan actually does.</small>"
   }
  ]
 },
 {
  "id": "security",
  "title": "Everyday security",
  "items": [
   {
    "id": "sec-updates",
    "html": "<strong>Keep software and plug-ins up to date, including your website if you have one.</strong><small>Old plug-ins and forgotten test sites are a common way in.</small>"
   },
   {
    "id": "sec-phishing",
    "html": "<strong>Tell the team what phishing looks like, and make it easy to report a suspicious message.</strong><small>People who feel safe reporting a mistake early save you the most damage.</small>"
   },
   {
    "id": "sec-admin-accounts",
    "html": "<strong>Use separate admin accounts for admin work, not your everyday inbox login.</strong><small>It limits what a single phishing click can reach.</small>"
   },
   {
    "id": "sec-alerts",
    "html": "<strong>Switch on sign-in alerts for email and key tools.</strong><small>You hear about a strange login while it is still a warning.</small>"
   },
   {
    "id": "sec-incident",
    "html": "<strong>Decide who to call, and what to do first, if something goes wrong.</strong><small>A name and a phone number written down beats working it out in a panic.</small>"
   },
   {
    "id": "sec-office-network",
    "html": "<strong>If you have an office: change the default router or firewall password, keep its firmware updated, and use a separate guest Wi-Fi.</strong><small>Default passwords on network equipment are widely known.</small>"
   }
  ]
 },
 {
  "id": "docs",
  "title": "Write things down",
  "items": [
   {
    "id": "doc-setup-note",
    "html": "<strong>Keep a one-page note of how things are set up: tools, owners, where recovery details live, how to reach each vendor’s support.</strong><small>Anyone covering for you, or any IT provider you hire later, can start from it.</small>"
   },
   {
    "id": "doc-recovery-codes",
    "html": "<strong>Store admin-account recovery codes somewhere safe and offline.</strong><small>They are what gets you back in if a phone with your MFA app is lost.</small>"
   }
  ]
 },
 {
  "id": "data",
  "title": "Customer data",
  "items": [
   {
    "id": "data-map",
    "html": "<strong>Write down what personal data you collect, where it is stored and who can see it.</strong><small>You cannot protect, or explain, data you have not mapped.</small>"
   },
   {
    "id": "data-law",
    "html": "<strong>Ask a lawyer what India’s Digital Personal Data Protection Act, 2023 means for your business.</strong><small>If you handle customers’ personal data it may apply to you. This checklist is not legal advice.</small>"
   }
  ]
 }
]
