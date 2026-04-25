/**
 * TypeScript calculators mirroring block_03_pph21_bpjs_engine.py
 * Used by Next.js API routes as a fast local fallback.
 * Production deployments call the FastAPI microservice instead.
 */

export const PTKP_VALUES: Record<string, number> = {
  TK0: 54_000_000,
  K0: 58_500_000,
  K1: 63_000_000,
  K2: 67_500_000,
  K3: 72_000_000,
};

// PMK 168/2023 TER brackets for TK/0 (Tabel A)
const TER_BRACKET_TK0: Array<{ max: number; rate: number }> = [
  { max: 5_400_000, rate: 0 },
  { max: 8_900_000, rate: 0.0025 },
  { max: 13_700_000, rate: 0.005 },
  { max: 19_400_000, rate: 0.0075 },
  { max: 26_200_000, rate: 0.01 },
  { max: 35_100_000, rate: 0.015 },
  { max: 45_700_000, rate: 0.02 },
  { max: 54_600_000, rate: 0.025 },
  { max: 64_600_000, rate: 0.03 },
  { max: 74_600_000, rate: 0.035 },
  { max: 85_400_000, rate: 0.04 },
  { max: 97_400_000, rate: 0.045 },
  { max: 110_300_000, rate: 0.05 },
  { max: 123_700_000, rate: 0.055 },
  { max: 137_600_000, rate: 0.06 },
  { max: 152_000_000, rate: 0.065 },
  { max: 167_000_000, rate: 0.07 },
  { max: 182_900_000, rate: 0.075 },
  { max: 199_500_000, rate: 0.08 },
  { max: 216_900_000, rate: 0.085 },
  { max: 235_000_000, rate: 0.09 },
  { max: 254_000_000, rate: 0.095 },
  { max: 274_000_000, rate: 0.1 },
  { max: 295_000_000, rate: 0.105 },
  { max: 317_000_000, rate: 0.11 },
  { max: 340_000_000, rate: 0.115 },
  { max: 364_000_000, rate: 0.12 },
  { max: 389_000_000, rate: 0.125 },
  { max: 415_000_000, rate: 0.13 },
  { max: 442_000_000, rate: 0.135 },
  { max: 471_000_000, rate: 0.14 },
  { max: 501_000_000, rate: 0.145 },
  { max: 533_000_000, rate: 0.15 },
  { max: Infinity, rate: 0.15 },
];

// PMK 168/2023 TER brackets for K/0, K/1, K/2, K/3 (Tabel B)
const TER_BRACKET_K: Array<{ max: number; rate: number }> = [
  { max: 6_000_000, rate: 0 },
  { max: 9_600_000, rate: 0.0025 },
  { max: 14_600_000, rate: 0.005 },
  { max: 20_300_000, rate: 0.0075 },
  { max: 27_100_000, rate: 0.01 },
  { max: 36_000_000, rate: 0.015 },
  { max: 47_100_000, rate: 0.02 },
  { max: Infinity, rate: 0.025 },
];

// PMK 168/2023 TER brackets for K/I/0, K/I/1, K/I/2, K/I/3 (Tabel C)
const TER_BRACKET_KI: Array<{ max: number; rate: number }> = [
  { max: 6_600_000, rate: 0 },
  { max: 10_300_000, rate: 0.0025 },
  { max: 15_600_000, rate: 0.005 },
  { max: 21_500_000, rate: 0.0075 },
  { max: 28_300_000, rate: 0.01 },
  { max: 37_500_000, rate: 0.015 },
  { max: 49_000_000, rate: 0.02 },
  { max: Infinity, rate: 0.025 },
];

/**
 * Returns the TER rate based on PTKP status and gross monthly salary.
 * Uses PMK 168/2023 TER tables.
 */
export function getTERRate(ptkpStatus: string, grossMonthly: number): number {
  let brackets: Array<{ max: number; rate: number }>;

  switch (ptkpStatus) {
    case "TK0":
      brackets = TER_BRACKET_TK0;
      break;
    case "K0":
    case "K1":
    case "K2":
    case "K3":
      brackets = TER_BRACKET_K;
      break;
    case "KI0":
    case "KI1":
    case "KI2":
    case "KI3":
      brackets = TER_BRACKET_KI;
      break;
    default:
      // Default to TK0 brackets
      brackets = TER_BRACKET_TK0;
  }

  for (const bracket of brackets) {
    if (grossMonthly <= bracket.max) {
      return bracket.rate;
    }
  }

  return 0.025; // Maximum rate
}

/**
 * Calculate monthly PPh21 using TER method from PMK 168/2023.
 * For December, applies progressive annual true-up calculation.
 */
