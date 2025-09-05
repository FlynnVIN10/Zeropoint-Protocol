import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, model, dataset } = body;

    // Generate unique job ID
    const jobId = `tinygrad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate required parameters
    if (!config || !model) {
      return NextResponse.json(
        { error: 'Missing required parameters: config and model are required' },
        { status: 400 }
      );
    }

    // Create training job configuration
    const trainingConfig = {
      jobId,
      config,
      model,
      dataset: dataset || 'default',
      status: 'queued',
      createdAt: new Date().toISOString(),
      backend: process.env.TINYGRAD_BACKEND || 'cpu'
    };

    // Log the training start
    console.log(`TinyGrad training job started: ${jobId}`, trainingConfig);

    // In a real implementation, this would queue the job with TinyGrad
    // For now, we'll simulate the job creation
    const response = {
      jobId,
      status: 'queued',
      message: 'Training job queued successfully',
      config: trainingConfig,
      estimatedDuration: '6 hours',
      backend: process.env.TINYGRAD_BACKEND || 'cpu'
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('TinyGrad start error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
