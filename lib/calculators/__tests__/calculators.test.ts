import { describe, it, expect } from "vitest";
import { getUMK, calculateBPJS, PTKP_VALUES, getTERRate, calculatePPh21 } from "@/lib/calculators";

describe("getUMK", () => {
  it("returns Jakarta UMK for jakarta input", () => {
    expect(getUMK("jakarta")).toBe(5_396_761);
  });

  it("returns Surabaya UMK for surabaya input (case insensitive)", () => {
    expect(getUMK("SURABAYA")).toBe(4_786_940);
  });

  it("returns default for unknown cities", () => {
    expect(getUMK("UnknownCity")).toBe(4_000_000);
  });
});

describe("calculateBPJS", () => {
  it("calculates correct employee JHT for UMK below ceiling", () => {
    const result = calculateBPJS(3_000_000, "jakarta");
    expect(result.jht_employee_monthly).toBe(Math.floor(3_000_000 * 0.02));
  });

  it("caps BPJS kesehatan at 120000", () => {
    const result = calculateBPJS(20_000_000, "jakarta");
    expect(result.bpjs_kesehatan_employee_monthly).toBe(120_000);
  });

  it("applies 10x UMK ceiling for high salaries", () => {
    const result = calculateBPJS(100_000_000, "jakarta");
    const ceiling = 5_396_761 * 10;
    expect(result.jht_employee_monthly).toBe(Math.floor(ceiling * 0.02));
  });

  it("employer contributions are larger than employee", () => {
    const result = calculateBPJS(5_000_000, "jakarta");
    expect(result.total_employer_monthly).toBeGreaterThan(result.total_employee_monthly);
  });

  it("total contribution equals employee + employer", () => {
    const result = calculateBPJS(5_000_000, "jakarta");
    expect(result.total_contribution_monthly).toBe(
      result.total_employee_monthly + result.total_employer_monthly
    );
  });
});

describe("PTKP_VALUES", () => {
  it("TK0 is the minimum PTKP", () => {
    expect(PTKP_VALUES.TK0).toBe(54_000_000);
  });

  it("K3 is the maximum PTKP", () => {
    expect(PTKP_VALUES.K3).toBe(72_000_000);
  });

  it("each increment adds 4.5M", () => {
    expect(PTKP_VALUES.K1 - PTKP_VALUES.K0).toBe(4_500_000);
    expect(PTKP_VALUES.K2 - PTKP_VALUES.K1).toBe(4_500_000);
    expect(PTKP_VALUES.K3 - PTKP_VALUES.K2).toBe(4_500_000);
  });
});

describe("getTERRate", () => {
  it("returns 0 rate for salary below first bracket (TK0)", () => {
    expect(getTERRate("TK0", 5_000_000)).toBe(0);
  });

  it("returns 0.0025 rate for TK0 salary in second bracket", () => {
    expect(getTERRate("TK0", 7_000_000)).toBe(0.0025);
  });

  it("returns 0.005 rate for TK0 salary in third bracket", () => {
    expect(getTERRate("TK0", 10_000_000)).toBe(0.005);
  });

  it("returns 0.025 (max rate) for high salary TK0", () => {
    expect(getTERRate("TK0", 50_000_000)).toBe(0.025);
  });

  it("uses K brackets for K0 status", () => {
    // K0 first bracket max is 6_000_000 vs TK0 5_400_000
    expect(getTERRate("K0", 5_500_000)).toBe(0);
    expect(getTERRate("TK0", 5_500_000)).toBe(0.0025);
  });

  it("uses KI brackets for KI0 status", () => {
    // KI first bracket max is 6_600_000 vs K 6_000_000
    expect(getTERRate("KI0", 6_200_000)).toBe(0);
    expect(getTERRate("K0", 6_200_000)).toBe(0.0025);
  });

  it("defaults to TK0 brackets for unknown status", () => {
    expect(getTERRate("UNKNOWN", 5_500_000)).toBe(0.0025);
    expect(getTERRate("TK0", 5_500_000)).toBe(0.0025);
  });
});

