'use client';

import useSWR from 'swr';
const fetcher=(u:string)=>fetch(u).then(r=>r.json());

export default function ProposalDetail({ id, apiBase, onClose }:{
  id:string; apiBase:string; onClose:()=>void;
}) {
  const { data, mutate, error, isLoading } = useSWR(`${apiBase}/proposals/${id}`, fetcher);
  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error || !data?.proposal) return <div className="p-6 text-rose-300">Failed to load.</div>;
  const p = data.proposal;

  async function vote(decision:'approve'|'veto', reason:string){
    const res = await fetch(`${apiBase}/proposals/${id}/vote`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ actor:'human', decision, reason })
    });
    if(!res.ok) { const j=await res.json().catch(()=>({})); throw new Error(j.error||'vote failed'); }
    await mutate();
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{p.title}</h3>
        <button onClick={onClose} className="px-2 py-1 border border-white/20 rounded">Back</button>
      </div>

      <div className="text-sm text-zinc-300 whitespace-pre-wrap bg-black/30 rounded p-3 mb-3">{p.body}</div>

      <div className="mb-3">
        <h4 className="text-sm font-semibold mb-1">Votes</h4>
        <ul className="space-y-1 text-xs">
          {p.votes?.map((v:any)=>(
            <li key={v.id}>
              <span className={`px-2 py-0.5 rounded ${v.decision==='approve'?'bg-emerald-700/30 text-emerald-300':'bg-amber-700/30 text-amber-200'}`}>
                {v.actor}:{v.decision}
              </span>
              <span className="text-zinc-400 ml-2">{new Date(v.createdAt).toLocaleString()}</span>
              <span className="text-zinc-400 ml-2">{v.reason}</span>
            </li>
          ))}
          {(!p.votes || p.votes.length === 0) && (
            <li className="text-zinc-500">No votes yet</li>
          )}
        </ul>
      </div>

      {p.status === 'synthient-review' ? (
        <div className="text-center">
          <div className="px-3 py-2 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 text-sm">
            🔍 Awaiting Synthient Review
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Synthient must review and vote before human review
          </div>
        </div>
      ) : p.status === 'human-review' ? (
        <div className="space-y-2">
          {/* Show voting status */}
          <div className="text-xs text-zinc-400">
            Synthient: {p.votes?.find(v => v.actor === 'synthient')?.decision || 'pending'} | 
            Human: {p.votes?.find(v => v.actor === 'human')?.decision || 'pending'}
          </div>
          
          {/* Only show vote buttons if human hasn't voted yet */}
          {!p.votes?.find(v => v.actor === 'human') ? (
            <div className="flex items-center gap-2">
              <button onClick={()=>vote('approve','Meets gates')}
                className="px-3 py-1 rounded border border-emerald-400/50 text-emerald-300 hover:scale-[1.02] transition">Approve</button>
              <button onClick={()=>vote('veto','Insufficient evidence')}
                className="px-3 py-1 rounded border border-amber-400/50 text-amber-200 hover:scale-[1.02] transition">Veto</button>
            </div>
          ) : (
            <div className="text-center">
              <div className="px-3 py-2 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-sm">
                Human has voted - processing consensus
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            p.status === 'approved' 
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
          }`}>
            Proposal {p.status === 'approved' ? '✅ APPROVED' : '❌ REJECTED'}
          </div>
          <div className="text-xs text-zinc-400 mt-2">
            {p.status === 'approved' 
              ? 'Dual consensus achieved - ready for implementation'
              : 'Proposal rejected - no further action required'
            }
          </div>
        </div>
      )}
    </div>
  );
}

