import { describe, it, expect } from "vitest";
import { detectViolations, type ViolationInput } from "@/lib/violations";

describe("detectViolations", () => {
  describe("V01 — BPJS JHT missing entirely", () => {
    it("should detect V01 when JHT not paid at all but expected", () => {
      const input: ViolationInput = {
        grossSalary: 8_000_000,
        reportedPPh21: 500_000,
        reportedJhtEmployee: 0,
        reportedJpEmployee: 160_000,
        reportedBpjsKesEmployee: 80_000,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 160_000,
        expectedJpEmployee: 80_000,
        expectedBpjsKesEmployee: 80_000,
        expectedPPh21: 500_000,
      };

      const violations = detectViolations(input);
      const v01 = violations.find((v) => v.code === "V01");

      expect(v01).toBeDefined();
      expect(v01?.severity).toBe("CRITICAL");
      expect(v01?.message).toBe("BPJS JHT tidak dibayarkan sama sekali");
      expect(v01?.expected).toBeGreaterThan(0);
      expect(v01?.reported).toBe(0);
      expect(v01?.difference).toBe(v01?.expected);
    });

    it("should NOT trigger V01 when expectedJhtEmployee is undefined", () => {
      const input: ViolationInput = {
        grossSalary: 8_000_000,
        reportedPPh21: 500_000,
        reportedJhtEmployee: 0,
        reportedJpEmployee: 80_000,
        reportedBpjsKesEmployee: 80_000,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJpEmployee: 80_000,
        expectedBpjsKesEmployee: 80_000,
        expectedPPh21: 500_000,
      };

      const violations = detectViolations(input);
      const v01 = violations.find((v) => v.code === "V01");

      expect(v01).toBeUndefined();
    });

    it("should NOT trigger V01 when expectedJhtEmployee is 0", () => {
      const input: ViolationInput = {
        grossSalary: 8_000_000,
        reportedPPh21: 500_000,
        reportedJhtEmployee: 0,
        reportedJpEmployee: 80_000,
        reportedBpjsKesEmployee: 80_000,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 0,
        expectedJpEmployee: 80_000,
        expectedBpjsKesEmployee: 80_000,
        expectedPPh21: 500_000,
      };

      const violations = detectViolations(input);
      const v01 = violations.find((v) => v.code === "V01");

      expect(v01).toBeUndefined();
    });

    it("should NOT trigger V01 when JHT was actually reported", () => {
      const input: ViolationInput = {
        grossSalary: 8_000_000,
        reportedPPh21: 500_000,
        reportedJhtEmployee: 160_000,
        reportedJpEmployee: 80_000,
        reportedBpjsKesEmployee: 80_000,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 160_000,
        expectedJpEmployee: 80_000,
        expectedBpjsKesEmployee: 80_000,
        expectedPPh21: 500_000,
      };

      const violations = detectViolations(input);
      const v01 = violations.find((v) => v.code === "V01");

      expect(v01).toBeUndefined();
    });
  });

  describe("V06 — Salary below UMK (CRITICAL — ILLEGAL)", () => {
    it("should detect V06 when salary is below city UMK", () => {
      const input: ViolationInput = {
        grossSalary: 4_000_000,
        reportedPPh21: 0,
        reportedJhtEmployee: 0,
        reportedJpEmployee: 0,
        reportedBpjsKesEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v06 = violations.find((v) => v.code === "V06");

      expect(v06).toBeDefined();
      expect(v06?.severity).toBe("CRITICAL");
      expect(v06?.message).toBe("Gaji di bawah UMK — ILEGAL");
      expect(v06?.expected).toBe(5_000_000);
      expect(v06?.reported).toBe(4_000_000);
      expect(v06?.difference).toBe(1_000_000);
    });

    it("should NOT trigger V06 when salary equals UMK", () => {
      const input: ViolationInput = {
        grossSalary: 5_000_000,
        reportedPPh21: 0,
        reportedJhtEmployee: 0,
        reportedJpEmployee: 0,
        reportedBpjsKesEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v06 = violations.find((v) => v.code === "V06");

      expect(v06).toBeUndefined();
    });

    it("should NOT trigger V06 when salary is above UMK", () => {
      const input: ViolationInput = {
        grossSalary: 6_000_000,
        reportedPPh21: 200_000,
        reportedJhtEmployee: 120_000,
        reportedJpEmployee: 60_000,
        reportedBpjsKesEmployee: 60_000,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 120_000,
        expectedJpEmployee: 60_000,
        expectedBpjsKesEmployee: 60_000,
        expectedPPh21: 200_000,
      };

      const violations = detectViolations(input);
      const v06 = violations.find((v) => v.code === "V06");

      expect(v06).toBeUndefined();
    });

    it("should trigger V06 even with NPWP and all other deductions correct", () => {
      const input: ViolationInput = {
        grossSalary: 4_500_000,
        reportedPPh21: 0,
        reportedJhtEmployee: 90_000,
        reportedJpEmployee: 45_000,
        reportedBpjsKesEmployee: 45_000,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 90_000,
        expectedJpEmployee: 45_000,
        expectedBpjsKesEmployee: 45_000,
      };

      const violations = detectViolations(input);
      const v06 = violations.find((v) => v.code === "V06");

      expect(v06).toBeDefined();
      expect(v06?.severity).toBe("CRITICAL");
    });
  });

  describe("V03 — PPh21 not withheld despite liability", () => {
    it("should detect V03 when salary above PTKP threshold and no PPh21 withheld", () => {
      const input: ViolationInput = {
        grossSalary: 5_000_000,
        reportedPPh21: 0,
        reportedJhtEmployee: 100_000,
        reportedJpEmployee: 50_000,
        reportedBpjsKesEmployee: 50_000,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 100_000,
        expectedJpEmployee: 50_000,
        expectedBpjsKesEmployee: 50_000,
        expectedPPh21: 200_000,
      };

      const violations = detectViolations(input);
      const v03 = violations.find((v) => v.code === "V03");

      expect(v03).toBeDefined();
      expect(v03?.severity).toBe("CRITICAL");
      expect(v03?.message).toBe("PPh21 tidak dipotong padahal ada kewajiban");
      expect(v03?.expected).toBe(200_000);
      expect(v03?.reported).toBe(0);
    });

    it("should NOT trigger V03 when PPh21 is properly withheld", () => {
      const input: ViolationInput = {
        grossSalary: 5_000_000,
        reportedPPh21: 200_000,
        reportedJhtEmployee: 100_000,
        reportedJpEmployee: 50_000,
        reportedBpjsKesEmployee: 50_000,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 100_000,
        expectedJpEmployee: 50_000,
        expectedBpjsKesEmployee: 50_000,
        expectedPPh21: 200_000,
      };

      const violations = detectViolations(input);
      const v03 = violations.find((v) => v.code === "V03");

      expect(v03).toBeUndefined();
    });

    it("should NOT trigger V03 when salary is exactly at PTKP threshold", () => {
      // PTKP TK0 = 54,000,000/year = 4,500,000/month
      // When salary equals threshold, no PPh21 liability
      const input: ViolationInput = {
        grossSalary: 4_500_000,
        reportedPPh21: 0,
        reportedJhtEmployee: 0,
        reportedJpEmployee: 0,
        reportedBpjsKesEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v03 = violations.find((v) => v.code === "V03");

      expect(v03).toBeUndefined();
    });

    it("should NOT trigger V03 when salary is below PTKP threshold", () => {
      const input: ViolationInput = {
        grossSalary: 3_500_000,
        reportedPPh21: 0,
        reportedJhtEmployee: 0,
        reportedJpEmployee: 0,
        reportedBpjsKesEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v03 = violations.find((v) => v.code === "V03");

      expect(v03).toBeUndefined();
    });
  });

  describe("Combined violations", () => {
    it("should detect multiple violations at once", () => {
      const input: ViolationInput = {
        grossSalary: 5_500_000, // Above PTKP threshold (4.5M/month) so V03 fires
        reportedPPh21: 0,
        reportedJhtEmployee: 0,
        reportedJpEmployee: 0,
        reportedBpjsKesEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 110_000,
        expectedJpEmployee: 55_000,
        expectedBpjsKesEmployee: 55_000,
        expectedPPh21: 250_000,
      };

      const violations = detectViolations(input);

      // V01 fires because JHT not paid, V03 fires because salary above PTKP
      // V06 does NOT fire because 5.5M > 5M UMK (salary is legal)
      expect(violations.length).toBeGreaterThanOrEqual(2);

      const codes = violations.map((v) => v.code);
      expect(codes).toContain("V01"); // JHT missing
      expect(codes).toContain("V03"); // PPh21 missing
      expect(codes).not.toContain("V06"); // 5.5M > 5M UMK, so legal
    });

    it("should detect V01, V03, V06 when salary is below UMK and above PTKP", () => {
      const input: ViolationInput = {
        grossSalary: 4_800_000, // Above PTKP 4.5M, below UMK 5M
        reportedPPh21: 0,
        reportedJhtEmployee: 0,
        reportedJpEmployee: 0,
        reportedBpjsKesEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 96_000,
        expectedJpEmployee: 48_000,
        expectedBpjsKesEmployee: 48_000,
        expectedPPh21: 200_000,
      };

      const violations = detectViolations(input);

      const codes = violations.map((v) => v.code);
      expect(codes).toContain("V01"); // JHT missing
      expect(codes).toContain("V03"); // PPh21 missing (salary above PTKP)
      expect(codes).toContain("V06"); // below UMK (4.8M < 5M)
    });

    it("should detect V01 and V03 (but not V06) when salary above UMK but above PTKP", () => {
      const input: ViolationInput = {
        grossSalary: 5_500_000, // Above PTKP 4.5M, above UMK 5M
        reportedPPh21: 0,
        reportedJhtEmployee: 0,
        reportedJpEmployee: 0,
        reportedBpjsKesEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 110_000,
        expectedJpEmployee: 55_000,
        expectedBpjsKesEmployee: 55_000,
        expectedPPh21: 250_000,
      };

      const violations = detectViolations(input);

      const codes = violations.map((v) => v.code);
      expect(codes).toContain("V01"); // JHT missing
      expect(codes).toContain("V03"); // PPh21 missing
      expect(codes).not.toContain("V06"); // 5.5M > 5M UMK, so legal
    });

    it("should return empty array when all is correct", () => {
      const input: ViolationInput = {
        grossSalary: 8_000_000,
        reportedPPh21: 400_000,
        reportedJhtEmployee: 160_000,
        reportedJpEmployee: 80_000,
        reportedBpjsKesEmployee: 80_000,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 160_000,
        expectedJpEmployee: 80_000,
        expectedBpjsKesEmployee: 80_000,
        expectedPPh21: 400_000,
      };

      const violations = detectViolations(input);

      // V04 underpayment threshold is 50k — with exact match there should be no violations
      const v04 = violations.find((v) => v.code === "V04");
      expect(v04).toBeUndefined();
    });
  });

  describe("V08 — ILLEGAL JKK deduction (JKK is employer-only)", () => {
    it("should detect V08 when JKK is deducted from employee salary", () => {
      const input: ViolationInput = {
        grossSalary: 8_000_000,
        reportedPPh21: 200_000,
        reportedJhtEmployee: 160_000,
        reportedJpEmployee: 80_000,
        reportedBpjsKesEmployee: 80_000,
        reportedJkkEmployee: 50_000,
        reportedJkmEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v08 = violations.find((v) => v.code === "V08");

      expect(v08).toBeDefined();
      expect(v08?.severity).toBe("CRITICAL");
      expect(v08?.reported).toBe(50_000);
      expect(v08?.expected).toBe(0);
    });

    it("should NOT trigger V08 when JKK is not deducted (correct)", () => {
      const input: ViolationInput = {
        grossSalary: 8_000_000,
        reportedPPh21: 200_000,
        reportedJhtEmployee: 160_000,
        reportedJpEmployee: 80_000,
        reportedBpjsKesEmployee: 80_000,
        reportedJkkEmployee: 0,
        reportedJkmEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v08 = violations.find((v) => v.code === "V08");

      expect(v08).toBeUndefined();
    });
  });

  describe("V09 — ILLEGAL JKM deduction (JKM is employer-only)", () => {
    it("should detect V09 when JKM is deducted from employee salary", () => {
      const input: ViolationInput = {
        grossSalary: 8_000_000,
        reportedPPh21: 200_000,
        reportedJhtEmployee: 160_000,
        reportedJpEmployee: 80_000,
        reportedBpjsKesEmployee: 80_000,
        reportedJkkEmployee: 0,
        reportedJkmEmployee: 30_000,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v09 = violations.find((v) => v.code === "V09");

      expect(v09).toBeDefined();
      expect(v09?.severity).toBe("CRITICAL");
      expect(v09?.reported).toBe(30_000);
      expect(v09?.expected).toBe(0);
    });

    it("should NOT trigger V09 when JKM is not deducted (correct)", () => {
      const input: ViolationInput = {
        grossSalary: 8_000_000,
        reportedPPh21: 200_000,
        reportedJhtEmployee: 160_000,
        reportedJpEmployee: 80_000,
        reportedBpjsKesEmployee: 80_000,
        reportedJkkEmployee: 0,
        reportedJkmEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v09 = violations.find((v) => v.code === "V09");

      expect(v09).toBeUndefined();
    });
  });

  describe("V10 — Total deductions exceed 50% of gross (PP 36/2021 Pasal 65)", () => {
    it("should NOT detect V10 when deductions are 19% of gross (below 50% threshold)", () => {
      const input: ViolationInput = {
        grossSalary: 8_000_000,
        reportedPPh21: 1_200_000,
        reportedJhtEmployee: 160_000,
        reportedJpEmployee: 80_000,
        reportedBpjsKesEmployee: 80_000,
        reportedJkkEmployee: 0,
        reportedJkmEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v10 = violations.find((v) => v.code === "V10");

      // 1.52M total deductions / 8M gross = 19% — below 50% threshold
      expect(v10).toBeUndefined();
    });

    it("should NOT detect V10 when deductions are 40% of gross (below 50% threshold)", () => {
      const input: ViolationInput = {
        grossSalary: 10_000_000,
        reportedPPh21: 2_000_000,
        reportedJhtEmployee: 1_000_000,
        reportedJpEmployee: 500_000,
        reportedBpjsKesEmployee: 500_000,
        reportedJkkEmployee: 0,
        reportedJkmEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v10 = violations.find((v) => v.code === "V10");

      // 4M / 10M = 40% — below 50%, should NOT trigger
      expect(v10).toBeUndefined();
    });

    it("should detect V10 when deductions are 60%", () => {
      const input: ViolationInput = {
        grossSalary: 10_000_000,
        reportedPPh21: 3_000_000,
        reportedJhtEmployee: 1_000_000,
        reportedJpEmployee: 500_000,
        reportedBpjsKesEmployee: 500_000,
        reportedJkkEmployee: 500_000,
        reportedJkmEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v10 = violations.find((v) => v.code === "V10");

      expect(v10).toBeDefined();
      expect(v10?.severity).toBe("CRITICAL");
    });
  });

  describe("Edge cases", () => {
    it("should handle zero gross salary", () => {
      const input: ViolationInput = {
        grossSalary: 0,
        reportedPPh21: 0,
        reportedJhtEmployee: 0,
        reportedJpEmployee: 0,
        reportedBpjsKesEmployee: 0,
        cityUMK: 5_000_000,
        hasNPWP: true,
      };

      const violations = detectViolations(input);
      const v06 = violations.find((v) => v.code === "V06");

      expect(v06).toBeDefined();
      expect(v06?.severity).toBe("CRITICAL");
    });

    it("should cap BPJS calculations at cityUMK * 10", () => {
      const input: ViolationInput = {
        grossSalary: 100_000_000,
        reportedPPh21: 5_000_000,
        reportedJhtEmployee: 1_000_000,
        reportedJpEmployee: 500_000,
        reportedBpjsKesEmployee: 120_000,
        cityUMK: 5_000_000,
        hasNPWP: true,
        expectedJhtEmployee: 1_000_000,
        expectedJpEmployee: 500_000,
        expectedBpjsKesEmployee: 120_000,
        expectedPPh21: 5_000_000,
      };

      const violations = detectViolations(input);
      // With high salary, should not trigger V01/V02 since ceiling is UMK*10
      const v01 = violations.find((v) => v.code === "V01");
      expect(v01).toBeUndefined();
    });
  });
});