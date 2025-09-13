'use client';

import React, { useState } from 'react';

export default function ContributionForm() {
  const [assetType, setAssetType] = useState('model');
  const [assetData, setAssetData] = useState('');
  const [metadata, setMetadata] = useState('{"version": "1.0", "format": "json"}');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/wondercraft/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetType,
          assetData: JSON.parse(assetData),
          metadata: JSON.parse(metadata),
          description,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(`Contribution submitted successfully! ID: ${data.contributionId}`);
      // Reset form
      setAssetType('model');
      setAssetData('');
      setMetadata('{"version": "1.0", "format": "json"}');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4">Contribute to Wondercraft</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Asset Type</label>
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="model">Model</option>
            <option value="dataset">Dataset</option>
            <option value="tool">Tool</option>
            <option value="documentation">Documentation</option>
            <option value="research">Research</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Asset Data (JSON)</label>
          <textarea
            value={assetData}
            onChange={(e) => setAssetData(e.target.value)}
            placeholder='{"name": "My Asset", "content": "..."}'
            rows={6}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Metadata (JSON)</label>
          <textarea
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder='{"version": "1.0", "format": "json"}'
            rows={3}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your contribution"
            rows={3}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded font-medium"
        >
          {loading ? 'Submitting Contribution...' : 'Submit Contribution'}
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
