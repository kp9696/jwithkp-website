import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter/wght.css'
import './index.css'
import App from './App'
import { routes } from './routes'
import { preloadHtml } from './lib/content'

const root = document.getElementById('root')!
// A prerendered page needs its body loaded before hydration so the first client render matches the server markup.
await Promise.all((routes.find((r) => r.meta.path === window.location.pathname)?.content ?? []).map(preloadHtml))
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
// Prerendered pages have markup inside #root and are hydrated; the dev server starts empty.
if (root.innerHTML.replace('<!--app-html-->', '').trim()) hydrateRoot(root, app)
else createRoot(root).render(app)
