// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// app/api/providers/tinygrad/stream/route.ts

import { NextRequest, NextResponse } from 'next/server'
import TinygradProvider from '../../../../../providers/tinygrad'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, maxTokens, temperature } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const provider = new TinygradProvider()
    
    // Check provider health first
    const isHealthy = await provider.healthCheck()
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'Tinygrad provider is not healthy' },
        { status: 503 }
      )
    }

    const stream = await provider.streamText({
      prompt,
      model,
      maxTokens,
      temperature,
      stream: true
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Provider': 'tinygrad'
      }
    })

  } catch (error) {
    console.error('Tinygrad streaming error:', error)
    return NextResponse.json(
      { error: `Streaming failed: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
