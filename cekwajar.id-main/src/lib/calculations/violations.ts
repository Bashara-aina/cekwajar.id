// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Violation Detectors (V01–V11)
// V01–V07: Core compliance checks | V08–V09: Illegal JKK/JKM deduction
// V10: Total deduction >50% (PP 36/2021 Pasal 65)
// V11: December TER method (should be progressive Pasal 17)
// ══════════════════════════════════════════════════════════════════════════════

import type { Violation, ViolationCode, ViolationSeverity, PtkpStatus } from '@/types'

export interface ViolationInput {
  grossSalary: number
  cityUMK: number
  month: number
  ptkpStatus: PtkpStatus
  reported: {
    pph21: number
    jhtEmployee: number
    jpEmployee: number
    kesehatan: number
    /** JKK employee contribution — should always be 0 (employer-only per PP 44/2015) */
    jkkEmployee: number
    /** JKM employee contribution — should always be 0 (employer-only per PP 44/2015) */
    jkmEmployee: number
    /** Other deductions (potongan_lain) — counted toward 50% limit */
    potonganLain?: number
  }
  calculated: {
    pph21: number
    jhtEmployee: number
    jpEmployee: number
    kesehatan: number
  }
  /**
   * TER-based PPh21 for December comparison.
   * When month === 12, this is the PPh21 that results from applying TER
   * to the December gross — the amount the employer SHOULD NOT be using.
   * Should match what calculatePPh21 would return if called with
   * monthNumber !== 12 (i.e., TER applied incorrectly instead of progressive).
   */
  pph21TerBased: number
}

// PTKP values (annual) — mirrored from lib/calculations/pph21.ts
const PTKP_VALUES: Record<PtkpStatus, number> = {
  'TK/0': 54_000_000,
  'TK/1': 58_500_000,
  'TK/2': 63_000_000,
  'TK/3': 67_500_000,
  'K/0': 58_500_000,
  'K/1': 63_000_000,
  'K/2': 67_500_000,
  'K/3': 72_000_000,
  'K/I/0': 112_500_000,
  'K/I/1': 117_000_000,
  'K/I/2': 121_500_000,
  'K/I/3': 126_000_000,
}

interface ViolationCandidate {
  code: ViolationCode
  severity: ViolationSeverity
  titleID: string
  descriptionID: string
  differenceIDR: number | null
  actionID: string
}

function v(
  code: ViolationCode,
  severity: ViolationSeverity,
  titleID: string,
  descriptionID: string,
  differenceIDR: number | null,
  actionID: string
): ViolationCandidate {
  return { code, severity, titleID, descriptionID, differenceIDR, actionID }
}

/**
 * Run all 11 violation detectors against the payslip data.
 * Returns violations sorted by severity (CRITICAL first).
 */
