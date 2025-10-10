'use client';

import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export function ConsensusPulse({ onClick }: { onClick: () => void }) {
  const { data } = useSWR('/api/governance/consensus/state', fetcher, { refreshInterval: 2000 });
  const state = data ? (data.open === 0 ? 'green' : 'amber') : 'amber';
  const cls = state === 'green' ? 'bg-[#00ff88]' : 'bg-[#ffaa00]';
  
  return (
    <button
      aria-label="Consensus state"
      onClick={onClick}
      className={`relative h-4 w-4 rounded-full ${cls} shadow-[0_0_0_0_rgba(0,255,136,0.7)] animate-[pulse_2s_infinite]`}
    />
  );
}

