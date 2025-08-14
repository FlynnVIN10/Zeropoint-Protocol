import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white py-20">
        <div className="max-w-6xl mx-auto text-center px-8">
          <h1 className="text-5xl font-bold mb-6">
            Zeropoint Protocol
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Dual Consensus Agentic AI Platform — The future of decentralized AI infrastructure
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/docs"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </a>
            <a
              href="/library"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Developer Library
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Agent Orchestration</h3>
              <p className="text-gray-600">
                Advanced multi-agent systems with intelligent coordination and consensus mechanisms
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Dual Consensus</h3>
              <p className="text-gray-600">
                Revolutionary dual consensus engine ensuring reliability and performance
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Decentralized Storage</h3>
              <p className="text-gray-600">
                IPFS-based storage system for secure, distributed data management
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Quick Access</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href="/legal"
              className="group p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <span className="text-xl">⚖️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Legal Information
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  Platform licensing and legal framework
                </p>
              </div>
            </a>
            <a
              href="/docs"
              className="group p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <span className="text-xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  Documentation
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  Comprehensive platform guides
                </p>
              </div>
            </a>
            <a
              href="/library"
              className="group p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <span className="text-xl">🛠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Developer Library
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  SDKs, tools, and integration guides
                </p>
              </div>
            </a>
            <a
              href="/status"
              className="group p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 transition-colors"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  System Status
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  Real-time platform health and metrics
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Technology Stack</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🐍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Python</h3>
              <p className="text-gray-600 text-sm">Core platform and AI agents</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Next.js</h3>
              <p className="text-gray-600 text-sm">Modern web interface</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Unreal Engine 5</h3>
              <p className="text-gray-600 text-sm">Advanced simulation and XR</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌺</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Petals</h3>
              <p className="text-gray-600 text-sm">Decentralized inference</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join the future of decentralized AI infrastructure with the Zeropoint Protocol
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/docs"
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Documentation
            </a>
            <a
              href="https://github.com/FlynnVIN10/Zeropoint-Protocol"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><a href="/docs" className="text-gray-300 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/library" className="text-gray-300 hover:text-white transition-colors">Developer Library</a></li>
                <li><a href="/status" className="text-gray-300 hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="/legal" className="text-gray-300 hover:text-white transition-colors">Legal Information</a></li>
                <li><a href="/legal/whitelabel" className="text-gray-300 hover:text-white transition-colors">Whitelabel Program</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="https://github.com/FlynnVIN10/Zeropoint-Protocol" className="text-gray-300 hover:text-white transition-colors">GitHub</a></li>
                <li><a href="mailto:support@zeropointprotocol.ai" className="text-gray-300 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <p className="text-gray-300">
                Zeropoint Protocol, Inc.<br />
                Austin, TX<br />
                © 2025 All Rights Reserved
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
