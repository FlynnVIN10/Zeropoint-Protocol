'use client';

import React, { useState } from 'react';

export default function DiffForm() {
  const [assetId, setAssetId] = useState('');
  const [newData, setNewData] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/wondercraft/diff/${assetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newData: JSON.parse(newData),
          changeReason,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(`Diff applied successfully! Validation ID: ${data.validationId}`);
      // Reset form
      setAssetId('');
      setNewData('');
      setChangeReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4">Generate Wondercraft Diff</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Asset ID</label>
          <input
            type="text"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            placeholder="Enter asset ID to modify"
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New Data (JSON)</label>
          <textarea
            value={newData}
            onChange={(e) => setNewData(e.target.value)}
            placeholder='{"updatedField": "newValue", ...}'
            rows={6}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Change Reason</label>
          <textarea
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            placeholder="Explain why this change is needed"
            rows={3}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded font-medium"
        >
          {loading ? 'Generating Diff...' : 'Generate Diff'}
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
