import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../route";

// Mock the supabaseAdmin module
vi.mock("@/lib/supabase/server", () => ({
  supabaseAdmin: {
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

describe("POST /api/pph21", () => {
  const validInput = {
    gross_monthly: 8500000,
    ptkp_status: "TK0" as const,
    npwp: true,
    month: 6,
    year: 2024,
    city: "Jakarta",
  };

  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it("returns 200 with valid input", async () => {
    const mockResponse = {
      monthly_pph21: 275000,
      annual_gross: 102000000,
      ppk: 54000000,
      violations: [] as Array<{ code: string; severity: string; message: string }>,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const request = new Request("http://localhost/api/pph21", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validInput),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("monthly_pph21");
    expect(data).toHaveProperty("annual_gross");
    expect(data).toHaveProperty("ptkp");
    expect(data).toHaveProperty("violations");
    expect(Array.isArray(data.violations)).toBe(true);
  });

  it("returns 400 when required fields are missing", async () => {
    const incompleteInput = {
      gross_monthly: 8500000,
      // missing ptkp_status, npwp, month, year, city
    };

    const request = new Request("http://localhost/api/pph21", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incompleteInput),
    });

    const response = await POST(request);
    const _data = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 400 with invalid ptkp_status", async () => {
    const invalidInput = {
      ...validInput,
      ptkp_status: "INVALID_STATUS" as typeof validInput.ptkp_status,
    };

    const request = new Request("http://localhost/api/pph21", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidInput),
    });

    const response = await POST(request);
    const _data = await response.json();

    expect(response.status).toBe(400);
  });

  it("response has monthly_pph21 and violations array", async () => {
    const mockResponse = {
      monthly_pph21: 350000,
      annual_gross: 120000000,
      ppk: 60000000,
      violations: [
        { code: "BRACKET", severity: "WARNING" as const, message: "Tax bracket discrepancy" },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const request = new Request("http://localhost/api/pph21", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validInput),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(typeof data.monthly_pph21).toBe("number");
    expect(Array.isArray(data.violations)).toBe(true);
    expect(data.violations.length).toBeGreaterThan(0);
    expect(data.violations[0]).toHaveProperty("code");
    expect(data.violations[0]).toHaveProperty("severity");
    expect(data.violations[0]).toHaveProperty("message");
  });
});