# JwithKP Technology website (jwithkp.com)

React + Vite + TypeScript + Tailwind site in `site/`, prerendered to static HTML at build, with Cloudflare Pages Functions for enquiries and the staff dashboard. Cloudflare Pages builds `site/` from `main` (root directory `site`, build `npm run build`, output `dist`).

## Workflow
- Setup once: `cd site && npm ci`. Check with `npm run typecheck` (covers the site and `functions/`) and `npm run build`. Local API test: `npm run build`, then `npx wrangler pages dev dist` (see `site/BACKEND.md`).
- Develop on the assigned branch. `main` deploys to production: push or merge to `main` only when asked (the owner merges pull requests).
- Be economical: no screenshots or browser checks unless asked, read only the lines needed, grep before reading.

## Structure
- Pages: `site/src/pages`. Routes and SEO metadata (title, description, schema) per URL: `site/src/routes.tsx`. Shared UI: `src/components` (Shadcn-style primitives in `ui/`). Icons: add the Lucide name to `src/components/Icon.tsx`.
- Content: `src/content/*.ts` (site facts in `site.ts`, service and solution pages in `servicePages.ts`, home sections in `home.ts`, nav in `nav.ts`). Do not hard-code phone, email, address or GSTIN elsewhere; empty `address`/`gstin` are hidden.
- Long-form pages (blog posts, projects, technologies, industries, security, privacy, terms): body HTML in `src/content/generated/<slug>.json`, metadata in `generated/index.json`. Edit those JSON files directly. Bodies load on demand (`src/lib/content.ts`).
- Adding a page: add a route in `routes.tsx` (and `content` slug if it has a generated body); the sitemap and prerender pick it up. Also add it to `public/llms.txt` and nav/footer if needed. Title at most 60 chars, description 120-160.
- Keep every existing URL (extensionless). Renames are 301s in `public/_redirects`: `/blog`, `/technology-stack`, `/case-studies`. Blog posts stay `/blog-*`. `public/_headers` holds security headers and cache rules.
- Backend: `site/functions/` (enquiries API, Turnstile, Resend email, D1, admin dashboard at `/admin`). Database migration in `site/migrations/`. Setup and secrets: `site/BACKEND.md`.
- Tools: `src/pages/Estimator.tsx` uses `src/lib/estimatorEngine.ts` (vendor prices and exchange rate live there; refresh them), `Roi.tsx`, `Checklist.tsx`.

## Assets
- Images in `public/images` are cached for a year: add a new filename, never replace one in place. Logo files: `jk-mark.webp` (light backgrounds), `jk-mark-on-dark.webp` (navy header/footer).
- Font: Inter (self-hosted via `@fontsource-variable/inter`). Icons: Lucide.

## Content rules (honesty)
- No fake client logos, testimonials, certifications, project results, prices or numbers.
- No absolute guarantees; no "24x7 SOC"; support wording is "first response within 24 business hours".
- Projects page scenarios are labelled illustrative.

## SEO and sitemap
- `sitemap.xml` is generated at build from `routes.tsx`; set `lastmod` per route (blog posts use `dateModified`). `/admin` and `/404` are noindex and excluded.
- `public/.well-known/security.txt` has an Expires date: renew it yearly.
