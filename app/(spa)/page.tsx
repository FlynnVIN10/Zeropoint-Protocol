import TrainingPanel from './panels/TrainingPanel'

export default function HomePage() {
  return (
    <div className="container" style={{padding:0, width:'100vw', maxWidth:'100vw'}}>
      <div id="top-ticker" style={{whiteSpace:'nowrap', overflow:'hidden', borderBottom:'1px solid #333', padding:'8px 12px'}}></div>
      
      <div className="panel-container">
        <aside className="left-panel">
          <h3 style={{marginTop:0}}>Consensus Queue</h3>
          <div id="consensus-queue" className="muted">Synthiant proposals will appear here.</div>
        </aside>
        
        <main className="center-panel">
          <h1 style={{marginTop:0}}>Zeropoint Protocol</h1>
          
          <div className="center-content">
            <div id="response-area" className="response-text"></div>
          </div>
          
          <div className="prompt-input-container">
            <form id="prompt-form">
              <input id="prompt" type="text" placeholder="Ask..." className="prompt-input" />
            </form>
            <div className="muted" id="telemetry" style={{marginTop:'8px'}}></div>
          </div>
        </main>
        
        <aside className="right-panel">
          <TrainingPanel />
        </aside>
      </div>
      
      <div id="bottom-ticker" style={{whiteSpace:'nowrap', overflow:'hidden', borderTop:'1px solid #333', padding:'8px 12px'}}></div>
    </div>
  )
}
