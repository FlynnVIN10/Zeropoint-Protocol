// CTO Directive: Compliance check
if (process.env.MOCKS_DISABLED === '1') {
  return <div>Component temporarily unavailable - MOCKS_DISABLED=1 enforced</div>
}

'use client';

import React, { useState, useEffect } from 'react';

interface JobStatus {
  jobId: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  dataset: string;
  modelConfig: any;
}

export default function JobStatusViewer() {
  const [jobId, setJobId] = useState('');
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (!jobId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tinygrad/status/${jobId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setJobStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setJobStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId.trim()) {
      fetchStatus();
    }
  }, [jobId]);

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4">Tinygrad Job Status</h2>

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
            onClick={fetchStatus}
            disabled={loading || !jobId.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded"
          >
            {loading ? 'Loading...' : 'Check Status'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-800 border border-red-600 rounded mb-4">
          <p className="text-red-200">Error: {error}</p>
        </div>
      )}

      {jobStatus && (
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-semibold mb-3">Job Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Job ID:</strong> {jobStatus.jobId}</p>
              <p><strong>Status:</strong>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  jobStatus.status === 'completed' ? 'bg-green-600' :
                  jobStatus.status === 'running' ? 'bg-blue-600' :
                  jobStatus.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                }`}>
                  {jobStatus.status}
                </span>
              </p>
              <p><strong>Progress:</strong> {jobStatus.progress}%</p>
            </div>
            <div>
              <p><strong>Dataset:</strong> {jobStatus.dataset}</p>
              <p><strong>Created:</strong> {new Date(jobStatus.createdAt).toLocaleString()}</p>
              <p><strong>Updated:</strong> {new Date(jobStatus.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">Model Config</h4>
            <pre className="bg-gray-900 p-2 rounded text-sm overflow-x-auto">
              {JSON.stringify(jobStatus.modelConfig, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
