'use client';

import React, { useState, useEffect } from 'react';

interface SynthientLog {
  id: string;
  timestamp: string;
  synthient_id: string;
  synthient_type: string;
  action: string;
  status: string;
  details: any;
  severity: string;
}

interface TrainingMetrics {
  active_runs: number;
  completed_today: number;
  total_runs: number;
  last_run_model: string;
  last_run_accuracy: number;
  last_run_loss: number;
  commit: string;
  last_update: string;
}

interface Proposal {
  id: string;
  title: string;
  status: string;
  votes: number;
  created_at: string;
}

const RightPanel: React.FC = () => {
  const [synthientLogs, setSynthientLogs] = useState<SynthientLog[]>([]);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLiveData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all live data in parallel with cache busting
      const cacheBuster = `?cb=${Date.now()}`;
      const [logsResponse, trainingResponse, proposalsResponse, statusResponse, versionResponse] = await Promise.all([
        fetch(`/api/synthients-syslog?limit=5${cacheBuster}`),
        fetch(`/api/training${cacheBuster}`),
        fetch(`/api/proposals${cacheBuster}`),
        fetch(`/api/healthz${cacheBuster}`),
        fetch(`/status/version.json${cacheBuster}`)
      ]);

      // Process Synthient activity logs
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setSynthientLogs(logsData.logs || []);
      }

      // Process training metrics
      if (trainingResponse.ok) {
        const trainingData = await trainingResponse.json();
        setTrainingMetrics(trainingData);
      }

      // Process proposals
      if (proposalsResponse.ok) {
        const proposalsData = await proposalsResponse.json();
        setProposals(Array.isArray(proposalsData) ? proposalsData : [proposalsData]);
      }

      // Process system status
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSystemStatus(statusData);
      }

      // Process version info for commit/buildTime display
      if (versionResponse.ok) {
        const versionData = await versionResponse.json();
        setSystemStatus(prev => ({ ...prev, ...versionData }));
      }

    } catch (err) {
      setError('Unable to load live data. Please try again later.');
      console.error('Error fetching live data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="right-panel">
      <h2>Live System Status</h2>
      {loading && <p>Loading live data...</p>}
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

      {/* Live Synthient Activity */}
      <div className="live-section">
        <h3>Recent Synthient Activity</h3>
        {synthientLogs.length > 0 ? (
          <div className="activity-list">
            {synthientLogs.map((log) => (
              <div key={log.id} className={`activity-item ${log.severity}`}>
                <div className="activity-header">
                  <span className="synthient-id">{log.synthient_id}</span>
                  <span className="timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="activity-action">{log.action}</div>
                <div className="activity-details">{JSON.stringify(log.details)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent activity</p>
        )}
      </div>

      {/* Live Training Metrics */}
      <div className="live-section">
        <h3>Training Status</h3>
        {trainingMetrics ? (
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Active Runs:</span>
              <span className="metric-value">{trainingMetrics.active_runs || 0}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Completed Today:</span>
              <span className="metric-value">{trainingMetrics.completed_today || 0}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Total Runs:</span>
              <span className="metric-value">{trainingMetrics.total_runs || 0}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Last Model:</span>
              <span className="metric-value">{trainingMetrics.last_run_model || 'N/A'}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Last Accuracy:</span>
              <span className="metric-value">{trainingMetrics.last_run_accuracy || 'N/A'}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Last Loss:</span>
              <span className="metric-value">{trainingMetrics.last_run_loss || 'N/A'}</span>
            </div>
          </div>
        ) : (
          <p>No training data available</p>
        )}
      </div>

      {/* Live Proposals */}
      <div className="live-section">
        <h3>Active Proposals</h3>
        {proposals.length > 0 ? (
          <div className="proposals-list">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="proposal-item">
                <div className="proposal-title">{proposal.title}</div>
                <div className="proposal-meta">
                  <span className="proposal-status">{proposal.status}</span>
                  <span className="proposal-votes">{proposal.votes} votes</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No active proposals</p>
        )}
      </div>

      {/* System Status */}
      {systemStatus && (
        <div className="live-section">
          <h3>System Health</h3>
          <div className="system-status">
            <div className="status-item">
              <span className="status-label">Status:</span>
              <span className={`status-value ${systemStatus.status === 'ok' ? 'healthy' : 'error'}`}>
                {systemStatus.status}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Commit:</span>
              <span className="status-value">{systemStatus.commit}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Phase:</span>
              <span className="status-value">{systemStatus.phase}</span>
            </div>
            <div className="status-item">
              <span className="status-label">DB Connected:</span>
              <span className={`status-value ${systemStatus.dbConnected ? 'healthy' : 'error'}`}>
                {systemStatus.dbConnected ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanel;


