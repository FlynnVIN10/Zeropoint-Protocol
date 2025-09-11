'use client';

import React, { useState, useEffect } from 'react';

interface StatusData {
  status?: string;
  ready?: boolean;
  active_runs?: number;
  commit: string;
  phase: string;
  buildTime: string;
  timestamp: string;
  dbConnected?: boolean;
}

const RightPanel: React.FC = () => {
  const [health, setHealth] = useState<StatusData | null>(null);
  const [ready, setReady] = useState<StatusData | null>(null);
  const [training, setTraining] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (url: string, setter: React.Dispatch<React.SetStateAction<StatusData | null>>) => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        const data = await response.json();
        setter(data);
      } catch (err) {
        setError(`Unable to load data from ${url}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData('/api/healthz', setHealth);
    fetchData('/api/readyz', setReady);
    fetchData('/api/training/status', setTraining);
  }, []);

  return (
    <div className="right-panel">
      <h2>System Status</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      
      {/* Navigation Links */}
      <div className="nav-section">
        <h3>Navigation</h3>
        <ul className="nav-links">
          <li><a href="/synthients">Synthients Dashboard</a></li>
          <li><a href="/synthients/monitor">Live Monitor</a></li>
          <li><a href="/status/version.json" target="_blank">Version Info</a></li>
          <li><a href="/api/synthients-syslog" target="_blank">Synthient Logs</a></li>
          <li><a href="/api/consensus/proposals" target="_blank">Proposals API</a></li>
          <li><a href="/api/training/metrics" target="_blank">Training Metrics</a></li>
        </ul>
      </div>

      <div>
        <h3>Health</h3>
        {health ? (
          <pre>
            Status: {health.status}
            Commit: {health.commit}
            DB Connected: {health.dbConnected ? 'Yes' : 'No'}
          </pre>
        ) : (
          <p>No health data available</p>
        )}
      </div>
      <div>
        <h3>Readiness</h3>
        {ready ? (
          <pre>
            Ready: {ready.ready ? 'Yes' : 'No'}
            Commit: {ready.commit}
          </pre>
        ) : (
          <p>No readiness data available</p>
        )}
      </div>
      <div>
        <h3>Training</h3>
        {training ? (
          <pre>
            Active Runs: {training.active_runs}
            Commit: {training.commit}
          </pre>
        ) : (
          <p>No training data available</p>
        )}
      </div>
    </div>
  );
};

export default RightPanel;


