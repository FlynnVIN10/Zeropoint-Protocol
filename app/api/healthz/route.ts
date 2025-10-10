import { NextResponse } from "next/server";
import { getTrainerStatus } from "@/src/server/trainer";

export async function GET() {
  const trainerStatus = getTrainerStatus();
  
  return NextResponse.json({
    ok: true,
    service: "web",
    now: new Date().toISOString(),
    trainerPid: trainerStatus.running ? process.pid : null,
    runStatus: trainerStatus.running ? 'running' : 'stopped',
    runId: trainerStatus.runId
  }, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
}
