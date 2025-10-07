/**
 * Readiness check logic
 * Per CTO directive: Server-only readiness checks
 */

import { db } from '../db';

export interface ReadinessStatus {
  ready: boolean;
  checks: {
    db: boolean;
  };
  now: string;
}

export async function checkReadiness(): Promise<ReadinessStatus> {
  const checks = {
    db: false,
  };
  
  try {
    // Verify database connection
    await db.$queryRaw`SELECT 1`;
    checks.db = true;
  } catch {
    checks.db = false;
  }
  
  const ready = Object.values(checks).every(Boolean);
  
  return {
    ready,
    checks,
    now: new Date().toISOString(),
  };
}

