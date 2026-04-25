import { NextRequest, NextResponse } from "next/server";
import { calculateBPJS } from "@/lib/calculators";
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
    const { gross_monthly, city } = await request.json();

    if (!gross_monthly || !city) {
      return NextResponse.json(
        { error: "gross_monthly and city are required" },
        { status: 400 }
      );
    }

    const result = calculateBPJS(Number(gross_monthly), String(city));

    const duration = Date.now() - startTime;
    logger("info", "BPJS calculation successful", { route: "/api/bpjs", duration });

    return NextResponse.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger("error", "BPJS calculation failed", { route: "/api/bpjs", error: errorMessage, duration });
    return NextResponse.json(
      { error: "BPJS calculation failed" },
      { status: 500 }
    );
  }
}
