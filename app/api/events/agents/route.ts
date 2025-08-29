import { NextRequest, NextResponse } from 'next/server'
import { featureFlags } from '../../../../lib/feature-flags'

export const dynamic = 'force-dynamic'

interface AgentEvent {
  id: string
  type: 'training_started' | 'training_completed' | 'training_failed' | 'model_updated' | 'health_check' | 'consensus_participation'
  agentId: string
  agentType: 'synthiant' | 'human' | 'system'
  action: string
  status: 'success' | 'warning' | 'error' | 'info'
  timestamp: string
  metadata: {
    model?: string
    dataset?: string
    duration?: number
    loss?: number
    accuracy?: number
    proposalId?: string
    vote?: 'approve' | 'veto'
    rationale?: string
    performance?: {
      latency: number
      throughput: number
      memoryUsage: number
    }
  }
}

// Check if SSE is enabled
function checkSSEEnabled(): boolean {
  return featureFlags.isEnabled('SSE_ENABLED')
}

// Generate unique event ID
function generateEventId(): string {
  return `agent_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Simulate agent activity events
function generateAgentEvents(): AgentEvent[] {
  const events: AgentEvent[] = []
  const now = new Date()
  
  // Training events
  events.push({
    id: generateEventId(),
    type: 'training_started',
    agentId: 'synthiant:alpha',
    agentType: 'synthiant',
    action: 'Started training run on ethics_v2 dataset',
    status: 'info',
    timestamp: new Date(now.getTime() - 300000).toISOString(), // 5 minutes ago
    metadata: {
      model: 'gpt-4o-mini',
      dataset: 'ethics_v2',
      performance: {
        latency: 45,
        throughput: 1200,
        memoryUsage: 2.1
      }
    }
  })
  
  events.push({
    id: generateEventId(),
    type: 'training_completed',
    agentId: 'synthiant:beta',
    agentType: 'synthiant',
    action: 'Completed training run successfully',
    status: 'success',
    timestamp: new Date(now.getTime() - 180000).toISOString(), // 3 minutes ago
    metadata: {
      model: 'claude-3.5-sonnet',
      dataset: 'reasoning_v1',
      duration: 1520,
      loss: 0.0187,
      accuracy: 97.2,
      performance: {
        latency: 38,
        throughput: 1350,
        memoryUsage: 1.8
      }
    }
  })
  
  // Consensus participation
  events.push({
    id: generateEventId(),
    type: 'consensus_participation',
    agentId: 'synthiant:gamma',
    agentType: 'synthiant',
    action: 'Voted on proposal run_2025_08_28_003',
    status: 'success',
    timestamp: new Date(now.getTime() - 120000).toISOString(), // 2 minutes ago
    metadata: {
      proposalId: 'run_2025_08_28_003',
      vote: 'approve',
      rationale: 'Proposal aligns with ethical guidelines and shows clear reasoning',
      performance: {
        latency: 22,
        throughput: 1100,
        memoryUsage: 1.5
      }
    }
  })
  
  // Health check
  events.push({
    id: generateEventId(),
    type: 'health_check',
    agentId: 'system:monitor',
    agentType: 'system',
    action: 'All synthiant agents healthy',
    status: 'success',
    timestamp: new Date(now.getTime() - 60000).toISOString(), // 1 minute ago
    metadata: {
      performance: {
        latency: 12,
        throughput: 2000,
        memoryUsage: 0.8
      }
    }
  })
  
  return events
}

// Stream agent events
function streamAgentEvents(): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  
  return new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialEvent = {
        id: generateEventId(),
        type: 'connection_established',
        message: 'Agent events stream connected',
        timestamp: new Date().toISOString()
      }
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialEvent)}\n\n`))
      
      // Send current state of recent agent events
      const currentEvents = generateAgentEvents()
      currentEvents.forEach(event => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      })
      
      // Set up interval to send new agent events
      const interval = setInterval(() => {
        try {
          // Generate new random agent events
          const newEvents = generateAgentEvents()
          const randomEvent = newEvents[Math.floor(Math.random() * newEvents.length)]
          
          // Update timestamp to current time
          randomEvent.timestamp = new Date().toISOString()
          randomEvent.id = generateEventId()
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(randomEvent)}\n\n`))
        } catch (error) {
          console.error('Error sending agent event:', error)
          clearInterval(interval)
          controller.close()
        }
      }, 15000) // Every 15 seconds
      
      // Clean up on close
      return () => {
        clearInterval(interval)
      }
    }
  })
}

export async function GET(request: NextRequest) {
  if (!checkSSEEnabled()) {
    return NextResponse.json(
      { error: 'SSE system is disabled' },
      { status: 503 }
    )
  }

  try {
    // Check for reduced motion preference
    const reducedMotion = request.headers.get('prefers-reduced-motion') === 'reduce'
    
    const response = new Response(streamAgentEvents(), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
        'X-SSE-Enabled': 'true',
        'X-Reduced-Motion': reducedMotion.toString()
      }
    })

    // Set up connection close handling
    request.signal.addEventListener('abort', () => {
      console.log('Agent events SSE connection closed by client')
    })

    return response
  } catch (error) {
    console.error('Error establishing agent events SSE stream:', error)
    return NextResponse.json(
      { error: 'Failed to establish SSE stream' },
      { status: 500 }
    )
  }
}

// Helper function to broadcast agent events to all connected clients
// This would be implemented with a proper event system in production
export async function broadcastAgentEvent(event: AgentEvent) {
  // In production, this would notify all connected SSE clients
  console.log('Broadcasting agent event:', event)
}
