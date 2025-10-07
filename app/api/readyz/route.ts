import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;
    const checks = { db: true };
    const ready = Object.values(checks).every(Boolean);
    
    return NextResponse.json({
      ready,
      checks,
      now: new Date().toISOString()
    }, {
      status: ready ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json({
      ready: false,
      checks: { db: false },
      error: 'Database check failed',
      now: new Date().toISOString()
    }, {
      status: 503
    });
  }
}
