import { Suspense } from 'react'
import { UpgradeSuccessClient } from '@/components/upgrade/UpgradeSuccessClient'

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={null}>
      <UpgradeSuccessClient />
    </Suspense>
  )
}
