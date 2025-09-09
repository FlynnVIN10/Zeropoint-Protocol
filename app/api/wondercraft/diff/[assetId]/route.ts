import { NextRequest, NextResponse } from 'next/server'

// Import the WondercraftBridge service
const WondercraftBridge = require('../../../../services/wondercraft-bridge/index.js')

// Initialize the bridge service
const bridge = new WondercraftBridge()

export async function GET(
  request: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const { assetId } = params
    const { searchParams } = new URL(request.url)
    const versionA = searchParams.get('versionA')
    const versionB = searchParams.get('versionB')

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    if (!versionA || !versionB) {
      return NextResponse.json(
        { error: 'Both versionA and versionB parameters are required' },
        { status: 400 }
      )
    }

    // Get asset diff
    const result = await bridge.getAssetDiff(assetId, parseInt(versionA), parseInt(versionB))

    return NextResponse.json(result, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    })
  } catch (error) {
    console.error('Wondercraft diff error:', error)
    return NextResponse.json(
      { error: 'Failed to get asset diff' },
      { status: 500 }
    )
  }
}
