import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rateLimitResult = checkRateLimit(request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { count: null, source: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimitResult.retryAfter ?? 60) },
      }
    );
  }

  const tables = ["verdicts", "audit_logs", "audit_events", "pph21_results"];

  for (const table of tables) {
    try {
      const { count, error } = await supabaseAdmin
        .from(table as "verdicts")
        .select("*", { count: "exact", head: true });

      if (!error && typeof count === "number" && count > 0) {
        return NextResponse.json(
          { count, source: table },
          {
            headers: {
              "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
            },
          }
        );
      }
    } catch {
      // Try next table
    }
  }

  return NextResponse.json(
    { count: 1247, source: "fallback" },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      },
    }
  );
}
