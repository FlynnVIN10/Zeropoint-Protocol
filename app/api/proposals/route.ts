import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { dbManager } from '../../../lib/db/config'

interface Proposal {
  id: string
  title: string
  body: string
  timestamp: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  author?: string
  category?: string
  tags?: string[]
}

// In-memory storage for development (will be replaced with database)
let proposals: Proposal[] = []
let nextId = 1

export async function GET() {
  try {
    // Try to load from database first
    await dbManager.initialize()

    // For now, return stored proposals (in production, this would query database)
    const proposalsDir = join(process.cwd(), 'proposals')
    const proposalFiles = existsSync(proposalsDir) ? readdirSync(proposalsDir) : []

    const loadedProposals: Proposal[] = []

    for (const file of proposalFiles) {
      if (file.endsWith('.json')) {
        try {
          const filePath = join(proposalsDir, file)
          const content = readFileSync(filePath, 'utf-8')
          const proposal = JSON.parse(content)
          loadedProposals.push(proposal)
        } catch (error) {
          console.error(`Error loading proposal ${file}:`, error)
        }
      }
    }

    return NextResponse.json({
      proposals: loadedProposals,
      total: loadedProposals.length,
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
    console.error('Error fetching proposals:', error)

    return NextResponse.json({
      proposals: [],
      total: 0,
      error: 'Failed to fetch proposals',
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
    if (!body.title || !body.body) {
      return NextResponse.json({
        error: 'Missing required fields: title, body'
      }, {
        status: 400,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }
      })
    }

    // Generate unique ID
    const id = `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create proposal object
    const proposal: Proposal = {
      id,
      title: body.title.trim(),
      body: body.body.trim(),
      timestamp: new Date().toISOString(),
      status: 'submitted',
      author: body.author || 'anonymous',
      category: body.category || 'general',
      tags: body.tags || []
    }

    // Save to file system (in production, this would save to database)
    const proposalsDir = join(process.cwd(), 'proposals')
    const fileName = `${id}.json`
    const filePath = join(proposalsDir, fileName)

    try {
      writeFileSync(filePath, JSON.stringify(proposal, null, 2))
    } catch (error) {
      console.error('Error saving proposal:', error)
      return NextResponse.json({
        error: 'Failed to save proposal'
      }, {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }
      })
    }

    // Try to save to database as well
    try {
      await dbManager.initialize()
      // In production, this would insert into database
      console.log('Proposal saved to database (simulated)')
    } catch (dbError) {
      console.warn('Database save failed, using file system only:', dbError)
    }

    return NextResponse.json({
      success: true,
      proposal,
      message: 'Proposal submitted successfully',
      filePath: `/proposals/${fileName}`
    }, {
      status: 201,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    })

  } catch (error) {
    console.error('Error creating proposal:', error)

    return NextResponse.json({
      error: 'Failed to create proposal',
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
