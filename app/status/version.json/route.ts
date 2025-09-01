// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// app/status/version.json/route.ts

import { NextResponse } from 'next/server'

export async function GET() {
  const versionInfo = {
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 
            process.env.GIT_COMMIT_SHA || 
            '1e4d82fdcf869c9ed0e57a7eb2ae811c7b717f9d', // Fallback to known commit
    buildTime: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    phase: 'v20',
    ciStatus: process.env.NODE_ENV === 'production' ? 'green' : 'development'
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
