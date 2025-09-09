import { NextRequest, NextResponse } from 'next/server'
import { dbManager } from '@lib/db/config'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Set up SSE (Server-Sent Events) for real-time proposal updates
    const responseStream = new ReadableStream({
      start(controller) {
        // Send initial connection confirmation
        const initialData = {
          type: 'connection',
          message: 'Connected to proposal stream',
          timestamp: new Date().toISOString()
        }
        controller.enqueue(`data: ${JSON.stringify(initialData)}\n\n`)

        // Set up periodic updates (in production, this would use WebSocket or database triggers)
        const interval = setInterval(async () => {
          try {
            // Check for new proposals (simulated for now)
            const proposals = await dbManager.query('proposals', {
              created_after: new Date(Date.now() - 60000).toISOString() // Last minute
            })

            if (proposals.length > 0) {
              const updateData = {
                type: 'proposals_update',
                proposals: proposals,
                timestamp: new Date().toISOString()
              }
              controller.enqueue(`data: ${JSON.stringify(updateData)}\n\n`)
            }

            // Send heartbeat
            const heartbeatData = {
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            }
            controller.enqueue(`data: ${JSON.stringify(heartbeatData)}\n\n`)

          } catch (error) {
            console.error('Stream update error:', error)
            const errorData = {
              type: 'error',
              message: 'Stream update failed',
              timestamp: new Date().toISOString()
            }
            controller.enqueue(`data: ${JSON.stringify(errorData)}\n\n`)
          }
        }, 30000) // Update every 30 seconds

        // Clean up interval when connection closes
        request.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      }
    })

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })

  } catch (error) {
    console.error('Proposal stream error:', error)

    return NextResponse.json({
      error: 'Failed to establish proposal stream',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    })
  }
}
