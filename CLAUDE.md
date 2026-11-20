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
