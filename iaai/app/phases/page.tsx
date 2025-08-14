export default function PhasesPage() {
  return (
    <div className="container py-16">
      <h1 className="text-4xl font-bold mb-8">Platform Phases</h1>
      
      <div className="space-y-8">
        <div className="glow-card">
          <h2 className="text-2xl font-semibold mb-4">Phase A: Local Appliance</h2>
          <p className="mb-4">Local system diagnostics and health monitoring.</p>
          <div className="status-ok">✅ Complete</div>
        </div>
        
        <div className="glow-card">
          <h2 className="text-2xl font-semibold mb-4">Phase B: Petals Connector</h2>
          <p className="mb-4">Distributed AI training and inference.</p>
          <div className="status-ok">✅ Complete</div>
        </div>
        
        <div className="glow-card">
          <h2 className="text-2xl font-semibold mb-4">Phase C: Tinygrad Training</h2>
          <p className="mb-4">Real LLM training implementation.</p>
          <div className="status-ok">✅ Complete</div>
        </div>
        
        <div className="glow-card">
          <h2 className="text-2xl font-semibold mb-4">Phase D: Wondercraft Loop</h2>
          <p className="mb-4">UE5 simulation and XR integration.</p>
          <div className="status-ok">✅ Complete</div>
        </div>
        
        <div className="glow-card">
          <h2 className="text-2xl font-semibold mb-4">Phase E: Control Center</h2>
          <p className="mb-4">Centralized system management.</p>
          <div className="status-ok">✅ Complete</div>
        </div>
        
        <div className="glow-card">
          <h2 className="text-2xl font-semibold mb-4">Phase F: Governance & Safety</h2>
          <p className="mb-4">Dual-consensus and safety protocols.</p>
          <div className="status-ok">✅ Complete</div>
        </div>
        
        <div className="glow-card">
          <h2 className="text-2xl font-semibold mb-4">Phase G: Image & Recovery</h2>
          <p className="mb-4">System recovery and backup.</p>
          <div className="status-ok">✅ Complete</div>
        </div>
        
        <div className="glow-card">
          <h2 className="text-2xl font-semibold mb-4">Phase W: Website Next-Gen</h2>
          <p className="mb-4">Modern website with live data streams.</p>
          <div className="status-warn">🔄 In Progress</div>
        </div>
      </div>
    </div>
  )
}
