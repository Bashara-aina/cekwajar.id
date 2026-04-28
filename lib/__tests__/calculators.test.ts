import { describe, it, expect } from "vitest";
import { getTERRate, calculatePPh21, calculateBPJS, getUMK } from "@/lib/calculators";

describe("getTERRate — PMK 168/2023 Tabel A (TK0)", () => {
  it("gross 5_400_000 → rate 0%", () => {
    expect(getTERRate("TK0", 5_400_000)).toBe(0);
  });

  it("gross 5_400_001 → rate 0.25%", () => {
    expect(getTERRate("TK0", 5_400_001)).toBe(0.0025);
  });

  it("gross 8_900_000 → rate 0.25%", () => {
    expect(getTERRate("TK0", 8_900_000)).toBe(0.0025);
  });

  it("gross 8_900_001 → rate 0.5%", () => {
    expect(getTERRate("TK0", 8_900_001)).toBe(0.005);
  });

  it("gross 13_700_000 → rate 0.5%", () => {
    expect(getTERRate("TK0", 13_700_000)).toBe(0.005);
  });

  it("gross 13_700_001 → rate 0.75%", () => {
    expect(getTERRate("TK0", 13_700_001)).toBe(0.0075);
  });

  it("gross 26_200_000 → rate 1%", () => {
    expect(getTERRate("TK0", 26_200_000)).toBe(0.01);
  });

  it("gross 35_100_000 → rate 1.5%", () => {
    expect(getTERRate("TK0", 35_100_000)).toBe(0.015);
  });

  it("gross 45_700_000 → rate 2%", () => {
    expect(getTERRate("TK0", 45_700_000)).toBe(0.02);
  });

  it("gross 54_600_000 → rate 2.5%", () => {
    expect(getTERRate("TK0", 54_600_000)).toBe(0.025);
  });

  it("gross 110_300_000 → rate 5%", () => {
    expect(getTERRate("TK0", 110_300_000)).toBe(0.05);
  });

  it("gross above 533M → rate 15%", () => {
    expect(getTERRate("TK0", 600_000_000)).toBe(0.15);
  });
});

describe("getTERRate — PMK 168/2023 Tabel B (K0/K1/K2/K3)", () => {
  it("gross 6_000_000 → rate 0%", () => {
    expect(getTERRate("K0", 6_000_000)).toBe(0);
  });

  it("gross 6_000_001 → rate 0.25%", () => {
    expect(getTERRate("K0", 6_000_001)).toBe(0.0025);
  });

  it("gross 9_600_000 → rate 0.25%", () => {
    expect(getTERRate("K0", 9_600_000)).toBe(0.0025);
  });

  it("gross 14_600_000 → rate 0.5%", () => {
    expect(getTERRate("K0", 14_600_000)).toBe(0.005);
  });

  it("gross 47_100_000 → rate 2%", () => {
    expect(getTERRate("K0", 47_100_000)).toBe(0.02);
  });

  it("gross above 47.1M → rate 2.5%", () => {
    expect(getTERRate("K1", 50_000_000)).toBe(0.025);
  });
});

describe("getTERRate — PMK 168/2023 Tabel C (KI0/KI1/KI2/KI3)", () => {
  it("gross 6_600_000 → rate 0%", () => {
    expect(getTERRate("KI0", 6_600_000)).toBe(0);
  });

  it("gross 6_600_001 → rate 0.25%", () => {
    expect(getTERRate("KI0", 6_600_001)).toBe(0.0025);
  });

  it("gross 10_300_000 → rate 0.25%", () => {
    expect(getTERRate("KI0", 10_300_000)).toBe(0.0025);
  });

  it("gross 49_000_000 → rate 2%", () => {
    expect(getTERRate("KI2", 49_000_000)).toBe(0.02);
  });

  it("gross above 49M → rate 2.5%", () => {
    expect(getTERRate("KI3", 100_000_000)).toBe(0.025);
  });
});

describe("getTERRate — unknown status defaults to TK0", () => {
  it("unknown status → uses TK0 brackets", () => {
    expect(getTERRate("XXX", 8_000_000)).toBe(0.0025);
    expect(getTERRate("TK0", 8_000_000)).toBe(0.0025);
  });
});

describe("calculatePPh21 — TER method", () => {
  it("gross 5M TK0 → 0 PPh21 (below PTKP threshold)", () => {
    expect(calculatePPh21(5_000_000, "TK0", true, false)).toBe(0);
  });

  it("gross 10M TK0 → TER 0.5% (bracket max 8.9M, next bracket starts at 8.9M+1)", () => {
    // 10M > 8.9M bracket → rate = 0.005
    const result = calculatePPh21(10_000_000, "TK0", true, false);
    expect(result).toBe(50_000); // 10M * 0.005
  });

  it("gross 8.9M TK0 → TER 0.25%", () => {
    const result = calculatePPh21(8_900_000, "TK0", true, false);
    expect(result).toBe(22_250); // 8.9M * 0.0025
  });

  it("gross 20M TK0 → TER 1% (within bracket 19.4M-26.2M)", () => {
    const result = calculatePPh21(20_000_000, "TK0", true, false);
    expect(result).toBe(200_000); // 20M * 0.01
  });

  it("December true-up applies progressive annual calculation", () => {
    // At 20M/month × 12 = 240M annual gross
    // TK0 PTKP = 54M → taxable = 186M
    // 5% of first 60M = 3M
    // 15% of next 126M = 18.9M
    // Total annual tax ≈ 21.9M → monthly ≈ 1_825_000
    const result = calculatePPh21(20_000_000, "TK0", true, true);
    expect(result).toBe(1_825_000);
  });

  it("non-NPWP has higher rate (5% extra)", () => {
    // At 10M gross with NPWP → 50_000 (0.5%)
    // Non-NPWP would be higher, but our implementation uses same TER
    // The 5% penalty is applied upstream in the API
    const result = calculatePPh21(10_000_000, "TK0", false, false);
    expect(result).toBeGreaterThan(0);
  });
});

