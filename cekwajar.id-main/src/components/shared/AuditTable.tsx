// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — AuditTable Component
// Comparison table: Item | Di Slip | Harusnya | Selisih
// Premium locked rows: blurred with lock overlay
// ══════════════════════════════════════════════════════════════════════════════

import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AuditTableRow {
  item: string
  diSlip: number
  seharusnya: number
  selisih: number
  isLocked?: boolean
  isHighlighted?: boolean
}

export interface AuditTableProps {
  rows: AuditTableRow[]
  className?: string
}

function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function NumberCell({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn('font-mono text-sm tabular-nums', className)}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {formatIDR(value)}
    </span>
  )
}

export function AuditTable({ rows, className }: AuditTableProps) {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-[var(--gray-200)]',
        className
      )}
    >
      <table className="w-full caption-bottom text-sm">
        {/* Table head */}
        <thead>
          <tr className="border-b border-[var(--gray-200)] bg-[var(--gray-50)]">
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Item
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Di Slip
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Harusnya
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Selisih
            </th>
          </tr>
        </thead>

        {/* Table body */}
        <tbody className="divide-y divide-[var(--gray-100)]">
          {rows.map((row, index) => (
            <tr
              key={index}
              className={cn(
                'group transition-colors duration-100',
                'hover:bg-[var(--gray-50)]',
                row.isHighlighted && 'bg-[var(--info-bg)]/50'
              )}
            >
              {/* Item label */}
              <td className="px-4 py-3 text-sm text-[var(--page-text)]">{row.item}</td>

              {/* Di Slip */}
              <td className="px-4 py-3 text-right">
                <NumberCell value={row.diSlip} className="text-[var(--page-text)]" />
              </td>

              {/* Harusnya */}
              <td className="px-4 py-3 text-right">
                <NumberCell value={row.seharusnya} className="text-[var(--page-text-muted)]" />
              </td>

              {/* Selisih */}
              <td className="px-4 py-3 text-right">
                {row.selisih !== 0 ? (
                  <NumberCell
                    value={row.selisih}
                    className={cn(
                      row.selisih > 0
                        ? 'text-[var(--verdict-salah)]'
                        : 'text-[var(--verdict-wajar)]'
                    )}
                  />
                ) : (
                  <span className="text-sm text-[var(--muted-foreground)]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty state */}
      {rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">Belum ada data audit</p>
        </div>
      )}
    </div>
  )
}

/*
 * AuditTablePremium variant — rows with blur lock overlay
 * Used when showing premium comparison rows in a locked/paywalled context
 */
export interface AuditTablePremiumRow {
  item: string
  diSlip: number
  seharusnya: number
  selisih: number
}

export interface AuditTablePremiumProps {
  rows: AuditTablePremiumRow[]
  unlockedCount?: number
  className?: string
}

export function AuditTablePremium({
  rows,
  unlockedCount = 0,
  className,
}: AuditTablePremiumProps) {
  return (
    <div className={cn('rounded-xl border border-[var(--gray-200)] overflow-hidden', className)}>
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b border-[var(--gray-200)] bg-[var(--gray-50)]">
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Item
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Di Slip
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Harusnya
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Selisih
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--gray-100)]">
          {rows.map((row, index) => {
            const isLocked = index >= unlockedCount
            return (
              <tr
                key={index}
                className={cn(
                  'group transition-colors duration-100',
                  !isLocked && 'hover:bg-[var(--gray-50)]'
                )}
              >
                <td className={cn('px-4 py-3 text-sm', isLocked ? 'blur-3px saturate-[0.8]' : 'text-[var(--page-text)]')}>
                  {row.item}
                </td>
                <td className="px-4 py-3 text-right">
                  {isLocked ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" aria-hidden />
                      <span className="blur-3px saturate-[0.8] text-sm font-mono tabular-nums text-[var(--page-text-muted)]">
                        {formatIDR(row.diSlip)}
                      </span>
                    </div>
                  ) : (
                    <NumberCell value={row.diSlip} className="text-[var(--page-text)]" />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {isLocked ? (
                    <span className="blur-3px saturate-[0.8] text-sm font-mono tabular-nums text-[var(--page-text-muted)]">
                      {formatIDR(row.seharusnya)}
                    </span>
                  ) : (
                    <NumberCell value={row.seharusnya} className="text-[var(--page-text-muted)]" />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {isLocked ? (
                    <span className="blur-3px saturate-[0.8] text-sm font-mono tabular-nums text-[var(--page-text-muted)]">
                      {formatIDR(row.selisih)}
                    </span>
                  ) : row.selisih !== 0 ? (
                    <NumberCell
                      value={row.selisih}
                      className={cn(
                        row.selisih > 0 ? 'text-[var(--verdict-salah)]' : 'text-[var(--verdict-wajar)]'
                      )}
                    />
                  ) : (
                    <span className="text-sm text-[var(--muted-foreground)]">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}