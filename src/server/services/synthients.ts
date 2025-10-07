/**
 * Synthient service logic
 * Per CTO directive: Business logic layer for Synthients
 */

import { db } from '../db';

export async function listSynthients() {
  return await db.synthient.findMany({
    include: {
      runs: {
        orderBy: { startedAt: 'desc' },
        take: 3,
      },
    },
  });
}

export async function createSynthient(name: string) {
  return await db.synthient.create({
    data: { name },
  });
}

export async function startTraining(id: string) {
  // Update synthient status
  await db.synthient.update({
    where: { id },
    data: {
      status: 'training',
      lastHeartbeat: new Date(),
    },
  });
  
  // Create training run
  const run = await db.trainingRun.create({
    data: {
      synthientId: id,
    },
  });
  
  // Simulate async training completion (in production, this would be a job queue)
  setTimeout(async () => {
    await db.trainingRun.update({
      where: { id: run.id },
      data: {
        status: 'success',
        finishedAt: new Date(),
        metricsJson: JSON.stringify({ loss: 0.12, accuracy: 0.94 }),
      },
    });
    
    await db.synthient.update({
      where: { id },
      data: {
        status: 'ready',
        lastHeartbeat: new Date(),
      },
    });
  }, 1500);
  
  return run;
}

