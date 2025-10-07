'use client';

import React, { useState, useEffect } from 'react';

interface Proposal {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  status: string;
  author?: string;
  category?: string;
  tags?: string[];
}

export default function ProposalList() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch('/api/proposals');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setProposals(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  if (loading) return <div className="p-4">Loading proposals...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4">Proposals</h2>

      {proposals.length === 0 ? (
        <p className="text-gray-400">No proposals yet</p>
      ) : (
        <div className="space-y-2">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-gray-800 p-3 rounded cursor-pointer hover:bg-gray-700"
              onClick={() => setSelectedProposal(proposal)}
            >
              <h3 className="font-semibold">{proposal.title}</h3>
              <p className="text-sm text-gray-400">
                Status: {proposal.status} | {new Date(proposal.timestamp).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {selectedProposal && (
        <div className="mt-4 bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-bold mb-2">{selectedProposal.title}</h3>
          <p className="text-gray-300 mb-2">{selectedProposal.body}</p>
          <div className="text-sm text-gray-400">
            <p>ID: {selectedProposal.id}</p>
            <p>Status: {selectedProposal.status}</p>
            <p>Author: {selectedProposal.author || 'Unknown'}</p>
            <p>Category: {selectedProposal.category || 'General'}</p>
            <p>Tags: {selectedProposal.tags?.join(', ') || 'None'}</p>
            <p>Created: {new Date(selectedProposal.timestamp).toLocaleString()}</p>
          </div>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            onClick={() => setSelectedProposal(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
