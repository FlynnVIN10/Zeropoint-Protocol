import { NextRequest } from 'next/server';

let clients: Set<ReadableStreamDefaultController> = new Set();

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);

      // Send initial connection message
      const welcomeMsg = {
        type: 'system',
        message: 'Connected to Synthient Actions feed',
        timestamp: new Date().toISOString(),
        level: 'info'
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(welcomeMsg)}\n\n`));

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clients.delete(controller);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

// Function to broadcast synthient actions (called from other parts of the system)
export function broadcastSynthientAction(action: {
  type: string;
  message: string;
  level: string;
  synthientId?: string;
  proposalId?: string;
  runId?: string;
  source?: string;
}) {
  const encoder = new TextEncoder();
  const actionEntry = {
    ...action,
    timestamp: new Date().toISOString()
  };
  
  const data = `data: ${JSON.stringify(actionEntry)}\n\n`;
  const chunk = encoder.encode(data);

  clients.forEach(controller => {
    try {
      controller.enqueue(chunk);
    } catch (error) {
      // Remove dead clients
      clients.delete(controller);
    }
  });
}
