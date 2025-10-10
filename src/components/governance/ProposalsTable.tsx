'use client';

import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

interface Proposal {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

function ProposalRow({ proposal, onOpen }: { proposal: Proposal; onOpen: (p: any) => void }) {
  return (
    <div
      className="p-3 border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
      onClick={() => onOpen(proposal)}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-zinc-200 truncate">{proposal.title}</h4>
        <span
          className={
            proposal.status === 'approved'
              ? 'px-2 py-0.5 rounded text-xs text-emerald-300 bg-emerald-700/30'
              : proposal.status === 'rejected'
              ? 'px-2 py-0.5 rounded text-xs text-amber-200 bg-amber-700/30'
              : proposal.status === 'synthient-review'
              ? 'px-2 py-0.5 rounded text-xs text-purple-300 bg-purple-700/30'
              : proposal.status === 'human-review'
              ? 'px-2 py-0.5 rounded text-xs text-blue-300 bg-blue-700/30'
              : 'px-2 py-0.5 rounded text-xs text-zinc-200 bg-zinc-700/30'
          }
        >
          {proposal.status}
        </span>
      </div>
      <div className="text-xs text-zinc-400">
        {new Date(proposal.createdAt).toLocaleString()}
      </div>
    </div>
  );
}

function ProposalPanel({ 
  title, 
  proposals, 
  onOpen, 
  emptyMessage,
  className = ""
}: {
  title: string;
  proposals: Proposal[];
  onOpen: (p: any) => void;
  emptyMessage: string;
  className?: string;
}) {
  return (
    <div className={`bg-zinc-900/50 border border-white/10 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
        <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
          {proposals.length}
        </span>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {proposals.length > 0 ? (
          proposals.map((proposal) => (
            <ProposalRow key={proposal.id} proposal={proposal} onOpen={onOpen} />
          ))
        ) : (
          <div className="text-center text-zinc-500 text-sm py-4">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProposalsTable({ onOpen, apiBase='/api/governance' }:{
  onOpen:(p:any)=>void; apiBase?:string;
}) {
  const { data, error, mutate } = useSWR(`${apiBase}/proposals`, fetcher, { refreshInterval: 4000 });
  const proposals: Proposal[] = data?.proposals ?? [];
  
  if (error) {
    console.error('Failed to fetch proposals:', error);
    return (
      <div className="bg-zinc-950/70 border border-white/10 rounded-xl p-4">
        <div className="text-red-400">Failed to load proposals: {error.message}</div>
      </div>
    );
  }
  
  // Group proposals by status
  const waitingApproval = proposals.filter(p => 
    p.status === 'synthient-review' || p.status === 'human-review'
  );
  const approved = proposals.filter(p => p.status === 'approved');
  const rejected = proposals.filter(p => p.status === 'rejected');
  
  return (
    <div className="bg-zinc-950/70 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Proposals</h2>
        <button
          onClick={() => mutate()}
          className="text-xs px-3 py-1 border border-white/20 rounded hover:bg-white/5 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <ProposalPanel
          title="Waiting Approval"
          proposals={waitingApproval}
          onOpen={onOpen}
          emptyMessage="No proposals waiting approval"
          className="border-l-4 border-l-blue-500"
        />
        
        <ProposalPanel
          title="Approved"
          proposals={approved}
          onOpen={onOpen}
          emptyMessage="No approved proposals"
          className="border-l-4 border-l-emerald-500"
        />
        
        <ProposalPanel
          title="Rejected"
          proposals={rejected}
          onOpen={onOpen}
          emptyMessage="No rejected proposals"
          className="border-l-4 border-l-amber-500"
        />
      </div>
    </div>
  );
}

