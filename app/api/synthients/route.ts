import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get configured synthients from environment
    const synthientIds = (process.env.SYNTHIENT_ID || 'synth-1').split(',').map(id => id.trim());
    
    // Ensure all configured synthients exist in database
    const synthients = await Promise.all(
      synthientIds.map(async (synthientName) => {
        // Find or create synthient
        let synthient = await db.synthient.findFirst({
          where: { name: synthientName }
        });

        if (!synthient) {
          synthient = await db.synthient.create({
            data: {
              name: synthientName,
              status: 'idle'
            }
          });
        }

        // Get run count for this synthient
        const runCount = await db.trainingRun.count({
          where: { synthientId: synthient.id }
        });

        // Check if this synthient has an active training run
        const activeRun = await db.trainingRun.findFirst({
          where: { 
            synthientId: synthient.id,
            status: 'running'
          }
        });

        return {
          id: synthient.id,
          name: synthient.name,
          status: activeRun ? 'active' : 'idle',
          runsCount: runCount,
          isRunning: !!activeRun,
          lastHeartbeat: synthient.lastHeartbeat
        };
      })
    );

    return NextResponse.json({ synthients }, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('Failed to fetch synthients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch synthients' },
      { status: 500 }
    );
  }
}