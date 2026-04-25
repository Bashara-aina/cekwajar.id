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
    const { job_title, city, experience_years } = await request.json();

    if (!job_title || !city) {
      return NextResponse.json(
        { error: "job_title and city are required" },
        { status: 400 }
      );
    }

    // Query Supabase for salary benchmarks
    // k-anonymity: only return if sample_count >= 10
    const { data, error } = await supabaseAdmin
      .from("salary_benchmarks")
      .select(
        `
        job_title,
        city,
        industry,
        experience_years,
        p50_idr,
        p75_idr,
        p90_idr,
        sample_count
      `
      )
      .ilike("job_title", `%${job_title}%`)
      .ilike("city", `%${city}%`)
      .gte("sample_count", 10)
      .limit(5);

    if (error) {
      const duration = Date.now() - startTime;
      logger("error", "Salary benchmark query failed", { route: "/api/salary-benchmark", error: error.message, duration });
      return NextResponse.json(
        { error: "Failed to fetch salary benchmark" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      const duration = Date.now() - startTime;
      logger("info", "No salary benchmark data found", { route: "/api/salary-benchmark", duration });
      return NextResponse.json({
        benchmark: null,
        message: "No benchmark data available for this role. Consider contributing your salary data.",
      });
    }

    // Find best match by experience years
    const closest = data.reduce((prev, curr) =>
      Math.abs(curr.experience_years - experience_years) <
      Math.abs(prev.experience_years - experience_years)
        ? curr
        : prev
    );

    const duration = Date.now() - startTime;
    logger("info", "Salary benchmark found", { route: "/api/salary-benchmark", duration });

    return NextResponse.json({
      benchmark: {
        job_title: closest.job_title,
        city: closest.city,
        p50_idr: closest.p50_idr,
        p75_idr: closest.p75_idr,
        p90_idr: closest.p90_idr,
        sample_count: closest.sample_count,
      },
      message: `Benchmark data from ${closest.sample_count} salary records`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger("error", "Salary benchmark lookup failed", { route: "/api/salary-benchmark", error: errorMessage, duration });
    return NextResponse.json(
      { error: "Salary benchmark lookup failed" },
      { status: 500 }
    );
  }
}
