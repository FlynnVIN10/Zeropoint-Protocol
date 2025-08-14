import React from 'react';

export default function DocsV1() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Zeropoint Protocol Documentation</h1>
        <p className="text-xl text-gray-600">
          Technical documentation and implementation guides
        </p>
      </div>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Available Documentation</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">Getting Started</h3>
            <p className="text-gray-600 mb-4">Platform setup and initial configuration</p>
            <div className="text-sm text-gray-500">
              <p>• Platform deployment guide</p>
              <p>• Environment configuration</p>
              <p>• Basic integration examples</p>
            </div>
          </div>
          <div className="border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-600 mb-2">Consensus Engine</h3>
            <p className="text-gray-600 mb-4">Dual consensus mechanisms and implementation</p>
            <div className="text-sm text-gray-500">
              <p>• Human-AI consensus protocols</p>
              <p>• Decision validation processes</p>
              <p>• Audit and veto mechanisms</p>
            </div>
          </div>
          <div className="border-2 border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">Petals Integration</h3>
            <p className="text-gray-600 mb-4">Federated inference and training</p>
            <div className="text-sm text-gray-500">
              <p>• Decentralized model training</p>
              <p>• Distributed inference setup</p>
              <p>• Performance optimization</p>
            </div>
          </div>
          <div className="border-2 border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-600 mb-2">API Reference</h3>
            <p className="text-gray-600 mb-4">Complete API documentation</p>
            <div className="text-sm text-gray-500">
              <p>• REST API endpoints</p>
              <p>• WebSocket connections</p>
              <p>• Authentication methods</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Documentation Status</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-800">
            <strong>Note:</strong> Full documentation is available in the platform repository. 
            This website serves as a public interface. For complete technical documentation, 
            please refer to the source code and internal documentation.
          </p>
        </div>
      </section>

      <div className="text-center text-gray-500">
        <p><em>Last Updated: August 14, 2025</em></p>
        <p><em>Documentation Version: 1.0</em></p>
        <p><em>© 2025 Zeropoint Protocol, Inc. All Rights Reserved.</em></p>
      </div>
    </div>
  );
}
