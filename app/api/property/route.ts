import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/middleware/rateLimit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = checkRateLimit(request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", retryAfter: rateLimitResult.retryAfter },
      { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfter ?? 60) } }
    );
  }

  const startTime = Date.now();

  try {
    const { city, property_type, price, area_m2 } = await request.json();

    if (!city || !property_type || !price || !area_m2) {
      return NextResponse.json(
        { error: "city, property_type, price, area_m2 are required" },
        { status: 400 }
      );
    }

    const inputPricePerM2 = price / area_m2;

    // Look up market price from Supabase
    const { data: marketData, error: dbError } = await supabaseAdmin
      .from("land_prices")
      .select("price_per_m2, sample_count")
      .eq("city", city)
      .eq("property_type", property_type)
      .limit(5);

    if (dbError) {
      const duration = Date.now() - startTime;
      logger("error", "Property lookup database error", { route: "/api/property", error: dbError.message, duration });
      throw dbError;
    }

    if (!marketData || marketData.length === 0) {
      const duration = Date.now() - startTime;
      logger("info", "No property data found", { route: "/api/property", duration });
      return NextResponse.json({
        price_per_m2: inputPricePerM2,
        market_price_per_m2: null,
        verdict: "TIDAK_TERSEDIA",
        verdict_code: "PROPERTY_NO_DATA",
        source: "user_input",
      });
    }

    // Weighted average by sample_count
    const totalSamples = marketData.reduce(
      (sum: number, r: { sample_count: number }) => sum + (r.sample_count || 1),
      0
    );
    const marketPricePerM2 =
      marketData.reduce(
        (sum: number, r: { price_per_m2: number; sample_count: number }) =>
          sum + (r.price_per_m2 * (r.sample_count || 1)) / totalSamples,
        0
      ) || null;

    const ratio = marketPricePerM2 ? inputPricePerM2 / marketPricePerM2 : null;
    const verdict = ratio
      ? ratio < 0.85
        ? "MURAH"
        : ratio > 1.15
        ? "MAHAMAL"
        : "WAJAR"
      : "TIDAK_TERSEDIA";

    const duration = Date.now() - startTime;
    logger("info", "Property lookup successful", { route: "/api/property", duration });

    return NextResponse.json({
      price_per_m2: inputPricePerM2,
      market_price_per_m2: marketPricePerM2,
      ratio: ratio ? (ratio - 1) * 100 : null, // % deviation from market
      verdict,
      verdict_code: `PROPERTY_${verdict}`,
      sample_count: totalSamples,
      source: "supabase_land_prices",
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger("error", "Property lookup failed", { route: "/api/property", error: errorMessage, duration });
    return NextResponse.json(
      { error: "Property lookup failed" },
      { status: 500 }
    );
  }
}
