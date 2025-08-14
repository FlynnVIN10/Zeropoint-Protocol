import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

export default function RunsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Runs</h1>
        <p className="text-sub">Execution history and live monitoring</p>
      </div>
      
      {/* Filters */}
      <Card title="Filters">
        <div className="flex gap-4 items-center">
          <select className="bg-muted border border-border rounded-md px-3 py-2 text-sm">
            <option>All Status</option>
            <option>Running</option>
            <option>Completed</option>
            <option>Failed</option>
          </select>
          <select className="bg-muted border border-border rounded-md px-3 py-2 text-sm">
            <option>All Types</option>
            <option>Training</option>
            <option>Inference</option>
            <option>Consensus</option>
          </select>
          <Button variant="subtle" size="sm">Clear Filters</Button>
        </div>
      </Card>
      
      {/* Live Runs */}
      <Card title="Active Runs">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <StatusBadge status="ok" label="Running" />
              <span className="font-medium">Consensus Engine Training</span>
              <span className="text-sub text-sm">Started 2m ago</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-sub">Progress: 67%</span>
              <Button variant="destructive" size="sm">Stop</Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <StatusBadge status="warn" label="Queued" />
              <span className="font-medium">Model Fine-tuning</span>
              <span className="text-sub text-sm">Queued 5m ago</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-sub">Position: #2</span>
              <Button variant="subtle" size="sm">Cancel</Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Recent Runs */}
      <Card title="Recent Runs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-medium">Run ID</th>
                <th className="text-left p-2 font-medium">Type</th>
                <th className="text-left p-2 font-medium">Status</th>
                <th className="text-left p-2 font-medium">Duration</th>
                <th className="text-left p-2 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2 font-mono">run_abc123</td>
                <td className="p-2">Training</td>
                <td className="p-2"><StatusBadge status="ok" label="Completed" /></td>
                <td className="p-2">2h 34m</td>
                <td className="p-2">2 hours ago</td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2 font-mono">run_def456</td>
                <td className="p-2">Inference</td>
                <td className="p-2"><StatusBadge status="err" label="Failed" /></td>
                <td className="p-2">12m</td>
                <td className="p-2">1 hour ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
