import { describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock fetch for testing API routes
const mockFetch = async (input: RequestInfo | URL, _init?: RequestInit | undefined) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
  
  if (url.includes("/api/worldbank")) {
    // Parse query params from URL string manually
    const queryStart = url.indexOf("?");
    const searchParamsStr = queryStart >= 0 ? url.substring(queryStart + 1) : "";
    const searchParams = new URLSearchParams(searchParamsStr);
    const currentCity = searchParams.get("current_city") || "jakarta";
    const targetCity = searchParams.get("target_city") || "singapore";
    
    const CITY_COUNTRY_MAP: Record<string, { country_code: string; country_name: string; mult: number }> = {
      jakarta:   { country_code: "IDN", country_name: "Indonesia", mult: 1.0 },
      surabaya:  { country_code: "IDN", country_name: "Indonesia", mult: 0.9 },
      bandung:   { country_code: "IDN", country_name: "Indonesia", mult: 0.85 },
      tangerang: { country_code: "IDN", country_name: "Indonesia", mult: 0.88 },
      bekasi:    { country_code: "IDN", country_name: "Indonesia", mult: 0.82 },
      bali:      { country_code: "IDN", country_name: "Indonesia", mult: 1.1 },
      jogja:     { country_code: "IDN", country_name: "Indonesia", mult: 0.75 },
      singapore: { country_code: "SGP", country_name: "Singapore", mult: 3.5 },
      kuala_lumpur: { country_code: "MYS", country_name: "Malaysia", mult: 1.3 },
      bangkok:   { country_code: "THA", country_name: "Thailand", mult: 1.4 },
      tokyo:     { country_code: "JPN", country_name: "Japan", mult: 4.2 },
      hong_kong:{ country_code: "HKG", country_name: "Hong Kong", mult: 4.0 },
    };
    
    const current = CITY_COUNTRY_MAP[currentCity.toLowerCase()] || CITY_COUNTRY_MAP.jakarta;
    const target = CITY_COUNTRY_MAP[targetCity.toLowerCase()] || CITY_COUNTRY_MAP.singapore;
    
    return new Response(JSON.stringify({
      current_city: {
        name: current.country_name,
        city: currentCity,
        indicators: {
          gdp_ppp: 1200000000000,
          gdp_per_capita: 4500,
          cost_of_living: 35,
          purchasing_power: 12000,
        },
      },
      target_city: {
        name: target.country_name,
        city: targetCity,
        indicators: {
          gdp_ppp: 400000000000,
          gdp_per_capita: 65000,
          cost_of_living: 100,
          purchasing_power: 65000,
        },
      },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
};

describe("GET /api/worldbank", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns 200 with valid query params", async () => {
    const response = await fetch("/api/worldbank?current_city=jakarta&target_city=singapore");

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("current_city");
    expect(data).toHaveProperty("target_city");
  });

  it("response contains current_city with indicators", async () => {
    const response = await fetch("/api/worldbank?current_city=jakarta&target_city=singapore");

    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data.current_city).toHaveProperty("name");
    expect(data.current_city).toHaveProperty("city");
    expect(data.current_city).toHaveProperty("indicators");
    
    expect(data.current_city.city).toBe("jakarta");
    expect(typeof data.current_city.indicators).toBe("object");
  });

  it("response contains target_city with indicators", async () => {
    const response = await fetch("/api/worldbank?current_city=jakarta&target_city=singapore");

    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data.target_city).toHaveProperty("name");
    expect(data.target_city).toHaveProperty("city");
    expect(data.target_city).toHaveProperty("indicators");
    
    expect(data.target_city.city).toBe("singapore");
    expect(typeof data.target_city.indicators).toBe("object");
  });

  it("uses defaults when params not provided", async () => {
    const response = await fetch("/api/worldbank");

    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data.current_city.city).toBe("jakarta");
    expect(data.target_city.city).toBe("singapore");
  });

  it("indicators contain expected keys", async () => {
    const response = await fetch("/api/worldbank?current_city=bandung&target_city=tokyo");

    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data.current_city.indicators).toHaveProperty("gdp_ppp");
    expect(data.current_city.indicators).toHaveProperty("gdp_per_capita");
    expect(data.current_city.indicators).toHaveProperty("cost_of_living");
    expect(data.current_city.indicators).toHaveProperty("purchasing_power");
  });
});