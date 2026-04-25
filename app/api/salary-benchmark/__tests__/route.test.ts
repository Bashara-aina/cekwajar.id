import { describe, it, expect, beforeEach, vi } from "vitest";

// Build mock chain for: supabaseAdmin.from("salary_benchmarks").select(...).ilike().ilike().gte().limit()

const mockLimit = vi.fn();
const mockGte = vi.fn().mockReturnValue({ limit: mockLimit });
const mockIlikeCity = vi.fn().mockReturnValue({ gte: mockGte });
const mockIlikeJob = vi.fn().mockReturnValue({ ilike: mockIlikeCity });
const mockSelect = vi.fn().mockReturnValue({ ilike: mockIlikeJob });
const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

vi.mock("@/lib/supabase/server", () => ({
  supabaseAdmin: {
    from: mockFrom,
  },
}));

describe("POST /api/salary-benchmark", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when job_title is missing", async () => {
    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({ city: "jakarta" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("job_title and city are required");
  });

  it("returns 400 when city is missing", async () => {
    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({ job_title: "engineer" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("job_title and city are required");
  });

  it("returns 400 when both job_title and city are missing", async () => {
    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({}),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("job_title and city are required");
  });

  it("returns benchmark data when valid data found", async () => {
    mockLimit.mockResolvedValueOnce({
      data: [
        {
          job_title: "Software Engineer",
          city: "Jakarta",
          industry: "Tech",
          experience_years: 5,
          p50_idr: 15_000_000,
          p75_idr: 20_000_000,
          p90_idr: 28_000_000,
          sample_count: 50,
        },
      ],
      error: null,
    });

    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        job_title: "engineer",
        city: "jakarta",
        experience_years: 4,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.benchmark).toBeDefined();
    expect(body.benchmark).toHaveProperty("job_title");
    expect(body.benchmark).toHaveProperty("city");
    expect(body.benchmark).toHaveProperty("p50_idr");
    expect(body.benchmark).toHaveProperty("p75_idr");
    expect(body.benchmark).toHaveProperty("p90_idr");
    expect(body.benchmark).toHaveProperty("sample_count");
  });

  it("selects closest experience_years match", async () => {
    mockLimit.mockResolvedValueOnce({
      data: [
        {
          job_title: "Software Engineer",
          city: "Jakarta",
          experience_years: 5,
          p50_idr: 15_000_000,
          p75_idr: 20_000_000,
          p90_idr: 28_000_000,
          sample_count: 50,
        },
        {
          job_title: "Software Engineer",
          city: "Jakarta",
          experience_years: 1,
          p50_idr: 8_000_000,
          p75_idr: 10_000_000,
          p90_idr: 14_000_000,
          sample_count: 20,
        },
      ],
      error: null,
    });

    const { POST } = await import("../route");
    // Request with 4 years experience — 5 years record is closest (diff=1)
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        job_title: "engineer",
        city: "jakarta",
        experience_years: 4,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    // 4 years: 5 years diff=1, 1 year diff=3 → picks 5 years record
    // Route maps experience_years to p50/p75/p90, not exposed directly
    // But the data should come from the 5-year record with p50 of 15M
    expect(body.benchmark).toHaveProperty("p50_idr", 15_000_000);
  });

  it("returns null benchmark when no data available", async () => {
    mockLimit.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        job_title: "unknown_role_xyz",
        city: "unknown_city",
        experience_years: 5,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.benchmark).toBeNull();
    expect(body.message).toContain("No benchmark data available");
  });

  it("returns 500 when database query returns error", async () => {
    mockLimit.mockResolvedValueOnce({
      data: null,
      error: { message: "Database connection failed", code: "CONNECTION_ERROR" },
    });

    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        job_title: "engineer",
        city: "jakarta",
        experience_years: 5,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to fetch salary benchmark");
  });

  it("includes message with sample count on success", async () => {
    mockLimit.mockResolvedValueOnce({
      data: [
        {
          job_title: "Data Scientist",
          city: "Bandung",
          experience_years: 2,
          p50_idr: 9_000_000,
          p75_idr: 12_000_000,
          p90_idr: 16_000_000,
          sample_count: 15,
        },
      ],
      error: null,
    });

    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        job_title: "data scientist",
        city: "bandung",
        experience_years: 2,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toContain("15"); // sample count
    expect(body.message).toContain("salary records");
  });

  it("returns 500 when exception is thrown", async () => {
    mockLimit.mockRejectedValueOnce(new Error("Unexpected error"));

    const { POST } = await import("../route");
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        job_title: "engineer",
        city: "jakarta",
        experience_years: 5,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Salary benchmark lookup failed");
  });
});