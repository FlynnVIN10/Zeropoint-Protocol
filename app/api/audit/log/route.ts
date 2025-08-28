import { NextRequest, NextResponse } from 'next/server'

interface AuditEvent {
  id: string
  timestamp: string
  user_id: string
  username: string
  action: string
  resource: string
  resource_id?: string
  details: any
  ip_address: string
  user_agent: string
  session_id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'authentication' | 'authorization' | 'data_access' | 'consensus' | 'system' | 'security'
  compliance_tags: string[]
}

// In-memory audit log storage (in production, this would be a database)
let auditEvents: AuditEvent[] = []
let eventCounter = 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      user_id, 
      username, 
      action, 
      resource, 
      resource_id, 
      details, 
      severity = 'low',
      category = 'system',
      compliance_tags = []
    } = body

    if (!user_id || !username || !action || !resource) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, username, action, resource' },
        { status: 400 }
      )
    }

    const auditEvent: AuditEvent = {
      id: `audit-${eventCounter++}`,
      timestamp: new Date().toISOString(),
      user_id,
      username,
      action,
      resource,
      resource_id,
      details,
      ip_address: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      session_id: request.headers.get('x-session-id') || 'unknown',
      severity,
      category,
      compliance_tags
    }

    auditEvents.push(auditEvent)

    // Log to console for development
    console.log(`[AUDIT] ${auditEvent.timestamp} - ${username} (${user_id}) performed ${action} on ${resource}`, {
      severity: auditEvent.severity,
      category: auditEvent.category,
      ip: auditEvent.ip_address,
      details: auditEvent.details
    })

    return NextResponse.json({
      success: true,
      audit_id: auditEvent.id,
      message: 'Audit event logged successfully'
    }, {
      status: 201,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline',
        'access-control-allow-origin': '*'
      }
    })
  } catch (error) {
    console.error('[AUDIT] Failed to log event:', error)
    return NextResponse.json(
      { error: 'Failed to log audit event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const category = searchParams.get('category')
    const severity = searchParams.get('severity')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let filteredEvents = auditEvents
    
    // Apply filters
    if (user_id) {
      filteredEvents = filteredEvents.filter(e => e.user_id === user_id)
    }
    
    if (category) {
      filteredEvents = filteredEvents.filter(e => e.category === category)
    }
    
    if (severity) {
      filteredEvents = filteredEvents.filter(e => e.severity === severity)
    }
    
    if (start_date) {
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) >= new Date(start_date))
    }
    
    if (end_date) {
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) <= new Date(end_date))
    }
    
    // Sort by timestamp (newest first) and limit results
    filteredEvents = filteredEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    // Calculate audit statistics
    const stats = calculateAuditStats(filteredEvents)

    return NextResponse.json({
      events: filteredEvents,
      statistics: stats,
      total_events: auditEvents.length,
      filtered_count: filteredEvents.length
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
    console.error('[AUDIT] Failed to fetch audit events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit events' },
      { status: 500 }
    )
  }
}

function calculateAuditStats(events: AuditEvent[]) {
  if (events.length === 0) {
    return {
      total_events: 0,
      severity_distribution: {},
      category_distribution: {},
      user_activity: {},
      compliance_coverage: []
    }
  }

  const severityDistribution = events.reduce((acc, e) => {
    acc[e.severity] = (acc[e.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryDistribution = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const userActivity = events.reduce((acc, e) => {
    acc[e.username] = (acc[e.username] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const allComplianceTags = events.flatMap(e => e.compliance_tags)
  const complianceCoverage = [...new Set(allComplianceTags)]

  return {
    total_events: events.length,
    severity_distribution: severityDistribution,
    category_distribution: categoryDistribution,
    user_activity: userActivity,
    compliance_coverage: complianceCoverage
  }
}

// Helper function to log audit events from other parts of the system
export function logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'ip_address' | 'user_agent' | 'session_id'>) {
  const auditEvent: AuditEvent = {
    ...event,
    id: `audit-${eventCounter++}`,
    timestamp: new Date().toISOString(),
    ip_address: 'system',
    user_agent: 'system',
    session_id: 'system'
  }
  
  auditEvents.push(auditEvent)
  
  // Log to console
  console.log(`[AUDIT] ${auditEvent.timestamp} - ${event.username} (${event.user_id}) performed ${event.action} on ${event.resource}`, {
    severity: auditEvent.severity,
    category: auditEvent.category,
    details: auditEvent.details
  })
}
