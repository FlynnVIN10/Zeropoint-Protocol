import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge';
import { EnhancedProviderRouter } from '../../../../services/enhanced-router'

const enhancedRouter = new EnhancedProviderRouter()

export async function GET(request: NextRequest) {
  try {
    const analytics = await enhancedRouter.getRoutingAnalytics()
    
    return NextResponse.json(analytics, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline',
        'access-control-allow-origin': '*'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch routing analytics' },
      { status: 500 }
    )
  }
}
