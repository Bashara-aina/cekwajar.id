'use client'

// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — CurrencyInput Component
// Indonesian Rupiah input with Rp prefix, live formatting, blur-to-format
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | ''
  onValueChange?: (rawValue: number | '') => void
  placeholder?: string
  error?: boolean
}

function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function parseIDR(value: string): number | '' {
  const cleaned = value.replace(/[Rp\s.]/g, '').replace(/,/g, '')
  if (cleaned === '') return ''
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? '' : num
}

export function CurrencyInput({
  value,
  onValueChange,
  placeholder = '0',
  error = false,
  className,
  id,
  ...props
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback(() => setIsFocused(true), [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (raw === '') {
        onValueChange?.('')
        return
      }
      const parsed = parseIDR(raw)
      if (parsed !== '') {
        onValueChange?.(parsed)
      }
    },
    [onValueChange]
  )

  const displayValue = (() => {
    if (isFocused) {
      return value === '' ? '' : value.toString()
    }
    if (value === '' || value === 0) return ''
    return formatIDR(value)
  })()

  return (
    <div className="relative">
      <div
        className={cn(
          'relative flex items-center overflow-hidden rounded-lg border bg-inset transition-all duration-150',
          // Height: 44px mobile / 40px desktop
          'h-11 min-h-11 sm:h-10 sm:min-h-10',
          // Border colors by state
          error
            ? 'border-[var(--verdict-salah)] focus-within:shadow-[0_0_0_2px_var(--verdict-salah-bg)]'
            : 'border-default hover:border-[var(--gray-400)] focus-within:border-[var(--primary)] focus-within:shadow-[0_0_0_2px_var(--primary)]',
          className
        )}
      >
        {/* Rp prefix — static label, left-padded */}
        <span
          className={cn(
            'pointer-events-none shrink-0 pl-3 text-sm font-medium fg-subtle',
            isFocused && 'hidden'
          )}
          aria-hidden
        >
          Rp
        </span>

        <input
          type="text"
          inputMode="numeric"
          id={id}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'flex-1 bg-transparent py-2 pr-3 text-sm font-medium text-slate-900 outline-none',
            'placeholder:text-[var(--muted-foreground)] placeholder:font-normal',
            'font-variant-numeric: tabular-nums',
            // Hide Rp text when focused (user is editing raw number)
            isFocused && 'pl-0'
          )}
          {...props}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-[var(--verdict-salah)]" role="alert">
          Nilai tidak valid
        </p>
      )}
    </div>
  )
}
