import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zeropoint Protocol - Real Compute Attestation',
  description: 'Real compute attestation and tinygrad integration for AI training and inference',
  keywords: ['AI', 'machine learning', 'tinygrad', 'ROCm', 'real compute', 'attestation'],
  authors: [{ name: 'Zeropoint Protocol, Inc.' }],
  creator: 'Zeropoint Protocol, Inc.',
  publisher: 'Zeropoint Protocol, Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://zeropointprotocol.ai'),
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
