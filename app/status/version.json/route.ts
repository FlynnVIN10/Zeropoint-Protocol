import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const commit = process.env.COMMIT_SHA || process.env.BUILD_COMMIT || 'unknown'
  const buildTime = process.env.BUILD_TIME || new Date().toISOString()
  const env = process.env.NODE_ENV || 'development'

  return NextResponse.json(
    {
      commit,
      buildTime,
      env,
      status: 'operational',
      version: '2.0.0',
      phase: process.env.PHASE || 'stage2'
    },
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    }
  )
}

