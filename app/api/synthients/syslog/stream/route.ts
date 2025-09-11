import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"type":"connected","message":"Synthient syslog stream connected","timestamp":"' + new Date().toISOString() + '"}\n\n'))
      
      // Generate realistic Synthient activity every 2-5 seconds
      const generateActivity = () => {
        const activities = [
          {
            type: 'petals',
            id: `petals:${Math.random().toString(36).substr(2, 4)}`,
            action: 'proposal_generated',
            status: 'success',
            details: {
              proposal_id: `prop_${Date.now()}`,
              title: 'Performance Optimization Proposal',
              impact: 'medium'
            },
            severity: 'medium'
          },
          {
            type: 'wondercraft',
            id: `wondercraft:${Math.random().toString(36).substr(2, 4)}`,
            action: 'asset_contribution',
            status: 'success',
            details: {
              contribution_id: `contrib_${Date.now()}`,
              asset_type: 'code_optimization',
              lines_changed: Math.floor(Math.random() * 50) + 10
            },
            severity: 'low'
          },
          {
            type: 'tinygrad',
            id: `tinygrad:${Math.random().toString(36).substr(2, 4)}`,
            action: 'training_epoch_completed',
            status: 'success',
            details: {
              job_id: `job_${Math.floor(Math.random() * 10) + 1}`,
              epoch: Math.floor(Math.random() * 100) + 1,
              loss: (Math.random() * 0.5).toFixed(3),
              accuracy: (0.8 + Math.random() * 0.2).toFixed(3)
            },
            severity: 'low'
          },
          {
            type: 'consensus',
            id: `consensus:${Math.random().toString(36).substr(2, 4)}`,
            action: 'proposal_vote_cast',
            status: 'success',
            details: {
              proposal_id: `prop_${Date.now()}`,
              vote: Math.random() > 0.5 ? 'approve' : 'veto',
              rationale: 'Based on performance impact analysis'
            },
            severity: 'medium'
          },
          {
            type: 'training',
            id: `training:${Math.random().toString(36).substr(2, 4)}`,
            action: 'self_improvement_analysis',
            status: 'success',
            details: {
              analysis_type: 'performance_optimization',
              target_metrics: ['response_time', 'memory_usage'],
              current_performance: {
                response_time_ms: Math.floor(Math.random() * 500) + 100,
                memory_usage_mb: Math.floor(Math.random() * 200) + 50
              }
            },
            severity: 'medium'
          },
          {
            type: 'tinygrad',
            id: `tinygrad:${Math.random().toString(36).substr(2, 4)}`,
            action: 'training_job_failed',
            status: 'error',
            details: {
              job_id: `job_${Math.floor(Math.random() * 10) + 1}`,
              error_type: 'out_of_memory',
              error_message: 'CUDA out of memory during forward pass',
              retry_count: Math.floor(Math.random() * 3)
            },
            severity: 'high'
          }
        ]
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)]
        
        const logEntry = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          timestamp: new Date().toISOString(),
          synthient_id: randomActivity.id,
          synthient_type: randomActivity.type,
          action: randomActivity.action,
          status: randomActivity.status,
          details: randomActivity.details,
          resource_affected: randomActivity.type === 'petals' ? 'governance_system' :
                           randomActivity.type === 'wondercraft' ? 'asset_repository' :
                           randomActivity.type === 'tinygrad' ? 'training_pipeline' :
                           randomActivity.type === 'consensus' ? 'voting_system' : 'platform',
          performance_metrics: {
            duration_ms: Math.floor(Math.random() * 5000) + 100,
            memory_usage_mb: Math.floor(Math.random() * 200) + 10,
            cpu_usage_percent: Math.floor(Math.random() * 100)
          },
          consensus_required: randomActivity.type === 'petals' || randomActivity.type === 'consensus',
          human_approval: randomActivity.type === 'consensus',
          error_code: randomActivity.status === 'error' ? 'SYNTHIENT_ERROR' : undefined,
          severity: randomActivity.severity
        }
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(logEntry)}\n\n`))
      }
      
      // Start generating activity
      const interval = setInterval(generateActivity, Math.random() * 3000 + 2000) // 2-5 seconds
      
      // Clean up on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}
