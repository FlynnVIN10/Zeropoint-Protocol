import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const commit = process.env.COMMIT_SHA || process.env.BUILD_COMMIT || 'unknown'
  const buildTime = process.env.BUILD_TIME || new Date().toISOString()
  const isReady = process.env.MOCKS_DISABLED === '1' && 
                  process.env.SYNTHIENTS_ACTIVE === '1' &&
                  process.env.TRAINING_ENABLED === '1'
  return NextResponse.json(
    {
      ready: isReady,
      commit,
      buildTime,
      timestamp: new Date().toISOString(),
      checks: {
        mocks_disabled: process.env.MOCKS_DISABLED === '1',
        synthients_active: process.env.SYNTHIENTS_ACTIVE === '1',
        training_enabled: process.env.TRAINING_ENABLED === '1',
        governance_mode: process.env.GOVERNANCE_MODE || 'dual-consensus'
      },
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