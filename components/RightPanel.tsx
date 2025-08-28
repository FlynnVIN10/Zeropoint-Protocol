import EnhancedTrainingPanel from '../app/(spa)/panels/EnhancedTrainingPanel'
import NetworkPanel from '../app/(spa)/panels/NetworkPanel'
import SecurityDashboard from '../app/(spa)/panels/SecurityDashboard'

export default function RightPanel() {
  return (
    <aside className="right-panel" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <EnhancedTrainingPanel />
      <NetworkPanel />
      <SecurityDashboard />
    </aside>
  )
}


