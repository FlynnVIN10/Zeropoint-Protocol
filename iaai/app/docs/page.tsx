import React from 'react';

export default function Documentation() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Documentation v1</h1>
        <p className="text-xl text-gray-600">
          Comprehensive guides for the Zeropoint Protocol — Dual Consensus Agentic AI Platform
        </p>
      </div>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Overview</h2>
        <p className="mb-4">
          Welcome to the Zeropoint Protocol — Dual Consensus Agentic AI Platform documentation. This platform provides enterprise-grade AI infrastructure with real-time consensus mechanisms, federated inference, and immersive simulation capabilities.
        </p>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>
        
        <h3 className="text-lg font-semibold mb-4">Prerequisites</h3>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Python 3.11+ with virtual environment</li>
          <li>Node.js 18+ for web interface</li>
          <li>Git for version control</li>
          <li>Docker (optional) for containerized deployment</li>
        </ul>

        <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Clone the repository: <code className="bg-gray-100 px-2 py-1 rounded">git clone https://github.com/FlynnVIN10/Zeropoint-Protocol</code></li>
          <li>Install dependencies: <code className="bg-gray-100 px-2 py-1 rounded">pip install -r requirements.txt</code></li>
          <li>Configure environment: <code className="bg-gray-100 px-2 py-1 rounded">cp .env.example .env</code></li>
          <li>Start the platform: <code className="bg-gray-100 px-2 py-1 rounded">python main.py</code></li>
        </ol>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">API Reference</h2>
        
        <h3 className="text-lg font-semibold mb-4">Health Endpoints</h3>
        <div className="space-y-4 mb-6">
          <div className="border-l-4 border-green-500 pl-4">
            <div className="font-mono text-sm"><strong>GET /healthz</strong></div>
            <div className="text-gray-600">Returns "ok" (200 OK)</div>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <div className="font-mono text-sm"><strong>GET /readyz</strong></div>
            <div className="text-gray-600">Returns readiness status (200 OK)</div>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <div className="font-mono text-sm"><strong>GET /livez</strong></div>
            <div className="text-gray-600">Returns liveness status (200 OK)</div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">Status Endpoints</h3>
        <div className="space-y-4 mb-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="font-mono text-sm"><strong>GET /api/status/version</strong></div>
            <div className="text-gray-600">Returns build information</div>
            <pre className="bg-gray-100 p-2 rounded text-xs mt-2">{`{
  "version": "1.0.0",
  "buildSha": "g7f6e5d4",
  "buildId": "2025-08-13",
  "startedAt": "2025-08-13T17:50:00Z"
}`}</pre>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="font-mono text-sm"><strong>GET /api/status/system</strong></div>
            <div className="text-gray-600">Returns system status</div>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="font-mono text-sm"><strong>GET /api/status/ai</strong></div>
            <div className="text-gray-600">Returns AI components status</div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">Metrics Endpoints</h3>
        <div className="space-y-4 mb-6">
          <div className="border-l-4 border-purple-500 pl-4">
            <div className="font-mono text-sm"><strong>GET /api/metrics/system</strong></div>
            <div className="text-gray-600">Returns system metrics</div>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <div className="font-mono text-sm"><strong>GET /api/metrics/ai</strong></div>
            <div className="text-gray-600">Returns AI metrics</div>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <div className="font-mono text-sm"><strong>GET /metrics/sse</strong></div>
            <div className="text-gray-600">Server-Sent Events stream of live metrics</div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">Training Endpoints</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-orange-500 pl-4">
            <div className="font-mono text-sm"><strong>POST /api/train/start</strong></div>
            <div className="text-gray-600">Start training job</div>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <div className="font-mono text-sm"><strong>GET /api/train/status</strong></div>
            <div className="text-gray-600">Get training status</div>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <div className="font-mono text-sm"><strong>GET /api/train/artifacts</strong></div>
            <div className="text-gray-600">Download training artifacts</div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Petals Connector Usage</h2>
        <p className="mb-4">
          The Petals connector enables federated inference across distributed AI models.
        </p>

        <h3 className="text-lg font-semibold mb-4">Installation</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm mb-6"><code>pip install petals</code></pre>

        <h3 className="text-lg font-semibold mb-4">Basic Usage</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm mb-6"><code>{`from runtime.petals_connector import PetalsConnector

# Initialize connector
connector = PetalsConnector(
    model_name="llama-2-7b",
    max_length=2048,
    temperature=0.7
)

# Connect to network
connector.join_network()

# Generate text
response = connector.generate("Hello, how are you?")
print(response)`}</code></pre>

        <h3 className="text-lg font-semibold mb-4">Network Management</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Join Network:</strong> Connect to existing Petals network</li>
          <li><strong>Host Network:</strong> Start new network for others to join</li>
          <li><strong>Peer Management:</strong> Monitor and manage network peers</li>
          <li><strong>Fallback:</strong> Local model execution when network unavailable</li>
        </ul>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">UE5/Wondercraft Integration</h2>
        <p className="mb-4">
          Integrate with Unreal Engine 5 for real-time simulation and XR experiences.
        </p>

        <h3 className="text-lg font-semibold mb-4">Python Bridge Setup</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm mb-6"><code>{`from runtime.wondercraft.wondercraft_bridge import UE5PythonBridge

