'use client';
import { useEffect, useState } from 'react';

type Proposal = { id:string; title:string; summary:string; owner:string; created_at:string; priority:'low'|'med'|'high' };

export default function Page() {
  const [items, setItems] = useState<Proposal[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [versionInfo, setVersionInfo] = useState<any>(null);

  useEffect(()=>{ (async()=>{
    // Fetch with cache-buster for live data
    const versionResponse = await fetch(`/status/version.json?cb=${Date.now()}`, {cache:'no-store'});
    const version = await versionResponse.json();
    setVersionInfo(version);
    
    const p = await fetch('/api/synthient/proposals').then(r=>r.json());
    setItems(p.items||[]);
    const s = await fetch('/api/synthient/status').then(r=>r.json());
    setStatus(s);
  })(); },[]);

  async function decide(id:string, action:'approve'|'veto') {
    const feedback = note[id] || '';
    const res = await fetch('/api/synthient/consensus', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id, action, feedback, actor:'CEO' })});
    if (!res.ok) alert('Decision failed'); else alert(`${action.toUpperCase()} recorded`);
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Synthient Proposals</h1>
        {versionInfo && (
          <div className="text-sm bg-gray-100 px-3 py-1 rounded-lg">
            <div className="font-mono text-xs">Commit: {versionInfo.commit}</div>
            <div className="text-xs opacity-70">Phase: {versionInfo.phase}</div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-4">
        <h2 className="text-xl font-medium mb-2">Training Status</h2>
        <pre className="text-sm overflow-auto">{JSON.stringify(status, null, 2)}</pre>
        <p className="mt-2 text-sm">{status?.summary || 'Loading...'}</p>
      </div>

      <ul className="space-y-4">
        {items.map(p=>(
          <li key={p.id} className="rounded-2xl border p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-medium">{p.title}</div>
                <div className="text-xs opacity-70">Owner: {p.owner} • {new Date(p.created_at).toLocaleString()} • Priority: {p.priority}</div>
                <p className="mt-2 text-sm">{p.summary}</p>
              </div>
            </div>
            <textarea
              className="mt-3 w-full rounded-xl border p-2 text-sm"
              placeholder="CEO feedback (optional)"
              value={note[p.id]||''}
              onChange={(e)=>setNote({...note, [p.id]:e.target.value})}
            />
            <div className="mt-3 flex gap-2">
              <button onClick={()=>decide(p.id,'approve')} className="rounded-xl border px-3 py-2 text-sm">Approve</button>
              <button onClick={()=>decide(p.id,'veto')} className="rounded-xl border px-3 py-2 text-sm">Veto</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
