import { NextRequest } from 'next/server';
import { getLatestTrainingStep } from '@/src/server/trainer';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        try {
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
      }, 1000); // Emit every 1 second

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}
