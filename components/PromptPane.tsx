'use client'

import { useState, useRef, useEffect } from 'react'
import ChainOfThought from './ChainOfThought'

interface ConsensusInfo {
  proposal_id: string
  consensus_status: string
  routing: any
  telemetry: any
}

export default function PromptPane() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [telemetry, setTelemetry] = useState('')
  const [consensusInfo, setConsensusInfo] = useState<ConsensusInfo | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const responseAreaRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setResponse('')
    setTelemetry('Processing...')
    setConsensusInfo(null)

    try {
      const res = await fetch(`/api/router/exec?q=${encodeURIComponent(prompt.trim())}`, { 
        cache: 'no-store' 
      })
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      const data = await res.json()
      setResponse(data.response || 'No response received')
      
      const t = data.telemetry || {}
      setTelemetry(`provider=${t.provider || 'unknown'} instance=${t.instance || 'none'} latency=${t.latencyMs || '-'}ms`)
      
      // Set consensus information
      if (data.proposal_id) {
        setConsensusInfo({
          proposal_id: data.proposal_id,
          consensus_status: data.consensus_status,
          routing: data.routing,
          telemetry: data.telemetry
        })
      }
      
      setPrompt('')
    } catch (error: any) {
      setResponse(`Error: ${error.message}`)
      setTelemetry('Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (responseAreaRef.current) {
      responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight
    }
  }, [response])

  return (
    <main className="center-panel">
      <h1 style={{marginTop:0}}>Zeropoint Protocol</h1>
      
      <div className="center-content" ref={responseAreaRef}>
        {response && (
          <div className="response-text">
            <div style={{marginBottom: '16px'}}>
              <strong>Response:</strong>
              <p>{response}</p>
            </div>
            
            {consensusInfo && (
              <div style={{marginBottom: '16px', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '4px'}}>
                <strong>Consensus Information:</strong>
                <p><strong>Proposal ID:</strong> {consensusInfo.proposal_id}</p>
                <p><strong>Status:</strong> {consensusInfo.consensus_status}</p>
                <p><strong>Provider:</strong> {consensusInfo.routing?.provider || 'Unknown'}</p>
                <p><strong>Reason:</strong> {consensusInfo.routing?.reason || 'No reason provided'}</p>
              </div>
            )}
            
            <ChainOfThought 
              routeTrace={consensusInfo?.routing?.reason}
              toolCalls={JSON.stringify(consensusInfo?.telemetry, null, 2)}
              summary={`Query processed through ${consensusInfo?.routing?.provider || 'unknown'} provider with ${consensusInfo?.consensus_status || 'unknown'} consensus status`}
            />
          </div>
        )}
      </div>
      
      <div className="prompt-input-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask..."
            className="prompt-input"
            disabled={isLoading}
          />
        </form>
        <div className="muted" style={{marginTop:'8px'}}>{telemetry}</div>
        
        <div style={{marginTop: '12px'}}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: 'transparent',
              border: '1px solid #6E00FF',
              color: '#6E00FF',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
          
          {showAdvanced && (
            <div style={{marginTop: '8px', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', fontSize: '11px'}}>
              <p><strong>Consensus Flow:</strong> Prompt → Synthiant Review → Human Approval → Execution</p>
              <p><strong>Training Signal:</strong> Automatically generated for each query</p>
              <p><strong>Evidence Chain:</strong> Complete traceability maintained</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
