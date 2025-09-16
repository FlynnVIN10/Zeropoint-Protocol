import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge'

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
          'x-content-type-options': 'nosniff',
          'content-disposition': 'inline'
        }
      })
    }

    // Mock proposal data - replace with real database query
    const proposal: Proposal = {
      id,
      title: `Proposal ${id}`,
      body: `This is a mock proposal with ID ${id}. In production, this would be fetched from a database.`,
      timestamp: new Date().toISOString(),
      status: 'under_review',
      author: 'system',
      category: 'governance',
      tags: ['mock', 'proposal']
    }

    return NextResponse.json(proposal, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    })

  } catch (error) {
    const { id } = await params;
    console.error(`Error fetching proposal ${id}:`, error)

    return NextResponse.json({
      error: 'Failed to fetch proposal',
      id: id,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
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
      }, { 
        status: 400,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
          'content-disposition': 'inline'
        }
      })
    }

    // Mock update response - replace with real database update
    const updatedProposal: Proposal = {
      id,
      title: body.title || `Proposal ${id}`,
      body: body.body || `Updated proposal with ID ${id}`,
      timestamp: new Date().toISOString(),
      status: body.status || 'under_review',
      author: body.author || 'system',
      category: body.category || 'governance',
      tags: body.tags || ['mock', 'proposal', 'updated']
    }

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      message: 'Proposal updated successfully'
    }, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    })

  } catch (error) {
    const { id } = await params;
    console.error(`Error updating proposal ${id}:`, error)

    return NextResponse.json({
      error: 'Failed to update proposal',
      id: id,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    })
  }
}