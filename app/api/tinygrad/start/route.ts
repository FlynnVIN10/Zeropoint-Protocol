import { NextRequest, NextResponse } from 'next/server'

// Import the TinygradTrainer service
import * as Tiny from '@services/trainer-tinygrad'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.dataset || !body.modelConfig) {
      return NextResponse.json(
        { error: 'Missing required fields: dataset, modelConfig' },
        { status: 400 }
      )
    }

    // Start training job
    const result = await Tiny.startTraining({
      dataset: body.dataset,
      modelConfig: body.modelConfig,
      trainingParams: body.trainingParams || {}
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
    console.error('Tinygrad training start error:', error)
    return NextResponse.json(
      { error: 'Failed to start training job' },
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