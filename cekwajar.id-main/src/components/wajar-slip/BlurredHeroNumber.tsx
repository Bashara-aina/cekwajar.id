'use client'
import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  amountIdr: number
  isPaid: boolean
}

export function BlurredHeroNumber({ amountIdr, isPaid }: Props) {
  const reduce = useReducedMotion()

  return (
    <div className="text-center">
      <motion.p
        initial={false}
        animate={
          isPaid
            ? { filter: 'blur(0px) saturate(1)', scale: 1 }
            : { filter: 'blur(8px) saturate(0.6) grayscale(0.4)', scale: 0.98 }
        }
        transition={{
          duration: reduce ? 0 : 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="font-mono text-5xl font-extrabold tracking-tight sm:text-6xl"
        style={isPaid ? { color: '#dc2626' } : { color: '#1e293b' }}
        aria-label={isPaid ? `Selisih ${amountIdr.toLocaleString('id-ID')} rupiah` : 'Selisih tertutup'}
      >
        IDR {amountIdr.toLocaleString('id-ID')}
      </motion.p>
      <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
        Total selisih bulan ini
      </p>
    </div>
  )
}
