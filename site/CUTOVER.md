# Cutover: switching jwithkp.com from the old static site to the new site

Status: the new site (`site/`) is built and tested. This is the order to go live safely. Nothing here changes your DNS or domain.

## What has been verified
- Same 31 URLs as the live sitemap; every page has an identical title, meta description and canonical URL.
- 301 redirects for `/blog`, `/technology-stack`, `/case-studies`; clean URLs; custom 404; security headers; cache rules (tested on the Cloudflare Pages runtime).
- 99 page loads (33 pages x desktop, tablet, phone): no console errors, no sideways scrolling, one H1 each.
- No broken internal links or images, no placeholder text, valid structured data.
- Cookie consent + Google Tag Manager (Consent Mode v2, analytics only) carried over; newsletter signup, WhatsApp button, mobile call bar carried over.
- Enquiry API + dashboard tested end to end (see BACKEND.md).

## Intentional differences from the old site
- New design and navigation (blueprint). No light/dark theme switch.
- Enquiries go to your database and dashboard (and email once set up) instead of FormSubmit; FormSubmit stays as an automatic fallback.
- Blog and project pages are still edited in the repository, not from the dashboard.

## Step 1: backend setup (any time before go-live)
Follow BACKEND.md steps 1 to 5 (D1 database, Turnstile, Resend, IP salt, first admin user).
If your domain already sends email (for example Google Workspace), **edit the existing SPF record rather than adding a second one** when you add Resend's records; two SPF records break email.

## Step 2: point the Pages project at `site/` (does not deploy anything)
Cloudflare dashboard -> Workers & Pages -> your project -> Settings -> Builds & deployments:
- Root directory: `site`
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables (Production and Preview): `NODE_VERSION` = `22`, `VITE_TURNSTILE_SITE_KEY` = your Turnstile site key

Saving these settings does not redeploy. Until `main` contains `site/`, a new build from `main` would simply fail, and **a failed build never replaces the live site**, so production stays on the last good deployment.

## Step 3: preview before going live
Pushing the branch `claude/funny-newton-unjgyg` (already done) makes Pages build a **preview deployment** with the new settings, at a `*.pages.dev` address shown on the Deployments tab. Preview addresses are not indexed by Google.
On the preview, check:
1. Home, a service page, an Insights post, the three tools, `/about`, `/contact`, `/admin` all load and look right on your phone.
2. Send a test enquiry on `/contact`: you see a reference number, receive the acknowledgement email, and it appears in `/admin`.
3. `/blog` redirects to `/insights`.
4. The cookie banner appears; Accept and Necessary Only both work.
If the preview build fails, open the build log and send it to me.

## Step 4: go live
Merge the branch into `main` (tell me and I will do it, or merge the pull request yourself). Pages builds and publishes. It takes a couple of minutes.

## Step 5: after go-live (first hour)
- Open the live site on a phone and a laptop; repeat the preview checks.
- Google Tag Manager preview / GA4 realtime: accept cookies, confirm a hit arrives.
- Search Console: the sitemap URL is unchanged (`/sitemap.xml`, same 31 URLs). Click "Resubmit"; use URL Inspection on the home page and one service page and "Request indexing".
- Returning visitors: the new `sw.js` clears the old offline cache and unregisters itself, so they may reload once.

## Rollback (takes under a minute)
Workers & Pages -> your project -> Deployments -> pick the last deployment from before the cutover -> "Rollback to this deployment". The old site is served again immediately. Then tell me and I will revert the merge in git.

## Step 6: retire the old files (after about a week of stable running)
The old static site is still in the repository root. Once you are happy, remove it in one commit; git history keeps everything:
```bash
git rm -r --quiet *.html css js images templates build.js site-config.json sitemap.xml robots.txt llms.txt manifest.json sw.js _headers _redirects Logo.png Logo.webp TODO.md .well-known package.json package-lock.json
git commit -m "Retire the old static site; the site now lives in site/"
```
(`site/public` already holds the copies of the images, robots.txt, llms.txt, manifest and other static files the new site needs.) Keep `CLAUDE.md`, `README.md`, `.gitignore`, `.claude/` and `site/`.

## Known small items to review after launch
- Several blog and technology images are the old, un-resized files; a per-post share image (1200x630) is still on the to-do list.
- `/google662243390838af12.html` is the Search Console verification file. Cloudflare Pages redirects `.html` to the extensionless form, as it did on the old site, so behaviour is unchanged; if verification ever lapses, use the DNS method instead.
- Add the real address and GSTIN to `src/content/site.ts` when you have them; the footer, About page and structured data pick them up.
