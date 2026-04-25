import { Suspense } from 'react'
import UpgradeSuccessPageClient from './UpgradeSuccessPageClient'

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Memuat...</p></div>}>
      <UpgradeSuccessPageClient />
    </Suspense>
  )
}