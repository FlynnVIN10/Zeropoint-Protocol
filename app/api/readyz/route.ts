import { NextResponse } from "next/server";
import { checkReadiness } from "@/server/checks/readiness";

export async function GET() {
  const status = await checkReadiness();
  
  return NextResponse.json(status, {
    status: status.ready ? 200 : 503,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
}
