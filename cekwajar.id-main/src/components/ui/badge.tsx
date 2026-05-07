// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Badge Component (shadcn/ui style)
// ══════════════════════════════════════════════════════════════════════════════

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--primary)] text-white',
        secondary: 'border-transparent bg-[var(--gray-100)] text-[var(--gray-700)]',
        destructive: 'border-transparent bg-[var(--verdict-salah)] text-white',
        outline: 'text-slate-900 border-[var(--gray-300)]',
        success: 'border-transparent bg-[var(--success-light)] text-[var(--success)]',
        warning: 'border-transparent bg-[var(--warning-light)] text-[var(--warning)]',
        wajar: 'border-transparent bg-[var(--verdict-wajar-bg)] text-[var(--verdict-wajar)]',
        aneh: 'border-transparent bg-[var(--verdict-aneh-bg)] text-[var(--verdict-aneh)]',
        salah: 'border-transparent bg-[var(--verdict-salah-bg)] text-[var(--verdict-salah)]',
        info: 'border-transparent bg-[var(--info-bg)] text-[var(--info)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
