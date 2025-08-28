import { NextRequest, NextResponse } from 'next/server'
import { logAuditEvent } from '../../../../services/audit'

interface AIModel {
  id: string
  name: string
  version: string
  type: 'llm' | 'embedding' | 'classification' | 'regression' | 'reinforcement' | 'multimodal'
  provider: string
  architecture: string
  parameters: number
  capabilities: string[]
  performance_metrics: {
    accuracy?: number
    precision?: number
    recall?: number
    f1_score?: number
    loss?: number
    perplexity?: number
    latency_ms: number
    throughput_tokens_per_sec: number
  }
  training_data: {
    source: string
    size_gb: number
    last_updated: string
    bias_metrics?: any
    fairness_scores?: any
  }
  deployment_status: 'development' | 'testing' | 'staging' | 'production' | 'deprecated'
  ethical_compliance: {
    bias_detection: boolean
    fairness_monitoring: boolean
    explainability: boolean
    privacy_preserving: boolean
    compliance_score: number
  }
  created_at: string
  last_updated: string
  last_evaluated: string
}

interface ModelEvaluation {
  id: string
  model_id: string
  timestamp: string
  metrics: any
  dataset: string
  evaluator: string
  notes?: string
  compliance_check: boolean
}

// In-memory AI model storage (in production, this would be a database)
let aiModels: Map<string, AIModel> = new Map()
let modelEvaluations: ModelEvaluation[] = []
let modelCounter = 1
let evaluationCounter = 1

// Initialize with demo AI models
aiModels.set('gpt-4-advanced', {
  id: 'model-001',
  name: 'GPT-4 Advanced',
  version: '4.0.1',
  type: 'llm',
  provider: 'OpenAI',
  architecture: 'Transformer',
  parameters: 175000000000,
  capabilities: ['text_generation', 'code_generation', 'reasoning', 'multimodal'],
  performance_metrics: {
    accuracy: 0.95,
    precision: 0.94,
    recall: 0.93,
    f1_score: 0.94,
    perplexity: 12.5,
    latency_ms: 150,
    throughput_tokens_per_sec: 1000
  },
  training_data: {
    source: 'OpenAI curated dataset',
    size_gb: 50000,
    last_updated: '2024-01-15T00:00:00Z',
    bias_metrics: { gender_bias: 0.02, racial_bias: 0.03 },
    fairness_scores: { demographic_parity: 0.95, equal_opportunity: 0.94 }
  },
  deployment_status: 'production',
  ethical_compliance: {
    bias_detection: true,
    fairness_monitoring: true,
    explainability: true,
    privacy_preserving: true,
    compliance_score: 92
  },
  created_at: '2024-01-01T00:00:00Z',
  last_updated: '2024-08-28T00:00:00Z',
  last_evaluated: '2024-08-27T00:00:00Z'
})

aiModels.set('claude-3-sonnet', {
  id: 'model-002',
  name: 'Claude 3 Sonnet',
  version: '3.5.0',
  type: 'llm',
  provider: 'Anthropic',
  architecture: 'Constitutional AI',
  parameters: 200000000000,
  capabilities: ['text_generation', 'reasoning', 'safety_alignment'],
  performance_metrics: {
    accuracy: 0.93,
    precision: 0.92,
    recall: 0.91,
    f1_score: 0.92,
    perplexity: 14.2,
    latency_ms: 180,
    throughput_tokens_per_sec: 850
  },
  training_data: {
    source: 'Anthropic safety-focused dataset',
    size_gb: 45000,
    last_updated: '2024-02-01T00:00:00Z',
    bias_metrics: { gender_bias: 0.01, racial_bias: 0.02 },
    fairness_scores: { demographic_parity: 0.97, equal_opportunity: 0.96 }
  },
  deployment_status: 'production',
  ethical_compliance: {
    bias_detection: true,
    fairness_monitoring: true,
    explainability: true,
    privacy_preserving: true,
    compliance_score: 95
  },
  created_at: '2024-02-01T00:00:00Z',
  last_updated: '2024-08-28T00:00:00Z',
  last_evaluated: '2024-08-26T00:00:00Z'
})

