import { unstable_noStore as noStore } from "next/cache"

async function getSecurityData() {
  noStore()
  try {
    const [securityRes, auditRes, usersRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/security/monitoring`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/audit/log`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/enterprise/users`, { cache: "no-store" })
    ])
    
    const securityData = securityRes.ok ? await securityRes.json() : null
    const auditData = auditRes.ok ? await auditRes.json() : null
    const usersData = usersRes.ok ? await usersRes.json() : null
    
    return { security: securityData, audit: auditData, users: usersData }
  } catch (error) {
    console.error('Failed to fetch security data:', error)
    return { security: null, audit: null, users: null }
  }
}

export default async function SecurityDashboard() {
  try {
    const { security, audit, users } = await getSecurityData()
    
    return (
      <section aria-labelledby="security-dashboard">
        <h2 id="security-dashboard">Security Dashboard</h2>
        
        {/* Security Overview */}
        {security && (
          <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Security Overview</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px'}}>
              <div>
                <strong>Total Events:</strong> {security.statistics?.total_events || 0}
              </div>
              <div>
                <strong>Avg Threat Score:</strong> {security.statistics?.threat_score_average || 0}
              </div>
              <div>
                <strong>High Severity:</strong> {security.statistics?.severity_distribution?.high || 0}
              </div>
              <div>
                <strong>Critical:</strong> {security.statistics?.severity_distribution?.critical || 0}
              </div>
            </div>
          </div>
        )}
        
        {/* Audit Summary */}
        {audit && (
          <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Audit Summary</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px'}}>
              <div>
                <strong>Total Events:</strong> {audit.statistics?.total_events || 0}
              </div>
              <div>
                <strong>Categories:</strong> {Object.keys(audit.statistics?.category_distribution || {}).length}
              </div>
              <div>
                <strong>Users Active:</strong> {Object.keys(audit.statistics?.user_activity || {}).length}
              </div>
              <div>
                <strong>Compliance Tags:</strong> {audit.statistics?.compliance_coverage?.length || 0}
              </div>
            </div>
          </div>
        )}
        
        {/* User Security Status */}
        {users && (
          <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>User Security Status</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px'}}>
              <div>
                <strong>Total Users:</strong> {users.statistics?.total_users || 0}
              </div>
              <div>
                <strong>MFA Adoption:</strong> {users.statistics?.mfa_adoption || 0}%
              </div>
              <div>
                <strong>SSO Adoption:</strong> {users.statistics?.sso_adoption || 0}%
              </div>
              <div>
                <strong>Active Users:</strong> {users.statistics?.status_distribution?.active || 0}
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Security Events */}
        {security?.events && security.events.length > 0 && (
          <div style={{marginBottom: '16px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Recent Security Events</h3>
            <div style={{maxHeight: '200px', overflowY: 'auto'}}>
              {security.events.slice(0, 5).map((event: any, index: number) => (
                <div key={index} style={{
                  padding: '8px',
                  marginBottom: '6px',
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '4px',
                  fontSize: '10px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                    <span><strong>{event.event_type}</strong></span>
                    <span style={{
                      color: event.severity === 'critical' ? '#ff6b6b' : 
                             event.severity === 'high' ? '#ff922b' : 
                             event.severity === 'medium' ? '#fcc419' : '#51cf66'
                    }}>
                      {event.severity}
                    </span>
                  </div>
                  <div style={{fontSize: '9px', color: '#999', marginBottom: '4px'}}>
                    {event.source_ip} • {event.resource}
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9px', color: '#999'}}>
                    <span>Threat Score: {event.threat_score}</span>
                    <span>Status: {event.mitigation_status}</span>
                    <span>User: {event.username || 'unknown'}</span>
                    <span>Time: {new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Security Metrics */}
        {security?.statistics && (
          <div style={{marginBottom: '16px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Security Metrics</h3>
            
            {/* Severity Distribution */}
            {security.statistics.severity_distribution && (
              <div style={{marginBottom: '8px', padding: '8px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px'}}>
                <h4 style={{margin: '0 0 6px 0', fontSize: '12px', color: '#51cf66'}}>Severity Distribution</h4>
                <div style={{display: 'flex', gap: '12px', fontSize: '11px'}}>
                  {Object.entries(security.statistics.severity_distribution).map(([severity, count]) => (
                    <span key={severity} style={{
                      color: severity === 'critical' ? '#ff6b6b' : 
                             severity === 'high' ? '#ff922b' : 
                             severity === 'medium' ? '#fcc419' : '#51cf66'
                    }}>
                      {severity}: {String(count)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Top Source IPs */}
            {security.statistics.top_source_ips && security.statistics.top_source_ips.length > 0 && (
              <div style={{marginBottom: '8px', padding: '8px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px'}}>
                <h4 style={{margin: '0 0 6px 0', fontSize: '12px', color: '#51cf66'}}>Top Source IPs</h4>
                <div style={{fontSize: '11px', color: '#bbb'}}>
                  {security.statistics.top_source_ips.slice(0, 5).map((ip: any, index: number) => (
                    <div key={index} style={{marginBottom: '2px'}}>
                      {ip.ip}: {ip.count} events
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Compliance Impact */}
            {security.statistics.compliance_impact_summary && security.statistics.compliance_impact_summary.length > 0 && (
              <div style={{marginBottom: '8px', padding: '8px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px'}}>
                <h4 style={{margin: '0 0 6px 0', fontSize: '12px', color: '#51cf66'}}>Compliance Impact</h4>
                <div style={{fontSize: '11px', color: '#bbb'}}>
                  {security.statistics.compliance_impact_summary.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Links */}
        <div style={{fontSize: '11px'}}>
          <a href="/api/security/monitoring" style={{color: '#6E00FF', textDecoration: 'none'}}>
            View Security API
          </a>
          <br />
          <a href="/api/audit/log" style={{color: '#6E00FF', textDecoration: 'none'}}>
            View Audit API
          </a>
          <br />
          <a href="/api/enterprise/users" style={{color: '#6E00FF', textDecoration: 'none'}}>
            View Users API
          </a>
        </div>
      </section>
    )
  } catch (e: any) {
    return (
      <section>
        <h2>Security Dashboard</h2>
        <p style={{color: '#ff6b6b'}}>Error: {e.message}</p>
      </section>
    )
  }
}
