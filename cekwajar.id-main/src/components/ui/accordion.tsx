// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Accordion Component (shadcn/ui style)
// ══════════════════════════════════════════════════════════════════════════════

'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCORDION_ANIMATION = `
  @keyframes accordion-open {
    from { height: 0; opacity: 0; }
    to { height: var(--radix-accordion-content-height); opacity: 1; }
  }
  @keyframes accordion-closed {
    from { height: var(--radix-accordion-content-height); opacity: 1; }
    to { height: 0; opacity: 0; }
  }
  [data-radix-accordion-trigger] .chevron {
    transition: transform 200ms;
  }
  [data-state=open] .chevron {
    transform: rotate(180deg);
  }
`

const ACCORDION_KEYFRAMES = 'accordion-open 0.2s ease-out'

function AccordionGlobalStyles() {
  React.useEffect(() => {
    const id = 'cekwajar-accordion-styles'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = ACCORDION_ANIMATION
    document.head.appendChild(style)
  }, [])
  return null
}

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <>
    <AccordionGlobalStyles />
    <AccordionPrimitive.Root ref={ref} className={cn('w-full', className)} {...props} />
  </>
))
Accordion.displayName = 'Accordion'

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-[var(--border)]', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-colors hover:text-[var(--primary)]',
        className
      )}
      data-radix-accordion-trigger=""
      {...props}
    >
      {children}
      <ChevronDown className="chevron h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm text-[var(--muted-foreground)]"
    style={{ animation: ACCORDION_KEYFRAMES }}
    data-radix-accordion-content=""
    {...props}
  >
    <div className={cn('pb-4 pt-2', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
