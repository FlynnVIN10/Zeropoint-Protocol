import { NextResponse } from 'next/server'
import { dbManager } from '@lib/db/config'

export async function GET() {
  try {
    const commit = process.env.VERCEL_GIT_COMMIT_SHA ||
                   process.env.GIT_COMMIT_SHA ||
                   '1604e587' // Canonical commit
    const buildTime = new Date().toISOString()

    // Query database for training data
    await dbManager.initialize()
    const aiModels = await dbManager.query('ai_models')
    const trainingJobs = await dbManager.query('training_jobs')

    // Calculate training statistics from database
    const activeRuns = trainingJobs.filter(job => job.status === 'running' || job.status === 'queued').length
    const completedToday = trainingJobs.filter(job =>
      job.status === 'completed' &&
      new Date(job.completed_at).toDateString() === new Date().toDateString()
    ).length
    const totalRuns = trainingJobs.length

    // Get latest completed run
    const completedJobs = trainingJobs.filter(job => job.status === 'completed')
    const lastRun = completedJobs.length > 0
      ? {
          id: `job-${completedJobs[0].id}`,
          model_id: completedJobs[0].model_id,
          started_at: completedJobs[0].started_at,
          ended_at: completedJobs[0].completed_at,
          status: completedJobs[0].status,
          config: completedJobs[0].config
        }
      : null

    // Generate leaderboard from AI models
    const leaderboard = aiModels.map((model, index) => ({
      rank: index + 1,
      model: model.name,
      accuracy: 0.8 + (Math.random() * 0.15), // Mock accuracy for demonstration
      runs: Math.floor(Math.random() * 30) + 10
    })).sort((a, b) => b.accuracy - a.accuracy)

    const trainingStatus = {
      active_runs: activeRuns,
      completed_today: completedToday,
      total_runs: totalRuns,
      last_run: lastRun,
      leaderboard,
      database_connected: true
    }

    return NextResponse.json(
      {
        ...trainingStatus,
        commit,
        buildTime,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        phase: 'stage1',
        training_enabled: true
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
  } catch (error) {
    console.error('Training status query failed:', error)

    // Fallback response if database fails
    return NextResponse.json(
      {
        active_runs: 0,
        completed_today: 0,
        total_runs: 0,
        last_run: null,
        leaderboard: [],
        database_connected: false,
        error: 'Database connection failed',
        commit: '1604e587',
        buildTime: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        phase: 'stage1',
        training_enabled: false
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
