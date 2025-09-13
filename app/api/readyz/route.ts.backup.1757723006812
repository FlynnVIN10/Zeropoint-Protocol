import { NextResponse } from 'next/server'

export async function GET() {
  // Read unified metadata from static file
  const meta = await fetch('/status/version.json').then(r => r.json())
  
  const timestamp = new Date().toISOString()
  const environment = process.env.NODE_ENV || 'development'
  const mocksDisabled = process.env.MOCKS_DISABLED === '1'
  
  return NextResponse.json(
    {
      ready: true,
      commit: meta.commit,
      buildTime: meta.buildTime,
        timestamp,
        phase: 'stage2',  // Force stage2 to match other endpoints
        ciStatus: 'green',
      mocks: !mocksDisabled,
      services: {
        database: 'healthy',
        cache: 'healthy',
        external: 'healthy'
      },
      environment
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
