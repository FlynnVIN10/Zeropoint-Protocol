'use client'

import { useState } from 'react'

export default function LeftPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (isCollapsed) {
    return (
      <aside className="left-panel-collapsed" style={{width: '60px', borderRight: '1px solid #333', padding: '8px', flexShrink: 0}}>
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6E00FF',
            cursor: 'pointer',
            fontSize: '20px'
          }}
        >
          ▶
        </button>
      </aside>
    )
  }

  return (
    <aside className="left-panel" style={{width: '20rem', borderRight: '1px solid #333', padding: '16px', flexShrink: 0, overflowY: 'auto', background: '#111'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
        <h3 style={{margin: 0}}>Consensus Queue</h3>
        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6E00FF',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ◀
        </button>
      </div>
      
      <div className="consensus-sections">
        <section style={{marginBottom: '20px'}}>
          <h4 style={{color: '#6E00FF', marginBottom: '8px'}}>Pending Proposals</h4>
          <div id="pending-proposals" className="muted">No pending proposals</div>
        </section>
        
        <section style={{marginBottom: '20px'}}>
          <h4 style={{color: '#6E00FF', marginBottom: '8px'}}>Approved</h4>
          <div id="approved-proposals" className="muted">No approved proposals</div>
        </section>
        
        <section style={{marginBottom: '20px'}}>
          <h4 style={{color: '#6E00FF', marginBottom: '8px'}}>Vetoed</h4>
          <div id="vetoed-proposals" className="muted">No vetoed proposals</div>
        </section>
        
        <section style={{marginBottom: '20px'}}>
          <h4 style={{color: '#6E00FF', marginBottom: '8px'}}>Human Approval Queue</h4>
          <div id="human-approval-queue" className="muted">No items requiring human approval</div>
        </section>
      </div>
    </aside>
  )
}
