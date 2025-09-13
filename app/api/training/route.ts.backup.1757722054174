import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Read unified metadata from static file
    const meta = await fetch('/status/version.json').then(r => r.json())
    
    const timestamp = new Date().toISOString()
    
    // Mock training metrics - replace with real database queries
    const trainingMetrics = {
      activeRuns: 2,
      runsCompletedToday: 1,
      totalRuns: 3,
      lastModel: "petals",
      lastAccuracy: 0.95,
      lastLoss: 0.12,
      lastUpdated: timestamp,
      commit: meta.commit,
      buildTime: meta.buildTime,
      phase: meta.phase,
      ciStatus: meta.ciStatus
    }

    return NextResponse.json(trainingMetrics, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    })
  } catch (error) {
    console.error('Training metrics failed:', error);
    
    return NextResponse.json(
      {
        activeRuns: 0,
        runsCompletedToday: 0,
        totalRuns: 0,
        lastModel: "unknown",
        lastAccuracy: 0,
        lastLoss: 0,
        lastUpdated: new Date().toISOString(),
        commit: 'unknown',
        buildTime: new Date().toISOString(),
        phase: 'stage2',
        ciStatus: 'error'
      },
      {
        status: 503,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }
      }
    )
  }
}