export function calculatePPh21(
  grossMonthly: number,
  ptkpStatus: string,
  hasNPWP: boolean,
  isDecember: boolean,
): number {
  const terRate = getTERRate(ptkpStatus, grossMonthly);
  let monthlyPPh21 = Math.floor(grossMonthly * terRate);

  // December true-up: calculate using cumulative annual income
  if (isDecember) {
    const annualGross = grossMonthly * 12;
    const ptkpValue = PTKP_VALUES[ptkpStatus] ?? 54_000_000;
    const taxableAnnual = Math.max(0, annualGross - ptkpValue);

    // Progressive rates
    let annualTax = 0;
    let remaining = taxableAnnual;

    // 5% bracket: first 60M
    if (remaining > 0) {
      const taxableIn5 = Math.min(remaining, 60_000_000);
      annualTax += taxableIn5 * 0.05;
      remaining -= taxableIn5;
    }

    // 15% bracket: 60M-250M
    if (remaining > 0) {
      const taxableIn15 = Math.min(remaining, 190_000_000);
      annualTax += taxableIn15 * 0.15;
      remaining -= taxableIn15;
    }

    // 25% bracket: 250M-500M
    if (remaining > 0) {
      const taxableIn25 = Math.min(remaining, 250_000_000);
      annualTax += taxableIn25 * 0.25;
      remaining -= taxableIn25;
    }

    // 30% bracket: 500M-5B
    if (remaining > 0) {
      annualTax += remaining * 0.30;
    }

    const monthlyTrueUp = Math.floor(annualTax / 12);
    monthlyPPh21 = monthlyTrueUp;
  }

  // NPWP surcharge: 20% if no NPWP (article 21 paragraph 2)
  if (!hasNPWP) {
    monthlyPPh21 = Math.floor(monthlyPPh21 * 1.2);
  }

  return monthlyPPh21;
}

export const UMK_2026: Record<string, number> = {
  jakarta: 5_396_761,
  bekasi: 5_690_752,
  surabaya: 4_786_940,
  bandung: 4_482_914,
  tangerang: 4_906_102,
  depok: 4_900_000,
  medan: 4_500_000,
  semarang: 4_600_000,
  makassar: 4_200_000,
  palembang: 4_350_000,
  default: 4_000_000,
};

export function getUMK(city: string): number {
  const cityLower = city.toLowerCase();
  for (const [key, val] of Object.entries(UMK_2026)) {
    if (cityLower.includes(key)) return val;
  }
  return UMK_2026.default;
}

export interface BPJSBreakdown {
  jht_employee_monthly: number;
  jp_employee_monthly: number;
  bpjs_kesehatan_employee_monthly: number;
  total_employee_monthly: number;
  jht_employer_monthly: number;
  jp_employer_monthly: number;
  bpjs_kesehatan_employer_monthly: number;
  jkk_employer_monthly: number;
  jkm_employer_monthly: number;
  tk_employer_monthly: number;
  total_employer_monthly: number;
  total_contribution_monthly: number;
}

export function calculateBPJS(
  grossMonthly: number,
  city: string
): BPJSBreakdown {
  const umk = getUMK(city);
  const bpjsCeiling = Math.min(grossMonthly, umk * 10);

  const jhtEmp = Math.floor(bpjsCeiling * 0.02);
  const jpEmp = Math.floor(bpjsCeiling * 0.01);
  const bpjsKesEmp = Math.min(Math.floor(bpjsCeiling * 0.01), 120_000);

  const jhtTotal = Math.floor(bpjsCeiling * 0.057); // 5.7% employer+employee
  const jpTotal = Math.floor(bpjsCeiling * 0.03); // 3%
  const bpjsKesTotal = Math.floor(bpjsCeiling * 0.05); // 5%
  const tkEmp = Math.floor(bpjsCeiling * 0.004); // 0.4%

  // JKK (Jaminan Kecelakaan Kerja) - employer only, 0.24% (lowest risk class)
  const jkkEmp = Math.floor(bpjsCeiling * 0.0024);

  // JKM (Jaminan Kematian) - employer only, 0.30%
  const jkmEmp = Math.floor(bpjsCeiling * 0.003);

  return {
    jht_employee_monthly: jhtEmp,
    jp_employee_monthly: jpEmp,
    bpjs_kesehatan_employee_monthly: bpjsKesEmp,
    total_employee_monthly: jhtEmp + jpEmp + bpjsKesEmp,
    jht_employer_monthly: jhtTotal - jhtEmp,
    jp_employer_monthly: jpTotal - jpEmp,
    bpjs_kesehatan_employer_monthly: bpjsKesTotal - bpjsKesEmp,
    jkk_employer_monthly: jkkEmp,
    jkm_employer_monthly: jkmEmp,
    tk_employer_monthly: tkEmp,
    total_employer_monthly: jhtTotal - jhtEmp + (jpTotal - jpEmp) + (bpjsKesTotal - bpjsKesEmp) + jkkEmp + jkmEmp + tkEmp,
    total_contribution_monthly: jhtEmp + jpEmp + bpjsKesEmp + (jhtTotal - jhtEmp) + (jpTotal - jpEmp) + (bpjsKesTotal - bpjsKesEmp) + jkkEmp + jkmEmp + tkEmp,
  };
}
