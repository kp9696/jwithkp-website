import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import { preloadHtml } from './lib/content'
import { routes } from './routes'

export async function render(url: string) {
  // Bodies are loaded on demand in the browser; here they must be ready before the synchronous render.
  await Promise.all((routes.find((r) => r.meta.path === url)?.content ?? []).map(preloadHtml))
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
}

export { routes, notFound, admin } from './routes'
export { headTags } from './lib/seo'
