import { NextResponse } from 'next/server';
import { startTrainer } from '@/src/server/trainer';

export async function POST() {
  try {
    const result = await startTrainer();
    
    if (!result.started) {
      return NextResponse.json(
        { error: 'Trainer already running or failed to start' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { started: true, runId: result.runId },
      {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
          'content-disposition': 'inline'
        }
      }
    );
  } catch (error) {
    console.error('Failed to start trainer:', error);
    return NextResponse.json(
      { error: 'Failed to start trainer' },
      { status: 500 }
    );
  }
}
