import React from 'react';

export default function Library() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Developer Library</h1>
        <p className="text-xl text-gray-600">
          SDKs, tools, and resources for integrating with the Zeropoint Protocol platform
        </p>
      </div>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">SDK (Node.js)</h2>
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{`import { EventSource } from 'eventsource';
const es = new EventSource(process.env.NEXT_PUBLIC_PLATFORM_SSE!);
es.addEventListener('metrics', (e:any)=>console.log(JSON.parse(e.data)));`}</pre>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">SDK (Python)</h2>
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{`import sseclient, requests
resp = requests.get("http://PLATFORM_HOST:3001/api/metrics/sse", stream=True)
for ev in sseclient.SSEClient(resp):
    print(ev.data)`}</pre>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">CLI</h2>
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{`zp status --json
zp consensus submit --file decision.json`}</pre>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Integration Tools</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">API Client</h3>
            <p className="text-gray-600 mb-4">Official client libraries for Node.js, Python, and Go</p>
            <a href="/docs" className="text-blue-600 hover:text-blue-800">View Documentation →</a>
          </div>
          <div className="border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-600 mb-3">Webhooks</h3>
            <p className="text-gray-600 mb-4">Real-time event notifications and callbacks</p>
            <a href="/docs" className="text-green-600 hover:text-green-800">View Documentation →</a>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Development Resources</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 border-2 border-purple-200 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">Code Examples</h3>
            <p className="text-gray-600">Ready-to-use code snippets and templates</p>
            <a href="/docs" className="text-purple-600 hover:text-purple-800 text-sm">View Examples →</a>
          </div>
          <div className="text-center p-4 border-2 border-orange-200 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-600 mb-2">Tutorials</h3>
            <p className="text-gray-600">Step-by-step integration guides</p>
            <a href="/docs" className="text-orange-600 hover:text-orange-800 text-sm">View Tutorials →</a>
          </div>
          <div className="text-center p-4 border-2 border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-600 mb-2">API Reference</h3>
            <p className="text-gray-600">Complete API documentation and schemas</p>
            <a href="/docs" className="text-red-600 hover:text-red-800 text-sm">View API Docs →</a>
          </div>
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
