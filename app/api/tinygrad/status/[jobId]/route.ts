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

    // In a real implementation, this would query the actual job status
    // For now, we'll simulate different job states
    const jobStatuses = ['queued', 'running', 'completed', 'failed'];
    const randomStatus = jobStatuses[Math.floor(Math.random() * jobStatuses.length)];
    
    const statusResponse = {
      jobId,
      status: randomStatus,
      progress: randomStatus === 'running' ? Math.floor(Math.random() * 100) : 
                randomStatus === 'completed' ? 100 : 0,
      currentEpoch: randomStatus === 'running' ? Math.floor(Math.random() * 10) : 0,
      totalEpochs: 10,
      currentStep: randomStatus === 'running' ? Math.floor(Math.random() * 1000) : 0,
      totalSteps: 1000,
      loss: randomStatus === 'running' ? (Math.random() * 2).toFixed(4) : null,
      accuracy: randomStatus === 'completed' ? (0.85 + Math.random() * 0.1).toFixed(4) : null,
      startedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedCompletion: randomStatus === 'running' ? 
        new Date(Date.now() + Math.random() * 1800000).toISOString() : null,
      backend: process.env.TINYGRAD_BACKEND || 'cpu',
      metrics: {
        gpuUtilization: randomStatus === 'running' ? Math.floor(Math.random() * 100) : 0,
        memoryUsage: randomStatus === 'running' ? Math.floor(Math.random() * 8000) : 0,
        throughput: randomStatus === 'running' ? Math.floor(Math.random() * 100) : 0
      }
    };

    return NextResponse.json(statusResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('TinyGrad status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
