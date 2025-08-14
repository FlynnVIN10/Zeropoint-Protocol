import React from 'react';

export default function Status() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">System Status</h1>
        <p className="text-xl text-gray-600">
          Real-time status and performance metrics for the Zeropoint Protocol platform
        </p>
      </div>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Platform Health</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 border-2 border-green-500 rounded-lg">
            <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
            <h3 className="text-lg font-semibold text-green-600">Core Platform</h3>
            <p className="text-sm text-gray-600">Operational</p>
          </div>
          <div className="text-center p-4 border-2 border-green-500 rounded-lg">
            <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
            <h3 className="text-lg font-semibold text-green-600">AI Agents</h3>
            <p className="text-sm text-gray-600">Operational</p>
          </div>
          <div className="text-center p-4 border-2 border-green-500 rounded-lg">
            <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
            <h3 className="text-lg font-semibold text-green-600">Consensus Engine</h3>
            <p className="text-sm text-gray-600">Operational</p>
          </div>
          <div className="text-center p-4 border-2 border-green-500 rounded-lg">
            <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
            <h3 className="text-lg font-semibold text-green-600">Storage System</h3>
            <p className="text-sm text-gray-600">Operational</p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Performance Metrics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">System Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>CPU Usage</span>
                <span className="font-semibold">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '23%'}}></div>
              </div>
              <div className="flex justify-between">
                <span>Memory Usage</span>
                <span className="font-semibold">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '67%'}}></div>
              </div>
              <div className="flex justify-between">
                <span>Network I/O</span>
                <span className="font-semibold">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{width: '45%'}}></div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">AI Agent Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Active Agents</span>
                <span className="font-semibold">1,247</span>
              </div>
              <div className="flex justify-between">
                <span>Consensus Rate</span>
                <span className="font-semibold">99.8%</span>
              </div>
              <div className="flex justify-between">
                <span>Response Time</span>
                <span className="font-semibold">127ms</span>
              </div>
              <div className="flex justify-between">
                <span>Throughput</span>
                <span className="font-semibold">2.3k req/s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Recent Updates</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Platform Update v1.2.3</h3>
                <p className="text-gray-600">Enhanced consensus engine performance and improved AI agent coordination</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">UE5 Integration Release</h3>
                <p className="text-gray-600">New Unreal Engine 5 plugin for advanced AI agent simulation</p>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Petals Framework Update</h3>
                <p className="text-gray-600">Enhanced decentralized inference capabilities and model support</p>
              </div>
              <span className="text-sm text-gray-500">3 days ago</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Service Status</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Core Services</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>API Gateway</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Authentication Service</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Consensus Engine</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span>IPFS Storage</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operational</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Integration Services</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>UE5 Bridge</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Petals Connector</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Monitoring System</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Webhook Service</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Incident History</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Minor Performance Degradation</h3>
                <p className="text-gray-600">Increased response times detected in consensus engine</p>
                <p className="text-sm text-gray-500 mt-1">Resolved: 4 hours ago</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Resolved</span>
            </div>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Scheduled Maintenance</h3>
                <p className="text-gray-600">Platform updates and security patches applied</p>
                <p className="text-sm text-gray-500 mt-1">Completed: 1 day ago</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Completed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">System Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Platform Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Platform Version</span>
                <span className="font-semibold">1.2.3</span>
              </div>
              <div className="flex justify-between">
                <span>Build Date</span>
                <span className="font-semibold">2025-08-13</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime</span>
                <span className="font-semibold">99.97%</span>
              </div>
              <div className="flex justify-between">
                <span>Last Restart</span>
                <span className="font-semibold">7 days ago</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Infrastructure</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Data Centers</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between">
                <span>Load Balancers</span>
                <span className="font-semibold">6</span>
              </div>
              <div className="flex justify-between">
                <span>Database Clusters</span>
                <span className="font-semibold">4</span>
              </div>
              <div className="flex justify-between">
                <span>CDN Nodes</span>
                <span className="font-semibold">12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Contact & Support</h2>
        <div className="text-center">
          <p className="mb-4">
            For immediate assistance or to report issues, contact our support team:
          </p>
          <div className="space-y-2">
            <p><strong>Email:</strong> <a href="mailto:support@zeropointprotocol.ai" className="text-blue-600 hover:text-blue-800">support@zeropointprotocol.ai</a></p>
            <p><strong>Status Page:</strong> <a href="https://status.zeropointprotocol.ai" className="text-blue-600 hover:text-blue-800">status.zeropointprotocol.ai</a></p>
            <p><strong>Emergency:</strong> <a href="mailto:emergency@zeropointprotocol.ai" className="text-red-600 hover:text-red-800">emergency@zeropointprotocol.ai</a></p>
          </div>
        </div>
      </section>

      <div className="text-center text-gray-500">
        <p><em>Last Updated: August 13, 2025 at 21:48 UTC</em></p>
        <p><em>Status Page Version: 1.0</em></p>
        <p><em>© 2025 Zeropoint Protocol, Inc., Austin, TX. All Rights Reserved.</em></p>
      </div>
    </div>
  );
}
