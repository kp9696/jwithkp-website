import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { Button } from '@/components/ui/button'
import { ctaLink, mainNav } from '@/content/nav'
import { cn } from '@/lib/utils'

export function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn('rounded-md px-3 py-2 text-sm font-medium transition-colors', isActive ? 'text-cyan2' : 'text-slate-200 hover:text-white')

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/95 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-navy">
        Skip to main content
      </a>
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) =>
            item.children ? (
              <div key={item.label} className="group relative">
                <NavLink to={item.to} end={false} className={(s) => cn(linkClass(s), 'inline-flex items-center gap-1')}>
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden="true" />
                </NavLink>
                <div className="invisible absolute left-1/2 top-full z-50 w-[28rem] -translate-x-1/2 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="grid gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    {item.children.map((c) => (
                      <Link key={c.to} to={c.to} className="rounded-xl px-4 py-3 hover:bg-slate-50">
                        <span className="block text-sm font-semibold text-navy">{c.label}</span>
                        {c.description && <span className="mt-0.5 block text-xs text-slate-500">{c.description}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to={ctaLink}>
              Get a Free Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 bg-navy lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="container max-h-[calc(100vh-4rem)] overflow-y-auto py-4">
              {mainNav.map((item) => (
                <div key={item.label} className="border-b border-white/5 py-2">
                  <Link to={item.to} className="block py-2 text-base font-semibold text-white">
                    {item.label}
                  </Link>
                  {item.children && (
                    <ul className="mb-1 ml-3 border-l border-white/10 pl-3">
                      {item.children.map((c) => (
                        <li key={c.to}>
                          <Link to={c.to} className="block py-1.5 text-sm text-slate-300 hover:text-white">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <Button asChild className="mt-4 w-full" size="lg">
                <Link to={ctaLink}>
                  Get a Free Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
