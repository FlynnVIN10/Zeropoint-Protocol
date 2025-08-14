import React from 'react';

export default function Library() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Developer Resources</h1>
        <p className="text-xl text-gray-600">
          Tools and resources for Zeropoint Protocol development
        </p>
      </div>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Platform Integration</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">Health Endpoints</h3>
            <p className="text-gray-600 mb-4">System health and readiness monitoring</p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <pre>{`GET /api/healthz
GET /api/readyz`}</pre>
            </div>
          </div>
          <div className="border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-600 mb-3">Status Monitoring</h3>
            <p className="text-gray-600 mb-4">Real-time system status verification</p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <pre>{`GET /status
# Returns verified telemetry only`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Development Guidelines</h2>
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Verification Policy</h3>
            <p className="text-blue-800">
              All system claims must be verified through official endpoints. No hardcoded metrics or unverified status information.
            </p>
          </div>
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Governance Compliance</h3>
            <p className="text-green-800">
              All contributions require dual consensus approval. Follow the governance framework for all changes.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Resource Status</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-800">
            <strong>Development Resources:</strong> Full SDKs, APIs, and development tools are available in the platform repository. 
            This website provides public access to verified system information and governance documentation.
          </p>
        </div>
      </section>

      <div className="text-center text-gray-500">
        <p><em>Last Updated: August 14, 2025</em></p>
        <p><em>Version: 1.0</em></p>
        <p><em>© 2025 Zeropoint Protocol, Inc. All Rights Reserved.</em></p>
      </div>
    </div>
  );
}
