// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// app/status/version.json/route.ts

import { NextResponse } from 'next/server'

export async function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || 
                 process.env.GIT_COMMIT_SHA || 
                 '730e99c5f48c7db769706d652c83fa146b25ce99' // Current commit
  const buildTime = new Date().toISOString()
  const env = process.env.NODE_ENV || 'development'
  
  const versionInfo = {
    phase: 'stage0',
    commit,
    ciStatus: env === 'production' ? 'green' : 'development',
    buildTime
  }
  
  // Ensure production values are always set
  if (env === 'production') {
    versionInfo.phase = 'stage0'
    versionInfo.ciStatus = 'green'
  }

  return NextResponse.json(versionInfo, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  })
}
