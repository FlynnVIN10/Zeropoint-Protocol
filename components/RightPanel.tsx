import EnhancedTrainingPanel from '../app/(spa)/panels/EnhancedTrainingPanel'
import NetworkPanel from '../app/(spa)/panels/NetworkPanel'

export default function RightPanel() {
  return (
    <aside className="right-panel" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <EnhancedTrainingPanel />
      <NetworkPanel />
    </aside>
  )
}


