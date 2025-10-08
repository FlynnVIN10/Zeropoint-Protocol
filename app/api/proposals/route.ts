import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db.proposal.findMany({
    orderBy: { createdAt: 'desc' },
    include: { Vote: true }
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { title, body } = await req.json();
  
  if (!title || !body) {
    return NextResponse.json({
      error: "Title and body are required"
    }, { status: 400 });
  }
  
  const p = await db.proposal.create({
    data: { id: `proposal-${Date.now()}`, title, body }
  });
  
  return NextResponse.json(p, { status: 201 });
}
