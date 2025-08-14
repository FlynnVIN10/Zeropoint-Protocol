'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const dynamic = 'force-dynamic';

interface HealthData {
  status: string;
  commit: string;
  buildTime: string;
  deployment: string;
  version: string;
}

interface ReadyData {
  ready: boolean;
  commit: string;
  buildTime: string;
  deployment: string;
  version: string;
}

async function fetchJSON(path: string) {
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`Probe ${path} ${r.status}`);
  return r.json();
}

export default function Status() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [readyData, setReadyData] = useState<ReadyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [health, ready] = await Promise.all([
          fetchJSON('/api/healthz'),
          fetchJSON('/api/readyz')
        ]);

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
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">System Status</h1>
          <p className="text-xl text-sub">Loading verified system status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">System Status</h1>
          <p className="text-xl text-err">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">System Status</h1>
        <p className="text-xl text-sub">
          Verified system status from health endpoints
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Build Information">
          <ul className="text-sm text-sub space-y-2">
            <li>Commit: <span className="text-text font-mono">{healthData?.commit || 'Unknown'}</span></li>
            <li>Built: <span className="text-text">{healthData?.buildTime || 'Unknown'}</span></li>
            <li>Deployment: <span className="text-text">{healthData?.deployment || 'Unknown'}</span></li>
            <li>Version: <span className="text-text">{healthData?.version || 'Unknown'}</span></li>
          </ul>
        </Card>

        <Card title="System Probes">
          <div className="flex gap-2">
            <StatusBadge 
              status={healthData?.status === 'ok' ? 'ok' : 'err'} 
              label="healthz 200" 
            />
            <StatusBadge 
              status={readyData?.ready ? 'ok' : 'err'} 
              label="readyz 200" 
            />
          </div>
        </Card>
      </div>

      <Card title="Verification Policy">
        <div className="bg-muted/50 border-l-4 border-link p-4 rounded-r-md">
          <p className="text-text">
            <strong>Verification Policy:</strong> This status page only displays information verified through 
            the official health endpoints (/api/healthz and /api/readyz). No unverified claims or metrics 
            are shown to ensure accuracy and transparency.
          </p>
        </div>
      </Card>

      <div className="text-center text-sub text-sm">
        <p><em>Last Updated: {new Date().toLocaleString()}</em></p>
        <p><em>Status Page Version: 4.0 (Cloudflare Functions)</em></p>
        <p><em>© 2025 Zeropoint Protocol, Inc. All Rights Reserved.</em></p>
      </div>
    </div>
  );
}
