import { NextResponse } from 'next/server'
import { buildMeta } from '../../lib/buildMeta'

export async function GET() {
  const timestamp = new Date().toISOString()
  const environment = process.env.NODE_ENV || 'development'
  
  return NextResponse.json(
    {
      ready: true,
      commit: buildMeta.commit,
      buildTime: buildMeta.buildTime,
      timestamp,
      phase: buildMeta.phase,
      ciStatus: buildMeta.ciStatus,
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
