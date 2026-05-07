// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Check Shield Wordmark Logo
// Direction A: shield-check icon replacing the dot in ".id"
// ══════════════════════════════════════════════════════════════════════════════

import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

interface LogoProps {
  size?: LogoSize
  showWordmark?: boolean
  className?: string
}

const SIZE_CONFIG = {
  sm: { icon: 20, text: 'text-xs', gap: 'gap-1', shieldW: 20, shieldH: 20 },
  md: { icon: 24, text: 'text-sm', gap: 'gap-1.5', shieldW: 24, shieldH: 24 },
  lg: { icon: 32, text: 'text-base', gap: 'gap-2', shieldW: 32, shieldH: 32 },
  xl: { icon: 40, text: 'text-lg', gap: 'gap-2.5', shieldW: 40, shieldH: 40 },
} as const

export function Logo({ size = 'lg', showWordmark = true, className }: LogoProps) {
  const config = SIZE_CONFIG[size]

  return (
    <div className={cn('flex items-center', config.gap, className)}>
      {/* Shield-check icon — primary fill with white checkmark */}
      <svg
        width={config.shieldW}
        height={config.shieldH}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        {/* Shield body */}
        <path
          d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5L12 2z"
          fill="var(--primary)"
        />
        {/* Checkmark */}
        <path
          d="M9 12l2 2 4-4"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span className={cn('font-bold tracking-tight', config.text)}>
          <span style={{ color: 'var(--primary-700)' }}>cekwajar</span>
          <span style={{ color: 'var(--primary-500)' }}>.id</span>
        </span>
      )}
    </div>
  )
}
