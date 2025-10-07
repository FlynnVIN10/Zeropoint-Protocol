"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<any>({});
  const [proposals, setProposals] = useState<any[]>([]);
  const [synthients, setSynthients] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function refresh() {
    try {
      const h = await fetch("/api/healthz").then(r => r.json());
      const p = await fetch("/api/proposals").then(r => r.json());
      const s = await fetch("/api/synthients").then(r => r.json());
      setStatus(h);
      setProposals(p);
      setSynthients(s);
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 1500);
    return () => clearInterval(t);
  }, []);

  async function createProposal() {
    if (!title) return;
    await fetch("/api/proposals", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    });
    setTitle("");
    setBody("");
    refresh();
  }

  async function vote(id: string, decision: "approve" | "veto") {
    await fetch(`/api/proposals/${id}/vote`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter: "CTO", decision })
    });
    refresh();
  }

  async function train(id: string) {
    await fetch(`/api/synthients/${id}/train`, { method: "POST" });
    refresh();
  }

  return (
    <main className="p-6 space-y-8 min-h-screen bg-black text-white">
      <section>
        <h1 className="text-3xl font-bold mb-4">Zeropoint Protocol — Local</h1>
        <pre className="bg-gray-900 p-4 rounded overflow-x-auto text-sm">
          {JSON.stringify(status, null, 2)}
        </pre>
      </section>

      <section className="bg-gray-900 p-6 rounded">
        <h2 className="text-2xl font-semibold mb-4">Create Proposal</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
          <textarea
            placeholder="Body"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={4}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
          <button
            onClick={createProposal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
          >
            Submit Proposal
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Proposals ({proposals.length})</h2>
        <div className="space-y-3">
          {proposals.map(p => (
            <div key={p.id} className="border border-gray-700 bg-gray-900 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    p.status === 'approved' ? 'bg-green-900 text-green-200' :
                    p.status === 'vetoed' ? 'bg-red-900 text-red-200' :
                    'bg-yellow-900 text-yellow-200'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-300 mb-3">{p.body}</p>
              <div className="text-sm text-gray-400 mb-3">
                Votes: {p.votes?.length ?? 0}
              </div>
              {p.status === 'open' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => vote(p.id, "approve")}
                    className="px-3 py-1 bg-green-700 hover:bg-green-800 rounded text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => vote(p.id, "veto")}
                    className="px-3 py-1 bg-red-700 hover:bg-red-800 rounded text-sm"
                  >
                    Veto
                  </button>
                </div>
              )}
            </div>
          ))}
          {proposals.length === 0 && (
            <p className="text-gray-500 italic">No proposals yet. Create one above.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Synthients ({synthients.length})</h2>
        <div className="space-y-3">
          {synthients.map(s => (
            <div key={s.id} className="border border-gray-700 bg-gray-900 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold">{s.name}</h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    s.status === 'ready' ? 'bg-green-900 text-green-200' :
                    s.status === 'training' ? 'bg-blue-900 text-blue-200' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  Last: {s.lastHeartbeat ? new Date(s.lastHeartbeat).toLocaleString() : "-"}
                </span>
              </div>
              <button
                onClick={() => train(s.id)}
                disabled={s.status === 'training'}
                className="px-3 py-1 bg-purple-700 hover:bg-purple-800 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm"
              >
                Start Training
              </button>
              <div className="mt-3 text-sm text-gray-400">
                <div className="font-semibold mb-1">Recent Runs:</div>
                {s.runs?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {s.runs.map((r: any) => (
                      <li key={r.id} className="text-xs">
                        {r.status} @ {new Date(r.startedAt).toLocaleString()}
                        {r.metrics && ` - Loss: ${r.metrics.loss}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs italic">No training runs yet</p>
                )}
              </div>
            </div>
          ))}
          {synthients.length === 0 && (
            <p className="text-gray-500 italic">No synthients yet. Run seed script to create.</p>
          )}
        </div>
      </section>
    </main>
  );
}
