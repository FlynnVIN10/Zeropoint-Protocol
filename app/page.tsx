import TopTicker from '../components/TopTicker'
import BottomTicker from '../components/BottomTicker'
import LeftPanel from '../components/LeftPanel'
import PromptPane from '../components/PromptPane'
import RightPanel from '../components/RightPanel'
import Footer from '../components/Footer'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

// No server-side props needed; the RightPanel fetches live data from dynamic APIs

export default async function HomePage() {
  return (
    <div className="container" style={{padding:0, width:'100vw', maxWidth:'100vw'}}>
      <TopTicker />
      
      <div className="panel-container">
        <LeftPanel />
        <PromptPane />
        <RightPanel />
      </div>
      
      <BottomTicker />
      <Footer />
    </div>
  )
}
