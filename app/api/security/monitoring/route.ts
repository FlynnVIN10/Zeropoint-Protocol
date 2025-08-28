import { NextRequest, NextResponse } from 'next/server'
import { logAuditEvent } from '../../../../services/audit'

interface SecurityEvent {
  id: string
  timestamp: string
  event_type: 'authentication_failure' | 'authorization_violation' | 'suspicious_activity' | 'rate_limit_exceeded' | 'anomaly_detected' | 'threat_detected'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source_ip: string
  user_id?: string
  username?: string
  resource: string
  details: any
  threat_score: number
  mitigation_status: 'none' | 'investigating' | 'mitigated' | 'resolved'
  ioc_indicators: string[]
  compliance_impact: string[]
}

interface ThreatIntelligence {
  ip_address: string
  threat_score: number
  reputation: 'clean' | 'suspicious' | 'malicious' | 'unknown'
  categories: string[]
  last_seen: string
  first_seen: string
  confidence: number
}

// In-memory security event storage (in production, this would be a database)
let securityEvents: SecurityEvent[] = []
let eventCounter = 1

// In-memory threat intelligence (in production, this would integrate with external threat feeds)
let threatIntelligence: Map<string, ThreatIntelligence> = new Map()

// Initialize with some demo threat intelligence
threatIntelligence.set('192.168.1.100', {
  ip_address: '192.168.1.100',
  threat_score: 85,
  reputation: 'suspicious',
  categories: ['botnet', 'scanning'],
  last_seen: new Date().toISOString(),
  first_seen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  confidence: 0.8
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      event_type, 
      severity, 
      source_ip, 
      user_id, 
      username, 
      resource, 
      details, 
      threat_score = 0,
      ioc_indicators = [],
      compliance_impact = []
    } = body

    if (!event_type || !severity || !source_ip || !resource) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type, severity, source_ip, resource' },
        { status: 400 }
      )
    }

    const securityEvent: SecurityEvent = {
      id: `sec-${eventCounter++}`,
      timestamp: new Date().toISOString(),
      event_type,
      severity,
      source_ip,
      user_id,
      username,
      resource,
      details,
      threat_score,
      mitigation_status: 'none',
      ioc_indicators,
      compliance_impact
    }

    securityEvents.push(securityEvent)

    // Check threat intelligence for the source IP
    const threatIntel = threatIntelligence.get(source_ip)
    if (threatIntel && threatIntel.threat_score > 70) {
      securityEvent.severity = 'high'
      securityEvent.threat_score = Math.max(securityEvent.threat_score, threatIntel.threat_score)
      securityEvent.ioc_indicators.push(...threatIntel.categories)
    }

    // Log to audit system
    logAuditEvent({
      user_id: user_id || 'unknown',
      username: username || 'unknown',
      action: 'security_event',
      resource: 'security_monitoring',
      resource_id: securityEvent.id,
      details: {
        event_type,
        severity,
        source_ip,
        threat_score: securityEvent.threat_score,
        ioc_indicators: securityEvent.ioc_indicators
      },
      severity: securityEvent.severity as any,
      category: 'security',
      compliance_tags: ['security', 'threat_detection', ...compliance_impact]
    })

    // Log security event
    console.log(`[SECURITY] ${securityEvent.timestamp} - ${event_type} from ${source_ip} (threat_score: ${securityEvent.threat_score})`, {
      severity: securityEvent.severity,
      resource: securityEvent.resource,
      details: securityEvent.details
    })

    return NextResponse.json({
      success: true,
      event_id: securityEvent.id,
      threat_score: securityEvent.threat_score,
      severity: securityEvent.severity,
      message: 'Security event logged successfully'
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
    console.error('[SECURITY] Failed to log security event:', error)
    return NextResponse.json(
      { error: 'Failed to log security event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const event_type = searchParams.get('event_type')
    const severity = searchParams.get('severity')
    const source_ip = searchParams.get('source_ip')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let filteredEvents = securityEvents
    
    // Apply filters
    if (event_type) {
      filteredEvents = filteredEvents.filter(e => e.event_type === event_type)
    }
    
    if (severity) {
      filteredEvents = filteredEvents.filter(e => e.severity === severity)
    }
    
    if (source_ip) {
      filteredEvents = filteredEvents.filter(e => e.source_ip === source_ip)
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

    // Calculate security statistics
    const stats = calculateSecurityStats(filteredEvents)

    return NextResponse.json({
      events: filteredEvents,
      statistics: stats,
      total_events: securityEvents.length,
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
    console.error('[SECURITY] Failed to fetch security events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security events' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, mitigation_status, notes } = body

    if (!event_id || !mitigation_status) {
      return NextResponse.json(
        { error: 'Missing required fields: event_id, mitigation_status' },
        { status: 400 }
      )
    }

    const eventIndex = securityEvents.findIndex(e => e.id === event_id)
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Security event not found' },
        { status: 404 }
      )
    }

    // Update mitigation status
    securityEvents[eventIndex].mitigation_status = mitigation_status
    if (notes) {
      securityEvents[eventIndex].details.notes = notes
    }

    // Log audit event
    logAuditEvent({
      user_id: 'system',
      username: 'system',
      action: 'update_mitigation',
      resource: 'security_event',
      resource_id: event_id,
      details: { mitigation_status, notes },
      severity: 'medium',
      category: 'security',
      compliance_tags: ['security', 'incident_response']
    })

    return NextResponse.json({
      success: true,
      message: 'Security event mitigation status updated successfully',
      event_id
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
    console.error('[SECURITY] Failed to update mitigation status:', error)
    return NextResponse.json(
      { error: 'Failed to update mitigation status' },
      { status: 500 }
    )
  }
}

function calculateSecurityStats(events: SecurityEvent[]) {
  if (events.length === 0) {
    return {
      total_events: 0,
      severity_distribution: {},
      event_type_distribution: {},
      threat_score_average: 0,
      mitigation_status_distribution: {},
      top_source_ips: [],
      compliance_impact_summary: []
    }
  }

  const severityDistribution = events.reduce((acc, e) => {
    acc[e.severity] = (acc[e.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const eventTypeDistribution = events.reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const threatScoreAverage = events.reduce((sum, e) => sum + e.threat_score, 0) / events.length

  const mitigationStatusDistribution = events.reduce((acc, e) => {
    acc[e.mitigation_status] = (acc[e.mitigation_status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sourceIpCounts = events.reduce((acc, e) => {
    acc[e.source_ip] = (acc[e.source_ip] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topSourceIps = Object.entries(sourceIpCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }))

  const allComplianceImpact = events.flatMap(e => e.compliance_impact)
  const complianceImpactSummary = [...new Set(allComplianceImpact)]

  return {
    total_events: events.length,
    severity_distribution: severityDistribution,
    event_type_distribution: eventTypeDistribution,
    threat_score_average: Math.round(threatScoreAverage * 100) / 100,
    mitigation_status_distribution: mitigationStatusDistribution,
    top_source_ips: topSourceIps,
    compliance_impact_summary: complianceImpactSummary
  }
}

// Helper function to check threat intelligence
function checkThreatIntelligence(ipAddress: string): ThreatIntelligence | null {
  return threatIntelligence.get(ipAddress) || null
}

// Helper function to add threat intelligence
function addThreatIntelligence(intel: ThreatIntelligence) {
  threatIntelligence.set(intel.ip_address, intel)
}
