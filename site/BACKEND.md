# Backend setup (enquiries, email, spam protection, dashboard)

The backend is Cloudflare Pages Functions in `functions/` (they run on the Workers runtime, same domain, no CORS).
Enquiries are stored in Cloudflare D1. Do these steps once, in order. Everything is free-tier friendly.

## 1. Create the database
```bash
cd site
npx wrangler login
npx wrangler d1 create jwithkp
```
Copy the `database_id` it prints into `wrangler.toml` (`[[d1_databases]]`). Then create the tables:
```bash
npm run db:migrate
```

## 2. Turnstile (spam protection)
Cloudflare dashboard -> Turnstile -> Add widget for `www.jwithkp.com` (managed mode). You get a **site key** and a **secret key**.
- Site key: Pages project -> Settings -> Environment variables -> `VITE_TURNSTILE_SITE_KEY` (Production). It is read at build time, so redeploy after adding it.
- Secret key: `npx wrangler pages secret put TURNSTILE_SECRET --project-name jwithkp-site`

Until both are set the form still works; it just skips the Turnstile check (honeypot, speed check and rate limits stay on).

## 3. Email (Resend)
1. Create an account at resend.com, add the domain `jwithkp.com`, and add the DNS records it shows (SPF and DKIM). Wait for "Verified".
2. Create an API key, then: `npx wrangler pages secret put RESEND_API_KEY --project-name jwithkp-site`
3. Check `NOTIFY_EMAIL` (who receives new enquiries) and `FROM_EMAIL` in `wrangler.toml`. `FROM_EMAIL` must use the verified domain.

Without a key nothing is emailed, but enquiries are still saved and visible in the dashboard. A failed email never fails an enquiry.

## 4. IP hashing secret
`npx wrangler pages secret put IP_SALT --project-name jwithkp-site` with any long random string. Visitor IPs are stored only as salted hashes.

## 5. Create dashboard users
```bash
npm run create-admin -- you@jwithkp.com "Your Name" admin
```
It asks for a password (12+ characters), writes `.create-admin.sql`, and prints the command to run, which looks like
`npx wrangler d1 execute jwithkp --remote --file .create-admin.sql && rm .create-admin.sql`. Run it.
Roles: `admin` (everything, including CSV export) and `sales` (view enquiries, change status, add notes).
Run the script again with the same email to reset a password.

## 6. Cloudflare Pages project
Settings for the Git-connected project: **Root directory** `site`, **Build command** `npm run build`, **Build output directory** `dist`,
environment variable `NODE_VERSION` = `22`. The D1 binding (`DB`) and variables come from `wrangler.toml`.

## 7. Test after the first deploy
- Open `/contact`, send an enquiry: you get a reference number, and (with email set up) two emails.
- Open `/admin`, sign in, find the enquiry, change its status.
- `curl -i https://www.jwithkp.com/api/enquiry` should answer 405 (GET not allowed).

## Optional extra lock on the dashboard
Cloudflare Zero Trust -> Access -> Applications: protect `www.jwithkp.com/admin*` and `www.jwithkp.com/api/admin/*` with a one-time-PIN policy for your team emails. Free for up to 50 users, and adds a second sign-in in front of the dashboard's own.

## Local development
```bash
npm run build
npm run db:migrate:local
npm run create-admin -- test@example.com "Test" admin   # then run the printed command with --local instead of --remote
npx wrangler pages dev dist --port 8788
```

## Security notes
- Passwords: PBKDF2-SHA256, 100,000 iterations (the Workers maximum). Sessions: random 256-bit token in an HttpOnly, SameSite=Strict cookie (`__Host-` prefixed on HTTPS); only its SHA-256 hash is stored; 7 days.
- Admin writes need the `X-Requested-With: fetch` header and a same-origin request, on top of SameSite=Strict.
- Rate limits: 5 enquiries per hour per connection; 5 login attempts per 15 minutes per connection and email.
- CSV export neutralises spreadsheet formulas. Notes and messages are escaped in emails and rendered as text in the dashboard.

## Not included yet
Blog and project management from the dashboard. Posts and project pages are content files in `src/content/generated/` and are edited in the repository for now.
