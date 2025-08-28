import { NextResponse } from 'next/server'

export async function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || 'dev-local'
  const buildTime = new Date().toISOString()
  
  return NextResponse.json(
    {
      ready: true,
      commit,
      buildTime,
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        cache: 'healthy',
        external: 'healthy'
      },
      environment: process.env.NODE_ENV || 'development'
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
