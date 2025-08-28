import { unstable_noStore as noStore } from "next/cache"

async function getTrainingData() {
  noStore()
  try {
    const [statusRes, metricsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/training/status`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/training/metrics`, { cache: "no-store" })
    ])
    
    const statusData = statusRes.ok ? await statusRes.json() : null
    const metricsData = metricsRes.ok ? await metricsRes.json() : null
    
    return { status: statusData, metrics: metricsData }
  } catch (error) {
    console.error('Failed to fetch training data:', error)
    return { status: null, metrics: null }
  }
}

export default async function EnhancedTrainingPanel() {
  try {
    const { status, metrics } = await getTrainingData()
    
    return (
      <section aria-labelledby="enhanced-training">
        <h2 id="enhanced-training">Enhanced Training Status</h2>
        
        {/* Basic Status */}
        {status && (
          <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Current Run</h3>
            <dl style={{fontSize: '12px', margin: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                <dt>Run ID:</dt>
                <dd>{status.run_id ?? "—"}</dd>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                <dt>Epoch:</dt>
                <dd>{status.epoch ?? "—"}</dd>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                <dt>Step:</dt>
                <dd>{status.step ?? "—"}</dd>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                <dt>Loss:</dt>
                <dd>{status.metrics?.loss ?? status.loss ?? "—"}</dd>
              </div>
            </dl>
          </div>
        )}
        
        {/* Advanced Metrics */}
        {metrics && (
          <div style={{marginBottom: '16px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Performance Analytics</h3>
            
            {/* Statistics Summary */}
            <div style={{marginBottom: '12px', padding: '8px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px'}}>
                <div>
                  <strong>Total Runs:</strong> {metrics.statistics?.total_runs || 0}
                </div>
                <div>
                  <strong>Avg Loss:</strong> {(metrics.statistics?.avg_loss || 0).toFixed(4)}
                </div>
                <div>
                  <strong>Best Score:</strong> {metrics.statistics?.best_performance || 0}
                </div>
                <div>
                  <strong>Avg Score:</strong> {(metrics.statistics?.avg_performance_score || 0).toFixed(1)}
                </div>
              </div>
            </div>
            
            {/* Convergence Summary */}
            {metrics.statistics?.convergence_summary && (
              <div style={{marginBottom: '12px', padding: '8px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px'}}>
                <h4 style={{margin: '0 0 6px 0', fontSize: '12px', color: '#51cf66'}}>Convergence Status</h4>
                <div style={{display: 'flex', gap: '12px', fontSize: '11px'}}>
                  <span style={{color: '#51cf66'}}>🟢 Improving: {metrics.statistics.convergence_summary.improving}</span>
                  <span style={{color: '#fcc419'}}>🟡 Stable: {metrics.statistics.convergence_summary.stable}</span>
                  <span style={{color: '#ff6b6b'}}>🔴 Degrading: {metrics.statistics.convergence_summary.degrading}</span>
                </div>
              </div>
            )}
            
            {/* Provider Performance */}
            {metrics.statistics?.providers && metrics.statistics.providers.length > 0 && (
              <div style={{marginBottom: '12px', padding: '8px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px'}}>
                <h4 style={{margin: '0 0 6px 0', fontSize: '12px', color: '#51cf66'}}>Active Providers</h4>
                <div style={{fontSize: '11px', color: '#bbb'}}>
                  {metrics.statistics.providers.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Recent Metrics */}
        {metrics?.metrics && metrics.metrics.length > 0 && (
          <div style={{marginBottom: '16px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Recent Metrics</h3>
            <div style={{maxHeight: '200px', overflowY: 'auto'}}>
              {metrics.metrics.slice(0, 5).map((metric: any, index: number) => (
                <div key={index} style={{
                  padding: '6px',
                  marginBottom: '4px',
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '3px',
                  fontSize: '10px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2px'}}>
                    <span><strong>{metric.provider}</strong></span>
                    <span style={{color: metric.performance_score > 80 ? '#51cf66' : metric.performance_score > 60 ? '#fcc419' : '#ff6b6b'}}>
                      Score: {metric.performance_score}
                    </span>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9px', color: '#999'}}>
                    <span>Loss: {metric.loss.toFixed(4)}</span>
                    <span>Epoch: {metric.epoch}</span>
                    <span>Step: {metric.step}</span>
                    <span>LR: {metric.learning_rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Links */}
        <div style={{fontSize: '11px'}}>
          <a href="/evidence/training/leaderboard.json" style={{color: '#6E00FF', textDecoration: 'none'}}>
            View Leaderboard JSON
          </a>
          <br />
          <a href="/api/training/metrics" style={{color: '#6E00FF', textDecoration: 'none'}}>
            View Metrics API
          </a>
        </div>
      </section>
    )
  } catch (e: any) {
    return (
      <section>
        <h2>Enhanced Training Status</h2>
        <p style={{color: '#ff6b6b'}}>No data: {e.message}</p>
      </section>
    )
  }
}
