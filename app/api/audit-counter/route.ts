import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { count: 1247 },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
