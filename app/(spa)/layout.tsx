import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zeropoint Protocol',
  description: 'Zeropoint Protocol: Dual-Consensus Agentic AI Platform with ethical governance and verified evidence.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
