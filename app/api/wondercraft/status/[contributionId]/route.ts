import { NextRequest, NextResponse } from 'next/server'

// Import the WondercraftBridge service
import * as Wondercraft from '@services/wondercraft-bridge'

export async function GET(
  request: NextRequest,
  { params }: { params: { contributionId: string } }
) {
  try {
    const { contributionId } = params

    if (!contributionId) {
      return NextResponse.json(
        { error: 'Contribution ID is required' },
        { status: 400 }
      )
    }

    // Get contribution status
    const result = await Wondercraft.getContributionStatus(contributionId);

    return NextResponse.json(result, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    })
  } catch (error) {
    console.error('Wondercraft status error:', error)
    return NextResponse.json(
      { error: 'Failed to get contribution status' },
      { status: 500 }
    )
  }
}
