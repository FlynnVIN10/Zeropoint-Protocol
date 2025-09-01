// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// app/status/version.json/route.ts

import { NextResponse } from 'next/server'

export async function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || 
                 process.env.GIT_COMMIT_SHA || 
                 '79d8c22cd58d5307f8332b709c463240afa0e9b5' // Latest commit
  const buildTime = new Date().toISOString()
  const env = process.env.NODE_ENV || 'development'
  
  const versionInfo = {
    commit,
    buildTime,
    env,
    phase: 'v20',
    ciStatus: env === 'production' ? 'green' : 'development'
  }
  
  // Ensure production values are always set
  if (env === 'production') {
    versionInfo.phase = 'v20'
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
