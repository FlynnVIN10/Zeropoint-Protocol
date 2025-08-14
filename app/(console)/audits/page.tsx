import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

export default function AuditsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Audit Logs</h1>
        <p className="text-sub">Chronological evidence and compliance tracking</p>
      </div>
      
      {/* Filters */}
      <Card title="Filters">
        <div className="flex gap-4 items-center flex-wrap">
          <select className="bg-muted border border-border rounded-md px-3 py-2 text-sm">
            <option>All Scopes</option>
            <option>Governance</option>
            <option>Security</option>
            <option>Performance</option>
            <option>Compliance</option>
          </select>
          <select className="bg-muted border border-border rounded-md px-3 py-2 text-sm">
            <option>All Levels</option>
            <option>Info</option>
            <option>Warning</option>
            <option>Error</option>
            <option>Critical</option>
          </select>
          <input 
            type="date" 
            className="bg-muted border border-border rounded-md px-3 py-2 text-sm"
            defaultValue="2025-08-14"
          />
          <Button variant="subtle" size="sm">Clear Filters</Button>
        </div>
      </Card>
      
      {/* Recent Audits */}
      <Card title="Recent Audit Events" cta={
        <Button variant="primary" size="sm">Export Logs</Button>
      }>
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <StatusBadge status="ok" label="Info" />
                <span className="font-medium">Governance Update</span>
                <span className="text-sub text-sm">#AUDIT-001</span>
              </div>
              <span className="text-sub text-sm">2 hours ago</span>
            </div>
            <p className="text-sm text-sub mb-3">
              CTO directives D-006 through D-009 implemented successfully. All quality gates passing.
            </p>
            <div className="flex items-center gap-4 text-xs text-sub">
              <span>Scope: Governance</span>
              <span>User: Dev Team</span>
              <span>IP: 192.168.1.100</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="subtle" size="sm">View Details</Button>
              <Button variant="subtle" size="sm">Download Evidence</Button>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <StatusBadge status="warn" label="Warning" />
                <span className="font-medium">Security Scan</span>
                <span className="text-sub text-sm">#AUDIT-002</span>
              </div>
              <span className="text-sub text-sm">4 hours ago</span>
            </div>
            <p className="text-sm text-sub mb-3">
              Automated security scan detected 3 low-severity vulnerabilities in dependencies.
            </p>
            <div className="flex items-center gap-4 text-xs text-sub">
              <span>Scope: Security</span>
              <span>User: System</span>
              <span>IP: Automated</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="subtle" size="sm">View Details</Button>
              <Button variant="subtle" size="sm">Download Report</Button>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <StatusBadge status="ok" label="Info" />
                <span className="font-medium">Performance Test</span>
                <span className="text-sub text-sm">#AUDIT-003</span>
              </div>
              <span className="text-sub text-sm">6 hours ago</span>
            </div>
            <p className="text-sm text-sub mb-3">
              Load testing completed successfully. System handles 10,000 concurrent users with 99.9% uptime.
            </p>
            <div className="flex items-center gap-4 text-xs text-sub">
              <span>Scope: Performance</span>
              <span>User: QA Team</span>
              <span>IP: 10.0.0.50</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="subtle" size="sm">View Details</Button>
              <Button variant="subtle" size="sm">Download Metrics</Button>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <StatusBadge status="err" label="Error" />
                <span className="font-medium">Deployment Failure</span>
                <span className="text-sub text-sm">#AUDIT-004</span>
              </div>
              <span className="text-sub text-sm">8 hours ago</span>
            </div>
            <p className="text-sm text-sub mb-3">
              Cloudflare deployment failed due to authentication error. Issue resolved after token rotation.
            </p>
            <div className="flex items-center gap-4 text-xs text-sub">
              <span>Scope: Deployment</span>
              <span>User: CI/CD</span>
              <span>IP: GitHub Actions</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="subtle" size="sm">View Details</Button>
              <Button variant="subtle" size="sm">Download Logs</Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Audit Summary */}
      <Card title="Audit Summary">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-ok mb-2">156</div>
            <div className="text-sm text-sub">Total Events</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-ok mb-2">142</div>
            <div className="text-sm text-sub">Info</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-warn mb-2">12</div>
            <div className="text-sm text-sub">Warnings</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-err mb-2">2</div>
            <div className="text-sm text-sub">Errors</div>
          </div>
        </div>
      </Card>
      
      {/* Compliance Status */}
      <Card title="Compliance Status">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">GDPR Compliance</h3>
              <p className="text-sm text-sub">Data protection and privacy standards</p>
            </div>
            <StatusBadge status="ok" label="Compliant" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">SOC 2 Type II</h3>
              <p className="text-sm text-sub">Security and availability controls</p>
            </div>
            <StatusBadge status="warn" label="In Progress" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">ISO 27001</h3>
              <p className="text-sm text-sub">Information security management</p>
            </div>
            <StatusBadge status="ok" label="Certified" />
          </div>
        </div>
      </Card>
    </div>
  );
}
