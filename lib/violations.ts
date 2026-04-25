/**
 * Violation detection for payroll compliance checking.
 * Based on reference V01-V07 violation codes.
 */

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM";

export interface Violation {
  code: string;
  severity: Severity;
  message: string;
  expected: number;
  reported: number;
  difference: number;
}

export interface ViolationInput {
  grossSalary: number;
  reportedPPh21: number;
  reportedJhtEmployee: number;
  reportedJpEmployee: number;
  reportedBpjsKesEmployee: number;
  cityUMK: number;
  hasNPWP: boolean;
  expectedJhtEmployee?: number;
  expectedJpEmployee?: number;
  expectedBpjsKesEmployee?: number;
  expectedPPh21?: number;
}

/**
 * Detect all violations based on payroll input.
 */
export function detectViolations(input: ViolationInput): Violation[] {
  const violations: Violation[] = [];

  const {
    grossSalary,
    reportedPPh21,
    reportedJhtEmployee,
    reportedJpEmployee,
    reportedBpjsKesEmployee,
    cityUMK,
    hasNPWP,
    expectedJhtEmployee,
    expectedJpEmployee,
    expectedBpjsKesEmployee,
    expectedPPh21,
  } = input;

  const bpjsCeiling = Math.min(grossSalary, cityUMK * 10);

  // V01: BPJS JHT missing entirely
  // JHT employee contribution is 2% of salary (capped at UMK * 10)
  const v01JhtExpected = Math.floor(bpjsCeiling * 0.02);
  if (expectedJhtEmployee !== undefined && expectedJhtEmployee > 0 && reportedJhtEmployee === 0) {
    violations.push({
      code: "V01",
      severity: "CRITICAL",
      message: "BPJS JHT tidak dibayarkan sama sekali",
      expected: v01JhtExpected,
      reported: 0,
      difference: v01JhtExpected,
    });
  }

  // V02: BPJS any component underpaid
  // Check JHT
  if (expectedJhtEmployee !== undefined && reportedJhtEmployee < expectedJhtEmployee) {
    violations.push({
      code: "V02",
      severity: "HIGH",
      message: "BPJS JHT kurang bayar",
      expected: expectedJhtEmployee,
      reported: reportedJhtEmployee,
      difference: expectedJhtEmployee - reportedJhtEmployee,
    });
  }

  // Check JP
  if (expectedJpEmployee !== undefined && reportedJpEmployee < expectedJpEmployee) {
    violations.push({
      code: "V02",
      severity: "HIGH",
      message: "BPJS JP kurang bayar",
      expected: expectedJpEmployee,
      reported: reportedJpEmployee,
      difference: expectedJpEmployee - reportedJpEmployee,
    });
  }

  // Check BPJS Kesehatan
  if (expectedBpjsKesEmployee !== undefined && reportedBpjsKesEmployee < expectedBpjsKesEmployee) {
    violations.push({
      code: "V02",
      severity: "HIGH",
      message: "BPJS Kesehatan kurang bayar",
      expected: expectedBpjsKesEmployee,
      reported: reportedBpjsKesEmployee,
      difference: expectedBpjsKesEmployee - reportedBpjsKesEmployee,
    });
  }

  // V03: PPh21 not withheld despite liability
  // If salary is above PTKP threshold, PPh21 should be withheld
  const ptkpThreshold = hasNPWP ? 54_000_000 / 12 : 54_000_000 / 12; // Monthly PTKP for TK0
  if (grossSalary > ptkpThreshold && reportedPPh21 === 0) {
    violations.push({
      code: "V03",
      severity: "CRITICAL",
      message: "PPh21 tidak dipotong padahal ada kewajiban",
      expected: expectedPPh21 ?? 0,
      reported: 0,
      difference: expectedPPh21 ?? 0,
    });
  }

  // V04: PPh21 underpaid > IDR 50K
  if (expectedPPh21 !== undefined && reportedPPh21 > 0) {
    const underpayment = expectedPPh21 - reportedPPh21;
    if (underpayment > 50_000) {
      violations.push({
        code: "V04",
        severity: "HIGH",
        message: "PPh21 kurang bayar lebih dari Rp50.000",
        expected: expectedPPh21,
        reported: reportedPPh21,
        difference: underpayment,
      });
    }
  }

  // V05: BPJS Kesehatan missing
  const v05BpjsKesExpected = Math.min(Math.floor(bpjsCeiling * 0.01), 120_000);
  if (expectedBpjsKesEmployee !== undefined && expectedBpjsKesEmployee > 0 && reportedBpjsKesEmployee === 0) {
    violations.push({
      code: "V05",
      severity: "CRITICAL",
      message: "BPJS Kesehatan tidak dibayarkan",
      expected: v05BpjsKesExpected,
      reported: 0,
      difference: v05BpjsKesExpected,
    });
  }

  // V06: Salary below UMK — ILLEGAL
  if (grossSalary < cityUMK) {
    violations.push({
      code: "V06",
      severity: "CRITICAL",
      message: "Gaji di bawah UMK — ILEGAL",
      expected: cityUMK,
      reported: grossSalary,
      difference: cityUMK - grossSalary,
    });
  }

  // V07: BPJS JP missing
  const v07JpExpected = Math.floor(bpjsCeiling * 0.01);
  if (expectedJpEmployee !== undefined && expectedJpEmployee > 0 && reportedJpEmployee === 0) {
    violations.push({
      code: "V07",
      severity: "CRITICAL",
      message: "BPJS JP tidak dibayarkan",
      expected: v07JpExpected,
      reported: 0,
      difference: v07JpExpected,
    });
  }

  return violations;
}