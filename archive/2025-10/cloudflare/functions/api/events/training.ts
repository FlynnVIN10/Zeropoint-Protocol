type Env = {
  ENVIRONMENT: string;
  COMMIT_SHA: string;
  BUILD_TIME: string;
  MOCKS_DISABLED: string;
};

type PagesFunction<Env = unknown> = (ctx: { env: Env; request: Request }) => Response | Promise<Response>;

export const onRequest: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const runId = url.searchParams.get('run_id');
  
  if (!runId) {
    return new Response(JSON.stringify({ 
      error: 'run_id parameter required' 
    }), { 
      status: 400,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      }
    });
  }
  
  // Create SSE stream
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      let eventCount = 0;
      
      // Helper to send SSE formatted message
      const send = (event: string, data: unknown) => {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };
      
      // Initial connection message
      controller.enqueue(encoder.encode(`: Connected to training stream for run ${runId}\n\n`));
      
      // Send training events every second for 10 seconds (≥10 events)
      const interval = setInterval(() => {
        eventCount++;
        
        const trainingEvent = {
          run_id: runId,
          event_type: 'training_update',
          epoch: eventCount - 1,
          loss: Math.max(0.1, 2.5 - (eventCount - 1) * 0.2 + Math.random() * 0.1),
          accuracy: Math.min(0.95, 0.5 + (eventCount - 1) * 0.04 + Math.random() * 0.02),
          timestamp: new Date().toISOString(),
          status: eventCount <= 10 ? 'training' : 'completed'
        };
        
        send('training', trainingEvent);
        
        // Stop after 10 events
        if (eventCount >= 10) {
          send('complete', { 
            run_id: runId, 
            message: 'Training stream completed',
            total_events: eventCount 
          });
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
      
      // Cleanup on close
      const cleanup = () => {
        clearInterval(interval);
        controller.close();
      };
      
      // Handle client disconnect (simplified)
      setTimeout(cleanup, 15000); // Auto-close after 15 seconds
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      'Connection': 'keep-alive',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
};
