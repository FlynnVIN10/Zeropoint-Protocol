import { NextRequest, NextResponse } from 'next/server'
import { logAuditEvent } from '../../audit/log/route'

interface MLPipeline {
  id: string
  name: string
  description: string
  model_id: string
  pipeline_type: 'training' | 'validation' | 'deployment' | 'retraining' | 'evaluation'
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  configuration: {
    dataset: string
    hyperparameters: any
    training_config: any
    validation_config: any
    deployment_config: any
  }
  progress: {
    current_step: string
    completed_steps: string[]
    total_steps: number
    percentage: number
    estimated_completion: string
  }
  metrics: {
    training_loss?: number
    validation_loss?: number
    accuracy?: number
    f1_score?: number
    latency_ms?: number
    throughput_tokens_per_sec?: number
  }
  logs: string[]
  created_at: string
  started_at?: string
  completed_at?: string
  created_by: string
  tags: string[]
}

interface PipelineStep {
  id: string
  pipeline_id: string
  name: string
  type: 'data_preprocessing' | 'model_training' | 'validation' | 'testing' | 'deployment' | 'monitoring'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  start_time?: string
  end_time?: string
  duration_ms?: number
  output: any
  error?: string
}

// In-memory pipeline storage (in production, this would be a database)
let mlPipelines: Map<string, MLPipeline> = new Map()
let pipelineSteps: Map<string, PipelineStep[]> = new Map()
let pipelineCounter = 1
let stepCounter = 1

// Initialize with demo pipelines
const demoPipeline: MLPipeline = {
  id: 'pipeline-001',
  name: 'Zeropoint Model Retraining',
  description: 'Automated retraining of Zeropoint custom model with latest consensus data',
  model_id: 'model-003',
  pipeline_type: 'retraining',
  status: 'completed',
  priority: 'high',
  configuration: {
    dataset: 'consensus-v2.0',
    hyperparameters: {
      learning_rate: 0.0001,
      batch_size: 32,
      epochs: 100,
      optimizer: 'AdamW'
    },
    training_config: {
      validation_split: 0.2,
      early_stopping: true,
      checkpoint_saving: true
    },
    validation_config: {
      metrics: ['accuracy', 'f1_score', 'precision', 'recall'],
      cross_validation: true
    },
    deployment_config: {
      canary_deployment: true,
      rollback_threshold: 0.85
    }
  },
  progress: {
    current_step: 'completed',
    completed_steps: ['data_preprocessing', 'model_training', 'validation', 'deployment'],
    total_steps: 4,
    percentage: 100,
    estimated_completion: new Date().toISOString()
  },
  metrics: {
    training_loss: 0.12,
    validation_loss: 0.15,
    accuracy: 0.89,
    f1_score: 0.88,
    latency_ms: 45,
    throughput_tokens_per_sec: 2200
  },
  logs: [
    'Pipeline started at 2024-08-28T10:00:00Z',
    'Data preprocessing completed successfully',
    'Model training completed in 45 minutes',
    'Validation metrics exceeded thresholds',
    'Deployment completed successfully'
  ],
  created_at: '2024-08-28T10:00:00Z',
  started_at: '2024-08-28T10:00:00Z',
  completed_at: '2024-08-28T10:45:00Z',
  created_by: 'system',
  tags: ['retraining', 'consensus', 'automated']
}

