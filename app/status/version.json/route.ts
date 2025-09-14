import { NextRequest, NextResponse } from 'next/server'

// ZEROPOINT PROTOCOL SHUTDOWN: All endpoints disabled
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      commit: 'SHUTDOWN',
      buildTime: new Date().toISOString(),
      env: 'shutdown',
      status: 'shutdown',
      message: 'Zeropoint Protocol has been fully shut down',
      code: 'PROTOCOL_SHUTDOWN',
      shutdown_date: new Date().toISOString()
    },
    {
      status: 410, // Gone
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    }
  )
}
