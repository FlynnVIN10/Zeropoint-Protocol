import { NextRequest, NextResponse } from 'next/server'
import { providerRouter } from '../../../../services/router'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter: q' },
        { status: 400 }
      )
    }

    // Generate training signal and create proposal
    const trainingSignal = {
      prompt: query,
      timestamp: new Date().toISOString(),
      model: 'router-selection',
      parameters: {
        max_tokens: 1024,
        temperature: 0.7
      }
    }

    // Create synthiant proposal
    const proposalResponse = await fetch(`${request.nextUrl.origin}/api/consensus/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: query,
        synthiant_id: 'router:exec',
        training_signal: trainingSignal,
        evidence_links: [`/api/router/exec?q=${encodeURIComponent(query)}`]
      })
    })

    if (!proposalResponse.ok) {
      throw new Error('Failed to create proposal')
    }

    const proposal = await proposalResponse.json()

    // Execute query through provider router
    const result = await providerRouter.executeQuery(query, 1024)

    // Record synthiant approval (router automatically approves its own decisions)
    await fetch(`${request.nextUrl.origin}/api/consensus/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        proposal_id: proposal.proposal_id,
        voter_id: 'router:exec',
        voter_type: 'synthiant',
        vote: 'approve',
        reason: `Router selected ${result.routing.provider} based on performance metrics`
      })
    })

    return NextResponse.json({
      response: result.response,
      routing: result.routing,
      telemetry: result.telemetry,
      proposal_id: proposal.proposal_id,
      consensus_status: 'synthiant_approved',
      message: 'Query executed and approved by synthiant consensus'
    }, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline',
        'access-control-allow-origin': '*'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to execute query',
        details: error instanceof Error ? error.message : 'Unknown error',
        consensus_status: 'failed'
      },
      { status: 500 }
    )
  }
}
