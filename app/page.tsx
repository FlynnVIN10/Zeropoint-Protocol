import TopTicker from '../components/TopTicker'
import BottomTicker from '../components/BottomTicker'
import LeftPanel from '../components/LeftPanel'
import PromptPane from '../components/PromptPane'
import RightPanel from '../components/RightPanel'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

// Server-side data fetching
async function getTrainingData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/training/status`, {
      cache: 'no-store'
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch training data:', error)
  }
  return null
}

export default async function HomePage() {
  // Fetch training data server-side
  const trainingData = await getTrainingData()
  
  return (
    <div className="container" style={{padding:0, width:'100vw', maxWidth:'100vw'}}>
      <TopTicker />
      
      <div className="panel-container">
        <LeftPanel />
        <PromptPane />
        <RightPanel initialTrainingData={trainingData} />
      </div>
      
      <BottomTicker />
      
      {/* Debug info */}
      <div style={{position: 'fixed', bottom: '10px', right: '10px', background: '#333', color: '#fff', padding: '8px', fontSize: '12px', zIndex: 1000}}>
        Debug: Page rendered at {new Date().toISOString()}
        {trainingData && (
          <div style={{marginTop: '4px', fontSize: '10px'}}>
            Training Data: {trainingData.active_runs} active runs
          </div>
        )}
      </div>
    </div>
  )
}
