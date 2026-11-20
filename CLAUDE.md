# JwithKP Technology website (jwithkp.com)

Static HTML site, built in place by `build.js`, deployed by Cloudflare Pages from `main`.

## Workflow
- Setup once: `npm ci`. After ANY edit run `node build.js` (production mode; it fails on `[ADD ...]` placeholders). `--preview` shows them.
- `build.js` rewrites the HTML files themselves: nav and footer come from `templates/`, blocks from `templates/blocks/`, JSON-LD entity graph, hreflang, FAQ schema, hashed CSS/JS names and the sitemap dates are all generated. Edit the sources, never the generated parts.
- Develop on the assigned branch. Push to `main` (= deploys) only when asked.
- Be economical: no screenshots or browser checks unless asked, read only the lines needed, grep before reading.

## Structure
- Pages: root `*.html`, plus `services/*.html` and `solutions/*.html`. Page links are written relative; the build makes nested pages root-relative.
- URLs are extensionless. Renamed pages: `/insights`, `/technologies`, `/projects` (301s from `/blog`, `/technology-stack`, `/case-studies` in `_redirects`). Blog posts stay `blog-*.html`.
- Adding a page: copy an existing one, set title, description, canonical, add to `sitemap.xml` and `llms.txt`, link it from nav/footer if needed. Title at most 60 chars, description 120-160.
- Business facts live in `site-config.json` (empty values are hidden). Do not hard-code phone, email, address or GSTIN.

## Do not edit by hand
- `css/style.*.min.css`, `js/*.min.js`, `css/fontawesome.*.min.css`, hashed fonts. Edit `css/style.css`, `js/<name>.js`, `css/fontawesome.min.css` instead.
- Images are cached immutably: add a new filename, never replace one in place.

## Fonts and icons
- Inter and Space Grotesk are self-hosted subsets; Font Awesome is a trimmed subset. Use only icons already in `css/fontawesome.min.css` (check before using a new `fa-*` class). Use `fa-arrow-right`, not a text arrow.
- Headings use the full stack: `'Space Grotesk', 'Space Grotesk Fallback', 'Inter', 'Inter Fallback', sans-serif`.

## Content rules (honesty)
- No fake client logos, testimonials, certifications, project results, prices or numbers.
- No absolute guarantees; no "24x7 SOC"; support wording is "first response within 24 business hours".
- Projects page scenarios are labelled illustrative. The build prints a claims lint; fix any hit.

## Sitemap
- `lastmod` comes from the Article `dateModified`, then git history, then the committed value. After a real content change, bump `dateModified` (posts) or the sitemap date by hand.

## New site (rebuild in progress, `site/`)
- React + Vite + TypeScript + Tailwind, prerendered to static HTML at build. The live site is still the root static files until cutover; do not push `site/` to `main` before that (Pages would publish the source folder).
- `cd site && npm ci && npm run build` -> `site/dist`. Content lives in `site/src/content/*.ts`, pages in `site/src/pages`, routes and SEO meta in `site/src/routes.tsx`. Icons: add the name to `site/src/components/Icon.tsx`.
- Keep every existing URL (`site/dist/sitemap.xml` must list the same 31 URLs as the live sitemap). Phases: 1 shell + home + services (done), 2 remaining pages and tools (done), 3 Worker/D1 enquiries and admin (code done, needs the Cloudflare setup in BACKEND.md), 4 cutover.
- Blog posts, projects, technologies, industries, security and legal pages were converted from the old HTML into `site/src/content/generated/<slug>.json` (body HTML) and `index.json` (titles, descriptions, dates, FAQ). Those JSON files are now the source: edit them directly. Bodies load on demand (`src/lib/content.ts`) and are preloaded for prerender and hydration.
- Backend (Phase 3, done): Cloudflare Pages Functions in `site/functions/` (enquiries API, Turnstile, Resend email, D1, admin dashboard at `/admin`). Setup steps are in `site/BACKEND.md`; local test with `wrangler pages dev dist`. Typecheck covers both (`npm run typecheck`).
- The estimator pricing engine (`src/lib/estimatorEngine.ts`) is the old `js/estimator.js` unchanged; refresh prices there.
