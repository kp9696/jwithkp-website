import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { routes, notFound, admin } from '@/routes'
import { fullTitle } from '@/lib/seo'

/** Keeps the tab title and description right after client-side navigation (the first load is prerendered). */
function RouteEffects() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const r = routes.find((x) => x.meta.path === pathname) ?? (pathname === '/admin' ? admin : notFound)
    document.title = fullTitle(r.meta.title)
    document.querySelector('meta[name="description"]')?.setAttribute('content', r.meta.description)
    const canon = document.querySelector('link[rel="canonical"]')
    if (canon) canon.setAttribute('href', `https://www.jwithkp.com${pathname === '/' ? '/' : pathname}`)
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        {routes.map((r) => (
          <Route key={r.meta.path} path={r.meta.path} element={r.element} />
        ))}
        <Route path="/admin" element={admin.element} />
        <Route path="*" element={notFound.element} />
      </Routes>
    </>
  )
}
