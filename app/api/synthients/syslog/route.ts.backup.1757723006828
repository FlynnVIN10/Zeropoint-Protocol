import { NextRequest, NextResponse } from 'next/server'

interface SynthientLogEntry {
  id: string
  timestamp: string
  synthient_id: string
  synthient_type: 'petals' | 'wondercraft' | 'tinygrad' | 'consensus' | 'training'
  action: string
  status: 'success' | 'error' | 'warning' | 'info'
  details: Record<string, any>
  resource_affected?: string
  performance_metrics?: {
    duration_ms: number
    memory_usage_mb: number
    cpu_usage_percent: number
  }
  consensus_required?: boolean
  human_approval?: boolean
  error_code?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// In-memory syslog storage (in production, this would be a database)
let synthientLogs: SynthientLogEntry[] = []
let logCounter = 1

// Generate realistic Synthient activity logs
function generateSynthientActivity(): SynthientLogEntry[] {
  const now = new Date()
  const activities: SynthientLogEntry[] = []
  
  // Petals activities
  activities.push({
    id: `log-${logCounter++}`,
    timestamp: new Date(now.getTime() - 30000).toISOString(),
    synthient_id: 'petals:alpha',
    synthient_type: 'petals',
    action: 'proposal_generated',
    status: 'success',
    details: {
      proposal_id: 'prop_20250911_002',
      title: 'Optimize Memory Allocation in Training Pipeline',
      impact: 'medium',
      category: 'performance'
    },
    resource_affected: 'training_pipeline',
    performance_metrics: {
      duration_ms: 1250,
      memory_usage_mb: 45.2,
      cpu_usage_percent: 12.3
    },
    consensus_required: true,
    human_approval: false,
    severity: 'medium'
  })

  // Wondercraft activities
  activities.push({
    id: `log-${logCounter++}`,
    timestamp: new Date(now.getTime() - 45000).toISOString(),
    synthient_id: 'wondercraft:beta',
    synthient_type: 'wondercraft',
    action: 'asset_contribution',
    status: 'success',
    details: {
      contribution_id: 'contrib_20250911_001',
      asset_type: 'code_optimization',
      file_path: 'lib/performance.ts',
      lines_changed: 23,
      improvement_type: 'memory_efficiency'
    },
    resource_affected: 'lib/performance.ts',
    performance_metrics: {
      duration_ms: 890,
      memory_usage_mb: 32.1,
      cpu_usage_percent: 8.7
    },
    consensus_required: false,
    human_approval: false,
    severity: 'low'
  })

  // Tinygrad training activities
  activities.push({
    id: `log-${logCounter++}`,
    timestamp: new Date(now.getTime() - 60000).toISOString(),
    synthient_id: 'tinygrad:gamma',
    synthient_type: 'tinygrad',
    action: 'training_epoch_completed',
    status: 'success',
    details: {
      job_id: 'job_001',
      epoch: 15,
      loss: 0.234,
      accuracy: 0.891,
      learning_rate: 0.001,
      batch_size: 32
    },
    resource_affected: 'synthient-v2_model',
    performance_metrics: {
      duration_ms: 45000,
      memory_usage_mb: 128.7,
      cpu_usage_percent: 85.2
    },
    consensus_required: false,
    human_approval: false,
    severity: 'low'
  })

  // Consensus activities
  activities.push({
    id: `log-${logCounter++}`,
    timestamp: new Date(now.getTime() - 75000).toISOString(),
    synthient_id: 'consensus:delta',
    synthient_type: 'consensus',
    action: 'proposal_vote_cast',
    status: 'success',
    details: {
      proposal_id: 'prop_20250911_001',
      vote: 'approve',
      rationale: 'Enhanced training pipeline will improve overall system performance',
      voter_type: 'synthiant'
    },
    resource_affected: 'governance_system',
    performance_metrics: {
      duration_ms: 340,
      memory_usage_mb: 12.5,
      cpu_usage_percent: 3.1
    },
    consensus_required: true,
    human_approval: true,
    severity: 'medium'
  })

  // Training system activities
  activities.push({
    id: `log-${logCounter++}`,
    timestamp: new Date(now.getTime() - 90000).toISOString(),
    synthient_id: 'training:epsilon',
    synthient_type: 'training',
    action: 'self_improvement_analysis',
    status: 'success',
    details: {
      analysis_type: 'performance_optimization',
      target_metrics: ['response_time', 'memory_usage', 'cache_efficiency'],
      current_performance: {
        response_time_ms: 245,
        memory_usage_mb: 156.3,
        cache_hit_rate: 0.78
      },
      recommended_improvements: [
        'Implement connection pooling',
        'Optimize database queries',
        'Add Redis caching layer'
      ]
    },
    resource_affected: 'platform_performance',
    performance_metrics: {
      duration_ms: 2300,
      memory_usage_mb: 67.8,
      cpu_usage_percent: 45.6
    },
    consensus_required: false,
    human_approval: false,
    severity: 'medium'
  })

  // Error example
  activities.push({
    id: `log-${logCounter++}`,
    timestamp: new Date(now.getTime() - 120000).toISOString(),
    synthient_id: 'tinygrad:zeta',
    synthient_type: 'tinygrad',
    action: 'training_job_failed',
    status: 'error',
    details: {
      job_id: 'job_003',
      error_type: 'out_of_memory',
      error_message: 'CUDA out of memory during forward pass',
      retry_count: 2,
      max_retries: 3
    },
    resource_affected: 'gpu_training_queue',
    performance_metrics: {
      duration_ms: 12000,
      memory_usage_mb: 2048.0,
      cpu_usage_percent: 95.8
    },
    consensus_required: false,
    human_approval: false,
    error_code: 'CUDA_OOM_ERROR',
    severity: 'high'
  })

  return activities
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const severity = searchParams.get('severity')
    const synthient_type = searchParams.get('type')
    const since = searchParams.get('since')
    const format = searchParams.get('format') || 'json'

    // Generate fresh activity if logs are empty
    if (synthientLogs.length === 0) {
      synthientLogs = generateSynthientActivity()
    }

    // Add new activity every time the endpoint is called
    const newActivity = generateSynthientActivity()
    synthientLogs.unshift(...newActivity)

    // Keep only last 1000 entries
    if (synthientLogs.length > 1000) {
      synthientLogs = synthientLogs.slice(0, 1000)
    }

    // Filter logs based on parameters
    let filteredLogs = [...synthientLogs]

    if (severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === severity)
    }

