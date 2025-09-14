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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center text-white p-8">
        <h1 className="text-6xl font-bold mb-4">ZEROPOINT PROTOCOL</h1>
        <h2 className="text-4xl font-semibold mb-8 text-red-400">SHUTDOWN</h2>
        <p className="text-xl mb-4">The Zeropoint Protocol has been fully shut down.</p>
        <p className="text-lg text-gray-300">All services, processes, and deployments have been disabled.</p>
        <div className="mt-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-200">
            This shutdown was executed on {new Date().toISOString()}
          </p>
        </div>
      </div>
    </div>
  )
}
