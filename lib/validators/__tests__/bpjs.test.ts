import { describe, it, expect } from "vitest";
import { BPJSInputSchema, COLInputSchema } from "@/lib/validators/pph21.schema";

describe("BPJSInputSchema", () => {
  it("accepts valid input", () => {
    const input = {
      grossMonthly: 8500000,
      city: "jakarta",
    };
    expect(() => BPJSInputSchema.parse(input)).not.toThrow();
  });

  it("rejects zero grossMonthly", () => {
    const input = {
      grossMonthly: 0,
      city: "surabaya",
    };
    expect(() => BPJSInputSchema.parse(input)).toThrow();
  });

  it("rejects negative grossMonthly", () => {
    const input = {
      grossMonthly: -1000,
      city: "jakarta",
    };
    expect(() => BPJSInputSchema.parse(input)).toThrow();
  });

  it("rejects non-numeric grossMonthly", () => {
    const input = {
      grossMonthly: "not a number" as unknown as number,
      city: "jakarta",
    };
    expect(() => BPJSInputSchema.parse(input)).toThrow();
  });

  it("rejects missing grossMonthly", () => {
    const input = {
      city: "jakarta",
    } as Record<string, unknown>;
    expect(() => BPJSInputSchema.parse(input)).toThrow();
  });

  it("rejects missing city", () => {
    const input = {
      grossMonthly: 8500000,
    } as Record<string, unknown>;
    expect(() => BPJSInputSchema.parse(input)).toThrow();
  });

  it("rejects empty city string", () => {
    const input = {
      grossMonthly: 8500000,
      city: "",
    };
    expect(() => BPJSInputSchema.parse(input)).toThrow();
  });

  it("accepts large grossMonthly values", () => {
    const input = {
      grossMonthly: 100000000,
      city: "tokyo",
    };
    expect(() => BPJSInputSchema.parse(input)).not.toThrow();
  });
});

describe("COLInputSchema", () => {
  it("accepts valid input", () => {
    const input = {
      currentCity: "jakarta",
      targetCity: "singapore",
    };
    expect(() => COLInputSchema.parse(input)).not.toThrow();
  });

  it("rejects empty currentCity", () => {
    const input = {
      currentCity: "",
      targetCity: "singapore",
    };
    expect(() => COLInputSchema.parse(input)).toThrow();
  });

  it("rejects empty targetCity", () => {
    const input = {
      currentCity: "jakarta",
      targetCity: "",
    };
    expect(() => COLInputSchema.parse(input)).toThrow();
  });

  it("rejects missing currentCity", () => {
    const input = {
      targetCity: "singapore",
    } as Record<string, unknown>;
    expect(() => COLInputSchema.parse(input)).toThrow();
  });

  it("rejects missing targetCity", () => {
    const input = {
      currentCity: "jakarta",
    } as Record<string, unknown>;
    expect(() => COLInputSchema.parse(input)).toThrow();
  });

  it("accepts different city names", () => {
    const input = {
      currentCity: "surabaya",
      targetCity: "tokyo",
    };
    expect(() => COLInputSchema.parse(input)).not.toThrow();
  });

  it("accepts same city for both fields", () => {
    const input = {
      currentCity: "jakarta",
      targetCity: "jakarta",
    };
    expect(() => COLInputSchema.parse(input)).not.toThrow();
  });
});