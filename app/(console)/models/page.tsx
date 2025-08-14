import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

export default function ModelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Models</h1>
        <p className="text-sub">LLM deployment and inference engine management</p>
      </div>
      
      {/* Active Models */}
      <Card title="Deployed Models" cta={
        <Button variant="primary" size="sm">Deploy New</Button>
      }>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">GPT-4 Consensus</h3>
              <StatusBadge status="ok" label="Active" />
            </div>
            <p className="text-sm text-sub mb-3">Consensus engine model</p>
            <div className="flex items-center gap-2 text-sm text-sub mb-3">
              <span>Memory: 8.2GB</span>
              <span>•</span>
              <span>Requests: 1.2k/min</span>
            </div>
            <div className="flex gap-2">
              <Button variant="subtle" size="sm">Configure</Button>
              <Button variant="destructive" size="sm">Stop</Button>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Claude-3 Haiku</h3>
              <StatusBadge status="warn" label="Scaling" />
            </div>
            <p className="text-sm text-sub mb-3">General purpose inference</p>
            <div className="flex items-center gap-2 text-sm text-sub mb-3">
              <span>Memory: 4.1GB</span>
              <span>•</span>
              <span>Requests: 856/min</span>
            </div>
            <div className="flex gap-2">
              <Button variant="subtle" size="sm">Configure</Button>
              <Button variant="destructive" size="sm">Stop</Button>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Llama-3 8B</h3>
              <StatusBadge status="err" label="Error" />
            </div>
            <p className="text-sm text-sub mb-3">Fine-tuned for specific tasks</p>
            <div className="flex items-center gap-2 text-sm text-sub mb-3">
              <span>Memory: 6.7GB</span>
              <span>•</span>
              <span>Requests: 0/min</span>
            </div>
            <div className="flex gap-2">
              <Button variant="subtle" size="sm">Restart</Button>
              <Button variant="destructive" size="sm">Remove</Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Petals Graph */}
      <Card title="Petals Network Status">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Decentralized Inference Network</h3>
            <StatusBadge status="ok" label="Connected" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-link">24</div>
              <div className="text-sm text-sub">Active Peers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ok">156</div>
              <div className="text-sm text-sub">Models Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warn">2.3s</div>
              <div className="text-sm text-sub">Avg Response</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tinygrad Runs */}
      <Card title="Tinygrad Training Runs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-medium">Model</th>
                <th className="text-left p-2 font-medium">Status</th>
                <th className="text-left p-2 font-medium">Progress</th>
                <th className="text-left p-2 font-medium">ETA</th>
                <th className="text-left p-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2">Custom Adapter</td>
                <td className="p-2"><StatusBadge status="ok" label="Training" /></td>
                <td className="p-2">78%</td>
                <td className="p-2">2h 15m</td>
                <td className="p-2">
                  <Button variant="subtle" size="sm">Monitor</Button>
                </td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2">Fine-tuned Base</td>
                <td className="p-2"><StatusBadge status="warn" label="Queued" /></td>
                <td className="p-2">0%</td>
                <td className="p-2">Pending</td>
                <td className="p-2">
                  <Button variant="subtle" size="sm">Cancel</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
