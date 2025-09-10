'use client';

import React, { useState, useEffect } from 'react';

interface Proposal {
  id: string;
  title: string;
  body: string;
  status: string;
  votes: { for: number; against: number; abstain: number };
}

export default function VoteForm() {
  const [proposalId, setProposalId] = useState('');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [vote, setVote] = useState<'for' | 'against' | 'abstain'>('for');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch active proposals
    const fetchProposals = async () => {
      try {
        const response = await fetch('/api/petals/status');
        if (response.ok) {
          const data = await response.json();
          setProposals(data.proposals || []);
        }
      } catch (err) {
        console.error('Failed to fetch proposals:', err);
      }
    };

    fetchProposals();
  }, []);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToVote = proposalId || selectedProposal?.id;
    if (!idToVote) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/petals/vote/${idToVote}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(`Vote recorded successfully! New tally: ${JSON.stringify(data.tally)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalSelect = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setProposalId(proposal.id);
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4">Vote on Petals Proposal</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Active Proposals</h3>
        {proposals.length === 0 ? (
          <p className="text-gray-400">No active proposals found.</p>
        ) : (
          <div className="space-y-2">
            {proposals.filter(p => p.status === 'active').map((proposal) => (
              <div
                key={proposal.id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedProposal?.id === proposal.id
                    ? 'border-blue-500 bg-blue-900'
                    : 'border-gray-600 bg-gray-800 hover:bg-gray-700'
                }`}
                onClick={() => handleProposalSelect(proposal)}
              >
                <h4 className="font-medium">{proposal.title}</h4>
                <p className="text-sm text-gray-400 mb-2">
                  Votes: {proposal.votes.for} For, {proposal.votes.against} Against, {proposal.votes.abstain} Abstain
                </p>
                <p className="text-sm">{proposal.body.slice(0, 100)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleVote} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Proposal ID (or select above)</label>
          <input
            type="text"
            value={proposalId}
            onChange={(e) => setProposalId(e.target.value)}
            placeholder="Enter proposal ID"
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your Vote</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="vote"
                value="for"
                checked={vote === 'for'}
                onChange={(e) => setVote(e.target.value as 'for')}
                className="mr-2"
              />
              For
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="vote"
                value="against"
                checked={vote === 'against'}
                onChange={(e) => setVote(e.target.value as 'against')}
                className="mr-2"
              />
              Against
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="vote"
                value="abstain"
                checked={vote === 'abstain'}
                onChange={(e) => setVote(e.target.value as 'abstain')}
                className="mr-2"
              />
              Abstain
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded font-medium"
        >
          {loading ? 'Submitting Vote...' : 'Submit Vote'}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-3 bg-green-800 border border-green-600 rounded">
          <p className="text-green-200">{result}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-800 border border-red-600 rounded">
          <p className="text-red-200">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
