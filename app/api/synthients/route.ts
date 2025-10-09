import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const synthients = await db.synthient.findMany({
      include: {
        TrainingRun: {
          orderBy: { startedAt: 'desc' },
          take: 3
        }
      }
    });
    return NextResponse.json(synthients);
  } catch (error) {
    console.error('Error fetching synthients:', error);
    return NextResponse.json({ error: 'Failed to fetch synthients' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const synthient = await db.synthient.create({
      data: {
        name: body.name ?? "Synthient"
      }
    });
    return NextResponse.json(synthient, { status: 201 });
  } catch (error) {
    console.error('Error creating synthient:', error);
    return NextResponse.json({ error: 'Failed to create synthient' }, { status: 500 });
  }
}
