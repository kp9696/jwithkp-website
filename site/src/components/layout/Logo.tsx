import { Link } from 'react-router-dom'
import { site } from '@/content/site'

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="JK">
      <defs>
        <linearGradient id="jk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#jk-g)" />
      <text x="20" y="27" textAnchor="middle" fontFamily="Inter Variable, Inter, sans-serif" fontWeight="800" fontSize="19" fill="#0B1428">JK</text>
    </svg>
  )
}

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label={`${site.name} home`}>
      <LogoMark />
      <span className="leading-none">
        <span className={`block text-lg font-bold ${light ? 'text-white' : 'text-navy'}`}>JwithKP</span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.28em] ${light ? 'text-cyan2' : 'text-brand'}`}>Technology</span>
      </span>
    </Link>
  )
}
