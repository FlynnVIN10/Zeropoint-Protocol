import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  try {
    // Read unified metadata from static file
    const meta = await fetch('/status/version.json').then(r => r.json())
    
    const timestamp = new Date().toISOString()
    
    // Mock proposal metrics - replace with real database queries
    const proposalMetrics = {
      proposalsPending: 1,
      proposalsApproved: 2,
      proposalsExecuted: 1,
      latestProposalId: "prop_20250911_003",
      latestProposalStatus: "approved",
      lastUpdated: timestamp,
      commit: meta.commit,
      buildTime: meta.buildTime,
      phase: meta.phase,
      ciStatus: meta.ciStatus
    }

    return NextResponse.json(proposalMetrics, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    })
  } catch (error) {
    console.error('Proposal metrics failed:', error);
    
    return NextResponse.json(
      {
        proposalsPending: 0,
        proposalsApproved: 0,
        proposalsExecuted: 0,
        latestProposalId: "none",
        latestProposalStatus: "none",
        lastUpdated: new Date().toISOString(),
        commit: 'unknown',
        buildTime: new Date().toISOString(),
        phase: 'stage2',
        ciStatus: 'error'
      },
      {
        status: 503,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }
      }
    )
  }
}