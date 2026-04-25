import { NextRequest, NextResponse } from "next/server";
import { PayslipInputSchema } from "@/lib/validators/pph21.schema";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/middleware/rateLimit";
import { logger } from "@/lib/logger";
import { calculatePPh21, getUMK, PTKP_VALUES } from "@/lib/calculators";
import { detectViolations } from "@/lib/violations";

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
    const body = await request.json();
    const input = PayslipInputSchema.parse(body);

    const isDecember = input.month === 12;

    // Calculate PPh21 directly using local calculator
    const monthlyPPh21 = calculatePPh21(
      input.gross_monthly,
      input.ptkp_status,
      input.npwp,
      isDecember
    );

    const annualGross = input.gross_monthly * 12;
    const ptkp = PTKP_VALUES[input.ptkp_status] ?? PTKP_VALUES["TK0"];
    const cityUMK = getUMK(input.city);

    // Detect violations if reported_pph21 is provided
    const violations = detectViolations({
      grossSalary: input.gross_monthly,
      reportedPPh21: input.reported_pph21 ?? 0,
      reportedJhtEmployee: 0,
      reportedJpEmployee: 0,
      reportedBpjsKesEmployee: 0,
      cityUMK,
      hasNPWP: input.npwp,
      expectedJhtEmployee: Math.floor(Math.min(input.gross_monthly, cityUMK * 10) * 0.02),
      expectedJpEmployee: Math.floor(Math.min(input.gross_monthly, cityUMK * 10) * 0.01),
      expectedBpjsKesEmployee: Math.min(
        Math.floor(Math.min(input.gross_monthly, cityUMK * 10) * 0.01),
        120_000
      ),
      expectedPPh21: monthlyPPh21,
    });

    // Log verdict (anon hashed, no PII)
    const inputHash = await hashInput(JSON.stringify(input));
    await supabaseAdmin.rpc("log_verdict", {
      p_tool_name: "slip",
      p_input_hash: inputHash,
      p_verdict_code: violations[0]?.code ?? "OK",
      p_idr_shortfall: violations.find((v) => v.code === "V04")?.difference ?? null,
    });

    const duration = Date.now() - startTime;
    logger("info", "PPh21 calculation successful", { route: "/api/pph21", duration });

    return NextResponse.json({
      monthly_pph21: monthlyPPh21,
      annual_gross: annualGross,
      ptkp,
      violations,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger("error", "PPh21 calculation failed", { route: "/api/pph21", error: errorMessage, duration });
    return NextResponse.json(
      { error: "Invalid input or calculation failed" },
      { status: 400 }
    );
  }
}

async function hashInput(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}
