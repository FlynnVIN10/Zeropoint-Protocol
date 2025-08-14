'use client';

import React, { useEffect, useState } from 'react';

interface HealthData {
  status: string;
  commit: string;
  buildTime: string;
}

interface ReadyData {
  ready: boolean;
  commit: string;
  buildTime: string;
}

export default function Status() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [readyData, setReadyData] = useState<ReadyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [healthResponse, readyResponse] = await Promise.all([
          fetch('/api/healthz'),
          fetch('/api/readyz')
        ]);

        if (!healthResponse.ok || !readyResponse.ok) {
          throw new Error('Failed to fetch status data');
        }

        const health = await healthResponse.json();
        const ready = await readyResponse.json();

        setHealthData(health);
        setReadyData(ready);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">System Status</h1>
          <p className="text-xl text-gray-600">Loading verified system status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">System Status</h1>
          <p className="text-xl text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">System Status</h1>
        <p className="text-xl text-gray-600">
          Verified system status from health endpoints
        </p>
      </div>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Verified System Health</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center p-6 border-2 border-green-500 rounded-lg">
            <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-green-600 mb-2">Health Status</h3>
            <p className="text-lg font-semibold text-green-600 mb-2">{healthData?.status || 'Unknown'}</p>
            <p className="text-sm text-gray-600">Verified via /api/healthz</p>
          </div>
          <div className="text-center p-6 border-2 border-blue-500 rounded-lg">
            <div className={`w-6 h-6 rounded-full mx-auto mb-4 ${readyData?.ready ? 'bg-blue-500' : 'bg-red-500'}`}></div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Readiness Status</h3>
            <p className="text-lg font-semibold text-blue-600 mb-2">{readyData?.ready ? 'Ready' : 'Not Ready'}</p>
            <p className="text-sm text-gray-600">Verified via /api/readyz</p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Build Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Deployment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Commit SHA</span>
                <span className="font-mono text-sm font-semibold">{healthData?.commit || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span>Build Time</span>
                <span className="font-semibold">{healthData?.buildTime || 'Unknown'}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Verification</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Health Endpoint</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Verified</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Readiness Endpoint</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Important Notice</h2>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-blue-800">
            <strong>Verification Policy:</strong> This status page only displays information verified through 
            the official health endpoints (/api/healthz and /api/readyz). No unverified claims or metrics 
            are shown to ensure accuracy and transparency.
          </p>
        </div>
      </section>

      <div className="text-center text-gray-500">
        <p><em>Last Updated: {new Date().toLocaleString()}</em></p>
        <p><em>Status Page Version: 2.0 (Verified Only)</em></p>
        <p><em>© 2025 Zeropoint Protocol, Inc. All Rights Reserved.</em></p>
      </div>
    </div>
  );
}
