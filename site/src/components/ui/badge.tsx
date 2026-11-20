import * as React from 'react'
import { cn } from '@/lib/utils'

export const Badge = ({ className, ...p }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-cyan2/30 bg-cyan2/10 px-3 py-1 text-xs font-semibold text-cyan2', className)} {...p} />
)
