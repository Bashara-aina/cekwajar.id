'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const labels: Record<Theme, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System preference',
}

const nextTheme: Record<Theme, 'light' | 'dark' | 'system'> = {
  light: 'light',
  dark: 'dark',
  system: 'system',
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={className} aria-hidden="true" />
    )
  }

  const current = (theme as Theme) ?? 'system'

  const cycle: Record<Theme, Theme> = {
    light: 'dark',
    dark: 'system',
    system: 'light',
  }

  function handleClick() {
    setTheme(nextTheme[cycle[current]])
  }

  function Icon() {
    switch (current) {
      case 'light':
        return <Sun size={16} aria-hidden="true" />
      case 'dark':
        return <Moon size={16} aria-hidden="true" />
      case 'system':
        return <Monitor size={16} aria-hidden="true" />
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Current: ${labels[current]}. Click to change.`}
      className={className}
    >
      <Icon />
    </button>
  )
}
