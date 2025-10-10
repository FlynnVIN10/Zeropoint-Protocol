import { NextRequest } from 'next/server';
import { getLatestTrainingStep } from '@/src/server/trainer';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Data interval: emit training step every 1s ONLY when training is active
      const dataInterval = setInterval(async () => {
        try {
          // Check if there's an active training run first
          const { getTrainerStatus } = await import('@/src/server/trainer');
          const trainerStatus = getTrainerStatus();
          
          if (!trainerStatus.running) {
            // No active training - send idle status
            const idleData = {
              type: 'idle',
              message: 'No active training',
              timestamp: new Date().toISOString()
            };
            const chunk = `data: ${JSON.stringify(idleData)}\n\n`;
            controller.enqueue(encoder.encode(chunk));
            return;
          }
          
          // Training is active - get latest step
          const latestStep = await getLatestTrainingStep();
          
          if (latestStep) {
            const data = {
              type: 'step',
              step: latestStep.step,
              loss: latestStep.loss,
              elapsedMs: latestStep.elapsedMs,
              parameters: JSON.parse(latestStep.parameters),
              createdAt: latestStep.createdAt.toISOString(),
              runId: latestStep.runId,
              synthientName: latestStep.TrainingRun.Synthient.name
            };

            const chunk = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('SSE feed error:', error);
          const errorChunk = `data: ${JSON.stringify({ type: 'error', message: 'Failed to get latest step' })}\n\n`;
          controller.enqueue(encoder.encode(errorChunk));
        }
      }, 1000);
      
      // Heartbeat interval: send comment every 10s to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch (error) {
          console.error('SSE heartbeat error:', error);
        }
      }, 10000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(dataInterval);
        clearInterval(heartbeatInterval);
        controller.close();
        console.log('SSE client disconnected.');
      });
    }
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
