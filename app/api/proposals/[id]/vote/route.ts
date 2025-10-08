import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { voter, decision, reason } = await req.json();
  
  if (!["approve", "veto"].includes(decision)) {
    return NextResponse.json({
      error: "Decision must be 'approve' or 'veto'"
    }, { status: 400 });
  }
  
  if (!voter) {
    return NextResponse.json({
      error: "Voter is required"
    }, { status: 400 });
  }
  
  const v = await db.vote.create({
    data: {
      id: `vote-${Date.now()}`,
      proposalId: params.id,
      voter,
      decision,
      reason
    }
  });
  
  // Update proposal status based on vote
  const status = decision === "approve" ? "approved" : "vetoed";
  await db.proposal.update({
    where: { id: params.id },
    data: { status }
  });
  
  return NextResponse.json(v, { status: 201 });
}

