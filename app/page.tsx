import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Zeropoint Protocol</h1>
        <p className="text-xl text-sub mb-8">
          Dual Consensus Agentic AI Platform Enterprise Console
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/console">
            <Button variant="primary" size="lg">Launch Console</Button>
          </Link>
          <Link href="/docs">
            <Button variant="subtle" size="lg">Documentation</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card title="AI Agents" cta={
          <Link href="/synthients">
            <Button variant="subtle" size="sm">Manage</Button>
          </Link>
        }>
          <p className="text-sub mb-4">
            Orchestrate and monitor AI agents with real-time status and memory management
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-ok rounded-full"></span>
            <span>3 agents active</span>
          </div>
        </Card>

        <Card title="Model Management" cta={
          <Link href="/models">
            <Button variant="subtle" size="sm">Configure</Button>
          </Link>
        }>
          <p className="text-sub mb-4">
            Deploy and manage LLMs, adapters, and inference engines
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-warn rounded-full"></span>
            <span>2 models running</span>
          </div>
        </Card>

        <Card title="Consensus Engine" cta={
          <Link href="/consensus">
            <Button variant="subtle" size="sm">Review</Button>
          </Link>
        }>
          <p className="text-sub mb-4">
            Dual consensus approval system for governance and safety
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-ok rounded-full"></span>
            <span>System operational</span>
          </div>
        </Card>

        <Card title="Execution Monitoring" cta={
          <Link href="/runs">
            <Button variant="subtle" size="sm">Monitor</Button>
          </Link>
        }>
          <p className="text-sub mb-4">
            Track training runs, inference jobs, and system performance
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-ok rounded-full"></span>
            <span>1 run active</span>
          </div>
        </Card>

        <Card title="System Health" cta={
          <Link href="/status">
            <Button variant="subtle" size="sm">Check</Button>
          </Link>
        }>
          <p className="text-sub mb-4">
            Real-time system status and verified health endpoints
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-ok rounded-full"></span>
            <span>All systems operational</span>
          </div>
        </Card>

        <Card title="Analytics" cta={
          <Link href="/metrics">
            <Button variant="subtle" size="sm">View</Button>
          </Link>
        }>
          <p className="text-sub mb-4">
            Performance metrics, resource utilization, and operational insights
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-ok rounded-full"></span>
            <span>Metrics available</span>
          </div>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-medium">Development</h3>
            <div className="space-y-2">
              <Link href="/library" className="block text-link hover:underline">Developer Library</Link>
              <Link href="/docs" className="block text-link hover:underline">API Documentation</Link>
              <Link href="/audits" className="block text-link hover:underline">Audit Logs</Link>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium">Administration</h3>
            <div className="space-y-2">
              <Link href="/settings" className="block text-link hover:underline">System Settings</Link>
              <Link href="/consensus" className="block text-link hover:underline">Governance</Link>
              <Link href="/metrics" className="block text-link hover:underline">Performance</Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
