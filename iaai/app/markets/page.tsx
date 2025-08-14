export default function MarketsPage() {
  return (
    <div className="container py-16">
      <h1 className="text-4xl font-bold mb-8">Prediction Markets</h1>
      
      <div className="glow-card mb-8">
        <h2 className="text-2xl font-semibold mb-4">Tokenized Incentives</h2>
        <p className="mb-4">
          Polymarket-style governance with real-time prediction markets and 
          tokenized incentives for platform decisions.
        </p>
      </div>
      
      <div className="data-grid">
        <div className="market-book">
          <h3 className="text-xl font-semibold mb-3">Platform Governance</h3>
          <p>Vote on platform upgrades and policy changes.</p>
          <div className="mt-4">
            <span className="stream-led">Active Markets: 3</span>
          </div>
        </div>
        
        <div className="market-book">
          <h3 className="text-xl font-semibold mb-3">AI Training Outcomes</h3>
          <p>Predict training performance and model accuracy.</p>
          <div className="mt-4">
            <span className="stream-led">Active Markets: 5</span>
          </div>
        </div>
        
        <div className="market-book">
          <h3 className="text-xl font-semibold mb-3">System Performance</h3>
          <p>Bet on system uptime and performance metrics.</p>
          <div className="mt-4">
            <span className="stream-led">Active Markets: 2</span>
          </div>
        </div>
        
        <div className="market-book">
          <h3 className="text-xl font-semibold mb-3">Research Milestones</h3>
          <p>Predict research breakthroughs and timeline.</p>
          <div className="mt-4">
            <span className="stream-led">Active Markets: 4</span>
          </div>
        </div>
      </div>
      
      <div className="glow-card mt-8">
        <h2 className="text-2xl font-semibold mb-4">Market Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="kpi-stat">
            <div className="text-2xl font-bold text-accent">14</div>
            <div className="text-sm text-muted-foreground">Total Markets</div>
          </div>
          <div className="kpi-stat">
            <div className="text-2xl font-bold text-ok">$2.4M</div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </div>
          <div className="kpi-stat">
            <div className="text-2xl font-bold text-accent2">1,247</div>
            <div className="text-sm text-muted-foreground">Active Traders</div>
          </div>
        </div>
      </div>
    </div>
  )
}