# Initialize bridge
bridge = UE5PythonBridge(
    host="localhost",
    port=8080,
    protocol="websocket"
)

# Connect to UE5
bridge.connect()

# Send scene update
scene_data = {
    "objects": ["agent_1", "agent_2"],
    "positions": [[0, 0, 0], [10, 0, 10]],
    "rotations": [[0, 0, 0], [0, 90, 0]]
}
bridge.update_scene(scene_data)`}</code></pre>

        <h3 className="text-lg font-semibold mb-4">Scene Management</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Scene Creation:</strong> Generate UE5 scenes programmatically</li>
          <li><strong>Object Manipulation:</strong> Control scene objects in real-time</li>
          <li><strong>XR Integration:</strong> Support for VR/AR experiences</li>
          <li><strong>Performance Monitoring:</strong> Real-time FPS and resource tracking</li>
        </ul>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Governance & Consensus Model</h2>
        <p className="mb-4">
          The Zeropoint Protocol implements a dual-consensus mechanism combining human expertise with AI capabilities.
        </p>

        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Consensus Architecture</h3>
          <pre className="text-sm">{`┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Human Quorum  │    │   AI Consensus  │    │   CEO Veto      │
│   (51% + 1)    │◄──►│   (75% + 1)     │◄──►│   (Final)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘`}</pre>
        </div>

        <h3 className="text-lg font-semibold mb-4">Decision Flow</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>Proposal Submission:</strong> Stakeholders submit proposals</li>
          <li><strong>Human Review:</strong> Human quorum reviews and votes</li>
          <li><strong>AI Analysis:</strong> AI consensus engine analyzes proposal</li>
          <li><strong>Dual Validation:</strong> Both human and AI must approve</li>
          <li><strong>CEO Veto:</strong> CEO maintains final veto authority</li>
          <li><strong>Execution:</strong> Approved proposals proceed to execution</li>
        </ol>

        <h3 className="text-lg font-semibold mb-4">Security Measures</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Multi-signature Wallets:</strong> Required for high-value decisions</li>
          <li><strong>Time-locked Proposals:</strong> Delayed execution for security</li>
          <li><strong>Audit Trails:</strong> Complete decision history recording</li>
          <li><strong>Emergency Procedures:</strong> Rapid response to security threats</li>
        </ul>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Configuration</h2>
        
        <h3 className="text-lg font-semibold mb-4">Environment Variables</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm mb-6"><code>{`# Platform Configuration
ZEROPOINT_ENV=production
ZEROPOINT_LOG_LEVEL=info
ZEROPOINT_PORT=8080

# AI Configuration
AI_MODEL_PATH=/models
AI_CACHE_SIZE=10GB
AI_MAX_CONCURRENT=5

# Security Configuration
SECURITY_JWT_SECRET=your-secret-key
SECURITY_SESSION_TIMEOUT=3600
SECURITY_MAX_LOGIN_ATTEMPTS=5`}</code></pre>

        <h3 className="text-lg font-semibold mb-4">Configuration Files</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>config/platform.yaml:</strong> Platform configuration</li>
          <li><strong>config/ai.yaml:</strong> AI model configuration</li>
          <li><strong>config/security.yaml:</strong> Security settings</li>
          <li><strong>config/network.yaml:</strong> Network configuration</li>
        </ul>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Deployment</h2>
        
        <h3 className="text-lg font-semibold mb-4">Local Development</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm mb-6"><code>{`# Start development server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8080

# Run tests
pytest tests/

# Check code quality
flake8 src/
black src/`}</code></pre>

        <h3 className="text-lg font-semibold mb-4">Production Deployment</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm mb-6"><code>{`# Build Docker image
docker build -t zeropoint-protocol .

# Run container
docker run -d -p 8080:8080 zeropoint-protocol

# Scale horizontally
docker-compose up -d --scale app=3`}</code></pre>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Support Resources</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Documentation</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>This comprehensive guide</li>
              <li>API reference documentation</li>
              <li>Integration examples</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>GitHub Issues</li>
              <li>Community Forum</li>
              <li>Developer Discord</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-lg mb-2">
            <strong>Support Email:</strong> support@zeropointprotocol.ai
          </p>
        </div>
      </section>

      <div className="text-center text-gray-500">
        <p><em>Last Updated: August 13, 2025</em></p>
        <p><em>Version: 1.0</em></p>
        <p><em>© 2025 Zeropoint Protocol, Inc., Austin, TX. All Rights Reserved.</em></p>
      </div>
    </div>
  );
}
