import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { dbManager } from '../../../../lib/db/config'

interface ConsensusReview {
  id: string
  proposalId: string
  reviewer: string
  decision: 'approve' | 'reject' | 'abstain'
  reasoning: string
  confidence: number // 0-1 scale
  timestamp: string
  reviewerType: 'synthient' | 'human'
}

interface ProposalConsensus {
  proposalId: string
  reviews: ConsensusReview[]
  summary: {
    totalReviews: number
    approved: number
    rejected: number
    abstained: number
    consensusReached: boolean
    finalDecision: 'approved' | 'rejected' | 'pending' | null
    lastUpdated: string
  }
}

export async function GET() {
  try {
    // Load all proposals and their consensus status
    const proposalsDir = join(process.cwd(), 'proposals')
    const consensusDir = join(process.cwd(), 'evidence', 'consensus')

    const proposalFiles = existsSync(proposalsDir) ? readdirSync(proposalsDir) : []
    const consensusFiles = existsSync(consensusDir) ? readdirSync(consensusDir) : []

    const proposalsWithConsensus = []

    for (const file of proposalFiles) {
      if (file.endsWith('.json')) {
        try {
          const proposalPath = join(proposalsDir, file)
          const proposal = JSON.parse(readFileSync(proposalPath, 'utf-8'))

          // Find consensus file for this proposal
          const consensusFile = consensusFiles.find(cf => cf.startsWith(proposal.id))
          let consensus: ProposalConsensus | null = null

          if (consensusFile) {
            const consensusPath = join(consensusDir, consensusFile)
            consensus = JSON.parse(readFileSync(consensusPath, 'utf-8'))
          }

          proposalsWithConsensus.push({
            proposal,
            consensus
          })
        } catch (error) {
          console.error(`Error loading proposal ${file}:`, error)
        }
      }
    }

    return NextResponse.json({
      proposals: proposalsWithConsensus,
      total: proposalsWithConsensus.length,
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    })

  } catch (error) {
    console.error('Error fetching consensus data:', error)

    return NextResponse.json({
      proposals: [],
      total: 0,
      error: 'Failed to fetch consensus data',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.proposalId || !body.reviewer || !body.decision) {
      return NextResponse.json({
        error: 'Missing required fields: proposalId, reviewer, decision'
      }, {
        status: 400,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }
      })
    }

    // Verify proposal exists
    const proposalsDir = join(process.cwd(), 'proposals')
    const proposalFile = `${body.proposalId}.json`
    const proposalPath = join(proposalsDir, proposalFile)

    if (!existsSync(proposalPath)) {
      return NextResponse.json({
        error: 'Proposal not found'
      }, {
        status: 404,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }
      })
    }

    // Load existing consensus or create new
    const consensusDir = join(process.cwd(), 'evidence', 'consensus')
    const consensusFile = `${body.proposalId}-consensus.json`
    const consensusPath = join(consensusDir, consensusFile)

    let consensus: ProposalConsensus

    if (existsSync(consensusPath)) {
      consensus = JSON.parse(readFileSync(consensusPath, 'utf-8'))
    } else {
      consensus = {
        proposalId: body.proposalId,
        reviews: [],
        summary: {
          totalReviews: 0,
          approved: 0,
          rejected: 0,
          abstained: 0,
          consensusReached: false,
          finalDecision: null,
          lastUpdated: new Date().toISOString()
        }
      }
    }

    // Create new review
    const review: ConsensusReview = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      proposalId: body.proposalId,
      reviewer: body.reviewer,
      decision: body.decision,
      reasoning: body.reasoning || '',
      confidence: body.confidence || 0.8,
      timestamp: new Date().toISOString(),
      reviewerType: body.reviewerType || 'synthient'
    }

    // Add review to consensus
    consensus.reviews.push(review)

    // Update summary
    consensus.summary.totalReviews = consensus.reviews.length
    consensus.summary.approved = consensus.reviews.filter(r => r.decision === 'approve').length
    consensus.summary.rejected = consensus.reviews.filter(r => r.decision === 'reject').length
    consensus.summary.abstained = consensus.reviews.filter(r => r.decision === 'abstain').length
    consensus.summary.lastUpdated = new Date().toISOString()

    // Determine if consensus reached (simple majority for now)
    const totalVotes = consensus.summary.approved + consensus.summary.rejected
    if (totalVotes >= 3) { // Require minimum 3 votes
      if (consensus.summary.approved > consensus.summary.rejected) {
        consensus.summary.consensusReached = true
        consensus.summary.finalDecision = 'approved'
      } else if (consensus.summary.rejected > consensus.summary.approved) {
        consensus.summary.consensusReached = true
        consensus.summary.finalDecision = 'rejected'
      }
    }

    // Save consensus to file
    writeFileSync(consensusPath, JSON.stringify(consensus, null, 2))

    // Write evidence file for the proposal
    const evidenceDir = join(process.cwd(), 'evidence', 'consensus')
    const evidenceFile = `${body.proposalId}-evidence.json`
    const evidencePath = join(evidenceDir, evidenceFile)

    const evidenceData = {
      proposalId: body.proposalId,
      reviews: consensus.reviews,
      finalDecision: consensus.summary.finalDecision,
      consensusReached: consensus.summary.consensusReached,
      timestamp: new Date().toISOString(),
      evidenceGenerated: new Date().toISOString()
    }

    try {
      writeFileSync(evidencePath, JSON.stringify(evidenceData, null, 2))
      console.log(`Evidence written to ${evidencePath}`)
    } catch (evidenceError) {
      console.error('Failed to write evidence file:', evidenceError)
    }

    // Try to save to database
    try {
      await dbManager.initialize()
      console.log('Consensus review saved to database (simulated)')
    } catch (dbError) {
      console.warn('Database save failed, using file system only:', dbError)
    }

    return NextResponse.json({
      success: true,
      review,
      consensus: consensus.summary,
      message: 'Consensus review submitted successfully'
    }, {
      status: 201,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    })

  } catch (error) {
    console.error('Error submitting consensus review:', error)

    return NextResponse.json({
      error: 'Failed to submit consensus review',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    })
  }
}