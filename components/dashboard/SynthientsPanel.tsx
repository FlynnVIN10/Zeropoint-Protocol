'use client';

import React, { useState, useEffect } from 'react';

interface SynthientsData {
  platform: string;
  governanceMode: string;
  commit: string;
  env: string;
  flags: {
    trainingEnabled: boolean;
    mocksDisabled: boolean;
    synthientsActive: boolean;
  };
  services: {
    tinygrad: { status: string; backend: string };
    petals: { status: string; orchestrator: string };
    wondercraft: { status: string; bridge: string };
    db: { connected: boolean };
  };
  timestamp: string;
}

export default function SynthientsPanel() {
  const [data, setData] = useState<SynthientsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/status/synthients.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-4">Loading synthients status...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-4">No data available</div>;

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h2 className="text-xl font-bold mb-4">Synthients Status Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Platform Info */}
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Platform</h3>
          <p><strong>Platform:</strong> {data.platform}</p>
          <p><strong>Governance:</strong> {data.governanceMode}</p>
          <p><strong>Environment:</strong> {data.env}</p>
          <p><strong>Commit:</strong> {data.commit.slice(0, 7)}</p>
        </div>

        {/* Flags */}
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Flags</h3>
          <div className="space-y-1">
            <p>Training: {data.flags.trainingEnabled ? '✅' : '❌'}</p>
            <p>Mocks Disabled: {data.flags.mocksDisabled ? '✅' : '❌'}</p>
            <p>Synthients Active: {data.flags.synthientsActive ? '✅' : '❌'}</p>
          </div>
        </div>

        {/* Services */}
        <div className="bg-gray-800 p-4 rounded md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <strong>Tinygrad:</strong> {data.services.tinygrad.status} ({data.services.tinygrad.backend})
            </div>
            <div>
              <strong>Petals:</strong> {data.services.petals.status} ({data.services.petals.orchestrator})
            </div>
            <div>
              <strong>Wondercraft:</strong> {data.services.wondercraft.status} ({data.services.wondercraft.bridge})
            </div>
            <div>
              <strong>Database:</strong> {data.services.db.connected ? '✅ Connected' : '❌ Disconnected'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
