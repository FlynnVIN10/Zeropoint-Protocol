import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../styles/tokens.css';
import Topbar from '@/components/ui/Topbar';
import Navigation from '@/components/ui/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zeropoint Protocol - Enterprise Console',
  description: 'Dual Consensus Agentic AI Platform Enterprise Console',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-bg text-text antialiased`}>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <div className="min-h-screen flex flex-col">
          <Topbar />
          <div className="flex flex-1">
            <Navigation />
            <main id="main-content" className="flex-1 p-6">
              <div className="max-w-screen-2xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
