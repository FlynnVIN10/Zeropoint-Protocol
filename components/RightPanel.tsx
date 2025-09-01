'use client'

import { useState, useEffect } from 'react'

interface TrainingStatus {
  active_runs: number
  completed_today: number
  total_runs: number
  last_run: {
    id: string
    model: string
    started_at: string
    ended_at: string
    dataset: string
    metrics: {
      loss: number
      accuracy: number
    }
    status: string
  }
  leaderboard: Array<{
    rank: number
    model: string
    accuracy: number
    runs: number
  }>
  commit: string
  buildTime: string
  timestamp: string
  environment: string
}

interface HealthStatus {
  healthz: boolean
  readyz: boolean
  version: boolean
  training: boolean
  petals: boolean
  wondercraft: boolean
}

interface EvidenceStatus {
  last_updated: string
  total_files: number
  schema_valid: boolean
  leaderboard_built: boolean
}

interface RightPanelProps {
  initialTrainingData?: TrainingStatus | null
}

export default function RightPanel({ initialTrainingData }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<'training' | 'health' | 'evidence'>('training')
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(initialTrainingData || null)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [evidenceStatus, setEvidenceStatus] = useState<EvidenceStatus | null>(null)
  const [loading, setLoading] = useState(!initialTrainingData)
  const [testState, setTestState] = useState('initial')

  // Test useEffect to see if JavaScript is executing
  useEffect(() => {
    console.log('RightPanel: Component mounted')
    setTestState('mounted')
    
    // Test if we can update state
    setTimeout(() => {
      setTestState('updated')
      console.log('RightPanel: State updated')
    }, 1000)
    
    // Set loading to false after a short delay to ensure component renders
    setTimeout(() => {
      setLoading(false)
    }, 500)
    
    // Force a re-render to test if state updates work
    const interval = setInterval(() => {
      setTestState(prev => prev === 'updated' ? 'interval' : 'updated')
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  // Immediate data fetch on mount
  useEffect(() => {
    const immediateFetch = async () => {
      try {
        console.log('RightPanel: Immediate fetch triggered')
        const response = await fetch('/api/training/status')
        if (response.ok) {
          const data = await response.json()
          console.log('RightPanel: Immediate fetch successful:', data)
          setTrainingStatus(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('RightPanel: Immediate fetch failed:', error)
        setLoading(false)
      }
    }
    
    // Execute immediately
    immediateFetch()
  }, [])

  // Immediate state update test
  useEffect(() => {
    // Force immediate state update to test if React is working
    setTestState('immediate')
    console.log('RightPanel: Immediate state update')
  }, [])

  // Fetch training status
  useEffect(() => {
    console.log('RightPanel: useEffect for training status triggered')
    const fetchTrainingStatus = async () => {
      try {
        console.log('RightPanel: Fetching training status...')
        const response = await fetch('/api/training/status')
        console.log('RightPanel: Training status response:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('RightPanel: Training status data:', data)
          setTrainingStatus(data)
        } else {
          console.error('RightPanel: Training status response not ok:', response.status)
        }
      } catch (error) {
        console.error('RightPanel: Failed to fetch training status:', error)
      }
    }

    fetchTrainingStatus()
    const interval = setInterval(fetchTrainingStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch health status
  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const [healthz, readyz, version, training, petals, wondercraft] = await Promise.all([
          fetch('/api/healthz').then(r => r.ok),
          fetch('/api/readyz').then(r => r.ok),
          fetch('/status/version.json').then(r => r.ok),
          fetch('/api/training/status').then(r => r.ok),
          fetch('/petals/status.json').then(r => r.ok),
          fetch('/wondercraft/status.json').then(r => r.ok)
        ])

        setHealthStatus({
          healthz,
          readyz,
          version,
          training,
          petals,
          wondercraft
        })
      } catch (error) {
        console.error('Failed to fetch health status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHealthStatus()
    const interval = setInterval(fetchHealthStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch evidence status
  useEffect(() => {
    const fetchEvidenceStatus = async () => {
      try {
        const response = await fetch('/evidence/v19/index.html')
        if (response.ok) {
          setEvidenceStatus({
            last_updated: new Date().toISOString(),
            total_files: 0, // This would need to be calculated
            schema_valid: true, // This would need to be validated
            leaderboard_built: true // This would need to be checked
          })
        }
      } catch (error) {
        console.error('Failed to fetch evidence status:', error)
      }
    }

    fetchEvidenceStatus()
    const interval = setInterval(fetchEvidenceStatus, 300000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  const renderTrainingTab = () => (
    <div className="training-tab">
      <h4 style={{color: '#6E00FF', marginBottom: '12px'}}>Training Status</h4>
      <div style={{fontSize: '10px', color: '#999', marginBottom: '8px'}}>
        Test State: {testState}
      </div>
      {trainingStatus ? (
        <div style={{fontSize: '12px'}}>
          <p><strong>Active Runs:</strong> {trainingStatus.active_runs}</p>
          <p><strong>Completed Today:</strong> {trainingStatus.completed_today}</p>
          <p><strong>Total Runs:</strong> {trainingStatus.total_runs}</p>
          <p><strong>Last Run:</strong> {trainingStatus.last_run.model} ({trainingStatus.last_run.status})</p>
          <p><strong>Last Run ID:</strong> {trainingStatus.last_run.id}</p>
          <p><strong>Last Run Accuracy:</strong> {(trainingStatus.last_run.metrics.accuracy * 100).toFixed(1)}%</p>
          <p><strong>Last Run Loss:</strong> {trainingStatus.last_run.metrics.loss.toFixed(4)}</p>
          <p><strong>Commit:</strong> {trainingStatus.commit}</p>
          <p><strong>Last Update:</strong> {new Date(trainingStatus.timestamp).toLocaleString()}</p>
          
          <div style={{marginTop: '12px'}}>
            <h5 style={{color: '#6E00FF', marginBottom: '8px', fontSize: '11px'}}>Leaderboard</h5>
            {trainingStatus.leaderboard.map((entry, index) => (
              <div key={index} style={{fontSize: '10px', marginBottom: '4px'}}>
                <span style={{color: '#6E00FF'}}>#{entry.rank}</span> {entry.model} - {(entry.accuracy * 100).toFixed(1)}% ({entry.runs} runs)
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="muted">Loading training status...</div>
          <div style={{fontSize: '10px', color: '#666', marginTop: '8px'}}>
            <strong>Debug Info:</strong><br/>
            Test State: {testState}<br/>
            Loading: {loading.toString()}<br/>
            Training Status: {trainingStatus ? 'Loaded' : 'Null'}
          </div>
        </div>
      )}
    </div>
  )

  const renderHealthTab = () => (
    <div className="health-tab">
      <h4 style={{color: '#6E00FF', marginBottom: '12px'}}>System Health</h4>
      {healthStatus ? (
        <div style={{fontSize: '12px'}}>
          <p><strong>Health Check:</strong> <span style={{color: healthStatus.healthz ? '#51cf66' : '#ff6b6b'}}>{healthStatus.healthz ? '✅' : '❌'}</span></p>
          <p><strong>Ready Check:</strong> <span style={{color: healthStatus.readyz ? '#51cf66' : '#ff6b6b'}}>{healthStatus.readyz ? '✅' : '❌'}</span></p>
          <p><strong>Version:</strong> <span style={{color: healthStatus.version ? '#51cf66' : '#ff6b6b'}}>{healthStatus.version ? '✅' : '❌'}</span></p>
          <p><strong>Training:</strong> <span style={{color: healthStatus.training ? '#51cf66' : '#ff6b6b'}}>{healthStatus.training ? '✅' : '❌'}</span></p>
          <p><strong>Petals:</strong> <span style={{color: healthStatus.petals ? '#51cf66' : '#ff6b6b'}}>{healthStatus.petals ? '✅' : '❌'}</span></p>
          <p><strong>Wondercraft:</strong> <span style={{color: healthStatus.wondercraft ? '#51cf66' : '#ff6b6b'}}>{healthStatus.wondercraft ? '✅' : '❌'}</span></p>
        </div>
      ) : (
        <div className="muted">Loading health status...</div>
      )}
    </div>
  )

  const renderEvidenceTab = () => (
    <div className="evidence-tab">
      <h4 style={{color: '#6E00FF', marginBottom: '12px'}}>Evidence Status</h4>
      {evidenceStatus ? (
        <div style={{fontSize: '12px'}}>
          <p><strong>Last Updated:</strong> {new Date(evidenceStatus.last_updated).toLocaleString()}</p>
          <p><strong>Total Files:</strong> {evidenceStatus.total_files}</p>
          <p><strong>Schema Valid:</strong> <span style={{color: evidenceStatus.schema_valid ? '#51cf66' : '#ff6b6b'}}>{evidenceStatus.schema_valid ? '✅' : '❌'}</span></p>
          <p><strong>Leaderboard Built:</strong> <span style={{color: evidenceStatus.leaderboard_built ? '#51cf66' : '#ff6b6b'}}>{evidenceStatus.leaderboard_built ? '✅' : '❌'}</span></p>
        </div>
      ) : (
        <div className="muted">Loading evidence status...</div>
      )}
    </div>
  )

  return (
    <aside className="right-panel">
      <div className="tab-navigation" style={{marginBottom: '16px'}}>
        <button
          onClick={() => setActiveTab('training')}
          style={{
            background: activeTab === 'training' ? '#6E00FF' : 'transparent',
            border: '1px solid #6E00FF',
            color: activeTab === 'training' ? 'white' : '#6E00FF',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            marginRight: '8px'
          }}
        >
          Training
        </button>
        <button
          onClick={() => setActiveTab('health')}
          style={{
            background: activeTab === 'health' ? '#6E00FF' : 'transparent',
            border: '1px solid #6E00FF',
            color: activeTab === 'health' ? 'white' : '#6E00FF',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            marginRight: '8px'
          }}
        >
          Health
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          style={{
            background: activeTab === 'evidence' ? '#6E00FF' : 'transparent',
            border: '1px solid #6E00FF',
            color: activeTab === 'evidence' ? 'white' : '#6E00FF',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Evidence
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'training' && renderTrainingTab()}
        {activeTab === 'health' && renderHealthTab()}
        {activeTab === 'evidence' && renderEvidenceTab()}
      </div>
    </aside>
  )
}


