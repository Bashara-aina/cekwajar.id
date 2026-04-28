import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseIDR(value: string): number {
  if (!value) return 0
  const cleaned = value.replace(/[^\d]/g, '')
  return parseInt(cleaned, 10) || 0
}

export function formatIDR(amount: number): string {
  if (amount === 0) return 'IDR 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatIDRCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `IDR ${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `IDR ${(amount / 1_000).toFixed(0)}K`
  }
  return `IDR ${amount}`
}

export function getCurrentUserId(): string | null {
  return null
}
