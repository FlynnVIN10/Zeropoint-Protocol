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

export function getAuditEvents(): AuditEvent[] {
  return [...auditEvents]
}

export function clearAuditEvents(): void {
  auditEvents = []
  eventCounter = 1
}
