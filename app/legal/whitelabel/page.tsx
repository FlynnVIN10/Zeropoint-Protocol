import React from 'react';

export default function Whitelabel() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Whitelabel Program</h1>
        <p className="text-xl text-gray-600">
          Partner and reseller terms for the Zeropoint Protocol platform
        </p>
      </div>

      <div className="text-left mb-6">
        <a href="/legal" className="text-blue-600 hover:text-blue-800 flex items-center">
          <span>← Back to Legal Information</span>
        </a>
      </div>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Program Overview</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Target Partners</h3>
            <p className="text-gray-600">Technology companies, system integrators, and value-added resellers</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Program Benefits</h3>
            <p className="text-gray-600">Custom branding, technical support, and revenue sharing opportunities</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Market Access</h3>
            <p className="text-gray-600">Access to enterprise customers and specialized markets</p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Rebranding & Customization</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">UI/UX Customization</h3>
            <p className="text-gray-600">Custom colors, logos, and branding elements</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Technical Customization</h3>
            <p className="text-gray-600">API endpoints, configuration options, and integration capabilities</p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Resale & Distribution</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Pricing Models</h3>
            <p className="text-gray-600">Flexible pricing structures and revenue sharing options</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Distribution Channels</h3>
            <p className="text-gray-600">Direct sales, channel partners, and online marketplaces</p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Partner Obligations</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Quality Standards</h3>
            <p className="text-gray-600">Maintain high service quality and customer satisfaction</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Reporting Requirements</h3>
            <p className="text-gray-600">Monthly sales reports and customer feedback</p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Support & Training</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Technical Support</h3>
            <p className="text-gray-600">Dedicated support team and escalation procedures</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Training Programs</h3>
            <p className="text-gray-600">Comprehensive training for sales and technical teams</p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Application Process</h2>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Apply for Partnership</h3>
          <p className="text-gray-600 mb-4">Complete the application form and submit required documentation</p>
          <a href="mailto:partners@zeropointprotocol.ai" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Start Application
          </a>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Rights</h2>
        <p className="mb-4">
          Approved partners may rebrand UI elements and host the Control Center under their domain. Core attributions in machine-readable headers remain.
        </p>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Tiers</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">OEM</h3>
            <ul className="space-y-2">
              <li>Full rebrand</li>
              <li>Private updates channel</li>
              <li>SLA Gold</li>
            </ul>
          </div>
          <div className="border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-600 mb-3">Reseller</h3>
            <ul className="space-y-2">
              <li>Co-brand</li>
              <li>Public updates channel</li>
              <li>SLA Silver</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Obligations</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Maintain CEO-as-final-consensus governance workflow.</li>
          <li>Pass downstream license terms (ZPCL) unmodified.</li>
          <li>Submit monthly distribution report.</li>
          <li>No transfer of model weights beyond licensed scopes.</li>
        </ul>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Brand Controls</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Colors, logo, and product name may be replaced via environment config.</li>
          <li>&quot;Powered by Zeropoint Protocol&quot; footer may be hidden with OEM tier.</li>
        </ul>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Support & Updates</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>OEM:</strong> 72h NBD patches</li>
          <li><strong>Reseller:</strong> 5-day patches</li>
          <li>Security bulletins must be forwarded to end users within 48h.</li>
        </ul>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Termination</h2>
        <p>Breach or audit failure permits immediate suspension.</p>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p className="text-lg">
          <a href="mailto:partners@zeropointprotocol.ai" className="text-blue-600 hover:text-blue-800">
            partners@zeropointprotocol.ai
          </a>
        </p>
      </section>

      <div className="text-center text-gray-500">
        <p><em>Last Updated: August 13, 2025</em></p>
        <p><em>Version: 1.0</em></p>
        <p><em>© 2025 Zeropoint Protocol, Inc., Austin, TX. All Rights Reserved.</em></p>
      </div>
    </div>
  );
}
