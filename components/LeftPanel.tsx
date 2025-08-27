import { useEffect, useState } from 'react';

interface Proposal {
  proposal_id: string;
  prompt: string;
  created_at: string;
  state: string;
}

export default function LeftPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stateFilter, setStateFilter] = useState('pending');
  const [actionMsg, setActionMsg] = useState('');
  const [approvedCount, setApprovedCount] = useState<number | null>(null);
  const [vetoedCount, setVetoedCount] = useState<number | null>(null);

  const loadProposals = async (state = 'pending') => {
    try {
      const res = await fetch(`/consensus/proposals?state=${encodeURIComponent(state)}`);
      const data = await res.json();
      setProposals(Array.isArray(data) ? data : []);
    } catch (e) {
      setProposals([]);
    }
  };

  const loadHistory = async () => {
    try {
      const r = await fetch('/consensus/history').then(x => x.json());
      if (typeof r?.approved === 'number' && typeof r?.vetoed === 'number') {
        setApprovedCount(r.approved);
        setVetoedCount(r.vetoed);
        return;
      }
    } catch {}
    // fallback using list queries
    try {
      const [a, v] = await Promise.all([
        fetch('/consensus/proposals?state=approved').then(r => r.json()).catch(() => []),
        fetch('/consensus/proposals?state=vetoed').then(r => r.json()).catch(() => [])
      ]);
      setApprovedCount(Array.isArray(a) ? a.length : 0);
      setVetoedCount(Array.isArray(v) ? v.length : 0);
    } catch {
      setApprovedCount(0);
      setVetoedCount(0);
    }
  };

  useEffect(() => {
    loadProposals(stateFilter);
    loadHistory();
  }, [stateFilter]);

  const vote = async (proposal_id: string, vote: 'approve' | 'veto') => {
    try {
      const res = await fetch('/consensus/vote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ proposal_id, voter: 'synthiant', vote })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`${vote.toUpperCase()} recorded: ${data.vote_id}`);
        loadProposals(stateFilter);
        loadHistory();
      } else {
        setActionMsg(`Error: ${data.error || 'vote failed'}`);
      }
    } catch (e) {
      setActionMsg('Error submitting vote');
    }
  };

  return (
    <div className={`bg-matte-black p-4 ${isOpen ? 'w-64' : 'w-16'}`}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && (
        <>
          <section>
            <h3>Synthiant Consensus</h3>
            <div>
              <label>
                State:
                <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="vetoed">vetoed</option>
                </select>
              </label>
              <button onClick={() => { loadProposals(stateFilter); loadHistory(); }}>Refresh</button>
            </div>
            <div style={{marginTop: 8}}>
              <small>History: approved {approvedCount ?? '-'} • vetoed {vetoedCount ?? '-'}</small>
            </div>
            <ul>
              {proposals.map(p => (
                <li key={p.proposal_id}>
                  <div>{p.prompt}</div>
                  <div>{p.state} • {new Date(p.created_at).toLocaleString()}</div>
                  <div>
                    <button onClick={() => vote(p.proposal_id, 'approve')}>Approve</button>
                    <button onClick={() => vote(p.proposal_id, 'veto')}>Veto</button>
                  </div>
                </li>
              ))}
            </ul>
            {actionMsg && <div>{actionMsg}</div>}
          </section>
          <section>Proposals</section>
          <section>Metrics</section>
          <section>Health</section>
        </>
      )}
    </div>
  );
}
