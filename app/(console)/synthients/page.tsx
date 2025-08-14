import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function SynthientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Synthients</h1>
        <p className="text-sub">AI Agent lifecycle and memory management</p>
      </div>
      
      <Card title="Active Agents" cta={
        <button className="text-sm text-link hover:underline">View All</button>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-medium">Agent</th>
                <th className="text-left p-2 font-medium">Type</th>
                <th className="text-left p-2 font-medium">Status</th>
                <th className="text-left p-2 font-medium">Memory</th>
                <th className="text-left p-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2">Consensus Engine</td>
                <td className="p-2">Core</td>
                <td className="p-2"><StatusBadge status="ok" label="Active" /></td>
                <td className="p-2">2.4GB</td>
                <td className="p-2">
                  <button className="text-link hover:underline text-xs">Details</button>
                </td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2">Storage Manager</td>
                <td className="p-2">Service</td>
                <td className="p-2"><StatusBadge status="warn" label="Connecting" /></td>
                <td className="p-2">1.8GB</td>
                <td className="p-2">
                  <button className="text-link hover:underline text-xs">Details</button>
                </td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2">Inference Engine</td>
                <td className="p-2">Worker</td>
                <td className="p-2"><StatusBadge status="err" label="Error" /></td>
                <td className="p-2">3.2GB</td>
                <td className="p-2">
                  <button className="text-link hover:underline text-xs">Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
