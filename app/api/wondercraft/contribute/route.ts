import { NextRequest, NextResponse } from 'next/server'

// Import the WondercraftBridge service
import * as Wondercraft from '@services/wondercraft-bridge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.assetType || !body.assetData || !body.metadata || !body.contributor) {
      return NextResponse.json(
        { error: 'Missing required fields: assetType, assetData, metadata, contributor' },
        { status: 400 }
      )
    }

    // Submit contribution
    const result = await Wondercraft.contributeAsset({
      assetType: body.assetType,
      assetData: body.assetData,
      metadata: body.metadata,
      contributor: body.contributor
    })

    return NextResponse.json(result, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    })
  } catch (error) {
    console.error('Wondercraft contribution error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contribution' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests',
      allowed_methods: ['POST']
    },
    {
      status: 405,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    }
  )
}