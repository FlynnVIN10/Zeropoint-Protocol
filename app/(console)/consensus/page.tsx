import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

export default function ConsensusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Consensus</h1>
        <p className="text-sub">Dual consensus approval queue and governance</p>
      </div>
      
      {/* Approval Queue */}
      <Card title="Pending Approvals" cta={
        <div className="flex gap-2">
          <Button variant="subtle" size="sm">Refresh</Button>
          <Button variant="primary" size="sm">Process All</Button>
        </div>
      }>
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <StatusBadge status="warn" label="Pending" />
                <span className="font-medium">Model Deployment Request</span>
                <span className="text-sub text-sm">#PR-123</span>
              </div>
              <span className="text-sub text-sm">2 hours ago</span>
            </div>
            <p className="text-sm text-sub mb-3">
              Request to deploy new consensus model v2.1.0 to production environment
            </p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm">Approve</Button>
              <Button variant="destructive" size="sm">Veto</Button>
              <Button variant="subtle" size="sm">View Diff</Button>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <StatusBadge status="warn" label="Pending" />
                <span className="font-medium">Security Policy Update</span>
                <span className="text-sub text-sm">#POL-456</span>
              </div>
              <span className="text-sub text-sm">4 hours ago</span>
            </div>
            <p className="text-sm text-sub mb-3">
              Update to authentication requirements and rate limiting policies
            </p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm">Approve</Button>
              <Button variant="destructive" size="sm">Veto</Button>
              <Button variant="subtle" size="sm">View Diff</Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Recent Decisions */}
      <Card title="Recent Decisions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-medium">Request</th>
                <th className="text-left p-2 font-medium">Decision</th>
                <th className="text-left p-2 font-medium">Approved By</th>
                <th className="text-left p-2 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2">API Rate Limit Increase</td>
                <td className="p-2"><StatusBadge status="ok" label="Approved" /></td>
                <td className="p-2">CTO + Dev Lead</td>
                <td className="p-2">1 hour ago</td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-2">New Feature Flag</td>
                <td className="p-2"><StatusBadge status="err" label="Vetoed" /></td>
                <td className="p-2">CTO</td>
                <td className="p-2">3 hours ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
