import { NextRequest, NextResponse } from 'next/server'

// CTO Directive: Block mocked endpoints when MOCKS_DISABLED=1
export async function POST(request: NextRequest) {
  if (process.env.MOCKS_DISABLED === '1') {
    return NextResponse.json(
      {
        error: 'Endpoint temporarily unavailable',
        message: 'This endpoint is currently being migrated to production services. MOCKS_DISABLED=1 is enforced.',
        code: 'ENDPOINT_MIGRATION_IN_PROGRESS',
        compliance: {
          mocks_disabled: true,
          dual_consensus_required: true,
          production_ready: false
        },
        timestamp: new Date().toISOString()
      },
      {
        status: 503,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
          'content-disposition': 'inline',
          'retry-after': '3600'
        }
      }
    )
  }

  return NextResponse.json(
    { error: 'Not implemented' },
    { status: 501 }
  )
}

export async function GET(request: NextRequest) {
  if (process.env.MOCKS_DISABLED === '1') {
    return NextResponse.json(
      {
        error: 'Endpoint temporarily unavailable',
        message: 'This endpoint is currently being migrated to production services. MOCKS_DISABLED=1 is enforced.',
        code: 'ENDPOINT_MIGRATION_IN_PROGRESS',
        compliance: {
          mocks_disabled: true,
          dual_consensus_required: true,
          production_ready: false
        },
        timestamp: new Date().toISOString()
      },
      {
        status: 503,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
          'content-disposition': 'inline',
          'retry-after': '3600'
        }
      }
    )
  }

  return NextResponse.json(
    { error: 'Not implemented' },
    { status: 501 }
  )
}