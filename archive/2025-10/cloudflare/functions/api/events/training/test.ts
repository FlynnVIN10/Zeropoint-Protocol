type Env = {
  ENVIRONMENT: string;
  COMMIT_SHA: string;
  BUILD_TIME: string;
  MOCKS_DISABLED: string;
};

type PagesFunction<Env = unknown> = (ctx: { env: Env; request: Request }) => Response | Promise<Response>;

export const onRequest: PagesFunction<Env> = async ({ env, request }) => {
  // Create SSE stream for testing
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Helper to send SSE formatted message
      const send = (data: unknown) => {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };
      
      // Send 10 test events over 10 seconds
      let eventCount = 0;
      
      const interval = setInterval(() => {
        eventCount++;
        
        const testEvent = {
          epoch: eventCount,
          loss: Math.max(0.1, 2.5 - (eventCount - 1) * 0.2 + Math.random() * 0.1),
          accuracy: Math.min(0.95, 0.5 + (eventCount - 1) * 0.04 + Math.random() * 0.02),
          timestamp: new Date().toISOString(),
          test_mode: true
        };
        
        send(testEvent);
        
        // Stop after 10 events
        if (eventCount >= 10) {
          send({ 
            message: 'Test stream completed',
            total_events: eventCount,
            test_mode: true
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
      
      // Auto-close after 15 seconds
      setTimeout(cleanup, 15000);
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
