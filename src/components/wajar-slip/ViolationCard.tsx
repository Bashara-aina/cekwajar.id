import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Violation {
  code: string
  name: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  legalBasis: string
  difference: number
  recommendedAction: string
}

interface ViolationCardProps {
  violation: Violation
}

const severityConfig = {
  CRITICAL: {
    icon: AlertTriangle,
    variant: 'destructive' as const,
    label: 'Kritis',
    borderClass: 'border-red-300 bg-red-50',
  },
  HIGH: {
    icon: AlertCircle,
    variant: 'warning' as const,
    label: 'Tinggi',
    borderClass: 'border-amber-300 bg-amber-50',
  },
  MEDIUM: {
    icon: Info,
    variant: 'secondary' as const,
    label: 'Sedang',
    borderClass: 'border-slate-200 bg-slate-50',
  },
}

export function ViolationCard({ violation }: ViolationCardProps) {
  const config = severityConfig[violation.severity]
  const Icon = config.icon

  return (
    <div className={`rounded-xl border p-4 ${config.borderClass}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${
          violation.severity === 'CRITICAL' ? 'text-red-600' :
          violation.severity === 'HIGH' ? 'text-amber-600' : 'text-slate-500'
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={config.variant}>{violation.code}</Badge>
            <span className="text-sm font-semibold text-slate-900">{violation.name}</span>
            <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">{violation.legalBasis}</p>
          {violation.difference > 0 && (
            <p className="mt-1 font-mono text-sm font-bold text-red-700">
              + IDR {violation.difference.toLocaleString('id-ID')}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-600">{violation.recommendedAction}</p>
        </div>
      </div>
    </div>
  )
}
