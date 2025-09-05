import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would fetch actual logs from TinyGrad
    // For now, we'll simulate training logs
    const simulatedLogs = [
      `[${new Date().toISOString()}] Starting training job ${jobId}`,
      `[${new Date(Date.now() - 300000).toISOString()}] Loading dataset...`,
      `[${new Date(Date.now() - 240000).toISOString()}] Initializing model...`,
      `[${new Date(Date.now() - 180000).toISOString()}] Epoch 1/10 - Step 1/1000 - Loss: 2.3456`,
      `[${new Date(Date.now() - 120000).toISOString()}] Epoch 1/10 - Step 100/1000 - Loss: 1.9876`,
      `[${new Date(Date.now() - 60000).toISOString()}] Epoch 1/10 - Step 200/1000 - Loss: 1.6543`,
      `[${new Date().toISOString()}] Epoch 1/10 - Step 300/1000 - Loss: 1.4321`
    ];

    const logResponse = {
      jobId,
      logs: simulatedLogs,
      totalLines: simulatedLogs.length,
      lastUpdated: new Date().toISOString(),
      logLevel: 'INFO',
      backend: process.env.TINYGRAD_BACKEND || 'cpu'
    };

    return NextResponse.json(logResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('TinyGrad logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
