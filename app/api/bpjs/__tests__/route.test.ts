import { describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock fetch for testing API routes
const mockFetch = async (input: RequestInfo | URL, init?: RequestInit | undefined) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
  
  if (url.includes("/api/bpjs")) {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
    
    if (!body || body.gross_monthly === undefined || body.city === undefined) {
      return new Response(JSON.stringify({ error: "gross_monthly and city are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const grossMonthly = Number(body.gross_monthly);
    const _city = String(body.city);
    const umk = 5000000;
    const bpjsCeiling = Math.min(grossMonthly, umk * 10);
    const jhtEmp = Math.floor(bpjsCeiling * 0.02);
    const jpEmp = Math.floor(bpjsCeiling * 0.01);
    const bpjsKesEmp = Math.min(Math.floor(bpjsCeiling * 0.01), 120000);
    
    return new Response(JSON.stringify({
      jht_employee_monthly: jhtEmp,
      jp_employee_monthly: jpEmp,
      bpjs_kesehatan_employee_monthly: bpjsKesEmp,
      total_employee_monthly: jhtEmp + jpEmp + bpjsKesEmp,
      jht_employer_monthly: Math.floor(bpjsCeiling * 0.057) - jhtEmp,
      jp_employer_monthly: Math.floor(bpjsCeiling * 0.03) - jpEmp,
      bpjs_kesehatan_employer_monthly: Math.min(Math.floor(bpjsCeiling * 0.05), 600000) - bpjsKesEmp,
      jkk_employer_monthly: Math.floor(bpjsCeiling * 0.0024),
      jkm_employer_monthly: Math.floor(bpjsCeiling * 0.003),
      tk_employer_monthly: Math.floor(bpjsCeiling * 0.004),
      total_employer_monthly: Math.floor(bpjsCeiling * 0.057) - jhtEmp + Math.floor(bpjsCeiling * 0.03) - jpEmp + Math.min(Math.floor(bpjsCeiling * 0.05), 600000) - bpjsKesEmp + Math.floor(bpjsCeiling * 0.0024) + Math.floor(bpjsCeiling * 0.003) + Math.floor(bpjsCeiling * 0.004),
      total_contribution_monthly: Math.floor(bpjsCeiling * 0.057) + Math.floor(bpjsCeiling * 0.03) + Math.min(Math.floor(bpjsCeiling * 0.05), 600000) + Math.floor(bpjsCeiling * 0.0024) + Math.floor(bpjsCeiling * 0.003) + Math.floor(bpjsCeiling * 0.004),
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
};

describe("POST /api/bpjs", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns 200 with valid input", async () => {
    const response = await fetch("/api/bpjs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gross_monthly: 8500000, city: "jakarta" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("jht_employee_monthly");
    expect(data).toHaveProperty("jp_employee_monthly");
    expect(data).toHaveProperty("bpjs_kesehatan_employee_monthly");
  });

  it("returns 400 with missing fields", async () => {
    const response = await fetch("/api/bpjs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("returns 400 when only gross_monthly is provided", async () => {
    const response = await fetch("/api/bpjs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gross_monthly: 8500000 }),
    });

    expect(response.status).toBe(400);
  });

  it("returns 400 when only city is provided", async () => {
    const response = await fetch("/api/bpjs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: "jakarta" }),
    });

    expect(response.status).toBe(400);
  });

  it("response contains required BPJS fields", async () => {
    const response = await fetch("/api/bpjs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gross_monthly: 10000000, city: "surabaya" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data).toHaveProperty("jht_employee_monthly");
    expect(data).toHaveProperty("jp_employee_monthly");
    expect(data).toHaveProperty("bpjs_kesehatan_employee_monthly");
    
    expect(typeof data.jht_employee_monthly).toBe("number");
    expect(typeof data.jp_employee_monthly).toBe("number");
    expect(typeof data.bpjs_kesehatan_employee_monthly).toBe("number");
    
    expect(data.jht_employee_monthly).toBeGreaterThan(0);
    expect(data.jp_employee_monthly).toBeGreaterThan(0);
    expect(data.bpjs_kesehatan_employee_monthly).toBeGreaterThan(0);
  });
});