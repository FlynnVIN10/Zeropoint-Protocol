'use client';

import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export function ProposalsTable({ onOpen, apiBase='/api/governance' }:{
  onOpen:(p:any)=>void; apiBase?:string;
}) {
  const { data, mutate } = useSWR(`${apiBase}/proposals`, fetcher, { refreshInterval: 4000 });
  const proposals = data?.proposals ?? [];
  
  return (
    <div className="bg-zinc-950/70 border border-white/10 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Proposals</h2>
        <button
          onClick={() => mutate()}
          className="text-xs px-2 py-1 border border-white/20 rounded hover:bg-white/5"
        >
          Refresh
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="text-left py-1">Title</th>
              <th className="text-left py-1">Status</th>
              <th className="text-right py-1">Created</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p: any) => (
              <tr
                key={p.id}
                className="hover:bg-white/5 cursor-pointer"
                onClick={() => onOpen(p)}
              >
                <td className="py-2">{p.title}</td>
                <td>
                  <span
                    className={
                      p.status === 'approved'
                        ? 'px-2 py-0.5 rounded text-emerald-300 bg-emerald-700/30'
                        : p.status === 'rejected'
                        ? 'px-2 py-0.5 rounded text-amber-200 bg-amber-700/30'
                        : 'px-2 py-0.5 rounded text-zinc-200 bg-zinc-700/30'
                    }
                  >
                    {p.status}
                  </span>
                </td>
                <td className="text-right text-zinc-400">
                  {new Date(p.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {proposals.length === 0 && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-zinc-400">
                  No proposals
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

