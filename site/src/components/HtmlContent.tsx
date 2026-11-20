import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

/** Renders converted page HTML. Internal links navigate client-side; everything else behaves normally. */
export function HtmlContent({ html, className }: { html: string; className?: string }) {
  const navigate = useNavigate()
  function onClick(e: MouseEvent<HTMLDivElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as HTMLElement).closest('a')
    const href = a?.getAttribute('href')
    if (!a || !href || a.target === '_blank' || !href.startsWith('/') || href.startsWith('//')) return
    e.preventDefault()
    navigate(href)
  }
  return <div className={cn('legacy', className)} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
}
