import { NextRequest, NextResponse } from 'next/server'

interface TrainingMetrics {
  run_id: string
  epoch: number
  step: number
  loss: number
  accuracy?: number
  learning_rate: number
  timestamp: string
  provider: string
  instance_id: string
  performance_score: number
  resource_usage: {
    gpu_utilization: number
    memory_usage: number
    cpu_usage: number
  }
  convergence_metrics: {
    loss_trend: 'improving' | 'stable' | 'degrading'
    convergence_rate: number
    plateau_detected: boolean
  }
}

// In-memory storage for training metrics (in production, this would be a database)
let trainingMetrics: TrainingMetrics[] = []
let metricsCounter = 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      run_id, 
      epoch, 
      step, 
      loss, 
      accuracy, 
      learning_rate, 
      provider, 
      instance_id,
      resource_usage,
      convergence_metrics
    } = body

    if (!run_id || epoch === undefined || step === undefined || loss === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: run_id, epoch, step, loss' },
        { status: 400 }
      )
    }

    // Calculate performance score based on metrics
    const performanceScore = calculatePerformanceScore(loss, accuracy, learning_rate, resource_usage)

    const metrics: TrainingMetrics = {
      run_id,
      epoch,
      step,
      loss,
      accuracy,
      learning_rate: learning_rate || 0.001,
      timestamp: new Date().toISOString(),
      provider: provider || 'unknown',
      instance_id: instance_id || 'local',
      performance_score: performanceScore,
      resource_usage: resource_usage || {
        gpu_utilization: 0,
        memory_usage: 0,
        cpu_usage: 0
      },
      convergence_metrics: convergence_metrics || {
        loss_trend: 'stable',
        convergence_rate: 0,
        plateau_detected: false
      }
    }

    trainingMetrics.push(metrics)

    return NextResponse.json({
      success: true,
      metrics_id: `m-${metricsCounter++}`,
      performance_score: performanceScore,
      message: 'Training metrics recorded successfully'
    }, {
      status: 201,
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
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const run_id = searchParams.get('run_id')
    const provider = searchParams.get('provider')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let filteredMetrics = trainingMetrics
    
    if (run_id) {
      filteredMetrics = filteredMetrics.filter(m => m.run_id === run_id)
    }
    
    if (provider) {
      filteredMetrics = filteredMetrics.filter(m => m.provider === provider)
    }
    
    // Sort by performance score (descending) and limit results
    filteredMetrics = filteredMetrics
      .sort((a, b) => b.performance_score - a.performance_score)
      .slice(0, limit)

    // Calculate aggregate statistics
    const stats = calculateAggregateStats(filteredMetrics)

    return NextResponse.json({
      metrics: filteredMetrics,
      statistics: stats,
      total_count: trainingMetrics.length,
      filtered_count: filteredMetrics.length
    }, {
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
      { error: 'Failed to fetch training metrics' },
      { status: 500 }
    )
  }
}

function calculatePerformanceScore(loss: number, accuracy?: number, learningRate?: number, resourceUsage?: any): number {
  let score = 100
  
  // Loss-based scoring (lower is better)
  if (loss < 0.1) score += 20
  else if (loss < 0.5) score += 10
  else if (loss > 2.0) score -= 20
  
  // Accuracy-based scoring (higher is better)
  if (accuracy && accuracy > 0.95) score += 15
  else if (accuracy && accuracy > 0.9) score += 10
  else if (accuracy && accuracy < 0.7) score -= 10
  
  // Resource efficiency scoring
  if (resourceUsage) {
    if (resourceUsage.gpu_utilization > 0.8) score += 5
    if (resourceUsage.memory_usage < 0.7) score += 5
    if (resourceUsage.cpu_usage < 0.6) score += 5
  }
  
  return Math.max(0, Math.min(100, score))
}

function calculateAggregateStats(metrics: TrainingMetrics[]) {
  if (metrics.length === 0) {
    return {
      avg_loss: 0,
      avg_accuracy: 0,
      avg_performance_score: 0,
      best_performance: 0,
      total_runs: 0,
      providers: [],
      convergence_summary: {
        improving: 0,
        stable: 0,
        degrading: 0
      }
    }
  }

  const avgLoss = metrics.reduce((sum, m) => sum + m.loss, 0) / metrics.length
  const avgAccuracy = metrics.filter(m => m.accuracy !== undefined)
    .reduce((sum, m) => sum + (m.accuracy || 0), 0) / metrics.filter(m => m.accuracy !== undefined).length
  const avgPerformanceScore = metrics.reduce((sum, m) => sum + m.performance_score, 0) / metrics.length
  const bestPerformance = Math.max(...metrics.map(m => m.performance_score))
  
  const providers = [...new Set(metrics.map(m => m.provider))]
  
  const convergenceSummary = {
    improving: metrics.filter(m => m.convergence_metrics.loss_trend === 'improving').length,
    stable: metrics.filter(m => m.convergence_metrics.loss_trend === 'stable').length,
    degrading: metrics.filter(m => m.convergence_metrics.loss_trend === 'degrading').length
  }

  return {
    avg_loss: avgLoss,
    avg_accuracy: avgAccuracy,
    avg_performance_score: avgPerformanceScore,
    best_performance: bestPerformance,
    total_runs: metrics.length,
    providers,
    convergence_summary: convergenceSummary
  }
}
