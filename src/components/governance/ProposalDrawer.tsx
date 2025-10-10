'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type VotePayload = { actor: 'human'; decision: 'approve' | 'veto'; reason: string };

export function ProposalDrawer({
  proposal,
  onClose
}: {
  proposal: any;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [decision, setDecision] = useState<'approve' | 'veto'>('approve');
  const [reason, setReason] = useState('Meets gates');

  const m = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/governance/proposals/${proposal.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'human', decision, reason } as VotePayload)
      });
      if (!res.ok) throw new Error('vote failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposal', proposal.id] });
      qc.invalidateQueries({ queryKey: ['proposals'] });
      onClose();
    }
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed right-0 top-0 h-full w-full md:w-[32rem] bg-zinc-950 border-l border-white/10 p-4 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{proposal.title}</h3>
        <button
          onClick={onClose}
          aria-label="Close"
          className="px-2 py-1 rounded border border-white/20 hover:bg-white/5"
        >
          ESC
        </button>
      </div>
      
      <div className="text-sm text-zinc-300 whitespace-pre-wrap bg-black/30 rounded p-3 mb-3 max-h-64 overflow-y-auto">
        {proposal.body}
      </div>
      
      <div className="mb-3">
        <h4 className="text-sm font-semibold mb-1">Votes</h4>
        <ul className="space-y-1 text-xs">
          {proposal.Vote?.map((v: any) => (
            <li key={v.id} className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded ${
                  v.decision === 'approve'
                    ? 'bg-emerald-600/30 text-emerald-300'
                    : 'bg-amber-600/30 text-amber-200'
                }`}
              >
                {v.actor}:{v.decision}
              </span>
              <span className="text-zinc-400">{new Date(v.createdAt).toLocaleString()}</span>
            </li>
          ))}
          {(!proposal.Vote || proposal.Vote.length === 0) && (
            <li className="text-zinc-500">No votes yet</li>
          )}
        </ul>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-center gap-2 mb-2">
          <select
            value={decision}
            onChange={e => setDecision(e.target.value as any)}
            className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-sm"
          >
            <option value="approve">Approve</option>
            <option value="veto">Veto</option>
          </select>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason"
            className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={() => m.mutate()}
            disabled={m.isPending}
            className="px-3 py-1 rounded border border-emerald-400/50 text-emerald-300 hover:scale-[1.02] transition disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
        {m.isError && <div className="text-rose-400 text-xs">Vote failed</div>}
      </div>
    </div>
  );
}

