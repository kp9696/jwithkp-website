const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CleanCSS = require('clean-css');
const { minify } = require('terser');

// ---------------------------------------------------------------------------
// Site config + preview/production modes
//
// site-config.json holds the business facts that are not yet (or not always)
// known: legal entity, GSTIN, address, founder details, social URLs, hours.
// Templates reference them as {{cfg.path}}.
//
//   node build.js            PRODUCTION: a value that is not filled in renders
//                            as nothing, and any {{#if}} block around it is
//                            dropped. The build FAILS if a placeholder marker
//                            is still present in the output, so "[ADD ...]" can
//                            never be committed as a production build by mistake.
//   node build.js --preview  PREVIEW: missing values render as a visible
//                            [ADD ...] marker and conditional blocks stay, so
//                            the branch preview shows exactly what is still
//                            needed. Adds a small "preview build" ribbon.
// ---------------------------------------------------------------------------
const PREVIEW = process.argv.includes('--preview') || process.env.SITE_ENV === 'preview';
const SITE_CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'site-config.json'), 'utf8'));
const SITE_ORIGIN = 'https://www.jwithkp.com';

// legal.gstin and location.address may hold the owner's own "Soon" / "Coming soon" wording, which is fine
// to show in the footer and on the contact and about pages. Structured data and the legal pages only
// state facts, so they use cfg.legalDoc.*: the GSTIN only when it is a real 15-character GSTIN, the
// address only when it is not a "coming soon" style placeholder.
const PENDING_TEXT = /\b(soon|tbd|tba|pending|n\/a)\b|to be (added|announced|confirmed)/i;
const GSTIN_FORMAT = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
{
  const gstin = String((SITE_CONFIG.legal || {}).gstin || '').replace(/\s+/g, '').toUpperCase();
  const address = String((SITE_CONFIG.location || {}).address || '').trim();
  SITE_CONFIG.legalDoc = {
    gstin: GSTIN_FORMAT.test(gstin) ? gstin : '',
    address: address && !PENDING_TEXT.test(address) ? address : ''
  };
  if (gstin && !SITE_CONFIG.legalDoc.gstin && !PENDING_TEXT.test(gstin)) {
    console.warn('Warning: legal.gstin is set but is not a valid 15-character GSTIN, so it is shown in the footer only and kept out of structured data and the legal pages.');
  }
}

function cfgGet(keyPath) {
  return keyPath.split('.').reduce((o, k) => (o == null ? undefined : o[k]), SITE_CONFIG);
}
function cfgFilled(keyPath) {
  const v = cfgGet(keyPath);
  if (Array.isArray(v)) return v.length > 0;
  return v !== undefined && v !== null && String(v).trim() !== '';
}
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function todoMarker(keyPath) {
  const label = keyPath.split('.').pop().replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
  return `<mark class="todo-marker" title="Set ${keyPath} in site-config.json">[ADD ${label}]</mark>`;
}

// {{cfg.a.b}}            text value (HTML-escaped); marker in preview if missing
// {{cfg.a.b|attr}}       for attribute values; "#add-a.b" in preview if missing
// {{#if cfg.a.b}}..{{/if}}           keep block only when filled (always kept in preview)
// {{#ifany cfg.a cfg.b}}..{{/ifany}} keep block when any of the keys is filled
// {{#ifall cfg.a cfg.b}}..{{/ifall}} keep block only when ALL of the keys are filled
// Blocks may nest (the innermost is resolved first).
// {{#unless cfg.a.b}}..{{/unless}}   fallback shown only when the key is NOT
//                                    filled (same in preview and production)
// {{#when cfg.a.b}}..{{/when}}       like #if but silent: never shows a marker
//                                    (use it inside a tag's attributes)
// {{#item cfg.a.b}}<li>..</li>{{/item}}  a list item kept only when the key is
//                                    filled. In preview the unfilled item stays
//                                    and the marker goes INSIDE the <li>, so a
//                                    <ul> never gets a stray direct child.
// {{cfg.a.b|or:fallback text}}       the value, or the fallback when not filled
//                                    (never a marker)
function renderTemplate(tpl) {
  const blockRe = /\{\{#(if|ifany|ifall|unless|when|item)\s+([^}]+?)\}\}((?:(?!\{\{#(?:if|ifany|ifall|unless|when|item))[\s\S])*?)\{\{\/\1\}\}/;
  let out = tpl;
  let guard = 0;
  while (blockRe.test(out) && guard++ < 200) {
    out = out.replace(blockRe, (whole, kind, args, inner) => {
      const keys = args.trim().split(/\s+/).map(k => k.replace(/^cfg\./, ''));
      if (kind === 'unless') return cfgFilled(keys[0]) ? '' : inner;
      if (kind === 'when') return cfgFilled(keys[0]) ? inner : '';
      if (kind === 'item') {
        if (cfgFilled(keys[0])) return inner;
        if (!PREVIEW) return '';
        return inner.replace(/^(\s*<li[^>]*>)/, (m, open) => `${open}${todoMarker(keys[0])} `);
      }
      const ok = kind === 'if' ? cfgFilled(keys[0]) : kind === 'ifall' ? keys.every(cfgFilled) : keys.some(cfgFilled);
      if (ok) return inner;
      if (!PREVIEW) return '';
      // preview: keep the block; make sure at least one marker is visible. A
      // block whose only tokens are attribute values (|attr) would otherwise
      // show nothing, so it gets an explicit marker in front.
      const hasVisibleToken = /\{\{cfg\.[A-Za-z0-9_.]+\}\}/.test(inner);
      return hasVisibleToken ? inner : todoMarker(keys.find(k => !cfgFilled(k)) || keys[0]) + inner;
    });
  }
  out = out.replace(/\{\{cfg\.([A-Za-z0-9_.]+)\|or:([^}]*)\}\}/g, (whole, keyPath, fallback) =>
    cfgFilled(keyPath) ? escHtml(cfgGet(keyPath)) : fallback);
  return out.replace(/\{\{cfg\.([A-Za-z0-9_.]+)(\|attr)?\}\}/g, (whole, keyPath, attr) => {
    if (cfgFilled(keyPath)) return escHtml(cfgGet(keyPath));
    if (!PREVIEW) return '';
    return attr ? `#add-${keyPath}` : todoMarker(keyPath);
  });
}

// Page blocks: any region of a page wrapped in
//   <!-- BLOCK:name --> ... <!-- /BLOCK:name -->
// is regenerated on every build from templates/blocks/name.html, rendered with
// the same {{cfg.*}} engine. Pages are edited in place, so this is how page
// content can depend on site-config.json without the tokens being lost the
// first time the page is built.
function renderBlocks(content, file) {
  return content.replace(/<!-- BLOCK:([a-z0-9-]+) -->[\s\S]*?<!-- \/BLOCK:\1 -->/g, (whole, name) => {
    const blockPath = path.join(__dirname, 'templates', 'blocks', `${name}.html`);
    if (!fs.existsSync(blockPath)) throw new Error(`${file}: BLOCK "${name}" has no templates/blocks/${name}.html`);
    const body = renderTemplate(fs.readFileSync(blockPath, 'utf8').replace(/\r\n/g, '\n').replace(/\s+$/, ''));
    return `<!-- BLOCK:${name} -->\n${body}\n<!-- /BLOCK:${name} -->`;
  });
}

const HTML_ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–', '&rsquo;': '’', '&lsquo;': '‘', '&hellip;': '…', '&middot;': '·' };
function plainText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, e => HTML_ENTITIES[e.toLowerCase()] || e).replace(/\s+/g, ' ').trim();
}

