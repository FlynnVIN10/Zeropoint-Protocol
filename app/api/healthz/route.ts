import { NextRequest, NextResponse } from 'next/server'

// ZEROPOINT PROTOCOL SHUTDOWN: All endpoints disabled
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: 'shutdown',
      message: 'Zeropoint Protocol has been fully shut down',
      code: 'PROTOCOL_SHUTDOWN',
      shutdown_date: new Date().toISOString(),
      compliance: {
        protocol_shutdown: true,
        all_services_disabled: true,
        no_further_operations: true
      }
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

// All other HTTP methods return shutdown status
export async function POST() { return shutdownResponse() }
export async function PUT() { return shutdownResponse() }
export async function DELETE() { return shutdownResponse() }
export async function PATCH() { return shutdownResponse() }

function shutdownResponse() {
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