'use client'
import * as React from 'react'
import { Input } from './input'

interface IDRInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number
  onChange: (value: number) => void
}

export function IDRInput({ value, onChange, className, ...props }: IDRInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')

  React.useEffect(() => {
    if (value > 0) {
      setDisplayValue(value.toLocaleString('id-ID'))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    const num = parseInt(raw, 10) || 0
    setDisplayValue(num.toLocaleString('id-ID'))
    onChange(num)
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">IDR</span>
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={cn('pl-12 font-mono', className)}
        placeholder="0"
      />
    </div>
  )
}