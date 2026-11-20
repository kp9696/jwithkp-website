import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Accordion = AccordionPrimitive.Root

export const AccordionItem = ({ className, ...p }: React.ComponentProps<typeof AccordionPrimitive.Item>) => (
  <AccordionPrimitive.Item className={cn('rounded-xl border border-slate-200 bg-white', className)} {...p} />
)

export const AccordionTrigger = ({ className, children, ...p }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn('group flex flex-1 items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-navy', className)}
      {...p}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
)

export const AccordionContent = ({ className, children, ...p }: React.ComponentProps<typeof AccordionPrimitive.Content>) => (
  <AccordionPrimitive.Content className="overflow-hidden text-slate-600" {...p}>
    <div className={cn('px-5 pb-5 leading-relaxed', className)}>{children}</div>
  </AccordionPrimitive.Content>
)
