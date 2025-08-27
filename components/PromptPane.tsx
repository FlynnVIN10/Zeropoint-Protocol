'use client'

import { useState, useRef, useEffect } from 'react'

export default function PromptPane() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [telemetry, setTelemetry] = useState('')
  const responseAreaRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setResponse('')
    setTelemetry('Processing...')

    try {
      const res = await fetch(`/api/router/exec?q=${encodeURIComponent(prompt.trim())}`, { 
        cache: 'no-store' 
      })
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      const data = await res.json()
      setResponse(data.response || 'No response received')
      
      const t = data.telemetry || {}
      setTelemetry(`provider=${t.provider || 'unknown'} instance=${t.instance || 'none'} latency=${t.latencyMs || '-'}ms`)
      
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
        <div className="response-text">{response}</div>
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
      </div>
    </main>
  )
}