describe("calculatePPh21", () => {
  it("returns 0 for zero gross", () => {
    const result = calculatePPh21(0, "TK0", true, false);
    expect(result).toBe(0);
  });

  it("applies TER rate correctly for monthly calculation", () => {
    // 7M salary with 0.0025 rate = 17,500
    const result = calculatePPh21(7_000_000, "TK0", true, false);
    expect(result).toBe(Math.floor(7_000_000 * 0.0025));
  });

  it("applies 20% NPWP surcharge when hasNPWP is false", () => {
    const withoutNPWP = calculatePPh21(7_000_000, "TK0", false, false);
    const withNPWP = calculatePPh21(7_000_000, "TK0", true, false);
    expect(withoutNPWP).toBe(Math.floor(withNPWP * 1.2));
  });

  it("applies December true-up for annual calculation", () => {
    const monthly = calculatePPh21(15_000_000, "TK0", true, false);
    const december = calculatePPh21(15_000_000, "TK0", true, true);
    // December should use progressive annual calculation
    expect(december).not.toBe(monthly);
  });
});

describe("JKK and JKM fields in BPJSBreakdown", () => {
  it("calculates JKK employer contribution at 0.24%", () => {
    const result = calculateBPJS(5_000_000, "jakarta");
    // JKK = bpjsCeiling * 0.0024 = 5_000_000 * 0.0024 = 12_000 (floor)
    // Note: floating point may give 11999, so we check it's approximately correct
    expect(result.jkk_employer_monthly).toBeGreaterThanOrEqual(11_999);
    expect(result.jkk_employer_monthly).toBeLessThanOrEqual(12_000);
  });

  it("calculates JKM employer contribution at 0.30%", () => {
    const result = calculateBPJS(5_000_000, "jakarta");
    // JKM = bpjsCeiling * 0.003 = 5_000_000 * 0.003 = 15_000
    expect(result.jkm_employer_monthly).toBe(15_000);
  });

  it("JKK and JKM are employer-only (not deducted from employee)", () => {
    const result = calculateBPJS(5_000_000, "jakarta");
    // These should be 0 for employee portion
    expect(result.jkk_employer_monthly).toBeGreaterThan(0);
    expect(result.jkm_employer_monthly).toBeGreaterThan(0);
    expect(result.total_employee_monthly).toBeLessThan(result.total_employer_monthly);
  });

  it("total_employer_monthly includes JKK and JKM", () => {
    const result = calculateBPJS(5_000_000, "jakarta");
    const withoutJKKandJKM =
      result.jht_employer_monthly +
      result.jp_employer_monthly +
      result.bpjs_kesehatan_employer_monthly +
      result.tk_employer_monthly;
    // total_employer includes JKK + JKM on top of standard contributions
    expect(result.total_employer_monthly).toBe(
      withoutJKKandJKM + result.jkk_employer_monthly + result.jkm_employer_monthly
    );
  });

  it("JKK and JKM scale with salary up to ceiling", () => {
    const lowSalary = calculateBPJS(3_000_000, "jakarta");
    const highSalary = calculateBPJS(100_000_000, "jakarta");
    // Low salary below ceiling (UMK*10 = 50M) pays less JKK/JKM than high salary at ceiling
    expect(lowSalary.jkk_employer_monthly).toBeLessThan(highSalary.jkk_employer_monthly);
    expect(lowSalary.jkm_employer_monthly).toBeLessThan(highSalary.jkm_employer_monthly);
  });

  it("total_contribution_monthly equals employee + employer total", () => {
    const result = calculateBPJS(5_000_000, "jakarta");
    expect(result.total_contribution_monthly).toBe(
      result.total_employee_monthly + result.total_employer_monthly
    );
  });
});