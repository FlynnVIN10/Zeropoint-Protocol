/**
 * Health check logic
 * Per CTO directive: Server-only health checks
 */

import { db } from '../db';

export interface HealthStatus {
  ok: boolean;
  service: string;
  now: string;
  db?: boolean;
}

export async function checkHealth(): Promise<HealthStatus> {
  const status: HealthStatus = {
    ok: true,
    service: 'web',
    now: new Date().toISOString(),
  };
  
  try {
    // Simple DB ping
    await db.$queryRaw`SELECT 1`;
    status.db = true;
  } catch {
    status.db = false;
    status.ok = false;
  }
  
  return status;
}

