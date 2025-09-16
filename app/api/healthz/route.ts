import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: 'shutdown',
      message: 'Zeropoint Protocol has been fully shut down',
      code: 'PROTOCOL_SHUTDOWN',
      shutdown_date: new Date().toISOString()
    },
    {
      status: 410,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    }
  )
}