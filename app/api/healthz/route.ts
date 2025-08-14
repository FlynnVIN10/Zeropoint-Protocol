import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      commit:
        process.env.NEXT_PUBLIC_COMMIT_SHA ||
        process.env.VERCEL_GIT_COMMIT_SHA ||
        'unknown',
      buildTime: process.env.BUILD_TIME || 'unknown',
    },
    { status: 200 }
  );
}
