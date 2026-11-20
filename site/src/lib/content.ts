import { useEffect, useState } from 'react'

// Long-form page bodies (blog posts, legal pages ...) are loaded on demand so the main bundle stays small.
// At build time and before hydration they are preloaded, so the prerendered markup and the first client render match.
const loaders = import.meta.glob('../content/generated/*.json') as Record<string, () => Promise<{ default: { html: string } }>>
const cache = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()

export function preloadHtml(slug: string): Promise<string> {
  const hit = cache.get(slug)
  if (hit !== undefined) return Promise.resolve(hit)
  let p = inflight.get(slug)
  if (!p) {
    const load = loaders[`../content/generated/${slug}.json`]
    if (!load) return Promise.reject(new Error(`No content for ${slug}`))
    p = load().then((m) => {
      cache.set(slug, m.default.html)
      return m.default.html
    })
    inflight.set(slug, p)
  }
  return p
}

/** Returns the body HTML, or null while it loads (client-side navigation only). */
export function useHtml(slug: string): string | null {
  const [html, setHtml] = useState<string | null>(cache.get(slug) ?? null)
  useEffect(() => {
    if (cache.has(slug)) setHtml(cache.get(slug)!)
    else preloadHtml(slug).then(setHtml)
  }, [slug])
  return cache.get(slug) ?? html
}
