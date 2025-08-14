export default function XRRoboticsPage() {
  return (
    <div className="container py-16">
      <h1 className="text-4xl font-bold mb-8">XR Robotics Vision</h1>
      
      <div className="glow-card mb-8">
        <h2 className="text-2xl font-semibold mb-4">Extended Reality Integration</h2>
        <p className="mb-4">
          Zeropoint Protocol integrates cutting-edge XR technologies with advanced robotics 
          to create immersive, interactive AI experiences.
        </p>
      </div>
      
      <div className="data-grid">
        <div className="glow-card">
          <h3 className="text-xl font-semibold mb-3">Virtual Reality (VR)</h3>
          <p>Immersive 3D environments for AI training and simulation.</p>
          <div className="stream-led mt-2">VR Ready</div>
        </div>
        
        <div className="glow-card">
          <h3 className="text-xl font-semibold mb-3">Augmented Reality (AR)</h3>
          <p>Overlay AI insights and controls on real-world environments.</p>
          <div className="stream-led mt-2">AR Active</div>
        </div>
        
        <div className="glow-card">
          <h3 className="text-xl font-semibold mb-3">Mixed Reality (MR)</h3>
          <p>Seamless integration of virtual and physical worlds.</p>
          <div className="stream-led mt-2">MR Testing</div>
        </div>
        
        <div className="glow-card">
          <h3 className="text-xl font-semibold mb-3">Robotics Control</h3>
          <p>AI-powered robotic systems with XR interfaces.</p>
          <div className="stream-led mt-2">Robotics Active</div>
        </div>
      </div>
      
      <div className="glow-card mt-8">
        <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
        <div className="code-block">
          <code>
            UE5 Engine + Python Bridge + XR SDK + Robotics API
          </code>
        </div>
      </div>
    </div>
  )
}
