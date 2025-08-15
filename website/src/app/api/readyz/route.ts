import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export function GET() {
  return NextResponse.json({
    ready: true,
    commit: process.env.NEXT_PUBLIC_COMMIT_SHA || 'unknown',
    buildTime: process.env.BUILD_TIME || 'unknown'
  });
}
