// Renders every route to static HTML (so search engines and no-JS visitors get real content),
// then writes sitemap.xml. Run by `npm run build` after the client and server bundles exist.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const { render, routes, notFound, headTags } = await import(pathToFileURL(path.join(root, 'dist-server', 'entry-server.js')).href)
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
if (!template.includes('<!--app-html-->') || !template.includes('<!--head-tags-->')) throw new Error('index.html template lost its placeholders')

const fileFor = (p) => (p === '/' ? 'index.html' : `${p.replace(/^\//, '')}.html`)
let count = 0
for (const r of [...routes, notFound]) {
  const appHtml = await render(r.meta.path)
  const html = template
    .replace('<!--head-tags-->', () => headTags(r.meta))
    .replace('<!--app-html-->', () => appHtml)
  const out = path.join(dist, fileFor(r.meta.path))
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, html)
  count++
}

const origin = 'https://www.jwithkp.com'
const urls = routes
  .filter((r) => !r.meta.noindex)
  .map((r) => `  <url>\n    <loc>${origin}${r.meta.path === '/' ? '/' : r.meta.path}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n  </url>`)
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)

// The server bundle is a build artefact, not part of the deployed site.
fs.rmSync(path.join(root, 'dist-server'), { recursive: true, force: true })
console.log(`Prerendered ${count} pages and sitemap.xml (${urls.length} URLs)`)
