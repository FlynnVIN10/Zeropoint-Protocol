import { unstable_noStore as noStore } from "next/cache"

async function getQuantumData() {
  noStore()
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/quantum/compute`, { cache: "no-store" })
    if (!response.ok) throw new Error(`status ${response.status}`)
    return response.json()
  } catch (error) {
    console.error('Failed to fetch quantum data:', error)
    return null
  }
}

export default async function QuantumComputingDashboard() {
  try {
    const quantumData = await getQuantumData()
    
    return (
      <section aria-labelledby="quantum-computing-dashboard">
        <h2 id="quantum-computing-dashboard">Quantum Computing Dashboard</h2>
        
        {/* Quantum Overview */}
        {quantumData && (
          <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Quantum Overview</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px'}}>
              <div>
                <strong>Total Jobs:</strong> {quantumData.statistics?.total_jobs || 0}
              </div>
              <div>
                <strong>Avg Quantum Advantage:</strong> {quantumData.statistics?.avg_quantum_advantage || 0}
              </div>
              <div>
                <strong>Total Qubits Used:</strong> {quantumData.statistics?.total_qubits_used || 0}
              </div>
              <div>
                <strong>Avg Execution Time:</strong> {quantumData.statistics?.avg_execution_time || 0}ms
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Quantum Jobs */}
        {quantumData?.jobs && quantumData.jobs.length > 0 && (
          <div style={{marginBottom: '16px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Recent Quantum Jobs</h3>
            <div style={{maxHeight: '200px', overflowY: 'auto'}}>
              {quantumData.jobs.slice(0, 3).map((job: any, index: number) => (
                <div key={index} style={{
                  padding: '8px',
                  marginBottom: '6px',
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '4px',
                  fontSize: '10px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                    <span><strong>{job.job_type}</strong></span>
                    <span style={{
                      color: job.status === 'completed' ? '#51cf66' : 
                             job.status === 'running' ? '#fcc419' : 
                             job.status === 'failed' ? '#ff6b6b' : '#999'
                    }}>
                      {job.status}
                    </span>
                  </div>
                  <div style={{fontSize: '9px', color: '#999', marginBottom: '4px'}}>
                    {job.quantum_backend} • {job.qubits_required} qubits • {job.circuit_depth} depth
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9px', color: '#999'}}>
                    <span>Priority: {job.priority}</span>
                    <span>Qubits: {job.qubits_required}</span>
                    <span>Circuit Depth: {job.circuit_depth}</span>
                    <span>Execution: {job.execution_time_ms || 0}ms</span>
                  </div>
                  {job.results.quantum_advantage && (
                    <div style={{marginTop: '4px', fontSize: '9px', color: '#51cf66'}}>
                      Quantum Advantage: {(job.results.quantum_advantage * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Quantum Job Statistics */}
        {quantumData?.statistics && (
          <div style={{marginBottom: '16px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Quantum Job Statistics</h3>
            
            {/* Job Type Distribution */}
            {quantumData.statistics.job_type_distribution && (
              <div style={{marginBottom: '8px', padding: '8px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px'}}>
                <h4 style={{margin: '0 0 6px 0', fontSize: '12px', color: '#51cf66'}}>Job Type Distribution</h4>
                <div style={{fontSize: '11px', color: '#bbb'}}>
                  {Object.entries(quantumData.statistics.job_type_distribution).map(([type, count]) => (
                    <div key={type} style={{marginBottom: '2px'}}>
                      {type.replace(/_/g, ' ')}: {count} jobs
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Backend Distribution */}
            {quantumData.statistics.backend_distribution && (
              <div style={{marginBottom: '8px', padding: '8px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px'}}>
                <h4 style={{margin: '0 0 6px 0', fontSize: '12px', color: '#51cf66'}}>Quantum Backend Distribution</h4>
                <div style={{fontSize: '11px', color: '#bbb'}}>
                  {Object.entries(quantumData.statistics.backend_distribution).map(([backend, count]) => (
                    <div key={backend} style={{marginBottom: '2px'}}>
                      {backend.replace(/_/g, ' ')}: {count} jobs
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Status Distribution */}
            {quantumData.statistics.status_distribution && (
              <div style={{marginBottom: '8px', padding: '8px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px'}}>
                <h4 style={{margin: '0 0 6px 0', fontSize: '12px', color: '#51cf66'}}>Job Status Distribution</h4>
                <div style={{display: 'flex', gap: '12px', fontSize: '11px'}}>
                  {Object.entries(quantumData.statistics.status_distribution).map(([status, count]) => (
                    <span key={status} style={{
                      color: status === 'completed' ? '#51cf66' : 
                             status === 'running' ? '#fcc419' : 
                             status === 'failed' ? '#ff6b6b' : '#999'
                    }}>
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Quantum Capabilities */}
        <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
          <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Quantum Capabilities</h3>
          <div style={{fontSize: '11px', color: '#bbb'}}>
            <div style={{marginBottom: '4px'}}>• <strong>Quantum ML:</strong> Neural networks and optimization</div>
            <div style={{marginBottom: '4px'}}>• <strong>Quantum Optimization:</strong> Combinatorial and constraint solving</div>
            <div style={{marginBottom: '4px'}}>• <strong>Quantum Cryptography:</strong> Post-quantum security</div>
            <div style={{marginBottom: '4px'}}>• <strong>Quantum Reasoning:</strong> Advanced AI decision making</div>
            <div style={{marginBottom: '4px'}}>• <strong>Quantum Simulation:</strong> Complex system modeling</div>
          </div>
        </div>
        
        {/* Quantum Backends */}
        <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
          <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Supported Quantum Backends</h3>
          <div style={{fontSize: '11px', color: '#bbb'}}>
            <div style={{marginBottom: '4px'}}>• <strong>IBM Quantum:</strong> Qiskit and real quantum hardware</div>
            <div style={{marginBottom: '4px'}}>• <strong>Google Quantum:</strong> Cirq and Sycamore processor</div>
            <div style={{marginBottom: '4px'}}>• <strong>Azure Quantum:</strong> Microsoft quantum platform</div>
            <div style={{marginBottom: '4px'}}>• <strong>AWS Braket:</strong> Amazon quantum computing</div>
            <div style={{marginBottom: '4px'}}>• <strong>Simulator:</strong> Local quantum simulation</div>
          </div>
        </div>
        
        {/* Links */}
        <div style={{fontSize: '11px'}}>
          <a href="/api/quantum/compute" style={{color: '#6E00FF', textDecoration: 'none'}}>
            View Quantum Computing API
          </a>
        </div>
      </section>
    )
  } catch (e: any) {
    return (
      <section>
        <h2>Quantum Computing Dashboard</h2>
        <p style={{color: '#ff6b6b'}}>Error: {e.message}</p>
      </section>
    )
  }
}