mlPipelines.set(demoPipeline.id, demoPipeline)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      model_id, 
      pipeline_type, 
      priority = 'medium',
      configuration, 
      created_by, 
      tags = [] 
    } = body

    if (!name || !description || !model_id || !pipeline_type || !configuration || !created_by) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, model_id, pipeline_type, configuration, created_by' },
        { status: 400 }
      )
    }

    // Validate pipeline type
    const validTypes = ['training', 'validation', 'deployment', 'retraining', 'evaluation']
    if (!validTypes.includes(pipeline_type)) {
      return NextResponse.json(
        { error: 'Invalid pipeline type. Must be one of: ' + validTypes.join(', ') },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be one of: ' + validPriorities.join(', ') },
        { status: 400 }
      )
    }

    const pipeline: MLPipeline = {
      id: `pipeline-${pipelineCounter++}`,
      name,
      description,
      model_id,
      pipeline_type: pipeline_type as any,
      status: 'queued',
      priority: priority as any,
      configuration,
      progress: {
        current_step: 'queued',
        completed_steps: [],
        total_steps: calculateTotalSteps(pipeline_type, configuration),
        percentage: 0,
        estimated_completion: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour default
      },
      metrics: {},
      logs: [`Pipeline created at ${new Date().toISOString()}`],
      created_at: new Date().toISOString(),
      created_by,
      tags
    }

    mlPipelines.set(pipeline.id, pipeline.id)
    pipelineSteps.set(pipeline.id, [])

    // Log audit event
    logAuditEvent({
      user_id: created_by,
      username: created_by,
      action: 'create_ml_pipeline',
      resource: 'ml_pipeline',
      resource_id: pipeline.id,
      details: { name, pipeline_type, model_id, priority },
      severity: 'medium',
      category: 'system',
      compliance_tags: ['ai_governance', 'ml_pipeline', 'automation']
    })

    return NextResponse.json({
      success: true,
      pipeline_id: pipeline.id,
      message: 'ML pipeline created successfully'
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
    console.error('[ML] Failed to create pipeline:', error)
    return NextResponse.json(
      { error: 'Failed to create ML pipeline' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const pipeline_type = searchParams.get('pipeline_type')
    const model_id = searchParams.get('model_id')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let filteredPipelines = Array.from(mlPipelines.values())
    
    // Apply filters
    if (status) {
      filteredPipelines = filteredPipelines.filter(p => p.status === status)
    }
    
    if (pipeline_type) {
      filteredPipelines = filteredPipelines.filter(p => p.pipeline_type === pipeline_type)
    }
    
    if (model_id) {
      filteredPipelines = filteredPipelines.filter(p => p.model_id === model_id)
    }
    
    if (priority) {
      filteredPipelines = filteredPipelines.filter(p => p.priority === priority)
    }
    
    // Sort by creation date (newest first) and limit results
    filteredPipelines = filteredPipelines
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

    // Calculate pipeline statistics
    const stats = calculatePipelineStats(filteredPipelines)

    return NextResponse.json({
      pipelines: filteredPipelines,
      statistics: stats,
      total_pipelines: mlPipelines.size,
      filtered_count: filteredPipelines.length
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
    console.error('[ML] Failed to fetch pipelines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ML pipelines' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { pipeline_id, updates } = body

    if (!pipeline_id || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: pipeline_id, updates' },
        { status: 400 }
      )
    }

    const pipeline = mlPipelines.get(pipeline_id)
    if (!pipeline) {
      return NextResponse.json(
        { error: 'Pipeline not found' },
        { status: 404 }
      )
    }

    // Update pipeline fields
    Object.assign(pipeline, updates)
    
    // Update progress if status changed
    if (updates.status === 'running' && !pipeline.started_at) {
      pipeline.started_at = new Date().toISOString()
    }
    
    if (updates.status === 'completed' || updates.status === 'failed') {
      pipeline.completed_at = new Date().toISOString()
    }

    // Log audit event
    logAuditEvent({
      user_id: 'system',
      username: 'system',
      action: 'update_ml_pipeline',
      resource: 'ml_pipeline',
      resource_id: pipeline_id,
      details: { updates },
      severity: 'medium',
      category: 'system',
      compliance_tags: ['ai_governance', 'ml_pipeline', 'automation']
    })

    return NextResponse.json({
      success: true,
      message: 'ML pipeline updated successfully',
      pipeline_id
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
    console.error('[ML] Failed to update pipeline:', error)
    return NextResponse.json(
      { error: 'Failed to update ML pipeline' },
      { status: 500 }
    )
  }
}

function calculateTotalSteps(pipelineType: string, configuration: any): number {
  const baseSteps = {
    training: 4, // data_preprocessing, model_training, validation, testing
    validation: 2, // data_preprocessing, validation
    deployment: 3, // testing, deployment, monitoring
    retraining: 5, // data_preprocessing, model_training, validation, testing, deployment
    evaluation: 2 // data_preprocessing, evaluation
  }
  
  return baseSteps[pipelineType as keyof typeof baseSteps] || 3
}

function calculatePipelineStats(pipelines: MLPipeline[]) {
  if (pipelines.length === 0) {
    return {
      total_pipelines: 0,
      status_distribution: {},
      type_distribution: {},
      priority_distribution: {},
      avg_completion_time: 0,
      success_rate: 0
    }
  }

  const statusDistribution = pipelines.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const typeDistribution = pipelines.reduce((acc, p) => {
    acc[p.pipeline_type] = (acc[p.pipeline_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const priorityDistribution = pipelines.reduce((acc, p) => {
    acc[p.priority] = (acc[p.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate average completion time for completed pipelines
  const completedPipelines = pipelines.filter(p => p.completed_at && p.started_at)
  const avgCompletionTime = completedPipelines.length > 0 
    ? completedPipelines.reduce((sum, p) => {
        const duration = new Date(p.completed_at!).getTime() - new Date(p.started_at!).getTime()
        return sum + duration
      }, 0) / completedPipelines.length
    : 0

  // Calculate success rate
  const successRate = pipelines.length > 0 
    ? (pipelines.filter(p => p.status === 'completed').length / pipelines.length) * 100
    : 0

  return {
    total_pipelines: pipelines.length,
    status_distribution: statusDistribution,
    type_distribution: typeDistribution,
    priority_distribution: priorityDistribution,
    avg_completion_time: Math.round(avgCompletionTime / (1000 * 60)), // Convert to minutes
    success_rate: Math.round(successRate * 100) / 100
  }
}
