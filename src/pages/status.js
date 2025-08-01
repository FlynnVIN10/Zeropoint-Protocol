import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import styles from './status.module.css';

const StatusPage = () => {
  const [promptData, setPromptData] = useState([]);
  const [uptimeData, setUptimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('7d');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // Mock data for demonstration
        const mockPromptData = [
          { date: '2025-07-25', completed: 85, failed: 5, pending: 10 },
          { date: '2025-07-26', completed: 92, failed: 3, pending: 5 },
          { date: '2025-07-27', completed: 78, failed: 8, pending: 14 },
          { date: '2025-07-28', completed: 95, failed: 2, pending: 3 },
          { date: '2025-07-29', completed: 88, failed: 6, pending: 6 },
          { date: '2025-07-30', completed: 91, failed: 4, pending: 5 },
          { date: '2025-07-31', completed: 87, failed: 5, pending: 8 }
        ];

        const mockUptimeData = [
          { time: '00:00', uptime: 99.8, responseTime: 120 },
          { time: '04:00', uptime: 99.9, responseTime: 110 },
          { time: '08:00', uptime: 99.7, responseTime: 140 },
          { time: '12:00', uptime: 99.6, responseTime: 160 },
          { time: '16:00', uptime: 99.8, responseTime: 130 },
          { time: '20:00', uptime: 99.9, responseTime: 115 },
          { time: '24:00', uptime: 99.8, responseTime: 125 }
        ];

        setPromptData(mockPromptData);
        setUptimeData(mockUptimeData);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateFilter]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading system metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Error Loading Metrics</h2>
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>System Status & Metrics</h1>
        <div className={styles.dateFilter}>
          <label htmlFor="dateFilter">Time Range:</label>
          <select 
            id="dateFilter" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className={styles.select}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </header>

      <div className={styles.metricsGrid}>
        {/* Prompt Completion Rate Chart */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Prompt Completion Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={promptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="completed" 
                fill="#00ff88" 
                name="Completed"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="failed" 
                fill="#ff4757" 
                name="Failed"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="pending" 
                fill="#ffa502" 
                name="Pending"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* System Uptime Chart */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>System Uptime & Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={uptimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="time" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
                domain={[99, 100]}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
                domain={[0, 200]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="uptime"
                stroke="#00ff88"
                fill="rgba(0, 255, 136, 0.2)"
                name="Uptime (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="responseTime"
                stroke="#ff6b6b"
                strokeWidth={2}
                name="Response Time (ms)"
                dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* System Health Summary */}
        <div className={styles.summaryCard}>
          <h2 className={styles.chartTitle}>System Health Summary</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Overall Uptime</span>
              <span className={styles.summaryValue}>99.8%</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Avg Response Time</span>
              <span className={styles.summaryValue}>128ms</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Success Rate</span>
              <span className={styles.summaryValue}>89.4%</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Active Connections</span>
              <span className={styles.summaryValue}>1,247</span>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className={styles.alertsCard}>
          <h2 className={styles.chartTitle}>Recent Alerts</h2>
          <div className={styles.alertsList}>
            <div className={styles.alertItem}>
              <span className={styles.alertTime}>2 hours ago</span>
              <span className={styles.alertMessage}>High response time detected</span>
              <span className={styles.alertSeverity}>Warning</span>
            </div>
            <div className={styles.alertItem}>
              <span className={styles.alertTime}>5 hours ago</span>
              <span className={styles.alertMessage}>Database connection restored</span>
              <span className={styles.alertSeverity}>Info</span>
            </div>
            <div className={styles.alertItem}>
              <span className={styles.alertTime}>1 day ago</span>
              <span className={styles.alertMessage}>System maintenance completed</span>
              <span className={styles.alertSeverity}>Info</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;