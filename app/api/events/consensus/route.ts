import { NextRequest, NextResponse } from 'next/server'
import { featureFlags } from '../../../../lib/feature-flags'

export const dynamic = 'force-dynamic'

interface ConsensusEvent {
  id: string
  type: 'proposal_created' | 'synthiant_vote' | 'human_vote' | 'consensus_reached' | 'proposal_resolved'
  proposalId: string
  prompt: string
  synthiantId?: string
  voterId?: string
  vote?: 'approve' | 'veto'
  rationale?: string
  state: 'pending' | 'approved' | 'vetoed'
  timestamp: string
  metadata: {
    synthiantConsensus: boolean
    humanConsensus: boolean
    totalSynthiantVotes: number
    totalHumanVotes: number
  }
}

// In-memory storage for proposals (shared with consensus routes)
declare global {
  var consensusProposals: Map<string, any>
}

if (!global.consensusProposals) {
  global.consensusProposals = new Map()
}

const proposals = global.consensusProposals

// Check if consensus is enabled
function checkConsensusEnabled(): boolean {
  return featureFlags.isEnabled('CONSENSUS_ENABLED')
}

// Check if SSE is enabled
function checkSSEEnabled(): boolean {
  return featureFlags.isEnabled('SSE_ENABLED')
}

// Generate unique event ID
function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create consensus event
function createConsensusEvent(
  type: ConsensusEvent['type'],
  proposal: any,
  metadata?: Partial<ConsensusEvent>
): ConsensusEvent {
  const totalSynthiantVotes = Object.keys(proposal.synthiantVotes || {}).length
  const totalHumanVotes = Object.keys(proposal.humanVotes || {}).length

  return {
    id: generateEventId(),
    type,
    proposalId: proposal.id,
    prompt: proposal.prompt,
    synthiantId: proposal.synthiantId,
    voterId: metadata?.voterId,
    vote: metadata?.vote,
    rationale: metadata?.rationale,
    state: proposal.state,
    timestamp: new Date().toISOString(),
    metadata: {
      synthiantConsensus: proposal.synthiantConsensus || false,
      humanConsensus: proposal.humanConsensus || false,
      totalSynthiantVotes,
      totalHumanVotes
    }
  }
}

// Stream consensus events
function streamConsensusEvents(): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  
  return new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialEvent = {
        id: generateEventId(),
        type: 'connection_established',
        message: 'Consensus events stream connected',
        timestamp: new Date().toISOString()
      }
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialEvent)}\n\n`))
      
      // Send current state of all proposals
      const currentProposals = Array.from(proposals.values())
      currentProposals.forEach(proposal => {
        const event = createConsensusEvent('proposal_created', proposal)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      })
      
      // Set up interval to send periodic updates
      const interval = setInterval(() => {
        try {
          // Send heartbeat
          const heartbeat = {
            id: generateEventId(),
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(heartbeat)}\n\n`))
        } catch (error) {
          console.error('Error sending heartbeat:', error)
          clearInterval(interval)
          controller.close()
        }
      }, 30000) // Every 30 seconds
      
      // Clean up on close
      return () => {
        clearInterval(interval)
      }
    }
  })
}

export async function GET(request: NextRequest) {
  if (!checkConsensusEnabled()) {
    return NextResponse.json(
      { error: 'Consensus system is disabled' },
      { status: 503 }
    )
  }

  if (!checkSSEEnabled()) {
    return NextResponse.json(
      { error: 'SSE system is disabled' },
      { status: 503 }
    )
  }

  try {
    // Check for reduced motion preference
    const reducedMotion = request.headers.get('prefers-reduced-motion') === 'reduce'
    
    const response = new Response(streamConsensusEvents(), {
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
      console.log('Consensus SSE connection closed by client')
    })

    return response
  } catch (error) {
    console.error('Error establishing consensus SSE stream:', error)
    return NextResponse.json(
      { error: 'Failed to establish SSE stream' },
      { status: 500 }
    )
  }
}

// Helper function to broadcast events to all connected clients
// This would be implemented with a proper event system in production
export async function broadcastEvent(event: ConsensusEvent) {
  // In production, this would notify all connected SSE clients
  console.log('Broadcasting consensus event:', event)
}
