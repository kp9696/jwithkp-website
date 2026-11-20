import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

// Google Tag Manager behind Consent Mode v2, carried over from the previous site: analytics storage stays denied
// until the visitor accepts; ad storage is always denied (this site runs analytics only). GTM itself loads late,
// on the first interaction or a few seconds after load, so it never competes with the page.
const GTM_ID = 'GTM-M98KB4X7'
const KEY = 'jwkp-cookie-consent'
export const COOKIE_SETTINGS_EVENT = 'jwkp:cookie-settings'

type DL = unknown[]
declare global {
  interface Window { dataLayer?: DL; gtag?: (...a: unknown[]) => void }
}

const store = {
  get: () => { try { return localStorage.getItem(KEY) } catch { return null } },
  set: (v: string) => { try { localStorage.setItem(KEY, v) } catch { /* storage blocked: choice lasts for this page view */ } },
}

function pushConsent(granted: boolean) {
  window.gtag?.('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
}

function initConsentDefaults() {
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { (window.dataLayer as DL).push(arguments) }
  window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 2000 })
}

function loadGtmLater() {
  let started = false
  const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const
  const go = () => {
    if (started) return
    started = true
    events.forEach((e) => window.removeEventListener(e, go, true))
    ;(window.dataLayer as DL).push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
    document.head.appendChild(s)
  }
  events.forEach((e) => window.addEventListener(e, go, { capture: true, passive: true }))
  window.addEventListener('load', () => setTimeout(go, 6000))
  if (document.readyState === 'complete') setTimeout(go, 6000)
}

export function Analytics() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    initConsentDefaults()
    const saved = store.get()
    if (saved === 'granted') pushConsent(true)
    else if (saved === 'denied') pushConsent(false)
    else setTimeout(() => setOpen(true), 1200)
    loadGtmLater()
    const reopen = () => setOpen(true)
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen)
  }, [])

  if (!open) return null
  const choose = (granted: boolean) => {
    store.set(granted ? 'granted' : 'denied')
    pushConsent(granted)
    setOpen(false)
  }
  return (
    <div role="dialog" aria-label="Cookie consent" aria-live="polite" className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/98 p-4 shadow-[0_-8px_30px_rgba(11,20,40,0.12)] backdrop-blur">
      <div className="container flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-700">
          We use analytics cookies to understand how visitors use our site and improve your experience. See our <Link to="/privacy-policy" className="font-semibold text-brand underline">Privacy Policy</Link> for details.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" onClick={() => choose(true)} autoFocus>Accept All</Button>
          <Button size="sm" variant="secondary" onClick={() => choose(false)}>Necessary Only</Button>
        </div>
      </div>
    </div>
  )
}
