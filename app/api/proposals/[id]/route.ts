import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { dbManager } from '../../../../lib/db/config'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({
        error: 'Proposal ID is required'
      }, {
        status: 400,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }
      })
    }

    // Try database first
    try {
      await dbManager.initialize()
      const rows = await dbManager.query('proposals')
      const match = rows.find((p: any) => p.id === id)
      if (match) {
        return NextResponse.json({ proposal: match, timestamp: new Date().toISOString() }, {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
            'x-content-type-options': 'nosniff'
          }
        })
      }
    } catch {}

    // Fallback: file system
    const proposalsDir = join(process.cwd(), 'proposals')
    const fileName = `${id}.json`
    const filePath = join(proposalsDir, fileName)

    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8')
        const proposal: Proposal = JSON.parse(content)

        return NextResponse.json({
          proposal,
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
        console.error(`Error parsing proposal ${id}:`, error)
      }
    }

    // If not found in file system, try database (future implementation)
    // For now, return not found

    return NextResponse.json({
      error: 'Proposal not found',
      id,
      timestamp: new Date().toISOString()
    }, {
      status: 404,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    })

  } catch (error) {
    console.error(`Error fetching proposal ${params.id}:`, error)

    return NextResponse.json({
      error: 'Failed to fetch proposal',
      id: params.id,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({
        error: 'Proposal ID is required'
      }, { status: 400 })
    }

    // Load existing proposal
    const proposalsDir = join(process.cwd(), 'proposals')
    const fileName = `${id}.json`
    const filePath = join(proposalsDir, fileName)

    if (!existsSync(filePath)) {
      return NextResponse.json({
        error: 'Proposal not found'
      }, { status: 404 })
    }

    const content = readFileSync(filePath, 'utf-8')
    const existingProposal: Proposal = JSON.parse(content)

    // Update allowed fields
    const updatedProposal: Proposal = {
      ...existingProposal,
      ...body,
      id, // Ensure ID doesn't change
      timestamp: existingProposal.timestamp, // Preserve original timestamp
      updatedAt: new Date().toISOString()
    }

    // Save updated proposal
    const fs = require('fs')
    fs.writeFileSync(filePath, JSON.stringify(updatedProposal, null, 2))

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      message: 'Proposal updated successfully'
    }, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    })

  } catch (error) {
    console.error(`Error updating proposal ${params.id}:`, error)

    return NextResponse.json({
      error: 'Failed to update proposal',
      id: params.id
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
