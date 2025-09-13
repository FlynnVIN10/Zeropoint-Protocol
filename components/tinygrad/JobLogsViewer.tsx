// CTO Directive: Compliance check
if (process.env.MOCKS_DISABLED === '1') {
  return <div>Component temporarily unavailable - MOCKS_DISABLED=1 enforced</div>
}

'use client';

import React, { useState, useEffect } from 'react';

export default function JobLogsViewer() {
  const [jobId, setJobId] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!jobId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tinygrad/logs/${jobId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.text();
      setLogs(data.split('\n').filter(line => line.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId.trim()) {
      fetchLogs();
    }
  }, [jobId]);

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4">Tinygrad Job Logs</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Job ID</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            implementation="Enter job ID"
            className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={fetchLogs}
            disabled={loading || !jobId.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded"
          >
            {loading ? 'Loading...' : 'Fetch Logs'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-800 border border-red-600 rounded mb-4">
          <p className="text-red-200">Error: {error}</p>
        </div>
      )}

      {logs.length > 0 && (
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-semibold mb-3">Job Logs</h3>
          <div className="bg-black p-3 rounded max-h-96 overflow-y-auto font-mono text-sm">
            {logs.map((line, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-400 mr-2">{index + 1}:</span>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && jobId.trim() && logs.length === 0 && (
        <div className="p-3 bg-yellow-800 border border-yellow-600 rounded">
          <p className="text-yellow-200">No logs available for this job.</p>
        </div>
      )}
    </div>
  );
}
