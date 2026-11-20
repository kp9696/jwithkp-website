import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter/wght.css'
import './index.css'
import App from './App'

const root = document.getElementById('root')!
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
