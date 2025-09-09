import { NextRequest, NextResponse } from 'next/server'

// Import the TinygradTrainer service
const TinygradTrainer = require('../../../../services/trainer-tinygrad/index.js')

// Initialize the trainer service
const trainer = new TinygradTrainer()

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Get job logs
    const result = await trainer.getJobLogs(jobId)

    return NextResponse.json(result, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    })
  } catch (error) {
    console.error('Tinygrad logs error:', error)
    return NextResponse.json(
      { error: 'Failed to get job logs' },
      { status: 500 }
    )
  }
}