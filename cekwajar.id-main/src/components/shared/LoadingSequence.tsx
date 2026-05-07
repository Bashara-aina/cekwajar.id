'use client'

// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — LoadingSequence Component
// Progressive loading UI for audit calculation steps
// Steps fade in sequentially with animated checkmarks
// Skeleton fallback for prefers-reduced-motion
// ══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const LOADING_STEPS = [
  { id: 1, label: 'Memproses slip gaji...', duration: 1000 },
  { id: 2, label: 'Menghitung PPh 21 berdasarkan PMK 168/2023...', duration: 1000 },
  { id: 3, label: 'Memeriksa BPJS Kesehatan...', duration: 1000 },
  { id: 4, label: 'Memeriksa BPJS Ketenagakerjaan...', duration: 1000 },
  { id: 5, label: 'Menyiapkan hasil audit...', duration: 500 },
] as const

interface StepState {
  id: number
  label: string
  isVisible: boolean
  isComplete: boolean
}

function buildInitialSteps(): StepState[] {
  return LOADING_STEPS.map((step) => ({
    id: step.id,
    label: step.label,
    isVisible: false,
    isComplete: false,
  }))
}

export interface LoadingSequenceProps {
  onComplete?: () => void
  className?: string
}

export function LoadingSequence({ onComplete, className }: LoadingSequenceProps) {
  const [steps, setSteps] = useState<StepState[]>(buildInitialSteps)
  const [isMotionSafe, setIsMotionSafe] = useState(true)

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsMotionSafe(!mq.matches)
  }, [])

  // Sequential step animation
  useEffect(() => {
    if (!isMotionSafe) {
      // Just show all visible immediately with no animation
      setSteps((prev) => prev.map((s) => ({ ...s, isVisible: true, isComplete: true })))
      onComplete?.()
      return
    }

    let currentIndex = 0
    let timeoutId: ReturnType<typeof setTimeout>

    const showNextStep = () => {
      if (currentIndex >= LOADING_STEPS.length) {
        onComplete?.()
        return
      }

      const stepDuration = LOADING_STEPS[currentIndex].duration

      setSteps((prev) => {
        const updated = [...prev]
        updated[currentIndex] = { ...updated[currentIndex], isVisible: true }
        return updated
      })

      timeoutId = setTimeout(() => {
        setSteps((prev) => {
          const updated = [...prev]
          updated[currentIndex] = { ...updated[currentIndex], isComplete: true }
          return updated
        })
        currentIndex++
        showNextStep()
      }, stepDuration)
    }

    // Start with first step after a short delay
    const startTimeout = setTimeout(showNextStep, 100)

    return () => {
      clearTimeout(startTimeout)
      clearTimeout(timeoutId)
    }
  }, [isMotionSafe, onComplete])

  // Skeleton fallback for reduced motion
  if (!isMotionSafe) {
    return (
      <div className={cn('w-full space-y-3', className)}>
        {LOADING_STEPS.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gray-200)]" />
            <Skeleton className="h-4 flex-1" shimmer />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('w-full space-y-1', className)} role="status" aria-label="Memproses audit">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            'flex items-center gap-3 overflow-hidden py-2 transition-all duration-300',
            step.isVisible ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
          )}
          style={{ transitionDelay: `${index * 50}ms` }}
        >
          {/* Animated checkmark circle */}
          <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
            {/* Background circle */}
            <div
              className={cn(
                'absolute inset-0 rounded-full bg-[var(--gray-200)] transition-all duration-300',
                step.isComplete && 'bg-[var(--verdict-wajar-bg)]'
              )}
            />
            {/* Check icon */}
            <Check
              className={cn(
                'relative z-10 h-3.5 w-3.5 transition-all duration-300',
                step.isComplete
                  ? 'text-[var(--verdict-wajar)] translate-y-0 opacity-100'
                  : 'translate-y-1 text-transparent opacity-0'
              )}
              strokeWidth={3}
              aria-hidden
            />
          </div>

          {/* Step label */}
          <span
            className={cn(
              'text-sm transition-colors duration-200',
              step.isComplete ? 'text-[var(--page-text)]' : 'text-[var(--muted-foreground)]'
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}