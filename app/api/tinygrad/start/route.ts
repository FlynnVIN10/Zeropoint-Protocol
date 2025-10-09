import { NextRequest, NextResponse } from 'next/server'
// Removed edge runtime to support Node.js child_process for real training

// Import the TinygradTrainer service
import * as Tiny from '@services/trainer-tinygrad'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // For CPU demo training: accept epochs/lr directly
    // For full training: accept dataset/modelConfig
    const params = {
      epochs: body.epochs || body.trainingParams?.epochs || 50,
      lr: body.lr || body.trainingParams?.lr || 0.01,
      dataset: body.dataset,
      modelConfig: body.modelConfig
    };

    // Start training job
    const result = await Tiny.startTraining(params)

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
  return new Response(JSON.stringify({ error: 'method_not_allowed' }), { 
    status: 405, 
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'allow': 'POST'
    }
  });
}