'use client'

import { useState } from 'react'

interface ChainOfThoughtProps {
  routeTrace?: string
  toolCalls?: string
  summary?: string
}

export default function ChainOfThought({ routeTrace, toolCalls, summary }: ChainOfThoughtProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!routeTrace && !toolCalls && !summary) {
    return null
  }

  return (
    <div className="chain-of-thought">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="toggle-button"
        style={{
          background: 'transparent',
          border: '1px solid #6E00FF',
          color: '#6E00FF',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '8px'
        }}
      >
        {isExpanded ? 'Hide' : 'Show'} Route Trace & Rationale
      </button>
      
      {isExpanded && (
        <div className="expanded-content" style={{padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
          {routeTrace && (
            <div style={{marginBottom: '12px'}}>
              <strong>Routing Path:</strong>
              <pre style={{margin: '8px 0', whiteSpace: 'pre-wrap', fontSize: '12px'}}>{routeTrace}</pre>
            </div>
          )}
          
          {toolCalls && (
            <div style={{marginBottom: '12px'}}>
              <strong>Tool Calls:</strong>
              <pre style={{margin: '8px 0', whiteSpace: 'pre-wrap', fontSize: '12px'}}>{toolCalls}</pre>
            </div>
          )}
          
          {summary && (
            <div>
              <strong>Rationale Summary:</strong>
              <p style={{margin: '8px 0'}}>{summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
