import { NextResponse } from "next/server";
import { checkHealth } from "@/server/checks/health";

export async function GET() {
  const status = await checkHealth();
  
  return NextResponse.json(status, {
    status: status.ok ? 200 : 503,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
}