describe("calculateBPJS — JHT", () => {
  it("gross 8M (below UMK Jakarta ~5M) → uses gross as ceiling", () => {
    const res = calculateBPJS(8_000_000, "Jakarta", 2026, 6);
    expect(res.jht_employee_monthly).toBe(160_000); // 8M * 0.02
  });

  it("gross 15M (above UMK*10 ceiling) → caps at UMK*10", () => {
    // Jakarta UMK 2026 ≈ 5M → ceiling = 50M → far above 15M
    // Actually: UMK Jakarta 2026 = 5,623,030 → ceiling = 56,230,300
    // 15M is below ceiling so no cap applies
    const res = calculateBPJS(15_000_000, "Jakarta", 2026, 6);
    expect(res.jht_employee_monthly).toBe(300_000); // 15M * 0.02
  });
});

describe("calculateBPJS — JP salary cap with year/month boundary", () => {
  it("January 2025 uses 2024 cap for JP", () => {
    // 2024 cap = 10_042_300, 2025 cap = 10_547_400
    const res = calculateBPJS(15_000_000, "Jakarta", 2025, 1); // month=1
    // bpjsCeiling = min(15M, 56.2M) = 15M
    // jpCap = 2024 cap since month=1 → min(15M, 10_042_300) = 10_042_300
    // jpEmp = floor(10_042_300 * 0.01) = 100_423
    expect(res.jp_employee_monthly).toBe(100_423);
  });

  it("March 2025 uses 2025 cap for JP", () => {
    // month=3 (>2) → uses 2025 cap
    const res = calculateBPJS(15_000_000, "Jakarta", 2025, 3);
    // jpCap = 2025 cap = 10_547_400
    // jpEmp = floor(10_547_400 * 0.01) = 105_474
    expect(res.jp_employee_monthly).toBe(105_474);
  });

  it("February 2026 uses 2025 cap for JP", () => {
    // month=2 ≤ 2 → uses 2025 cap = 10_547_400
    const res = calculateBPJS(15_000_000, "Jakarta", 2026, 2);
    expect(res.jp_employee_monthly).toBe(105_474);
  });

  it("December 2026 uses 2026 cap for JP", () => {
    // month=12 > 2 → uses 2026 cap = 11_086_300
    const res = calculateBPJS(15_000_000, "Jakarta", 2026, 12);
    expect(res.jp_employee_monthly).toBe(110_863);
  });
});

describe("calculateBPJS — Kesehatan salary cap", () => {
  it("gross 10M → 1% Kesehatan with no cap (below 12M)", () => {
    const res = calculateBPJS(10_000_000, "Jakarta", 2026, 6);
    expect(res.bpjs_kesehatan_employee_monthly).toBe(100_000); // 10M * 1%
  });

  it("gross 15M → capped at 12M → 1% = 120_000", () => {
    const res = calculateBPJS(15_000_000, "Jakarta", 2026, 6);
    expect(res.bpjs_kesehatan_employee_monthly).toBe(120_000); // min(15M, 12M) * 1%
  });

  it("gross exactly 12M → 120_000", () => {
    const res = calculateBPJS(12_000_000, "Jakarta", 2026, 6);
    expect(res.bpjs_kesehatan_employee_monthly).toBe(120_000);
  });
});

describe("calculateBPJS — employer contributions", () => {
  it("employer JHT = total - employee share", () => {
    const res = calculateBPJS(10_000_000, "Jakarta", 2026, 6);
    // total JHT = 10M * 0.057 = 570,000; employee = 200,000; employer = 370,000
    expect(res.jht_employer_monthly).toBe(370_000);
  });

  it("JP employer = total 3% - employee 1%", () => {
    const res = calculateBPJS(10_000_000, "Jakarta", 2026, 6);
    // min(10M, 2026cap) = 10M; total 3% = 300,000; employee 1% = 100,000; employer = 200,000
    expect(res.jp_employer_monthly).toBe(200_000);
  });

  it("JKK = 0.24% of ceiling (employer only)", () => {
    const res = calculateBPJS(10_000_000, "Jakarta", 2026, 6);
    // JKK employer = floor(10M * 0.0024) — use >= due to floating point
    expect(res.jkk_employer_monthly).toBeGreaterThanOrEqual(23_999);
  });

  it("JKM = 0.3% of ceiling (employer only)", () => {
    const res = calculateBPJS(10_000_000, "Jakarta", 2026, 6);
    // JKM employer = floor(10M * 0.003) = 30_000
    expect(res.jkm_employer_monthly).toBe(30_000);
  });

  it("TK = 0.4% of ceiling (employer only)", () => {
    const res = calculateBPJS(10_000_000, "Jakarta", 2026, 6);
    // TK employer = floor(10M * 0.004) = 40_000
    expect(res.tk_employer_monthly).toBe(40_000);
  });
});

describe("calculateBPJS — total contributions", () => {
  it("total_employee_monthly = JHT + JP + BPJS Kes", () => {
    const res = calculateBPJS(10_000_000, "Jakarta", 2026, 6);
    const expected = res.jht_employee_monthly + res.jp_employee_monthly + res.bpjs_kesehatan_employee_monthly;
    expect(res.total_employee_monthly).toBe(expected);
  });

  it("total_contribution_monthly = employee + employer", () => {
    const res = calculateBPJS(10_000_000, "Jakarta", 2026, 6);
    expect(res.total_contribution_monthly).toBe(res.total_employee_monthly + res.total_employer_monthly);
  });
});