export function detectViolations(input: ViolationInput): Violation[] {
  const { grossSalary, cityUMK, month, ptkpStatus, reported, calculated, pph21TerBased } = input
  const isDecember = month === 12
  const potonganLain = reported.potonganLain ?? 0

  const candidates: ViolationCandidate[] = []

  // V01: JHT missing — employer not enrolling
  if (reported.jhtEmployee === 0 && grossSalary > 0) {
    candidates.push(
      v(
        'V01',
        'HIGH',
        'JHT Tidak Dipotong',
        'Tidak ada potongan JHT (2%). Perusahaan wajib mendaftarkan kamu ke BPJS Ketenagakerjaan program JHT.',
        calculated.jhtEmployee,
        'Minta HRD mendaftarkan kamu ke BPJS Ketenagakerjaan program JHT.'
      )
    )
  }

  // V02: JP underpaid
  if (
    reported.jpEmployee > 0 &&
    calculated.jpEmployee > reported.jpEmployee &&
    Math.abs(calculated.jpEmployee - reported.jpEmployee) > 5000
  ) {
    candidates.push(
      v(
        'V02',
        'MEDIUM',
        'JP Kurang Potong',
        `JP dipotong Rp ${reported.jpEmployee.toLocaleString('id-ID')} tapi seharusnya Rp ${calculated.jpEmployee.toLocaleString('id-ID')}.`,
        calculated.jpEmployee - reported.jpEmployee,
        'Minta HRD atau bagian payroll koreksi potongan JP sesuai gaji terbaru.'
      )
    )
  }

  // V03: PPh21 not withheld when it should be
  if (calculated.pph21 > 10_000 && reported.pph21 === 0) {
    candidates.push(
      v(
        'V03',
        'HIGH',
        'PPh21 Tidak Dipotong',
        'Seharusnya ada pemotongan PPh21 tapi di slip gaji tertulis Rp 0.',
        calculated.pph21,
        'Konsultasikan dengan HRD atau gunakan jasa konsultan pajak untuk koreksi.'
      )
    )
  }

  // V04: PPh21 underpaid (not zero — V03 covers zero case)
  if (
    calculated.pph21 > reported.pph21 &&
    reported.pph21 > 0 &&
    calculated.pph21 - reported.pph21 > 50_000
  ) {
    candidates.push(
      v(
        'V04',
        'MEDIUM',
        'PPh21 Kurang Potong',
        `PPh21 dipotong Rp ${reported.pph21.toLocaleString('id-ID')} tapi seharusnya Rp ${calculated.pph21.toLocaleString('id-ID')}.`,
        calculated.pph21 - reported.pph21,
        'Minta HRD koreksi pemotongan PPh21 dan laporkan ke atasan.'
      )
    )
  }

  // V05: BPJS Kesehatan missing
  if (reported.kesehatan === 0 && grossSalary > 0) {
    candidates.push(
      v(
        'V05',
        'HIGH',
        'BPJS Kesehatan Tidak Dipotong',
        'Tidak ada potongan BPJS Kesehatan (1%). Perusahaan wajib mendaftarkan kamu ke program BPJS Kesehatan.',
        calculated.kesehatan,
        'Minta HRD mendaftarkan kamu ke BPJS Kesehatan dan potong iuran yang tertunggak.'
      )
    )
  }

  // V06: Below UMK — most critical violation
  if (cityUMK > 0 && grossSalary < cityUMK) {
    candidates.push(
      v(
        'V06',
        'CRITICAL',
        'Gaji Di Bawah UMK',
        `Gaji Rp ${grossSalary.toLocaleString('id-ID')} di bawah UMK kota ini (Rp ${cityUMK.toLocaleString('id-ID')}). Ini PELANGGARAN HUKUM berat.`,
        cityUMK - grossSalary,
        'Laporkan ke Dinas Ketenagakerjaan setempat atau konsultasikan dengan Serikat Pekerja/LC KCHI.'
      )
    )
  }

  // V07: JP missing
  if (
    reported.jpEmployee === 0 &&
    grossSalary > 0 &&
    calculated.jpEmployee > 0
  ) {
    candidates.push(
      v(
        'V07',
        'MEDIUM',
        'JP Tidak Dipotong',
        'Tidak ada potongan JP (1%). Perusahaan wajib mendaftarkan kamu ke BPJS Ketenagakerjaan program JP.',
        calculated.jpEmployee,
        'Minta HRD mendaftarkan kamu ke program JP dan bayarkan iuran yang tertunggak.'
      )
    )
  }

  // V08: Illegal JKK deduction — JKK is employer-only (PP 44/2015 + PP 36/2021)
  if (reported.jkkEmployee > 0) {
    candidates.push(
      v(
        'V08',
        'CRITICAL',
        'JKK Dipotong dari Karyawan',
        'JKK adalah iuran pihak pemberi kerja (PP 44/2015); tidak boleh dipotong dari gaji karyawan.',
        reported.jkkEmployee,
        'Laporkan ke HRD — pemotongan JKK dari karyawan adalah pelanggaran hukum.'
      )
    )
  }

  // V09: Illegal JKM deduction — JKM is employer-only (PP 44/2015 + PP 36/2021)
  if (reported.jkmEmployee > 0) {
    candidates.push(
      v(
        'V09',
        'CRITICAL',
        'JKM Dipotong dari Karyawan',
        'JKM adalah iuran pihak pemberi kerja (PP 44/2015); tidak boleh dipotong dari gaji karyawan.',
        reported.jkmEmployee,
        'Laporkan ke HRD — pemotongan JKM dari karyawan adalah pelanggaran hukum.'
      )
    )
  }

  // V10: Total deductions exceed 50% of gross salary (PP 36/2021 Pasal 65)
  const totalReportedDeductions =
    reported.pph21 +
    reported.jhtEmployee +
    reported.jpEmployee +
    reported.kesehatan +
    reported.jkkEmployee +
    reported.jkmEmployee +
    potonganLain
  const DEDUCTION_LIMIT_RATIO = 0.5
  if (totalReportedDeductions > grossSalary * DEDUCTION_LIMIT_RATIO) {
    const overage = totalReportedDeductions - Math.round(grossSalary * DEDUCTION_LIMIT_RATIO)
    candidates.push(
      v(
        'V10',
        'CRITICAL',
        'Total Potongan Melebihi 50%',
        `Total potongan Rp ${totalReportedDeductions.toLocaleString('id-ID')} melebihi 50% dari gaji bruto (Rp ${Math.round(grossSalary * DEDUCTION_LIMIT_RATIO).toLocaleString('id-ID')}).`,
        overage,
        'Ini melanggar PP 36/2021 Pasal 65. Konsultasikan dengan HRD atau pajak.'
      )
    )
  }

  // V11: December uses TER method instead of progressive Pasal 17
  // In December, PPh21 must use full progressive calculation (Pasal 17 UU PPh),
  // NOT the TER simplified method. TER is only for months 1-11.
  if (isDecember) {
    // pph21TerBased is the TER-equivalent amount — what employer would owe if they
    // wrongly applied TER to December. Compare against progressive (calculated.pph21).
    const pph21Progressive = calculated.pph21
    const terDiff = Math.abs(reported.pph21 - pph21TerBased)
    const progDiff = Math.abs(reported.pph21 - pph21Progressive)
    // If the reported amount matches TER more closely than progressive,
    // employer almost certainly used TER in December
    if (
      reported.pph21 > 0 &&
      terDiff < progDiff &&
      Math.abs(pph21Progressive - pph21TerBased) > 50_000
    ) {
      const ptkpAnnual = PTKP_VALUES[ptkpStatus] ?? 54_000_000
      const annualizedGross = grossSalary * 12
      const pkp = Math.max(0, annualizedGross - ptkpAnnual)
      candidates.push(
        v(
          'V11',
          'CRITICAL',
          'Metode TER pada Bulan Desember',
          `PPh21 bulan Desember menggunakan metode TER. Pada bulan Desember harus menggunakan cara regresif Pasal 17 UU PPh (dengan pengurangan biaya jabatan).`,
          Math.abs(pph21Progressive - reported.pph21),
          'Minta HRD atau bagian payroll koreksi PPh21 Desember menggunakan metode pajak regresif Pasal 17, bukan TER.'
        )
      )
    }
  }

  // Sort by severity: CRITICAL > HIGH > MEDIUM > LOW
  const severityOrder: Record<ViolationSeverity, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  }

  return candidates
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .map((c) => ({
      code: c.code,
      severity: c.severity,
      titleID: c.titleID,
      descriptionID: c.descriptionID,
      differenceIDR: c.differenceIDR,
      actionID: c.actionID,
    }))
}