aiModels.set('custom-zeropoint', {
  id: 'model-003',
  name: 'Zeropoint Custom Model',
  version: '1.0.0',
  type: 'llm',
  provider: 'Zeropoint Protocol',
  architecture: 'Custom Transformer',
  parameters: 7000000000,
  capabilities: ['text_generation', 'consensus_optimization', 'ethical_reasoning'],
  performance_metrics: {
    accuracy: 0.88,
    precision: 0.87,
    recall: 0.86,
    f1_score: 0.87,
    loss: 0.15,
    latency_ms: 50,
    throughput_tokens_per_sec: 2000
  },
  training_data: {
    source: 'Zeropoint consensus dataset',
    size_gb: 1000,
    last_updated: '2024-08-28T00:00:00Z',
    bias_metrics: { gender_bias: 0.01, racial_bias: 0.01 },
    fairness_scores: { demographic_parity: 0.99, equal_opportunity: 0.98 }
  },
  deployment_status: 'staging',
  ethical_compliance: {
    bias_detection: true,
    fairness_monitoring: true,
    explainability: true,
    privacy_preserving: true,
    compliance_score: 98
  },
  created_at: '2024-08-01T00:00:00Z',
  last_updated: '2024-08-28T00:00:00Z',
  last_evaluated: '2024-08-28T00:00:00Z'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      version, 
      type, 
      provider, 
      architecture, 
      parameters, 
      capabilities, 
      performance_metrics, 
      training_data, 
      deployment_status = 'development',
      ethical_compliance 
    } = body

    if (!name || !version || !type || !provider || !architecture || !parameters || !capabilities) {
      return NextResponse.json(
        { error: 'Missing required fields: name, version, type, provider, architecture, parameters, capabilities' },
        { status: 400 }
      )
    }

    // Validate model type
    const validTypes = ['llm', 'embedding', 'classification', 'regression', 'reinforcement', 'multimodal']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid model type. Must be one of: ' + validTypes.join(', ') },
        { status: 400 }
      )
    }

    const model: AIModel = {
      id: `model-${modelCounter++}`,
      name,
      version,
      type: type as any,
      provider,
      architecture,
      parameters,
      capabilities,
      performance_metrics: performance_metrics || {
        latency_ms: 0,
        throughput_tokens_per_sec: 0
      },
      training_data: training_data || {
        source: 'unknown',
        size_gb: 0,
        last_updated: new Date().toISOString()
      },
      deployment_status: deployment_status as any,
      ethical_compliance: ethical_compliance || {
        bias_detection: false,
        fairness_monitoring: false,
        explainability: false,
        privacy_preserving: false,
        compliance_score: 0
      },
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      last_evaluated: new Date().toISOString()
    }

    aiModels.set(model.id, model)

    // Log audit event
    logAuditEvent({
      user_id: 'system',
      username: 'system',
      action: 'create_ai_model',
      resource: 'ai_model',
      resource_id: model.id,
      details: { name, type, provider, parameters },
      severity: 'medium',
      category: 'system',
      compliance_tags: ['ai_governance', 'model_management']
    })

    return NextResponse.json({
      success: true,
      model_id: model.id,
      message: 'AI model created successfully'
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
    console.error('[AI] Failed to create model:', error)
    return NextResponse.json(
      { error: 'Failed to create AI model' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const provider = searchParams.get('provider')
    const deployment_status = searchParams.get('deployment_status')
    const min_compliance_score = searchParams.get('min_compliance_score')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let filteredModels = Array.from(aiModels.values())
    
    // Apply filters
    if (type) {
      filteredModels = filteredModels.filter(m => m.type === type)
    }
    
    if (provider) {
      filteredModels = filteredModels.filter(m => m.provider === provider)
    }
    
    if (deployment_status) {
      filteredModels = filteredModels.filter(m => m.deployment_status === deployment_status)
    }
    
    if (min_compliance_score) {
      filteredModels = filteredModels.filter(m => m.ethical_compliance.compliance_score >= parseInt(min_compliance_score))
    }
    
    // Sort by compliance score (descending) and limit results
    filteredModels = filteredModels
      .sort((a, b) => b.ethical_compliance.compliance_score - a.ethical_compliance.compliance_score)
      .slice(0, limit)

    // Calculate model statistics
    const stats = calculateModelStats(filteredModels)

    return NextResponse.json({
      models: filteredModels,
      statistics: stats,
      total_models: aiModels.size,
      filtered_count: filteredModels.length
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
    console.error('[AI] Failed to fetch models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI models' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { model_id, updates } = body

    if (!model_id || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: model_id, updates' },
        { status: 400 }
      )
    }

    const model = aiModels.get(model_id)
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Update model fields
    Object.assign(model, updates)
    model.last_updated = new Date().toISOString()

    // Log audit event
    logAuditEvent({
      user_id: 'system',
      username: 'system',
      action: 'update_ai_model',
      resource: 'ai_model',
      resource_id: model_id,
      details: { updates },
      severity: 'medium',
      category: 'system',
      compliance_tags: ['ai_governance', 'model_management']
    })

    return NextResponse.json({
      success: true,
      message: 'AI model updated successfully',
      model_id
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
    console.error('[AI] Failed to update model:', error)
    return NextResponse.json(
      { error: 'Failed to update AI model' },
      { status: 500 }
    )
  }
}

function calculateModelStats(models: AIModel[]) {
  if (models.length === 0) {
    return {
      total_models: 0,
      type_distribution: {},
      provider_distribution: {},
      deployment_status_distribution: {},
      avg_compliance_score: 0,
      total_parameters: 0,
      ethical_compliance_summary: {
        bias_detection: 0,
        fairness_monitoring: 0,
        explainability: 0,
        privacy_preserving: 0
      }
    }
  }

  const typeDistribution = models.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const providerDistribution = models.reduce((acc, m) => {
    acc[m.provider] = (acc[m.provider] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const deploymentStatusDistribution = models.reduce((acc, m) => {
    acc[m.deployment_status] = (acc[m.deployment_status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const avgComplianceScore = models.reduce((sum, m) => sum + m.ethical_compliance.compliance_score, 0) / models.length
  const totalParameters = models.reduce((sum, m) => sum + m.parameters, 0)

  const ethicalComplianceSummary = {
    bias_detection: models.filter(m => m.ethical_compliance.bias_detection).length,
    fairness_monitoring: models.filter(m => m.ethical_compliance.fairness_monitoring).length,
    explainability: models.filter(m => m.ethical_compliance.explainability).length,
    privacy_preserving: models.filter(m => m.ethical_compliance.privacy_preserving).length
  }

  return {
    total_models: models.length,
    type_distribution: typeDistribution,
    provider_distribution: providerDistribution,
    deployment_status_distribution: deploymentStatusDistribution,
    avg_compliance_score: Math.round(avgComplianceScore * 100) / 100,
    total_parameters: totalParameters,
    ethical_compliance_summary: ethicalComplianceSummary
  }
}
