import { Link } from 'react-router-dom'
import { site } from '@/content/site'

/** The JK mark. `onDark` picks the white-and-orange version for the navy header and footer. */
export function LogoMark({ onDark = true, className = 'h-10 w-auto' }: { onDark?: boolean; className?: string }) {
  return <img src={onDark ? '/images/jk-mark-on-dark.webp' : '/images/jk-mark.webp'} width={400} height={326} alt="" className={className} decoding="async" />
}

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label={`${site.name} home`}>
      <LogoMark onDark={light} />
      <span className="leading-none">
        <span className={`block text-lg font-bold ${light ? 'text-white' : 'text-navy'}`}>JwithKP</span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.28em] ${light ? 'text-cyan2' : 'text-brand'}`}>Technology</span>
      </span>
    </Link>
  )
}
