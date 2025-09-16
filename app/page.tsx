import TopTicker from '../components/TopTicker'
import BottomTicker from '../components/BottomTicker'
import LeftPanel from '../components/LeftPanel'
import PromptPane from '../components/PromptPane'
import RightPanel from '../components/RightPanel'
import Footer from '../components/Footer'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// No server-side props needed; the RightPanel fetches live data from dynamic APIs

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <TopTicker />
      <div className="panel-container">
        <LeftPanel />
        <div className="center-panel">
          <div className="center-content">
            <PromptPane />
          </div>
        </div>
        <RightPanel />
      </div>
      <BottomTicker />
      <Footer />
    </div>
  )
}
