import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const commit = process.env.COMMIT_SHA || process.env.BUILD_COMMIT || 'unknown'
  const buildTime = process.env.BUILD_TIME || new Date().toISOString()
  
  return NextResponse.json(
    {
      status: 'ok',
      commit,
      buildTime,
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      phase: process.env.PHASE || 'stage2',
      services: {
        synthients: process.env.SYNTHIENTS_ACTIVE === '1' ? 'active' : 'inactive',
        training: process.env.TRAINING_ENABLED === '1' ? 'enabled' : 'disabled',
        governance: process.env.GOVERNANCE_MODE || 'dual-consensus'
      }
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