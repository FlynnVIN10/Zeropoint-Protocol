import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"type":"connected","message":"Synthiant activity stream connected"}\n\n'))
      
      // Simulate synthiant activity events every 3 seconds
      const interval = setInterval(() => {
        const events = [
          {
            type: 'training',
            id: `t-${Date.now()}`,
            actor: 'synthiant:gamma',
            action: 'training_completed',
            msg: 'Training run completed - loss: 0.234',
            seq: Math.floor(Math.random() * 1000),
            ts: new Date().toISOString()
          },
          {
            type: 'inference',
            id: `i-${Date.now()}`,
            actor: 'synthiant:delta',
            action: 'inference_request',
            msg: 'Processing prompt via GPT-4',
            seq: Math.floor(Math.random() * 1000),
            ts: new Date().toISOString()
          },
          {
            type: 'health',
            id: `h-${Date.now()}`,
            actor: 'synthiant:epsilon',
            action: 'health_check',
            msg: 'Provider health check passed',
            seq: Math.floor(Math.random() * 1000),
            ts: new Date().toISOString()
          },
          {
            type: 'consensus',
            id: `c-${Date.now()}`,
            actor: 'synthiant:zeta',
            action: 'proposal_review',
            msg: 'Reviewing human approval request',
            seq: Math.floor(Math.random() * 1000),
            ts: new Date().toISOString()
          }
        ]
        
        const randomEvent = events[Math.floor(Math.random() * events.length)]
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(randomEvent)}\n\n`))
      }, 3000)
      
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
