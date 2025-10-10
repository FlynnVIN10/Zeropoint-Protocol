'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProposalsTable } from '@/components/governance/ProposalsTable';
import { ProposalDrawer } from '@/components/governance/ProposalDrawer';
import { ConsensusPulse } from '@/components/governance/ConsensusPulse';
import EvidenceFooter from '@/components/governance/EvidenceFooter';

const qc = new QueryClient();

export default function GovernancePage() {
  const [focused, setFocused] = useState<'default' | 'proposals' | 'max'>('default');
  const [drawer, setDrawer] = useState<any | null>(null);
  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawer(null);
        setFocused('default');
      }
    };
    document.body.addEventListener('keydown', handler);
    return () => document.body.removeEventListener('keydown', handler);
  }, []);
  
  const grid = focused === 'proposals' ? 'md:grid-cols-[7fr_5fr]' : 'md:grid-cols-2';

  return (
    <QueryClientProvider client={qc}>
      <div className="min-h-screen bg-black text-white pb-16">
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h1 className="text-lg font-semibold">Zeropoint Governance</h1>
          <ConsensusPulse onClick={() => setFocused('proposals')} />
        </header>

        <main className={`grid ${grid} gap-3 p-3 transition-all`}>
          <section className={`${focused === 'max' ? 'col-span-2' : 'col-span-1'}`}>
            <ProposalsTable
              onOpen={p => {
                setFocused('proposals');
                fetch(`/api/governance/proposals/${p.id}`)
                  .then(r => r.json())
                  .then(d => setDrawer(d.proposal));
              }}
            />
          </section>
          <section className={`relative ${focused === 'proposals' ? 'block' : 'hidden'} md:block`}>
            <div className="h-full bg-zinc-950/70 border border-white/10 rounded-xl p-3">
              <h2 className="text-xl font-semibold mb-2">System Overview</h2>
              <p className="text-sm text-zinc-300">Health OK. CI green. Dual-consensus active.</p>
            </div>
          </section>
        </main>

        {drawer && (
          <ProposalDrawer
            proposal={drawer}
            onClose={() => {
              setDrawer(null);
              setFocused('default');
            }}
          />
        )}
        <EvidenceFooter />
      </div>
    </QueryClientProvider>
  );
}

