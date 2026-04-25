import { NextRequest, NextResponse } from "next/server";

const WB_INDICATORS: Record<string, string> = {
  gdp_ppp: "NY.GDP.MKTP.PP.CD",        // GDP PPP (current international $)
  gdp_per_capita: "NY.GDP.PCAP.CD",    // GDP per capita (current US$)
  cost_of_living: "PA.NUS.PRVT.GD",    // Price level ratio (US=100)
  purchasing_power: "NY.GDP.PCAP.PP.CD", // GDP per capita, PPP
};

// City to country + approximate multiplier for cost-of-living
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

async function fetchWorldBankIndicator(
  indicator: string,
  countryCode: string
): Promise<{ year: number; value: number | null }[]> {
  const year = new Date().getFullYear();
  const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json&date=${year - 2}:${year}&per_page=20`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 2) return [];
    return (data[1] as Array<{ date: string; value: number | null }>).map(
      (d) => ({ year: parseInt(d.date), value: d.value })
    );
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const currentCity = searchParams.get("current_city") || "jakarta";
  const targetCity = searchParams.get("target_city") || "singapore";

  const current = CITY_COUNTRY_MAP[currentCity.toLowerCase()] || CITY_COUNTRY_MAP.jakarta;
  const target = CITY_COUNTRY_MAP[targetCity.toLowerCase()] || CITY_COUNTRY_MAP.singapore;

  // Fetch both cities in parallel
  const [currentIndicators, targetIndicators] = await Promise.all([
    Promise.all(
      Object.entries(WB_INDICATORS).map(async ([key, indicator]) => ({
        key,
        data: await fetchWorldBankIndicator(indicator, current.country_code),
      }))
    ),
    Promise.all(
      Object.entries(WB_INDICATORS).map(async ([key, indicator]) => ({
        key,
        data: await fetchWorldBankIndicator(indicator, target.country_code),
      }))
    ),
  ]);

  const buildIndicators = (
    results: { key: string; data: { year: number; value: number | null }[] }[]
  ) =>
    Object.fromEntries(
      results.map(({ key, data }) => {
        const latest = data.sort((a, b) => b.year - a.year)[0];
        return [key, latest?.value ?? null];
      })
    );

  const currentData = buildIndicators(currentIndicators);
  const targetData = buildIndicators(targetIndicators);

  return NextResponse.json({
    current_city: {
      name: current.country_name,
      city: currentCity,
      indicators: currentData,
    },
    target_city: {
      name: target.country_name,
      city: targetCity,
      indicators: targetData,
    },
  });
}
