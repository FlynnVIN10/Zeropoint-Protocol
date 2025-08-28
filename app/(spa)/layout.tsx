import type { Metadata, Viewport } from 'next'
import '../../styles/tokens.css'

export const metadata: Metadata = {
  title: 'Zeropoint Protocol - Dual-Consensus AI Platform',
  description: 'Zeropoint Protocol: Dual-Consensus Agentic AI Platform with ethical governance, verified evidence, and synthiant-human collaboration.',
  keywords: 'AI, consensus, governance, ethics, synthiant, human oversight',
  authors: [{ name: 'Zeropoint Protocol Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1E1E1E" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
