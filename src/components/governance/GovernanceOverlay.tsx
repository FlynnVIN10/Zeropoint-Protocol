'use client';

import { useState, useEffect } from 'react';
import { ProposalsTable } from './ProposalsTable';
import ProposalDetail from './ProposalDetail';

export default function GovernanceOverlay({ open, onClose }:{
  open:boolean; onClose:()=>void;
}) {
  const [selectedId, setSelectedId] = useState<string|null>(null);
  useEffect(()=>{ if(!open) setSelectedId(null); },[open]);
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') onClose(); };
    if(open) window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[open,onClose]);

  if(!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm pointer-events-auto">
      <button onClick={onClose}
        className="absolute top-4 right-4 px-3 py-1 border border-white/20 rounded">Close</button>

      <div className="mx-auto mt-8 h-[80vh] max-w-6xl grid md:grid-cols-[7fr_5fr] gap-3 p-3">
        <div className="rounded-xl border border-white/10 bg-zinc-950/70 overflow-hidden">
          <ProposalsTable
            apiBase="/api/governance"
            onOpen={(p)=>setSelectedId(p.id)}
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-950/70 overflow-auto">
          {selectedId
            ? <ProposalDetail id={selectedId} apiBase="/api/governance" onClose={()=>setSelectedId(null)} />
            : <div className="p-6 text-zinc-400">Select a proposal</div>}
        </div>
      </div>
    </div>
  );
}
