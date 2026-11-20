import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Phone } from 'lucide-react'
import { site } from '@/content/site'

/** Floating WhatsApp button on every page, plus (on phones only) a sticky call bar once the visitor scrolls past the hero. */
export function Floaters() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 700)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <>
      <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className={`fixed right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-105 ${scrolled ? 'bottom-20 lg:bottom-6' : 'bottom-6'}`}>
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </a>
      <div role="region" aria-label="Quick contact" className={`fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white p-3 shadow-[0_-6px_20px_rgba(11,20,40,0.12)] transition-transform lg:hidden ${scrolled ? 'translate-y-0' : 'translate-y-full'}`} aria-hidden={!scrolled}>
        <a href={`tel:${site.phoneE164}`} tabIndex={scrolled ? 0 : -1} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 text-sm font-semibold text-navy"><Phone className="h-4 w-4" aria-hidden="true" /> Call Us</a>
        <Link to="/contact?intent=call#enquiry" tabIndex={scrolled ? 0 : -1} className="inline-flex h-11 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">Book a free call</Link>
      </div>
    </>
  )
}
