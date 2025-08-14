import React from 'react';

export default function Legal() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Legal Information</h1>
      </div>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Quick Navigation</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a 
            href="/legal" 
            className="p-4 border-2 border-blue-500 rounded-lg text-center hover:bg-blue-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-blue-600">Legal Information</h3>
            <p className="text-gray-600">Platform licensing and terms</p>
          </a>
          <a 
            href="/legal/whitelabel" 
            className="p-4 border-2 border-green-500 rounded-lg text-center hover:bg-green-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-green-600">Whitelabel Program</h3>
            <p className="text-gray-600">Partner and reseller terms</p>
          </a>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Open Source Licenses</h2>
        <p className="mb-4">
          This platform incorporates the following open-source components:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>MIT License</strong>: <a href="https://opensource.org/licenses/MIT" className="text-blue-600 hover:text-blue-800">MIT Components</a></li>
          <li><strong>Apache-2.0 License</strong>: <a href="https://www.apache.org/licenses/LICENSE-2.0" className="text-blue-600 hover:text-blue-800">Apache Components</a></li>
        </ul>
        <p className="mt-4 text-gray-600">
          Full NOTICE file available in the platform repository.
        </p>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Proprietary License</h2>
        <p className="mb-4">
          The Zeropoint Protocol — Dual Consensus Agentic AI Platform is protected under a proprietary license owned by Zeropoint Protocol, Inc. This license governs the use, distribution, and modification of the platform's core technology, including AI agent orchestration, consensus mechanisms, and real-time analytics. All rights reserved.
        </p>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">License Bundle</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><strong>Version:</strong> 1.0</div>
          <div><strong>SHA:</strong> g7f6e5d4 (platform commit)</div>
          <div><strong>Build Date:</strong> 2025-08-13</div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Terms of Service</h2>
        <p className="mb-4">By using the Zeropoint Protocol platform, you agree to:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>Compliance:</strong> Adhere to all applicable laws and regulations</li>
          <li><strong>Security:</strong> Maintain appropriate security measures</li>
          <li><strong>Usage:</strong> Use the platform for lawful purposes only</li>
          <li><strong>Updates:</strong> Accept platform updates and modifications</li>
          <li><strong>Termination:</strong> Acknowledge our right to terminate access</li>
        </ol>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Privacy Policy</h2>
        <p className="mb-4">We collect and process data in accordance with our privacy policy, ensuring:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Data Protection:</strong> Industry-standard encryption and security</li>
          <li><strong>User Control:</strong> Full control over personal data</li>
          <li><strong>Transparency:</strong> Clear communication about data usage</li>
          <li><strong>Compliance:</strong> GDPR and CCPA compliance</li>
        </ul>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
        <div className="text-center">
          <p className="text-lg mb-2">
            <strong>Zeropoint Protocol, Inc.</strong><br />
            Legal Department
          </p>
          <p className="mb-2">
            Email: <a href="mailto:legal@zeropointprotocol.ai" className="text-blue-600 hover:text-blue-800">
              legal@zeropointprotocol.ai
            </a>
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
