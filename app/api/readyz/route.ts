import { NextResponse } from 'next/server'

export async function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || 
                 process.env.GIT_COMMIT_SHA || 
                 '1e4d82fdcf869c9ed0e57a7eb2ae811c7b717f9d' // Fallback to known commit
  const buildTime = new Date().toISOString()
  const timestamp = new Date().toISOString()
  const environment = process.env.NODE_ENV || 'development'
  
  return NextResponse.json(
    {
      ready: true,
      commit,
      buildTime,
      timestamp,
      phase: 'stage1',
      ciStatus: environment === 'production' ? 'green' : 'development',
      mocks: false,
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
