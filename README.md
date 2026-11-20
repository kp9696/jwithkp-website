# jwithkp-website

Website for JwithKP Technology (jwithkp.com): React, Vite, TypeScript and Tailwind, prerendered to static HTML, with Cloudflare Pages Functions and D1 for enquiries and a staff dashboard.

All code lives in [`site/`](site/). See `CLAUDE.md` for how the project is organised, `site/BACKEND.md` for backend setup, and `site/CUTOVER.md` for the launch runbook.

```bash
cd site
npm ci
npm run build      # typecheck, build, prerender to site/dist
```
