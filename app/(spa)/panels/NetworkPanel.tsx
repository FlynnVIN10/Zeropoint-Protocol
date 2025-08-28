import { unstable_noStore as noStore } from "next/cache"

async function getNetworkData() {
  noStore()
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/network/instances`, { cache: "no-store" })
    if (!response.ok) throw new Error(`status ${response.status}`)
    return response.json()
  } catch (error) {
    console.error('Failed to fetch network data:', error)
    return null
  }
}

export default async function NetworkPanel() {
  try {
    const networkData = await getNetworkData()
    
    return (
      <section aria-labelledby="network-monitoring">
        <h2 id="network-monitoring">Network Monitoring</h2>
        
        {networkData ? (
          <>
            {/* Network Statistics */}
            <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
              <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Network Overview</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px'}}>
                <div>
                  <strong>Total Instances:</strong> {networkData.total_instances}
                </div>
                <div>
                  <strong>Online:</strong> {networkData.online_instances}
                </div>
                <div>
                  <strong>Avg Latency:</strong> {networkData.network_statistics?.avg_latency?.toFixed(1) || 0}ms
                </div>
                <div>
                  <strong>Avg Uptime:</strong> {networkData.network_statistics?.avg_uptime?.toFixed(1) || 0}%
                </div>
              </div>
            </div>
            
            {/* Performance Tiers */}
            {networkData.network_statistics?.performance_tiers && (
              <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
                <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Performance Distribution</h3>
                <div style={{display: 'flex', gap: '12px', fontSize: '11px'}}>
                  <span style={{color: '#51cf66'}}>🟢 High: {networkData.network_statistics.performance_tiers.high}</span>
                  <span style={{color: '#fcc419'}}>🟡 Medium: {networkData.network_statistics.performance_tiers.medium}</span>
                  <span style={{color: '#ff6b6b'}}>🔴 Low: {networkData.network_statistics.performance_tiers.low}</span>
                </div>
              </div>
            )}
            
            {/* Regional Distribution */}
            {networkData.network_statistics?.regional_distribution && Object.keys(networkData.network_statistics.regional_distribution).length > 0 && (
              <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
                <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Regional Distribution</h3>
                <div style={{fontSize: '11px', color: '#bbb'}}>
                  {Object.entries(networkData.network_statistics.regional_distribution).map(([region, count]) => (
                    <div key={region} style={{marginBottom: '2px'}}>
                      {region}: {count} instances
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Active Instances */}
            {networkData.instances && networkData.instances.length > 0 && (
              <div style={{marginBottom: '16px'}}>
                <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Active Instances</h3>
                <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                  {networkData.instances.slice(0, 5).map((instance: any, index: number) => (
                    <div key={index} style={{
                      padding: '8px',
                      marginBottom: '6px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                        <span><strong>{instance.hostname}</strong></span>
                        <span style={{
                          color: instance.status === 'online' ? '#51cf66' : instance.status === 'maintenance' ? '#fcc419' : '#ff6b6b'
                        }}>
                          {instance.status}
                        </span>
                      </div>
                      <div style={{fontSize: '9px', color: '#999', marginBottom: '4px'}}>
                        {instance.ip_address} • {instance.region} • v{instance.version}
                      </div>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9px', color: '#999'}}>
                        <span>Latency: {instance.performance_metrics.latency_ms}ms</span>
                        <span>Uptime: {instance.performance_metrics.uptime_percentage}%</span>
                        <span>Proposals: {instance.consensus_participation.total_proposals}</span>
                        <span>Approval: {instance.consensus_participation.approved_proposals}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Capabilities */}
            {networkData.network_statistics?.total_capabilities && networkData.network_statistics.total_capabilities.length > 0 && (
              <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
                <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Network Capabilities</h3>
                <div style={{fontSize: '11px', color: '#bbb'}}>
                  {networkData.network_statistics.total_capabilities.join(', ')}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#999'}}>
            No network data available
          </div>
        )}
        
        {/* Links */}
        <div style={{fontSize: '11px'}}>
          <a href="/api/network/instances" style={{color: '#6E00FF', textDecoration: 'none'}}>
            View Network API
          </a>
        </div>
      </section>
    )
  } catch (e: any) {
    return (
      <section>
        <h2>Network Monitoring</h2>
        <p style={{color: '#ff6b6b'}}>Error: {e.message}</p>
      </section>
      )
  }
}
