import EnhancedTrainingPanel from '../app/(spa)/panels/EnhancedTrainingPanel'
import NetworkPanel from '../app/(spa)/panels/NetworkPanel'
import SecurityDashboard from '../app/(spa)/panels/SecurityDashboard'
import AIGovernanceDashboard from '../app/(spa)/panels/AIGovernanceDashboard'
import QuantumComputingDashboard from '../app/(spa)/panels/QuantumComputingDashboard'

export default function RightPanel() {
  return (
    <aside className="right-panel" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <EnhancedTrainingPanel />
      <NetworkPanel />
      <SecurityDashboard />
      <AIGovernanceDashboard />
      <QuantumComputingDashboard />
    </aside>
  )
}


