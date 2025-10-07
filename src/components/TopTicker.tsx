'use client'

import { useEffect, useRef } from 'react'

export default function TopTicker() {
  const tickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tickerRef.current) return

    try {
      const eventSource = new EventSource('/api/events/consensus')
      
      eventSource.addEventListener('consensus', (e) => {
        const data = JSON.parse(e.data)
        const span = document.createElement('span')
        span.textContent = ` [consensus] ${data.state} #${data.seq} ${data.ts} `
        span.style.paddingRight = '24px'
        tickerRef.current?.appendChild(span)
        tickerRef.current!.scrollLeft = tickerRef.current!.scrollWidth
      })

      return () => eventSource.close()
    } catch (error) {
      console.error('Failed to connect to consensus events:', error)
    }
  }, [])

  return (
    <div 
      ref={tickerRef}
      id="top-ticker" 
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        borderBottom: '1px solid #333',
        padding: '8px 12px'
      }}
    />
  )
}
