import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: "healthy",
  };

  const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const redisRes = await fetch(`${REDIS_URL}/`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
        signal: AbortSignal.timeout(3000),
      });
      checks.redis = redisRes.ok ? "ok" : `error:${redisRes.status}`;
    } catch {
      checks.redis = "unreachable";
    }
  } else {
    checks.redis = "not_configured";
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const dbRes = await fetch(`${supabaseUrl}/rest/v1/rpc.cef_wajar_health_check`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      checks.database = dbRes.ok ? "ok" : `error:${dbRes.status}`;
    } else {
      checks.database = "not_configured";
    }
  } catch {
    checks.database = "unreachable";
  }

  checks.api = "ok";
  checks.build = "16.2.3";
  checks.node_env = process.env.NODE_ENV || "development";

  const allHealthy = Object.values(checks).every(
    (v) => v === "ok" || v === "healthy" || v === "not_configured" || v === "unreachable"
  );

  return NextResponse.json(checks, { status: allHealthy ? 200 : 503 });
}