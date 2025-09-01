import TopTicker from '../../components/TopTicker'
import BottomTicker from '../../components/BottomTicker'
import LeftPanel from '../../components/LeftPanel'
import PromptPane from '../../components/PromptPane'
import RightPanel from '../../components/RightPanel'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="container" style={{padding:0, width:'100vw', maxWidth:'100vw'}}>
      <TopTicker />
      
      <div className="panel-container">
        <LeftPanel />
        <PromptPane />
        <RightPanel />
      </div>
      
      <BottomTicker />
      
      {/* Debug info */}
      <div style={{position: 'fixed', bottom: '10px', right: '10px', background: '#333', color: '#fff', padding: '8px', fontSize: '12px', zIndex: 1000}}>
        Debug: Page rendered at {new Date().toISOString()}
      </div>
    </div>
  )
}
