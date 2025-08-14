import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Metrics</h1>
        <p className="text-sub">System performance and resource utilization</p>
      </div>
      
      {/* System Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card title="CPU Usage">
          <div className="text-center">
            <div className="text-3xl font-bold text-ok mb-2">67%</div>
            <div className="text-sm text-sub">Average across cores</div>
          </div>
        </Card>
        
        <Card title="Memory Usage">
          <div className="text-center">
            <div className="text-3xl font-bold text-warn mb-2">82%</div>
            <div className="text-sm text-sub">24.6GB / 30GB</div>
          </div>
        </Card>
        
        <Card title="Network I/O">
          <div className="text-center">
            <div className="text-3xl font-bold text-link mb-2">1.2GB/s</div>
            <div className="text-sm text-sub">Inbound traffic</div>
          </div>
        </Card>
        
        <Card title="Storage">
          <div className="text-center">
            <div className="text-3xl font-bold text-ok mb-2">45%</div>
            <div className="text-sm text-sub">900GB / 2TB</div>
          </div>
        </Card>
      </div>
      
      {/* Prometheus Panels */}
      <Card title="System Metrics" cta={
        <StatusBadge status="ok" label="Live" />
      }>
        <div className="bg-muted rounded-lg p-6 text-center">
          <div className="text-sub mb-4">
            <h3 className="font-medium mb-2">Prometheus Metrics Dashboard</h3>
            <p className="text-sm">Real-time system monitoring and alerting</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-panel rounded-lg p-4">
              <div className="text-2xl font-bold text-ok">99.7%</div>
              <div className="text-sm text-sub">Uptime</div>
            </div>
            <div className="bg-panel rounded-lg p-4">
              <div className="text-2xl font-bold text-link">2.3ms</div>
              <div className="text-sm text-sub">Avg Response</div>
            </div>
            <div className="bg-panel rounded-lg p-4">
              <div className="text-2xl font-bold text-warn">156</div>
              <div className="text-sm text-sub">Active Requests</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Grafana Panels */}
      <Card title="Application Metrics" cta={
        <StatusBadge status="ok" label="Connected" />
      }>
        <div className="bg-muted rounded-lg p-6 text-center">
          <div className="text-sub mb-4">
            <h3 className="font-medium mb-2">Grafana Analytics Dashboard</h3>
            <p className="text-sm">Business metrics and user analytics</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-panel rounded-lg p-4">
              <div className="text-2xl font-bold text-ok">1,247</div>
              <div className="text-sm text-sub">API Calls Today</div>
            </div>
            <div className="bg-panel rounded-lg p-4">
              <div className="text-2xl font-bold text-link">89.3%</div>
              <div className="text-sm text-sub">Success Rate</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Custom Metrics */}
      <Card title="AI Model Performance">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-medium">Model</th>
                <th className="text-left p-2 font-medium">Accuracy</th>
                <th className="text-left p-2 font-medium">Latency</th>
                <th className="text-left p-2 font-medium">Throughput</th>
                <th className="text-left p-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2">Consensus Engine</td>
                <td className="p-2">98.7%</td>
                <td className="p-2">45ms</td>
                <td className="p-2">1.2k req/min</td>
                <td className="p-2"><StatusBadge status="ok" label="Optimal" /></td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2">Inference Engine</td>
                <td className="p-2">94.2%</td>
                <td className="p-2">78ms</td>
                <td className="p-2">856 req/min</td>
                <td className="p-2"><StatusBadge status="warn" label="Degraded" /></td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2">Storage Manager</td>
                <td className="p-2">99.1%</td>
                <td className="p-2">12ms</td>
                <td className="p-2">2.1k req/min</td>
                <td className="p-2"><StatusBadge status="ok" label="Optimal" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
