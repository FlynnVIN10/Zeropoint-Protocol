'use client'

import { useEffect, useRef } from 'react'

export default function BottomTicker() {
  const tickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tickerRef.current) return

    try {
      const eventSource = new EventSource('/api/events/synthiant')
      
      eventSource.addEventListener('tick', (e) => {
        const data = JSON.parse(e.data)
        const span = document.createElement('span')
        span.textContent = ` [synthiant] ${data.msg} #${data.seq} ${data.ts} `
        span.style.paddingRight = '24px'
        tickerRef.current?.appendChild(span)
        tickerRef.current!.scrollLeft = tickerRef.current!.scrollWidth
      })

      return () => eventSource.close()
    } catch (error) {
      console.error('Failed to connect to synthiant events:', error)
    }
  }, [])

  return (
    <div 
      ref={tickerRef}
      id="bottom-ticker" 
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        borderTop: '1px solid #333',
        padding: '8px 12px'
      }}
    />
  )
}
