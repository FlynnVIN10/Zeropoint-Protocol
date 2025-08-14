import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zeropoint Protocol - Dual Consensus Agentic AI Platform",
  description: "Advanced AI infrastructure featuring multi-agent collaboration, IPFS-based decentralized storage, and ethical AI principles with Zeroth-gate compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Navigation Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <a href="/" className="text-2xl font-bold text-blue-900">
                  Zeropoint Protocol
                </a>
                <div className="hidden md:flex items-center space-x-6">
                  <a href="/docs" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Documentation
                  </a>
                  <a href="/library" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Developer Library
                  </a>
                  <a href="/status" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Status
                  </a>
                  <a href="/legal" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Legal
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/FlynnVIN10/Zeropoint-Protocol"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  href="mailto:support@zeropointprotocol.ai"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
