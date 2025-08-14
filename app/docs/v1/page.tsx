import React from 'react';

export default function DocsV1() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Zeropoint Protocol Docs (v1)</h1>
        <p className="text-xl text-gray-600">
          Comprehensive documentation for the Dual Consensus Agentic AI Platform
        </p>
      </div>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">What is Zeropoint Protocol?</h2>
        <p className="mb-4">
          A Dual Consensus Agentic AI Platform. Human+AI quorum governs Planner-Executor-Critic agents (&quot;Synthients&quot;), with audit and veto.
        </p>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Quickstart</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Deploy Appliance image.</li>
          <li>Configure `/api/status/version`, `/healthz`, `/readyz`.</li>
          <li>Point Control Center to Platform SSE at `NEXT_PUBLIC_PLATFORM_SSE`.</li>
        </ol>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Sections</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">Architecture</h3>
            <p className="text-gray-600">Platform architecture and system design</p>
            <a href="/docs/v1/architecture" className="text-blue-600 hover:text-blue-800 text-sm">View →</a>
          </div>
          <div className="border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-600 mb-2">API Reference</h3>
            <p className="text-gray-600">Complete API documentation and endpoints</p>
            <a href="/docs/v1/api" className="text-green-600 hover:text-green-800 text-sm">View →</a>
          </div>
          <div className="border-2 border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">Petals Connector</h3>
            <p className="text-gray-600">Federated inference integration</p>
            <a href="/docs/v1/api/petals" className="text-purple-600 hover:text-purple-800 text-sm">View →</a>
          </div>
          <div className="border-2 border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-600 mb-2">Metrics & SSE</h3>
            <p className="text-gray-600">Real-time monitoring and events</p>
            <a href="/docs/v1/api/metrics" className="text-orange-600 hover:text-orange-800 text-sm">View →</a>
          </div>
          <div className="border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Wondercraft UE5</h3>
            <p className="text-gray-600">Unreal Engine 5 integration</p>
            <a href="/docs/v1/ue5/wondercraft" className="text-red-600 hover:text-red-800 text-sm">View →</a>
          </div>
          <div className="border-2 border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">Governance</h3>
            <p className="text-gray-600">Dual consensus mechanisms</p>
            <a href="/docs/v1/governance/dual-consensus" className="text-indigo-600 hover:text-indigo-800 text-sm">View →</a>
          </div>
        </div>
      </section>

      <div className="text-center text-gray-500">
        <p><em>Last Updated: August 13, 2025</em></p>
        <p><em>Documentation Version: 1.0</em></p>
        <p><em>© 2025 Zeropoint Protocol, Inc., Austin, TX. All Rights Reserved.</em></p>
      </div>
    </div>
  );
}
