import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"type":"connected","message":"Consensus event stream connected"}\n\n'))
      
      // Simulate consensus events every 5 seconds
      const interval = setInterval(() => {
        const events = [
          {
            type: 'proposal',
            id: `p-${Date.now()}`,
            actor: 'synthiant:alpha',
            action: 'submitted',
            state: 'pending',
            seq: Math.floor(Math.random() * 1000),
            ts: new Date().toISOString()
          },
          {
            type: 'vote',
            id: `v-${Date.now()}`,
            actor: 'synthiant:beta',
            action: 'approved',
            state: 'synthiant_approved',
            seq: Math.floor(Math.random() * 1000),
            ts: new Date().toISOString()
          },
          {
            type: 'escalation',
            id: `e-${Date.now()}`,
            actor: 'human:reviewer',
            action: 'pending_review',
            state: 'human_pending',
            seq: Math.floor(Math.random() * 1000),
            ts: new Date().toISOString()
          }
        ]
        
        const randomEvent = events[Math.floor(Math.random() * events.length)]
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(randomEvent)}\n\n`))
      }, 5000)
      
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
