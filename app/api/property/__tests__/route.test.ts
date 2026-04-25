import { describe, it, expect, beforeEach, vi } from "vitest";

// Create a mock function that we'll configure per test
const mockLimit = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  supabaseAdmin: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: mockLimit,
          }),
        }),
      }),
    }),
  },
}));

describe("POST /api/property", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({}),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("city, property_type, price, area_m2 are required");
  });

  it("returns 400 when only some fields are provided", async () => {
    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({ city: "jakarta", price: 500_000_000 }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("city, property_type, price, area_m2 are required");
  });

  it("calculates price_per_m2 correctly from input", async () => {
    // Mock returns empty data - will use user input
    mockLimit.mockResolvedValueOnce({ data: [], error: null });

    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        city: "jakarta",
        property_type: "apartemen",
        price: 1_000_000_000,
        area_m2: 50,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.price_per_m2).toBe(20_000_000); // 1B / 50 = 20M
  });

  it("returns TIDAK_TERSEDIA when no market data exists", async () => {
    mockLimit.mockResolvedValueOnce({ data: [], error: null });

    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        city: "unknown",
        property_type: "apartemen",
        price: 500_000_000,
        area_m2: 50,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.verdict).toBe("TIDAK_TERSEDIA");
    expect(body.verdict_code).toBe("PROPERTY_NO_DATA");
    expect(body.market_price_per_m2).toBeNull();
    expect(body.source).toBe("user_input");
  });

  it("returns MURAH verdict when input price is below 85% of market", async () => {
    // Market price is 20M/m2, user pays 15M/m2 = 75% of market (below 85%)
    mockLimit.mockResolvedValueOnce({
      data: [{ price_per_m2: 20_000_000, sample_count: 50 }],
      error: null,
    });

    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        city: "jakarta",
        property_type: "apartemen",
        price: 750_000_000, // 15M/m2
        area_m2: 50,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.verdict).toBe("MURAH");
    expect(body.verdict_code).toBe("PROPERTY_MURAH");
    expect(body.market_price_per_m2).toBe(20_000_000);
  });

  it("returns MAHAMAL verdict when input price is above 115% of market", async () => {
    // Market price is 20M/m2, user pays 25M/m2 = 125% of market (above 115%)
    mockLimit.mockResolvedValueOnce({
      data: [{ price_per_m2: 20_000_000, sample_count: 50 }],
      error: null,
    });

    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        city: "jakarta",
        property_type: "apartemen",
        price: 1_250_000_000, // 25M/m2
        area_m2: 50,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.verdict).toBe("MAHAMAL");
    expect(body.verdict_code).toBe("PROPERTY_MAHAMAL");
  });

  it("returns WAJAR verdict when input price is within 85-115% of market", async () => {
    // Market price is 20M/m2, user pays 20M/m2 = 100% of market
    mockLimit.mockResolvedValueOnce({
      data: [{ price_per_m2: 20_000_000, sample_count: 50 }],
      error: null,
    });

    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        city: "jakarta",
        property_type: "apartemen",
        price: 1_000_000_000, // 20M/m2
        area_m2: 50,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.verdict).toBe("WAJAR");
    expect(body.verdict_code).toBe("PROPERTY_WAJAR");
  });

  it("calculates weighted average when multiple market data exists", async () => {
    // Two records: 10M with 10 samples, 20M with 30 samples
    // Weighted avg = (10M*10 + 20M*30) / 40 = 700M/40 = 17.5M
    mockLimit.mockResolvedValueOnce({
      data: [
        { price_per_m2: 10_000_000, sample_count: 10 },
        { price_per_m2: 20_000_000, sample_count: 30 },
      ],
      error: null,
    });

    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        city: "jakarta",
        property_type: "apartemen",
        price: 875_000_000, // 17.5M/m2 - right at market
        area_m2: 50,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.market_price_per_m2).toBe(17_500_000);
    expect(body.verdict).toBe("WAJAR");
    expect(body.sample_count).toBe(40);
  });

  it("returns ratio as percentage deviation from market", async () => {
    mockLimit.mockResolvedValueOnce({
      data: [{ price_per_m2: 20_000_000, sample_count: 50 }],
      error: null,
    });

    const { POST } = await import("../route");
    // Input price is 22M/m2 = 10% above market
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        city: "jakarta",
        property_type: "apartemen",
        price: 1_100_000_000, // 22M/m2
        area_m2: 50,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ratio).toBeCloseTo(10, 5); // 10% above market (floating point precision)
  });
});
