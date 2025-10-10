import { NextResponse } from 'next/server';
import { stopTrainer } from '@/src/server/trainer';

export async function POST() {
  try {
    const result = await stopTrainer();
    
    if (!result.stopped) {
      return NextResponse.json(
        { error: 'No trainer running to stop' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { stopped: true },
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
    console.error('Failed to stop trainer:', error);
    return NextResponse.json(
      { error: 'Failed to stop trainer' },
      { status: 500 }
    );
  }
}
