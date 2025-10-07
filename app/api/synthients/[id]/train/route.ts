import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = params.id;
  
  // Update synthient status to training
  await db.synthient.update({
    where: { id },
    data: {
      status: "training",
      lastHeartbeat: new Date()
    }
  });
  
  // Create training run
  const run = await db.trainingRun.create({
    data: {
      synthientId: id
    }
  });
  
  // Simulate training completion (in production, this would be async job)
  setTimeout(async () => {
    await db.trainingRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        metricsJson: JSON.stringify({ loss: 0.12, accuracy: 0.94 })
      }
    });
    
    await db.synthient.update({
      where: { id },
      data: {
        status: "ready",
        lastHeartbeat: new Date()
      }
    });
  }, 1500);
  
  return NextResponse.json({
    started: true,
    runId: run.id
  });
}

