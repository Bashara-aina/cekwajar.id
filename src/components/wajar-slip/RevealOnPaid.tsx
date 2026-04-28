'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface RevealOnPaidProps {
  amountIdr: number
  isPaid: boolean
}

export function RevealOnPaid({ amountIdr, isPaid }: RevealOnPaidProps) {
  const reduce = useReducedMotion()
  const [displayed, setDisplayed] = useState(isPaid ? amountIdr : 0)

  useEffect(() => {
    if (!isPaid || reduce) {
      setDisplayed(amountIdr)
      return
    }
    const start = performance.now()
    const duration = 1200
    const raf = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(amountIdr * eased))
      if (t < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [isPaid, amountIdr, reduce])

  return (
    <motion.p
      initial={false}
      animate={isPaid ? { filter: 'blur(0px)', scale: 1 } : { filter: 'blur(8px)', scale: 0.98 }}
      transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="font-mono text-5xl font-black tracking-tight text-red-700 sm:text-6xl"
    >
      IDR {displayed.toLocaleString('id-ID')}
    </motion.p>
  )
}
