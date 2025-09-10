'use client';

import React, { useState } from 'react';

export default function JobStartForm() {
  const [dataset, setDataset] = useState('');
  const [modelConfig, setModelConfig] = useState('{"layers": 3, "neurons": 128}');
  const [trainingParams, setTrainingParams] = useState('{"epochs": 10, "batch_size": 32}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/tinygrad/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataset,
          modelConfig: JSON.parse(modelConfig),
          trainingParams: JSON.parse(trainingParams),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(`Job started successfully! Job ID: ${data.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4">Start Tinygrad Training Job</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Dataset</label>
          <input
            type="text"
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            placeholder="e.g., mnist, cifar10"
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Model Config (JSON)</label>
          <textarea
            value={modelConfig}
            onChange={(e) => setModelConfig(e.target.value)}
            placeholder='{"layers": 3, "neurons": 128}'
            rows={3}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Training Params (JSON)</label>
          <textarea
            value={trainingParams}
            onChange={(e) => setTrainingParams(e.target.value)}
            placeholder='{"epochs": 10, "batch_size": 32}'
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
          {loading ? 'Starting Job...' : 'Start Training Job'}
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
