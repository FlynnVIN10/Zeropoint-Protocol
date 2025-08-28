import { unstable_noStore as noStore } from "next/cache"

async function getAIGovernanceData() {
  noStore()
  try {
    const [modelsRes, pipelinesRes, ethicsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/models`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ml/pipeline`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/ethics`, { cache: "no-store" })
    ])
    
    const modelsData = modelsRes.ok ? await modelsRes.json() : null
    const pipelinesData = pipelinesRes.ok ? await pipelinesRes.json() : null
    const ethicsData = ethicsRes.ok ? await ethicsRes.json() : null
    
    return { models: modelsData, pipelines: pipelinesData, ethics: ethicsData }
  } catch (error) {
    console.error('Failed to fetch AI governance data:', error)
    return { models: null, pipelines: null, ethics: null }
  }
}

export default async function AIGovernanceDashboard() {
  try {
    const { models, pipelines, ethics } = await getAIGovernanceData()
    
    return (
      <section aria-labelledby="ai-governance-dashboard">
        <h2 id="ai-governance-dashboard">AI Governance Dashboard</h2>
        
        {/* AI Models Overview */}
        {models && (
          <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>AI Models Overview</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px'}}>
              <div>
                <strong>Total Models:</strong> {models.statistics?.total_models || 0}
              </div>
              <div>
                <strong>Avg Compliance:</strong> {models.statistics?.avg_compliance_score || 0}
              </div>
              <div>
                <strong>Total Parameters:</strong> {(models.statistics?.total_parameters || 0).toLocaleString()}
              </div>
              <div>
                <strong>Production Ready:</strong> {models.statistics?.deployment_status_distribution?.production || 0}
              </div>
            </div>
          </div>
        )}
        
        {/* ML Pipelines Status */}
        {pipelines && (
          <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>ML Pipelines Status</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px'}}>
              <div>
                <strong>Total Pipelines:</strong> {pipelines.statistics?.total_pipelines || 0}
              </div>
              <div>
                <strong>Success Rate:</strong> {pipelines.statistics?.success_rate || 0}%
              </div>
              <div>
                <strong>Running:</strong> {pipelines.statistics?.status_distribution?.running || 0}
              </div>
              <div>
                <strong>Avg Completion:</strong> {pipelines.statistics?.avg_completion_time || 0} min
              </div>
            </div>
          </div>
        )}
        
        {/* Ethics & Compliance */}
        {ethics && (
          <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Ethics & Compliance</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px'}}>
              <div>
                <strong>Total Assessments:</strong> {ethics.statistics?.total_assessments || 0}
              </div>
              <div>
                <strong>Avg Compliance:</strong> {ethics.statistics?.avg_compliance_score || 0}
              </div>
              <div>
                <strong>Low Risk:</strong> {ethics.statistics?.compliance_summary?.low_risk || 0}
              </div>
              <div>
                <strong>Critical Risk:</strong> {ethics.statistics?.compliance_summary?.critical_risk || 0}
              </div>
            </div>
          </div>
        )}
        
        {/* Recent AI Models */}
        {models?.models && models.models.length > 0 && (
          <div style={{marginBottom: '16px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Recent AI Models</h3>
            <div style={{maxHeight: '200px', overflowY: 'auto'}}>
              {models.models.slice(0, 3).map((model: any, index: number) => (
                <div key={index} style={{
                  padding: '8px',
                  marginBottom: '6px',
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '4px',
                  fontSize: '10px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                    <span><strong>{model.name}</strong></span>
                    <span style={{
                      color: model.ethical_compliance.compliance_score > 90 ? '#51cf66' : 
                             model.ethical_compliance.compliance_score > 70 ? '#fcc419' : '#ff6b6b'
                    }}>
                      Score: {model.ethical_compliance.compliance_score}
                    </span>
                  </div>
                  <div style={{fontSize: '9px', color: '#999', marginBottom: '4px'}}>
                    {model.provider} • {model.architecture} • {model.parameters.toLocaleString()} params
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9px', color: '#999'}}>
                    <span>Type: {model.type}</span>
                    <span>Status: {model.deployment_status}</span>
                    <span>Bias Detection: {model.ethical_compliance.bias_detection ? '✅' : '❌'}</span>
                    <span>Explainability: {model.ethical_compliance.explainability ? '✅' : '❌'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Active ML Pipelines */}
        {pipelines?.pipelines && pipelines.pipelines.length > 0 && (
          <div style={{marginBottom: '16px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Active ML Pipelines</h3>
            <div style={{maxHeight: '200px', overflowY: 'auto'}}>
              {pipelines.pipelines.slice(0, 3).map((pipeline: any, index: number) => (
                <div key={index} style={{
                  padding: '8px',
                  marginBottom: '6px',
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '4px',
                  fontSize: '10px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                    <span><strong>{pipeline.name}</strong></span>
                    <span style={{
                      color: pipeline.status === 'completed' ? '#51cf66' : 
                             pipeline.status === 'running' ? '#fcc419' : 
                             pipeline.status === 'failed' ? '#ff6b6b' : '#999'
                    }}>
                      {pipeline.status}
                    </span>
                  </div>
                  <div style={{fontSize: '9px', color: '#999', marginBottom: '4px'}}>
                    {pipeline.pipeline_type} • Priority: {pipeline.priority}
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9px', color: '#999'}}>
                    <span>Progress: {pipeline.progress.percentage}%</span>
                    <span>Step: {pipeline.progress.current_step}</span>
                    <span>Created: {new Date(pipeline.created_at).toLocaleDateString()}</span>
                    <span>Model: {pipeline.model_id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Ethics Assessments */}
        {ethics?.assessments && ethics.assessments.length > 0 && (
          <div style={{marginBottom: '16px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Recent Ethics Assessments</h3>
            <div style={{maxHeight: '200px', overflowY: 'auto'}}>
              {ethics.assessments.slice(0, 3).map((assessment: any, index: number) => (
                <div key={index} style={{
                  padding: '8px',
                  marginBottom: '6px',
                  background: '#0a0a0a',
                  border: '1px solid '#222',
                  borderRadius: '4px',
                  fontSize: '10px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                    <span><strong>Model {assessment.model_id}</strong></span>
                    <span style={{
                      color: assessment.results.risk_level === 'low' ? '#51cf66' : 
                             assessment.results.risk_level === 'medium' ? '#fcc419' : 
                             assessment.results.risk_level === 'high' ? '#ff922b' : '#ff6b6b'
                    }}>
                      {assessment.results.risk_level} risk
                    </span>
                  </div>
                  <div style={{fontSize: '9px', color: '#999', marginBottom: '4px'}}>
                    {assessment.assessment_type} • {assessment.status}
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9px', color: '#999'}}>
                    <span>Bias: {assessment.results.bias_score}</span>
                    <span>Fairness: {assessment.results.fairness_score}</span>
                    <span>Explainability: {assessment.results.explainability_score}</span>
                    <span>Privacy: {assessment.results.privacy_score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Compliance Summary */}
        {ethics?.statistics && (
          <div style={{marginBottom: '16px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#6E00FF'}}>Compliance Summary</h3>
            
            {/* Risk Level Distribution */}
            {ethics.statistics.risk_level_distribution && (
              <div style={{marginBottom: '8px', padding: '8px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px'}}>
                <h4 style={{margin: '0 0 6px 0', fontSize: '12px', color: '#51cf66'}}>Risk Level Distribution</h4>
                <div style={{display: 'flex', gap: '12px', fontSize: '11px'}}>
                  <span style={{color: '#51cf66'}}>🟢 Low: {ethics.statistics.risk_level_distribution.low || 0}</span>
                  <span style={{color: '#fcc419'}}>🟡 Medium: {ethics.statistics.risk_level_distribution.medium || 0}</span>
                  <span style={{color: '#ff922b'}}>🟠 High: {ethics.statistics.risk_level_distribution.high || 0}</span>
                  <span style={{color: '#ff6b6b'}}>🔴 Critical: {ethics.statistics.risk_level_distribution.critical || 0}</span>
                </div>
              </div>
            )}
            
            {/* Assessment Types */}
            {ethics.statistics.type_distribution && (
              <div style={{marginBottom: '8px', padding: '8px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px'}}>
                <h4 style={{margin: '0 0 6px 0', fontSize: '12px', color: '#51cf66'}}>Assessment Types</h4>
                <div style={{fontSize: '11px', color: '#bbb'}}>
                  {Object.entries(ethics.statistics.type_distribution).map(([type, count]) => (
                    <div key={type} style={{marginBottom: '2px'}}>
                      {type}: {count} assessments
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Links */}
        <div style={{fontSize: '11px'}}>
          <a href="/api/ai/models" style={{color: '#6E00FF', textDecoration: 'none'}}>
            View AI Models API
          </a>
          <br />
          <a href="/api/ml/pipeline" style={{color: '#6E00FF', textDecoration: 'none'}}>
            View ML Pipelines API
          </a>
          <br />
          <a href="/api/ai/ethics" style={{color: '#6E00FF', textDecoration: 'none'}}>
            View Ethics API
          </a>
        </div>
      </section>
    )
  } catch (e: any) {
    return (
      <section>
        <h2>AI Governance Dashboard</h2>
        <p style={{color: '#ff6b6b'}}>Error: {e.message}</p>
      </section>
    )
  }
}