    if (synthient_type) {
      filteredLogs = filteredLogs.filter(log => log.synthient_type === synthient_type)
    }

    if (since) {
      const sinceDate = new Date(since)
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= sinceDate)
    }

    // Apply limit
    filteredLogs = filteredLogs.slice(0, limit)

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (format === 'syslog') {
      // Return in syslog format
      const syslogEntries = filteredLogs.map(log => {
        const priority = log.severity === 'critical' ? 0 : 
                        log.severity === 'high' ? 1 :
                        log.severity === 'medium' ? 2 : 3
        const facility = 16 // local0
        const priorityCode = facility * 8 + priority
        
        return `<${priorityCode}>${log.timestamp} zeropoint-protocol ${log.synthient_id}[${log.id}]: ${log.action} - ${JSON.stringify(log.details)}`
      }).join('\n')

      return new Response(syslogEntries, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      })
    }

    // Return JSON format
    const response = {
      total_entries: filteredLogs.length,
      total_available: synthientLogs.length,
      generated_at: new Date().toISOString(),
      filters: {
        limit,
        severity,
        synthient_type,
        since
      },
      logs: filteredLogs
    }

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    })

  } catch (error) {
    console.error('[SYNTHIENT SYSLOG] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve Synthient syslog' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      synthient_id,
      synthient_type,
      action,
      status = 'info',
      details = {},
      resource_affected,
      performance_metrics,
      consensus_required = false,
      human_approval = false,
      error_code,
      severity = 'low'
    } = body

    if (!synthient_id || !synthient_type || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: synthient_id, synthient_type, action' },
        { status: 400 }
      )
    }

    const logEntry: SynthientLogEntry = {
      id: `log-${logCounter++}`,
      timestamp: new Date().toISOString(),
      synthient_id,
      synthient_type,
      action,
      status,
      details,
      resource_affected,
      performance_metrics,
      consensus_required,
      human_approval,
      error_code,
      severity
    }

    synthientLogs.unshift(logEntry)

    // Keep only last 1000 entries
    if (synthientLogs.length > 1000) {
      synthientLogs = synthientLogs.slice(0, 1000)
    }

    return NextResponse.json({
      success: true,
      log_id: logEntry.id,
      message: 'Synthient activity logged successfully'
    }, {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('[SYNTHIENT SYSLOG] Error logging activity:', error)
    return NextResponse.json(
      { error: 'Failed to log Synthient activity' },
      { status: 500 }
    )
  }
}
