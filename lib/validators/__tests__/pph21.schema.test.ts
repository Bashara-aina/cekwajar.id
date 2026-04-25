import { describe, it, expect } from "vitest";
import { PayslipInputSchema, PropertyInputSchema, SalaryBenchmarkInputSchema } from "@/lib/validators/pph21.schema";

describe("PayslipInputSchema", () => {
  it("accepts valid TK0 input", () => {
    const input = {
      gross_monthly: 8500000,
      ptkp_status: "TK0" as const,
      npwp: true,
      month: 6,
      year: 2024,
      city: "Jakarta",
    };
    expect(() => PayslipInputSchema.parse(input)).not.toThrow();
  });

  it("accepts optional reported_pph21", () => {
    const input = {
      gross_monthly: 10000000,
      ptkp_status: "K1" as const,
      npwp: false,
      month: 1,
      year: 2024,
      city: "Surabaya",
      reported_pph21: 150000,
    };
    expect(() => PayslipInputSchema.parse(input)).not.toThrow();
  });

  it("rejects negative gross_monthly", () => {
    const input = {
      gross_monthly: -1000,
      ptkp_status: "TK0" as const,
      npwp: true,
      month: 6,
      year: 2024,
      city: "Jakarta",
    };
    expect(() => PayslipInputSchema.parse(input)).toThrow();
  });

  it("rejects invalid ptkp_status", () => {
    const input = {
      gross_monthly: 8500000,
      ptkp_status: "INVALID" as unknown as "TK0" | "K0" | "K1" | "K2" | "K3",
      npwp: true,
      month: 6,
      year: 2024,
      city: "Jakarta",
    };
    expect(() => PayslipInputSchema.parse(input)).toThrow();
  });

  it("rejects month outside 1-12", () => {
    const input = {
      gross_monthly: 8500000,
      ptkp_status: "TK0" as const,
      npwp: true,
      month: 13,
      year: 2024,
      city: "Jakarta",
    };
    expect(() => PayslipInputSchema.parse(input)).toThrow();
  });
});

describe("PropertyInputSchema", () => {
  it("accepts valid tanah input", () => {
    const input = {
      city: "Jakarta Selatan",
      property_type: "tanah" as const,
      price: 500000000,
      area_m2: 120,
    };
    expect(() => PropertyInputSchema.parse(input)).not.toThrow();
  });

  it("rejects invalid property_type", () => {
    const input = {
      city: "Jakarta",
      property_type: "invalid" as unknown as "rumah" | "tanah" | "apartemen" | "ruko",
      price: 500000000,
      area_m2: 120,
    };
    expect(() => PropertyInputSchema.parse(input)).toThrow();
  });

  it("rejects zero area", () => {
    const input = {
      city: "Jakarta",
      property_type: "tanah" as const,
      price: 500000000,
      area_m2: 0,
    };
    expect(() => PropertyInputSchema.parse(input)).toThrow();
  });
});

describe("SalaryBenchmarkInputSchema", () => {
  it("accepts valid benchmark input", () => {
    const input = {
      job_title: "Software Engineer",
      city: "Jakarta",
      p50_idr: 12000000,
      experience_years: 3,
    };
    expect(() => SalaryBenchmarkInputSchema.parse(input)).not.toThrow();
  });

  it("accepts all optional fields", () => {
    const input = {
      job_title: "Data Scientist",
      city: "Bandung",
      province: "Jawa Barat",
      industry: "Fintech",
      experience_years: 5,
      p50_idr: 18000000,
      sample_count: 50,
    };
    expect(() => SalaryBenchmarkInputSchema.parse(input)).not.toThrow();
  });

  it("rejects negative experience_years", () => {
    const input = {
      job_title: "Engineer",
      city: "Jakarta",
      experience_years: -1,
      p50_idr: 12000000,
    };
    expect(() => SalaryBenchmarkInputSchema.parse(input)).toThrow();
  });
});