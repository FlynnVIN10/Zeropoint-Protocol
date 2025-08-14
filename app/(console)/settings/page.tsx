import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-sub">System configuration and administration</p>
      </div>
      
      {/* Environment Configuration */}
      <Card title="Environment Variables" cta={
        <Button variant="primary" size="sm">Add Variable</Button>
      }>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">NODE_ENV</span>
                <StatusBadge status="ok" label="Set" />
              </div>
              <div className="text-sm text-sub">production</div>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">DATABASE_URL</span>
                <StatusBadge status="ok" label="Set" />
              </div>
              <div className="text-sm text-sub">postgresql://...</div>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">API_KEY</span>
                <StatusBadge status="warn" label="Expired" />
              </div>
              <div className="text-sm text-sub">••••••••••••••••</div>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">LOG_LEVEL</span>
                <StatusBadge status="ok" label="Set" />
              </div>
              <div className="text-sm text-sub">info</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Secrets Management */}
      <Card title="Secrets & Mounts" cta={
        <Button variant="primary" size="sm">Mount Secret</Button>
      }>
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium">Database Credentials</h3>
                <p className="text-sm text-sub">PostgreSQL connection secrets</p>
              </div>
              <StatusBadge status="ok" label="Mounted" />
            </div>
            <div className="flex gap-2">
              <Button variant="subtle" size="sm">View</Button>
              <Button variant="subtle" size="sm">Rotate</Button>
              <Button variant="destructive" size="sm">Unmount</Button>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium">API Keys</h3>
                <p className="text-sm text-sub">External service integrations</p>
              </div>
              <StatusBadge status="warn" label="Expiring Soon" />
            </div>
            <div className="flex gap-2">
              <Button variant="subtle" size="sm">View</Button>
              <Button variant="subtle" size="sm">Rotate</Button>
              <Button variant="destructive" size="sm">Unmount</Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Resource Quotas */}
      <Card title="Resource Quotas">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-4">Compute Resources</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">CPU Cores</span>
                <span className="text-sm font-medium">8 / 16</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-link h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Memory</span>
                <span className="text-sm font-medium">24GB / 32GB</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warn h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Storage</span>
                <span className="text-sm font-medium">900GB / 2TB</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-ok h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">API Limits</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Requests per minute</span>
                <span className="text-sm font-medium">1,247 / 2,000</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-ok h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Concurrent connections</span>
                <span className="text-sm font-medium">156 / 200</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warn h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Webhook calls</span>
                <span className="text-sm font-medium">89 / 100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-ok h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* CODEOWNERS Preview */}
      <Card title="Repository Governance" cta={
        <Button variant="subtle" size="sm">Edit CODEOWNERS</Button>
      }>
        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-medium mb-3">Current CODEOWNERS Configuration</h3>
          <div className="bg-panel border border-border rounded-lg p-4 font-mono text-sm">
            <div className="text-sub"># All files require CEO (temporary) until CTO handle is added.</div>
            <div className="text-sub"># Replace or append the CTO GitHub handle when available.</div>
            <div className="text-text">* @FlynnVIN10</div>
          </div>
          <div className="mt-3 text-sm text-sub">
            <p>This configuration ensures all repository changes require approval from the designated code owner.</p>
          </div>
        </div>
      </Card>
      
      {/* System Preferences */}
      <Card title="System Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Auto-scaling</h3>
              <p className="text-sm text-sub">Automatically adjust resources based on demand</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-link"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Debug logging</h3>
              <p className="text-sm text-sub">Enable verbose logging for troubleshooting</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-link"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Maintenance mode</h3>
              <p className="text-sm text-sub">Temporarily disable non-essential services</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-link"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
