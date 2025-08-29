// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// app/(spa)/components/ChainOfThought.tsx

'use client'

import { useState } from 'react'

interface ChainOfThoughtProps {
  routeTrace?: string
  rationaleSummary?: string
  isVisible?: boolean
}

export default function ChainOfThought({ 
  routeTrace, 
  rationaleSummary, 
  isVisible = false 
}: ChainOfThoughtProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isVisible) return null

  return (
    <div className="chain-of-thought" style={{
      border: '1px solid #333',
      borderRadius: '4px',
      padding: '12px',
      margin: '8px 0',
      background: '#111'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: '14px',
          color: '#6E00FF'
        }}>
          Chain of Thought
        </h4>
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
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {isExpanded && (
        <div style={{ fontSize: '12px', color: '#E8E8E8' }}>
          {routeTrace && (
            <div style={{ marginBottom: '12px' }}>
              <strong>Route Trace:</strong>
              <div style={{
                background: '#000',
                padding: '8px',
                borderRadius: '3px',
                marginTop: '4px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
              }}>
                {routeTrace}
              </div>
            </div>
          )}
          
          {rationaleSummary && (
            <div>
              <strong>Rationale Summary:</strong>
              <div style={{
                background: '#000',
                padding: '8px',
                borderRadius: '3px',
                marginTop: '4px',
                lineHeight: '1.4'
              }}>
                {rationaleSummary}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
