import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db.synthient.findMany({
    include: {
      runs: {
        orderBy: { startedAt: 'desc' },
        take: 3
      }
    }
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const row = await db.synthient.create({
    data: {
      name: body.name ?? "Synthient"
    }
  });
  return NextResponse.json(row, { status: 201 });
}

