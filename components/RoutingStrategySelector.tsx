'use client'

import { useState } from 'react'

interface RoutingStrategySelectorProps {
  onStrategyChange: (strategy: string) => void
  onPreferencesChange: (preferences: any) => void
  currentStrategy: string
}

export default function RoutingStrategySelector({ 
  onStrategyChange, 
  onPreferencesChange, 
  currentStrategy 
}: RoutingStrategySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [preferences, setPreferences] = useState({
    maxLatency: 500,
    maxCost: 0.05,
    minQuality: 80,
    preferredRegion: ''
  })

  const strategies = [
    { id: 'hybrid', name: 'Hybrid', description: 'Balanced performance, cost, quality, and consensus' },
    { id: 'performance', name: 'Performance', description: 'Optimize for speed and low latency' },
    { id: 'cost', name: 'Cost', description: 'Minimize token costs and resource usage' },
    { id: 'quality', name: 'Quality', description: 'Prioritize highest quality responses' },
    { id: 'consensus', description: 'Focus on consensus alignment and ethical compliance' }
  ]

  const handleStrategyChange = (strategy: string) => {
    onStrategyChange(strategy)
    setIsExpanded(false)
  }

  const handlePreferenceChange = (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    onPreferencesChange(newPreferences)
  }

  return (
    <div style={{marginBottom: '16px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
        <h3 style={{margin: 0, fontSize: '14px', color: '#a855f7'}}>Routing Strategy</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'transparent',
            border: '1px solid #6E00FF',
            color: '#6E00FF',
            padding: '4px 8px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          {isExpanded ? 'Hide' : 'Configure'}
        </button>
      </div>
      
      {/* Current Strategy Display */}
      <div style={{
        padding: '8px',
        background: '#111',
        border: '1px solid #333',
        borderRadius: '4px',
        fontSize: '11px'
      }}>
        <strong>Current:</strong> {strategies.find(s => s.id === currentStrategy)?.name || 'Hybrid'}
        <br />
        <span style={{color: '#999', fontSize: '10px'}}>
          {strategies.find(s => s.id === currentStrategy)?.description}
        </span>
      </div>
      
      {/* Strategy Options */}
      {isExpanded && (
        <div style={{
          marginTop: '8px',
          padding: '12px',
          background: '#0a0a0a',
          border: '1px solid #222',
          borderRadius: '4px'
        }}>
          <h5 style={{margin: '0 0 8px 0', fontSize: '12px', color: '#51cf66'}}>Select Strategy</h5>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px'}}>
            {strategies.map(strategy => (
              <button
                key={strategy.id}
                onClick={() => handleStrategyChange(strategy.id)}
                style={{
                  background: currentStrategy === strategy.id ? '#6E00FF' : 'transparent',
                  border: '1px solid #333',
                  color: currentStrategy === strategy.id ? 'white' : '#bbb',
                  padding: '6px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  textAlign: 'left'
                }}
              >
                <div style={{fontWeight: 'bold'}}>{strategy.name}</div>
                <div style={{fontSize: '9px', opacity: 0.8}}>{strategy.description}</div>
              </button>
            ))}
          </div>
          
          {/* User Preferences */}
          <h5 style={{margin: '0 0 8px 0', fontSize: '12px', color: '#51cf66'}}>User Preferences</h5>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px'}}>
            <div>
              <label>Max Latency (ms):</label>
              <input
                type="number"
                value={preferences.maxLatency}
                onChange={(e) => handlePreferenceChange('maxLatency', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  background: '#111',
                  border: '1px solid #333',
                  color: '#bbb',
                  padding: '2px 4px',
                  fontSize: '10px'
                }}
              />
            </div>
            <div>
              <label>Max Cost ($/token):</label>
              <input
                type="number"
                step="0.001"
                value={preferences.maxCost}
                onChange={(e) => handlePreferenceChange('maxCost', parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  background: '#111',
                  border: '1px solid #333',
                  color: '#bbb',
                  padding: '2px 4px',
                  fontSize: '10px'
                }}
              />
            </div>
            <div>
              <label>Min Quality Score:</label>
              <input
                type="number"
                value={preferences.minQuality}
                onChange={(e) => handlePreferenceChange('minQuality', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  background: '#111',
                  border: '1px solid #333',
                  color: '#bbb',
                  padding: '2px 4px',
                  fontSize: '10px'
                }}
              />
            </div>
            <div>
              <label>Preferred Region:</label>
              <input
                type="text"
                value={preferences.preferredRegion}
                onChange={(e) => handlePreferenceChange('preferredRegion', e.target.value)}
                placeholder="e.g., us-east, eu-west"
                style={{
                  width: '100%',
                  background: '#111',
                  border: '1px solid #333',
                  color: '#bbb',
                  padding: '2px 4px',
                  fontSize: '10px'
                }}
              />
            </div>
          </div>
          
          <div style={{marginTop: '8px', fontSize: '9px', color: '#999'}}>
            <strong>Note:</strong> Preferences will filter available providers before strategy selection
          </div>
        </div>
      )}
    </div>
  )
}
