import { useEffect, useRef } from 'react'

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; remove: (id: string) => void } }
}

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/** Cloudflare Turnstile spam check. Renders nothing when no site key is configured (VITE_TURNSTILE_SITE_KEY). */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!siteKey || !box.current) return
    let id: string | undefined
    const mount = () => {
      if (!box.current || !window.turnstile || id) return
      id = window.turnstile.render(box.current, { sitekey: siteKey, callback: onToken, 'expired-callback': () => onToken(''), 'error-callback': () => onToken('') })
    }
    if (window.turnstile) mount()
    else {
      let s = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`)
      if (!s) {
        s = document.createElement('script')
        s.src = SRC
        s.async = true
        document.head.appendChild(s)
      }
      s.addEventListener('load', mount)
    }
    return () => { if (id) window.turnstile?.remove(id) }
  }, [siteKey, onToken])

  return siteKey ? <div ref={box} className="min-h-[65px]" /> : null
}
