const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CleanCSS = require('clean-css');
const { minify } = require('terser');

// Short, stable content hash used for cache-busting filenames. Deterministic
// per build (same source content -> same hash), so an unchanged file gets a
// stable URL and an edited one gets a new one automatically.
function contentHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
}

const GTM_HEAD_SNIPPET = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M98KB4X7');</script>
<!-- End Google Tag Manager -->`;

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

const routeMap = {
  'index.html': 'https://www.jwithkp.com/',
  'about.html': 'about',
  'industries.html': 'industries',
  'technology-stack.html': 'technology-stack',
  'services.html': 'services',
  'roi-calculator.html': 'roi-calculator',
  'blog.html': 'blog',
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
function ensureEntityGraph(content) {
  if (content.includes('/#organization"')) return content; // already injected
  const canonicalMatch = content.match(/<link rel="canonical" href="([^"]+)"/i);
  const pageUrl = canonicalMatch ? canonicalMatch[1] : 'https://www.jwithkp.com/';
  const graph = `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.jwithkp.com/#organization",
        "name": "JwithKP",
        "url": "https://www.jwithkp.com/",
        "logo": { "@type": "ImageObject", "url": "https://www.jwithkp.com/Logo.webp" },
        "sameAs": [
          "https://www.linkedin.com/in/jwithkp-it-consulting-2b2460270/",
          "https://twitter.com/jwithkp"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+917982912207",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["en", "hi"]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://www.jwithkp.com/#website",
        "url": "https://www.jwithkp.com/",
        "name": "JwithKP",
        "publisher": { "@id": "https://www.jwithkp.com/#organization" }
      },
      {
        "@type": "WebPage",
        "@id": "${pageUrl}#webpage",
        "url": "${pageUrl}",
        "isPartOf": { "@id": "https://www.jwithkp.com/#website" },
        "about": { "@id": "https://www.jwithkp.com/#organization" }
      }
    ]
  }
  </script>`;
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

  return content;
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
    const cssContent = fs.readFileSync(cssPath, 'utf8');
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

  const navbarTemplatePath = path.join(__dirname, 'templates', 'navbar.html');
  const footerTemplatePath = path.join(__dirname, 'templates', 'footer.html');
  const navbarTemplate = fs.readFileSync(navbarTemplatePath, 'utf8');
  const footerTemplate = fs.readFileSync(footerTemplatePath, 'utf8')
    .replace('{{YEAR}}', String(new Date().getFullYear()));

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
          dynamicNavbar = setActiveLink(dynamicNavbar, 'blog');
        } else if (file === 'case-studies.html' || file === 'guides.html') {
          // The Resources parent links to case-studies and appears before its
          // mega-menu children, so this marks the parent, not the child item.
          dynamicNavbar = setActiveLink(dynamicNavbar, 'case-studies');
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

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Compiled: ${file}`);
    }
  }

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

    sitemapContent = sitemapContent.replace(
      /<loc>([^<]+)<\/loc>(\s*)<lastmod>[^<]+<\/lastmod>/g,
      (whole, loc, gap) => {
        const slug = loc.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '');
        const candidate = path.join(__dirname, (slug === '' ? 'index' : slug) + '.html');
        let stamp = todayISO;
        if (fs.existsSync(candidate)) {
          stamp = fs.statSync(candidate).mtime.toISOString().slice(0, 10);
          resolved++;
        } else {
          console.warn(`  sitemap: no file for <loc>${loc}</loc> — using today`);
        }
        return `<loc>${loc}</loc>${gap}<lastmod>${stamp}</lastmod>`;
      }
    );

    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
    console.log(`Updated sitemap.xml lastmod (${resolved} URLs from file mtime)`);
  }

  console.log('Build completed successfully.');
}

build();
