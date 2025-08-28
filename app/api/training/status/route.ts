import { NextResponse } from 'next/server'

export async function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || 'dev-local'
  const buildTime = new Date().toISOString()
  
  // Mock training data - in production this would come from actual training runs
  const trainingStatus = {
    active_runs: 2,
    completed_today: 15,
    total_runs: 127,
    last_run: {
      id: 'run-2025-08-28-001',
      model: 'gpt-4',
      started_at: '2025-08-28T16:30:00Z',
      ended_at: '2025-08-28T16:45:00Z',
      dataset: 'consensus-ethics-v2',
      metrics: {
        loss: 0.234,
        accuracy: 0.892
      },
      status: 'completed'
    },
    leaderboard: [
      {
        rank: 1,
        model: 'claude-3.5-sonnet',
        accuracy: 0.945,
        runs: 23
      },
      {
        rank: 2,
        model: 'gpt-4',
        accuracy: 0.892,
        runs: 18
      },
      {
        rank: 3,
        model: 'grok-4',
        accuracy: 0.876,
        runs: 15
      }
    ]
  }
  
  return NextResponse.json(
    {
      ...trainingStatus,
      commit,
      buildTime,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    },
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    }
  )
}
