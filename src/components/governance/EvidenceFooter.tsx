'use client';

import useSWR from 'swr';

type Summary = { filesHashed: number; lastProbeISO: string } | null;

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function EvidenceFooter() {
  const { data } = useSWR<Summary>(
    '/evidence/compliance/latest/probe-summary.json',
    fetcher,
    { shouldRetryOnError: false }
  );
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur border-t border-white/10 px-4 py-2 text-xs text-zinc-300 flex items-center justify-between z-40">
      <span>Last Probe: {data?.lastProbeISO ?? '—'}</span>
      <span>Evidence hashed: {data?.filesHashed ?? 0}</span>
    </div>
  );
}