// FAQPage JSON-LD is generated from the visible accordion (.hp-faq-item), so
// the structured data can never drift from the text a visitor reads.
function syncFaqSchema(content) {
  // Two FAQ markups exist: the home accordion (.hp-faq-item) and the card grid
  // used on the services page (.svc-faq-card, an <h3> question and a <p> answer).
  if (!content.includes('class="hp-faq-accordion"') && !content.includes('class="svc-faq-card"')) return content;
  const items = [];
  const accordion = /<button class="hp-faq-trigger"[^>]*>([\s\S]*?)<span class="hp-faq-icon"[\s\S]*?<\/button>[\s\S]*?<div class="hp-faq-content-inner">([\s\S]*?)<\/div>/g;
  const cards = /<article class="svc-faq-card">\s*<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>\s*<\/article>/g;
  let m;
  while ((m = accordion.exec(content))) items.push({ q: plainText(m[1]), a: plainText(m[2]) });
  if (!items.length) while ((m = cards.exec(content))) items.push({ q: plainText(m[1]), a: plainText(m[2]) });
  if (!items.length) return content;
  content = content.replace(/[ \t]*<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>[ \t]*\r?\n?/gi, (whole, json) => {
    try {
      const j = JSON.parse(json);
      return [].concat(j['@graph'] || j).some(n => n && n['@type'] === 'FAQPage') ? '' : whole;
    } catch (e) { return whole; }
  });
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } }))
  };
  return content.replace('</head>', `  <script type="application/ld+json" id="faq-schema">\n${JSON.stringify(faq, null, 2)}\n  </script>\n</head>`);
}

// Reads width/height from a PNG, JPEG or WebP file buffer (no dependencies).
function imageSize(buf) {
  try {
    if (buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') {
      const fmt = buf.slice(12, 16).toString();
      if (fmt === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      if (fmt === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (fmt === 'VP8L') {
        const b = buf.readUInt32LE(21);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
    }
  } catch (e) { /* fall through */ }
  return null;
}

// Short, stable content hash used for cache-busting filenames. Deterministic
// per build (same source content -> same hash), so an unchanged file gets a
// stable URL and an edited one gets a new one automatically.
function contentHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
}

// ---------------------------------------------------------------------------
// Self-hosted fonts (Inter and Space Grotesk, SIL OFL 1.1, see
// css/webfonts/OFL-LICENSE.txt). They used to come from Google Fonts, which cost
// two extra connections before any text could use them, and the late swap moved
// the page (layout shift). Sources stay at css/webfonts/<name>.woff2; the build
// emits fingerprinted copies (the folder is served as immutable, like Font
// Awesome's) and rewrites the @font-face URLs in the stylesheet. No preload is
// needed: the files are same-origin and are found as soon as the stylesheet is parsed.
// ---------------------------------------------------------------------------
let siteFontMap = {}; // 'inter-latin' -> 'inter-latin.<hash>.woff2'
const SITE_FONT_RE = /^((?:inter|space-grotesk)-(?:latin|rupee))\.woff2$/;
function fingerprintSiteFonts() {
  const fontDir = path.join(__dirname, 'css', 'webfonts');
  const map = {};
  for (const f of fs.readdirSync(fontDir)) {
    const m = f.match(SITE_FONT_RE);
    if (m) map[m[1]] = `${m[1]}.${contentHash(fs.readFileSync(path.join(fontDir, f)))}.woff2`;
  }
  const keep = new Set(Object.values(map));
  for (const f of fs.readdirSync(fontDir)) {
    if (/^(?:inter|space-grotesk)-(?:latin|rupee)\.[0-9a-f]{10}\.woff2$/.test(f) && !keep.has(f)) fs.unlinkSync(path.join(fontDir, f));
  }
  for (const [base, hashed] of Object.entries(map)) fs.copyFileSync(path.join(fontDir, `${base}.woff2`), path.join(fontDir, hashed));
  return map;
}

// Applies the current theme before first paint. Without it the page always paints
// dark and then flips to light once the deferred script runs, which flashes for
// anyone who chose the light theme.
const THEME_INIT = "(function(){var t='dark';try{if(localStorage.getItem('jwkp-theme')==='light')t='light'}catch(e){}document.documentElement.setAttribute('data-theme',t)})();";

// Per-page head block: no Google Fonts, the theme applied before first paint, and a
// preload for the heading font only. Preloading both fonts delayed first paint in a
// throttled test (they compete with the stylesheet for bandwidth), but the heading
// font is small (11 KB) and it is the one whose late swap re-wraps h1s and shifts the
// page; the metric-matched fallbacks cover the body font.
function ensureHeadPerf(content) {
  content = content.replace(/[ \t]*<noscript>\s*<link[^>]*fonts\.googleapis\.com[^>]*>\s*<\/noscript>/g, '');
  content = content.replace(/[ \t]*<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>[ \t]*\r?\n?/g, '');
  content = content.replace(/[ \t]*<!-- HEAD_PERF -->[\s\S]*?<!-- \/HEAD_PERF -->[ \t]*\r?\n?/g, '');
  const idx = content.search(/[ \t]*<link rel="stylesheet" href="css\//);
  if (idx < 0 || !siteFontMap['space-grotesk-latin']) return content;
  const block = [
    '  <!-- HEAD_PERF -->',
    `  <script>${THEME_INIT}</script>`,
    `  <link rel="preload" href="/css/webfonts/${siteFontMap['space-grotesk-latin']}" as="font" type="font/woff2" crossorigin>`,
    '  <!-- /HEAD_PERF -->',
    ''
  ].join('\n');
  return content.slice(0, idx) + block + content.slice(idx);
}

// GTM is deferred: gtm.js (and the GA4 tag it pulls in) cost ~0.5-1s of main-thread
// blocking on desktop and ~2-4s on throttled mobile, so it starts on the first user
// interaction, or ~6s after the load event for visitors who just read without
// touching anything. Consent Mode defaults and any later gtag('consent','update')
// calls are queued on dataLayer, which GTM drains in order once it loads. Trade-off:
// a visit that bounces in under ~6s with no interaction is not counted.
const GTM_HEAD_SNIPPET = `<!-- Google Tag Manager -->
<script>(function(w,d,l,i){w[l]=w[l]||[];var s=0,ev=['pointerdown','keydown','touchstart','scroll'];
function go(){if(s)return;s=1;ev.forEach(function(e){w.removeEventListener(e,go,true)});
w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var j=d.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;d.head.appendChild(j)}
ev.forEach(function(e){w.addEventListener(e,go,{capture:true,passive:true})});
w.addEventListener('load',function(){setTimeout(function(){(w.requestIdleCallback?w.requestIdleCallback(go,{timeout:1500}):go())},6000)});
})(window,document,'dataLayer','GTM-M98KB4X7');</script>
<!-- End Google Tag Manager -->`;

const GTM_HEAD_RE = /<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/;

const GTM_BODY_SNIPPET = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M98KB4X7"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

const CONSENT_INIT_SNIPPET = `<!-- Google Consent Mode v2 (GDPR / India DPDP) -->
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 2000
});
</script>
<!-- End Consent Mode -->`;

// Which main-menu link is "active" on which page. Industries and Technology
// are no longer in the main menu (they are linked from the footer), so they
// have no entry. Resource pages all light up the Resources parent (href "blog").
const routeMap = {
  'index.html': 'https://www.jwithkp.com/',
  'about.html': 'about',
  'services.html': 'services',
  'roi-calculator.html': 'it-cost-estimator',
  'it-cost-estimator.html': 'it-cost-estimator',
  'blog.html': 'blog',
  'guides.html': 'blog',
  'startup-it-checklist.html': 'blog',
  'case-studies.html': 'blog',
  'contact.html': 'contact'
};

// Adds class="active" to the first nav <a> whose href matches exactly.
// Throws if no match, so a template change can never silently disable the
// active state again.
function setActiveLink(navHtml, href) {
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(<a\\s+href="${escaped}")(?=[\\s>])`);
  if (!re.test(navHtml)) {
    throw new Error(`setActiveLink: no nav link found for href="${href}" — navbar template changed?`);
  }
  return navHtml.replace(re, '$1 class="active"');
}

function ensureHreflang(content) {
  if (content.includes('hreflang')) return content;
  const canonicalMatch = content.match(/<link rel="canonical" href="([^"]+)"/i);
  if (!canonicalMatch) return content;
  const url = canonicalMatch[1];
  const tags = `<link rel="alternate" hreflang="en-IN" href="${url}">\n  <link rel="alternate" hreflang="x-default" href="${url}">`;
  return content.replace(/(<link rel="canonical"[^>]+>)/i, `$1\n  ${tags}`);
}

function ensureCoreSeoMeta(content) {
  if (!/meta name="author"/i.test(content)) {
    content = content.replace(/(<meta name="description"[^>]*>)/i, '$1\n  <meta name="author" content="JwithKP">');
  }

  // The keywords meta tag has been ignored by Google for years; drop it.
  content = content.replace(/^[ \t]*<meta name="keywords"[^>]*>[ \t]*\r?\n/gim, '');

  // One title everywhere: og:title and twitter:title always mirror <title>.
  const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch) {
    const t = titleMatch[1].trim().replace(/"/g, '&quot;');
    content = content.replace(/(<meta property="og:title" content=")[^"]*(")/i, (m, a, b) => a + t + b);
    content = content.replace(/(<meta name="twitter:title" content=")[^"]*(")/i, (m, a, b) => a + t + b);
  }

  // og:image:width/height must describe the file actually referenced. They
  // were left at 2816x1536 after the image was resized to 960x524.
  const ogImg = content.match(/<meta property="og:image" content="([^"]+)"/i);
  if (ogImg && ogImg[1].startsWith(SITE_ORIGIN + '/')) {
    const file = path.join(__dirname, ogImg[1].slice(SITE_ORIGIN.length + 1).split('?')[0]);
    if (fs.existsSync(file)) {
      const size = imageSize(fs.readFileSync(file));
      if (size) {
        content = content.replace(/(<meta property="og:image:width" content=")\d+(")/i, (m, a, b) => a + size.width + b);
        content = content.replace(/(<meta property="og:image:height" content=")\d+(")/i, (m, a, b) => a + size.height + b);
      }
    }
  }

  return content;
}

function ensureManifest(content) {
  if (content.includes('rel="manifest"')) return content;
  return content.replace(/(<link rel="icon"[^>]+>)/i, '$1\n  <link rel="manifest" href="/manifest.json">');
}

// One canonical, @id-linked Organization + WebSite + per-page WebPage graph,
// injected into every page. Additive only — it does not touch any existing
// page-specific schema (Article, FAQPage, Service, HowTo, etc.), so nothing
// already working can be broken by this. Crawlers and AI-search systems can
// now resolve "JwithKP" to one consistent entity instead of the unlinked,
// differently-shaped Organization/ProfessionalService objects that used to
// appear independently on index/about/contact/services with no @id tying
// them together.
//
// The graph is now regenerated from site-config.json on every build: any
// existing block that DEFINES the Organization / WebSite / WebPage entities
// (including the separate ones the home page used to carry) is removed and
// replaced by a single block, so a config change always reaches every page and
// there is never more than one definition of the same @id. Blocks that merely
// reference the organisation (Article author/publisher, FAQPage, ...) are left
// alone. Fields without a confirmed value (founder, street address, hours) are
// omitted rather than guessed.
// page: { url, name, description } of the page being built. url is empty for a page with no
// canonical link (the 404 page), which then gets no WebPage entry: it used to fall back to the
// home page's URL and declare itself to be the home page.
function buildEntityGraph(page) {
  const org = {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${SITE_ORIGIN}/#organization`,
    name: SITE_CONFIG.brand.name,
    url: `${SITE_ORIGIN}/`,
    slogan: SITE_CONFIG.brand.tagline,
    description: SITE_CONFIG.brand.description,
    logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/images/icons/icon-512.png`, width: 512, height: 512 },
    telephone: SITE_CONFIG.contact.phoneE164,
    email: SITE_CONFIG.contact.email,
    areaServed: { '@type': 'Country', name: 'India' },
    knowsAbout: SITE_CONFIG.seo.knowsAbout
  };
  if (SITE_CONFIG.location.city) {
    org.address = {
      '@type': 'PostalAddress',
      addressLocality: SITE_CONFIG.location.city,
      addressRegion: SITE_CONFIG.location.region,
      addressCountry: SITE_CONFIG.location.country
    };
    if (cfgFilled('legalDoc.address')) org.address.streetAddress = SITE_CONFIG.legalDoc.address;
  }
  if (cfgFilled('legal.entityName')) org.legalName = SITE_CONFIG.legal.entityName;
  if (cfgFilled('legalDoc.gstin')) org.taxID = SITE_CONFIG.legalDoc.gstin;
  const sameAs = [SITE_CONFIG.social.x, SITE_CONFIG.social.linkedinCompany].filter(Boolean);
  if (sameAs.length) org.sameAs = sameAs;
  org.contactPoint = {
    '@type': 'ContactPoint',
    telephone: SITE_CONFIG.contact.phoneE164,
    email: SITE_CONFIG.contact.email,
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['en', 'hi']
  };
  const graph = [
    org,
    {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: SITE_CONFIG.brand.name,
      publisher: { '@id': `${SITE_ORIGIN}/#organization` }
    }
  ];
  if (page.url) {
    const orgRef = { '@id': `${SITE_ORIGIN}/#organization` };
    // A hand-written AboutPage / ContactPage / CollectionPage for this URL is merged in as an extra type.
    const webPage = { '@type': page.types && page.types.length ? ['WebPage', ...page.types] : 'WebPage', '@id': `${page.url}#webpage`, url: page.url };
    // name and description come from the page's own <title> and meta description, so this entry
    // cannot drift from what the page says (hand-written copies of it had).
    if (page.name) webPage.name = page.name;
    if (page.description) webPage.description = page.description;
    webPage.isPartOf = { '@id': `${SITE_ORIGIN}/#website` };
    webPage.about = page.topics && page.topics.length ? [orgRef, ...page.topics] : orgRef;
    if (page.mainEntityIsOrg) webPage.mainEntity = orgRef;
    graph.push(webPage);
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

// A generated entity (organization, website, webpage) is rebuilt on every page. A hand-written
// WebPage, AboutPage, ContactPage or CollectionPage for the same URL is the same page described
// again, so it is dropped too (its type, topics and contact reference are merged into the
// generated WebPage by ensureEntityGraph).
const PAGE_TYPES = ['AboutPage', 'ContactPage', 'CollectionPage'];
function isEntityDefinition(node, pageUrl) {
  const id = node && node['@id'];
  if (typeof id === 'string' && /\/#(organization|website)$|#webpage$/.test(id) && !id.includes('{')) return true;
  const type = node && node['@type'];
  return !!node && !!pageUrl && node.url === pageUrl && (type === 'WebPage' || PAGE_TYPES.includes(type));
}

function ensureEntityGraph(content) {
  const canonicalMatch = content.match(/<link rel="canonical" href="([^"]+)"/i);
  const pageUrl = canonicalMatch ? canonicalMatch[1] : '';
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = content.match(/<meta name="description" content="([^"]*)"/i);
  const page = { url: pageUrl, name: titleMatch ? plainText(titleMatch[1]) : '', description: descMatch ? plainText(descMatch[1]) : '', types: [], topics: [], mainEntityIsOrg: false };

  content = content.replace(/[ \t]*<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>[ \t]*\r?\n?/gi, (whole, json) => {
    let parsed;
    try { parsed = JSON.parse(json); } catch (e) { return whole; }
    const nodes = parsed['@graph'] || [parsed];
    if (!nodes.some(n => isEntityDefinition(n, pageUrl))) return whole;
    nodes.filter(n => n && PAGE_TYPES.includes(n['@type']) && n.url === pageUrl).forEach(n => {
      if (!page.types.includes(n['@type'])) page.types.push(n['@type']);
      if (Array.isArray(n.about)) n.about.filter(a => typeof a === 'string').forEach(a => { if (!page.topics.includes(a)) page.topics.push(a); });
      // an inline copy of the business details is the same organization again: refer to it instead
      if (n.mainEntity && /^(ProfessionalService|Organization)$/.test([].concat(n.mainEntity['@type']).join(''))) page.mainEntityIsOrg = true;
    });
    const rest = nodes.filter(n => !isEntityDefinition(n, pageUrl));
    if (!rest.length) return '';
    return `  <script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': rest }, null, 2)}\n  </script>\n`;
  });

  const graph = `<script type="application/ld+json" id="entity-graph">\n${JSON.stringify(buildEntityGraph(page), null, 2)}\n  </script>`;
  return content.replace('</head>', `  ${graph}\n</head>`);
}

// Blog posts each carry an identical inline Organization stub for both
// "author" and "publisher" — the exact same object repeated 8 times with no
// @id. Once the canonical graph above exists on the page, point these at it
// instead, so there's one Organization entity, not nine differently-scoped
// copies of the same one. Only fires on the exact known pattern, so it's a
// no-op (not a risk) on every non-blog page.
function linkBlogEntityReferences(content) {
  content = content.replace(
    /"author":\s*\{\s*"@type":\s*"Organization",\s*"name":\s*"JwithKP"\s*\}/,
    '"author": { "@id": "https://www.jwithkp.com/#organization" }'
  );
  content = content.replace(
    /"publisher":\s*\{\s*"@type":\s*"Organization",\s*"name":\s*"JwithKP",\s*"logo":\s*\{\s*"@type":\s*"ImageObject",\s*"url":\s*"https:\/\/www\.jwithkp\.com\/Logo\.png"\s*\}\s*\}/,
    '"publisher": { "@id": "https://www.jwithkp.com/#organization" }'
  );
  return content;
}

function ensureGtmSnippets(content) {
  if (!content.includes('GTM-M98KB4X7')) {
    content = content.replace(/<head>/i, '<head>\n' + CONSENT_INIT_SNIPPET + '\n' + GTM_HEAD_SNIPPET);
    content = content.replace(/<body([^>]*)>/i, '<body$1>\n    ' + GTM_BODY_SNIPPET);
  } else if (!content.includes("'consent', 'default'")) {
    content = content.replace('<!-- Google Tag Manager -->', CONSENT_INIT_SNIPPET + '\n<!-- Google Tag Manager -->');
  } else if (!content.includes("'ad_user_data'")) {
    // Upgrade an older Consent Mode v2 snippet — one missing the
    // ad_user_data/ad_personalization signals the v2 spec requires — to the
    // current complete one, in place.
    content = content.replace(
      /<!-- Google Consent Mode v2[\s\S]*?<!-- End Consent Mode -->/,
      CONSENT_INIT_SNIPPET
    );
  }

  // Pages already carry an earlier copy of the head snippet; bring it up to date
  // so the loader stays identical on every page. (Function form: no $-expansion.)
  content = content.replace(GTM_HEAD_RE, () => GTM_HEAD_SNIPPET);

  return content;
}

// Wording the site must not use (see the "no absolute guarantees" and "no
// unearned certifications" rules). The build only warns; it never rewrites copy.
const CLAIM_PATTERNS = [
  ['"zero data loss"', /zero[- ]data[- ]loss/gi],
  ['"zero downtime"', /zero[- ]downtime/gi],
  ['"guarantee(d)"', /guarantee[ds]?\b/gi],
  ['"SOC 2" (only "aligned with" is acceptable)', /SOC ?2/g],
  ['"70%" savings figure (no confirmed methodology: use "significantly lower")', /\b70\s?%/g],
  ['"24 hours" support wording (use "first response within 24 business hours")', /\b24[ -](?:hours?|hrs?)\b/gi]
];

// RFC 9116 security.txt. Expires is kept under a year out and is refreshed on
// any build run within 90 days of expiry, so it cannot silently lapse.
function writeSecurityTxt() {
  const dir = path.join(__dirname, '.well-known');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'security.txt');
  const DAY = 24 * 60 * 60 * 1000;
  let expires = null;
  if (fs.existsSync(file)) {
    const m = fs.readFileSync(file, 'utf8').match(/^Expires:\s*(.+)$/m);
    const d = m ? new Date(m[1].trim()) : null;
    if (d && !isNaN(d) && d.getTime() - Date.now() > 90 * DAY) expires = d;
  }
  if (!expires) {
    expires = new Date(Date.now() + 364 * DAY);
    expires.setUTCHours(18, 29, 59, 0);
  }
  const lines = [
    `Contact: mailto:${SITE_CONFIG.contact.securityEmail}`,
    `Expires: ${expires.toISOString().replace('.000Z', 'Z')}`,
    'Preferred-Languages: en',
    `Canonical: ${SITE_ORIGIN}/.well-known/security.txt`
  ];
  if (fs.existsSync(path.join(__dirname, 'security-practices.html'))) {
    lines.push(`Policy: ${SITE_ORIGIN}/security-practices`);
  }
  fs.writeFileSync(file, lines.join('\n') + '\n', 'utf8');
  console.log(`security.txt written (expires ${expires.toISOString().slice(0, 10)})`);
}

async function build() {
  console.log('Starting build compilation...');

  // Content-hashed filenames: css/*, js/* are served with a 1-year immutable
  // Cache-Control (see _headers). Without a hash in the filename, an edit to
  // either file is invisible to any browser that already cached the old one
  // until that cache expires. Hashing makes an edit produce a new URL, so the
  // browser fetches it unconditionally instead of trusting a stale cache.
  let cssHashedName = null;
  let jsHashedName = null;

  try {
    const cssDir = path.join(__dirname, 'css');
    const cssPath = path.join(cssDir, 'style.css');
    siteFontMap = fingerprintSiteFonts();
    const cssContent = fs.readFileSync(cssPath, 'utf8').replace(/webfonts\/((?:inter|space-grotesk)-(?:latin|rupee))\.woff2/g, (whole, base) => {
      if (!siteFontMap[base]) throw new Error(`style.css references webfonts/${base}.woff2 but no such file exists`);
      return `webfonts/${siteFontMap[base]}`;
    });
    const minifiedCss = new CleanCSS().minify(cssContent).styles;
    cssHashedName = `style.${contentHash(minifiedCss)}.min.css`;

    // Remove filenames from earlier builds (both the old unhashed name and
    // any previous hash) so the css/ directory doesn't accumulate orphans.
    for (const f of fs.readdirSync(cssDir)) {
      if ((f === 'style.min.css' || /^style\.[0-9a-f]{10}\.min\.css$/.test(f)) && f !== cssHashedName) {
        fs.unlinkSync(path.join(cssDir, f));
      }
    }
    fs.writeFileSync(path.join(cssDir, cssHashedName), minifiedCss, 'utf8');
    console.log(`CSS Minification: Successful (${cssHashedName})`);
  } catch (err) {
    console.error('Error minifying CSS:', err);
  }

  try {
    const jsDir = path.join(__dirname, 'js');
    const jsPath = path.join(jsDir, 'script.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    const minifiedJs = (await minify(jsContent)).code;
    jsHashedName = `script.${contentHash(minifiedJs)}.min.js`;

    for (const f of fs.readdirSync(jsDir)) {
      if ((f === 'script.min.js' || /^script\.[0-9a-f]{10}\.min\.js$/.test(f)) && f !== jsHashedName) {
        fs.unlinkSync(path.join(jsDir, f));
      }
    }
    fs.writeFileSync(path.join(jsDir, jsHashedName), minifiedJs, 'utf8');
    console.log(`JS Minification: Successful (${jsHashedName})`);
  } catch (err) {
    console.error('Error minifying JS:', err);
  }

  // Page-specific scripts (contact.js, services.js, home.js, estimator.js ...)
  // get the same fingerprinting. They used to be served from fixed URLs under the
  // 1-year "immutable" cache in _headers, so a returning visitor would keep an
  // old copy after an edit. Sources stay at js/<name>.js; the build emits
  // js/<name>.<hash>.min.js and the pages are pointed at that.
  const pageScriptMap = {}; // 'contact' -> 'contact.<hash>.min.js'
  try {
    const jsDir = path.join(__dirname, 'js');
    for (const f of fs.readdirSync(jsDir)) {
      const m = f.match(/^([a-z0-9-]+)\.js$/);
      if (!m || m[1] === 'script') continue;
      const code = (await minify(fs.readFileSync(path.join(jsDir, f), 'utf8'))).code;
      const hashed = `${m[1]}.${contentHash(code)}.min.js`;
      pageScriptMap[m[1]] = hashed;
      fs.writeFileSync(path.join(jsDir, hashed), code, 'utf8');
    }
    for (const f of fs.readdirSync(jsDir)) {
      const m = f.match(/^([a-z0-9-]+)\.[0-9a-f]{10}\.min\.js$/);
      if (m && m[1] !== 'script' && pageScriptMap[m[1]] !== f) fs.unlinkSync(path.join(jsDir, f));
    }
    console.log(`Page scripts fingerprinted: ${Object.values(pageScriptMap).join(', ') || 'none'}`);
  } catch (err) {
    console.error('Error fingerprinting page scripts:', err);
  }

  // Font Awesome gets the same treatment. Its CSS and webfonts used to be
  // served from fixed URLs under a 1-year "immutable" Cache-Control, so a
  // changed file was invisible to every cache that already held the old bytes:
  // after the font subset shipped, Cloudflare's edge kept handing browsers the
  // old 150KB/108KB fonts (and the old CSS) for a CORS font request, while a
  // plain request got the new ones. Sources stay hand-maintained at
  // css/fontawesome.min.css and css/webfonts/fa-*.woff2; the build emits
  // fingerprinted copies and the pages point at those.
  let faCssHashedName = null;
  try {
    const cssDir = path.join(__dirname, 'css');
    const fontDir = path.join(cssDir, 'webfonts');
    const fontMap = {}; // 'fa-solid-900' -> 'fa-solid-900.<hash>.woff2'
    for (const f of fs.readdirSync(fontDir)) {
      const m = f.match(/^(fa-[a-z]+-\d+)\.woff2$/);
      if (!m) continue;
      const bytes = fs.readFileSync(path.join(fontDir, f));
      fontMap[m[1]] = `${m[1]}.${contentHash(bytes)}.woff2`;
    }
    const keepFonts = new Set(Object.values(fontMap));
    for (const f of fs.readdirSync(fontDir)) {
      if (/^fa-[a-z]+-\d+\.[0-9a-f]{10}\.woff2$/.test(f) && !keepFonts.has(f)) fs.unlinkSync(path.join(fontDir, f));
    }
    for (const [base, hashed] of Object.entries(fontMap)) {
      fs.copyFileSync(path.join(fontDir, `${base}.woff2`), path.join(fontDir, hashed));
    }

    const faSrc = fs.readFileSync(path.join(cssDir, 'fontawesome.min.css'), 'utf8');
    const faOut = faSrc.replace(/webfonts\/(fa-[a-z]+-\d+)\.woff2/g, (whole, base) => {
      if (!fontMap[base]) throw new Error(`fontawesome.min.css references webfonts/${base}.woff2 but no such file exists`);
      return `webfonts/${fontMap[base]}`;
    });
    faCssHashedName = `fontawesome.${contentHash(faOut)}.min.css`;
    for (const f of fs.readdirSync(cssDir)) {
      if (/^fontawesome\.[0-9a-f]{10}\.min\.css$/.test(f) && f !== faCssHashedName) fs.unlinkSync(path.join(cssDir, f));
    }
    fs.writeFileSync(path.join(cssDir, faCssHashedName), faOut, 'utf8');
    console.log(`Font Awesome fingerprinting: Successful (${faCssHashedName}, ${Object.keys(fontMap).length} fonts)`);
  } catch (err) {
    console.error('Error fingerprinting Font Awesome:', err);
  }

  const navbarTemplatePath = path.join(__dirname, 'templates', 'navbar.html');
  const footerTemplatePath = path.join(__dirname, 'templates', 'footer.html');
  const navbarTemplate = renderTemplate(fs.readFileSync(navbarTemplatePath, 'utf8'));
  const footerTemplate = renderTemplate(fs.readFileSync(footerTemplatePath, 'utf8'))
    .replace('{{YEAR}}', String(new Date().getFullYear()));

  console.log(`Build mode: ${PREVIEW ? 'PREVIEW (placeholders shown as [ADD ...])' : 'PRODUCTION (placeholders hidden, build fails if any remain)'}`);
  const leaks = [];
  const claimHits = [];

  const files = fs.readdirSync(__dirname);
  for (const file of files) {
    if (file.endsWith('.html') && file !== 'google662243390838af12.html') {
      const filePath = path.join(__dirname, file);
      let content = fs.readFileSync(filePath, 'utf8');

      if (content.includes('<!-- NAV_START -->') && content.includes('<!-- NAV_END -->')) {
        let dynamicNavbar = navbarTemplate;
        const currentHref = routeMap[file];

        // Mark the current page's nav link active.
        // Targets the <a> itself rather than the surrounding <li>, so it works
        // whether or not the item is a mega-menu parent, and is independent of
        // line endings (the templates are CRLF).
        if (currentHref) {
          dynamicNavbar = setActiveLink(dynamicNavbar, currentHref);
        } else if (file.startsWith('blog-')) {
          // The Resources parent (href "blog") comes before its mega-menu
          // children, so this marks the parent, not the "Blog" child item.
          dynamicNavbar = setActiveLink(dynamicNavbar, 'blog');
        }

        content = content.replace(
          /<!-- NAV_START -->[\s\S]*?<!-- NAV_END -->/,
          `<!-- NAV_START -->\n${dynamicNavbar}\n<!-- NAV_END -->`
        );
      }

      if (content.includes('<!-- FOOTER_START -->') && content.includes('<!-- FOOTER_END -->')) {
        content = content.replace(
          /<!-- FOOTER_START -->[\s\S]*?<!-- FOOTER_END -->/,
          `<!-- FOOTER_START -->\n${footerTemplate}\n<!-- FOOTER_END -->`
        );
      }

      content = renderBlocks(content, file);
      content = syncFaqSchema(content);
      content = ensureCoreSeoMeta(content);
      content = ensureHreflang(content);
      content = ensureManifest(content);
      content = ensureGtmSnippets(content);
      content = ensureEntityGraph(content);
      content = linkBlogEntityReferences(content);
      content = content.replace(/<script\s+src="([^"]+)"(?![\s>]*defer)/gi, '<script src="$1" defer');

      // Matches the unhashed name (first-ever build), any previously-hashed
      // name (a later build), or the still-unminified source name (so the
      // very first build on a fresh checkout also works) — always rewriting
      // to the current build's hashed filename.
      if (cssHashedName) {
        content = content.replace(/href="css\/style(?:\.[0-9a-f]{10})?\.min\.css"/, `href="css/${cssHashedName}"`);
        content = content.replace('href="css/style.css"', `href="css/${cssHashedName}"`);
      }
      if (jsHashedName) {
        content = content.replace(/src="js\/script(?:\.[0-9a-f]{10})?\.min\.js"/, `src="js/${jsHashedName}"`);
      }
      if (faCssHashedName) {
        content = content.replace(/href="css\/fontawesome(?:\.[0-9a-f]{10})?\.min\.css"/g, `href="css/${faCssHashedName}"`);
      }
      content = ensureHeadPerf(content);
      for (const [name, hashed] of Object.entries(pageScriptMap)) {
        content = content.replace(new RegExp(`src="js/${name}(?:\\.[0-9a-f]{10}\\.min)?\\.js"`, 'g'), `src="js/${hashed}"`);
      }

      // Preview-only ribbon. Always stripped first so a production build leaves
      // no trace of it.
      content = content.replace(/[ \t]*<!-- PREVIEW_RIBBON -->[\s\S]*?<!-- \/PREVIEW_RIBBON -->[ \t]*\r?\n?/g, '');
      if (PREVIEW) {
        content = content.replace('</body>', '<!-- PREVIEW_RIBBON --><aside class="preview-ribbon" aria-label="Preview build notice">Preview build &middot; shows [ADD &hellip;] placeholders &middot; not for production</aside><!-- /PREVIEW_RIBBON -->\n</body>');
      }

      if (!PREVIEW && /todo-marker|\[ADD [A-Z]/.test(content)) leaks.push(file);

      // Claims lint (warnings only): wording that must not come back.
      const visibleText = content
        .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
        .replace(/<[^>]+>/g, ' ');
      for (const [label, re] of CLAIM_PATTERNS) {
        const n = (visibleText.match(re) || []).length;
        if (n) claimHits.push(`${file}: ${n} x ${label}`);
      }

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Compiled: ${file}`);
    }
  }

  if (leaks.length) {
    console.error(`\nBUILD FAILED: placeholder markers are still present in a PRODUCTION build: ${leaks.join(', ')}`);
    console.error('Fill the values in site-config.json, or build with --preview.');
    process.exitCode = 1;
  }
  if (claimHits.length) {
    console.warn(`\nClaims lint (${claimHits.length} hits) — wording the site should not use:`);
    claimHits.forEach(h => console.warn('  ' + h));
  }

  writeSecurityTxt();

  // Keep the service worker's precache list and cache name in sync with the
  // hashed filenames above. Its own CACHE_NAME is derived from the same
  // content, so it changes automatically whenever CSS or JS actually changes
  // — no more remembering to bump a version string by hand, and the
  // `activate` handler's cache cleanup then evicts everything from the
  // previous build, hashed assets included.
  if (cssHashedName || jsHashedName) {
    try {
      const swPath = path.join(__dirname, 'sw.js');
      let sw = fs.readFileSync(swPath, 'utf8');
      if (cssHashedName) {
        sw = sw.replace(/\/css\/style(?:\.[0-9a-f]{10})?\.min\.css/, `/css/${cssHashedName}`);
      }
      if (jsHashedName) {
        sw = sw.replace(/\/js\/script(?:\.[0-9a-f]{10})?\.min\.js/, `/js/${jsHashedName}`);
      }
      const swCacheHash = contentHash((cssHashedName || '') + (jsHashedName || ''));
      sw = sw.replace(/const CACHE_NAME = '[^']*';/, `const CACHE_NAME = 'jwithkp-${swCacheHash}';`);
      fs.writeFileSync(swPath, sw, 'utf8');
      console.log(`Updated sw.js precache list and CACHE_NAME (jwithkp-${swCacheHash})`);
    } catch (err) {
      console.error('Error updating sw.js:', err);
    }
  }

  // Derive each <lastmod> from the matching file's real mtime, so the sitemap
  // reflects actual freshness per page instead of stamping every URL with today.
  const sitemapPath = path.join(__dirname, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const todayISO = new Date().toISOString().slice(0, 10);
    let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    let resolved = 0;

    // Consumes every consecutive <lastmod> after a <loc> and writes back exactly
    // one, so a duplicate introduced by a merge can't survive a build (the
    // sitemap protocol allows one <lastmod> per <url>).
    sitemapContent = sitemapContent.replace(
      /<loc>([^<]+)<\/loc>(\s*)(?:<lastmod>[^<]*<\/lastmod>(\s*))+/g,
      (whole, loc, gap, trail) => {
        const slug = loc.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '');
        const candidate = path.join(__dirname, (slug === '' ? 'index' : slug) + '.html');
        let stamp = todayISO;
        if (fs.existsSync(candidate)) {
          stamp = fs.statSync(candidate).mtime.toISOString().slice(0, 10);
          resolved++;
        } else {
          console.warn(`  sitemap: no file for <loc>${loc}</loc> — using today`);
        }
        return `<loc>${loc}</loc>${gap}<lastmod>${stamp}</lastmod>${trail}`;
      }
    );

    // Pages that exist on disk but are missing from the sitemap are added
    // (so a new page can't be forgotten); 404 and the Search Console
    // verification file are intentionally not listed.
    const listed = new Set([...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
    const missing = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.html') && f !== '404.html' && !f.startsWith('google'))
      .map(f => ({ f, loc: f === 'index.html' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${f.replace(/\.html$/, '')}` }))
      .filter(p => !listed.has(p.loc));
    for (const p of missing) {
      const stamp = fs.statSync(path.join(__dirname, p.f)).mtime.toISOString().slice(0, 10);
      const entry = `  <url>\n    <loc>${p.loc}</loc>\n    <lastmod>${stamp}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      sitemapContent = sitemapContent.replace('</urlset>', entry + '</urlset>');
      console.log(`  sitemap: added ${p.loc}`);
    }

    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
    console.log(`Updated sitemap.xml lastmod (${resolved} URLs from file mtime, ${missing.length} added)`);
  }

  console.log('Build completed successfully.');
}

build();
