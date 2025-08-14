import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Developer Library</h1>
        <p className="text-sub">SDKs, tools, and integration guides</p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-4">
        {/*
        Sticky Table of Contents
        */}
        <div className="lg:col-span-1">
          <Card title="Contents" className="sticky top-24">
            <nav className="space-y-2">
              <a href="#getting-started" className="block text-sm text-link hover:underline py-1">
                Getting Started
              </a>
              <a href="#api-reference" className="block text-sm text-link hover:underline py-1">
                API Reference
              </a>
              <a href="#sdks" className="block text-sm text-link hover:underline py-1">
                SDKs & Tools
              </a>
              <a href="#deployment" className="block text-sm text-link hover:underline py-1">
                Deployment
              </a>
              <a href="#troubleshooting" className="block text-sm text-link hover:underline py-1">
                Troubleshooting
              </a>
            </nav>
          </Card>
        </div>
        
        {/*
        Main Content
        */}
        <div className="lg:col-span-3 space-y-6">
          <Card title="Getting Started" id="getting-started">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-4">Quick Start Guide</h2>
              <p className="text-sub mb-4">
                Get up and running with the Zeropoint Protocol in minutes. This guide covers the essential 
                concepts and your first API call.
              </p>
              
              <h3 className="text-lg font-medium mb-3">Installation</h3>
                             <div className="bg-muted rounded-lg p-4 font-mono text-sm mb-4">
                 <div className="text-sub"># Install the official SDK</div>
                 <div className="text-text">npm install @zeropoint/sdk</div>
                 <div className="text-sub"># Or using yarn</div>
                 <div className="text-text">yarn add @zeropoint/sdk</div>
               </div>
               
               <h3 className="text-lg font-medium mb-3">Basic Usage</h3>
               <div className="bg-muted rounded-lg p-4 font-mono text-sm mb-4">
                 <div className="text-sub">import {'{ ZeropointClient }'} from &apos;@zeropoint/sdk&apos;;</div>
                 <div className="text-text">const client = new ZeropointClient({'{'}</div>
                 <div className="text-text pl-4">apiKey: &apos;your-api-key&apos;,</div>
                 <div className="text-text pl-4">environment: &apos;production&apos;</div>
                 <div className="text-text">{'}'});</div>
                 <div className="text-sub">{'// Initialize consensus engine'}</div>
                 <div className="text-text">const consensus = await client.consensus.create();</div>
               </div>
            </div>
          </Card>
          
          <Card title="API Reference" id="api-reference">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Core Endpoints</h2>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium mb-2">Consensus Engine</h3>
                <div className="text-sm text-sub mb-2">POST /api/v1/consensus</div>
                <p className="text-sm text-sub mb-3">
                  Create a new consensus session for AI agent coordination
                </p>
                <div className="flex gap-2">
                  <Button variant="subtle" size="sm">View Docs</Button>
                  <Button variant="subtle" size="sm">Try It</Button>
                </div>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium mb-2">Agent Management</h3>
                <div className="text-sm text-sub mb-2">GET /api/v1/agents</div>
                <p className="text-sm text-sub mb-3">
                  Retrieve all active AI agents and their current status
                </p>
                <div className="flex gap-2">
                  <Button variant="subtle" size="sm">View Docs</Button>
                  <Button variant="subtle" size="sm">Try It</Button>
                </div>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium mb-2">Model Inference</h3>
                <div className="text-sm text-sub mb-2">POST /api/v1/inference</div>
                <p className="text-sm text-sub mb-3">
                  Execute inference requests using deployed AI models
                </p>
                <div className="flex gap-2">
                  <Button variant="subtle" size="sm">View Docs</Button>
                  <Button variant="subtle" size="sm">Try It</Button>
                </div>
              </div>
            </div>
          </Card>
          
          <Card title="SDKs & Tools" id="sdks">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium mb-2">JavaScript/TypeScript</h3>
                <p className="text-sm text-sub mb-3">
                  Official SDK with full TypeScript support and comprehensive documentation
                </p>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">Download</Button>
                  <Button variant="subtle" size="sm">Documentation</Button>
                </div>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium mb-2">Python</h3>
                <p className="text-sm text-sub mb-3">
                  Python client library for data science and ML workflows
                </p>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">Download</Button>
                  <Button variant="subtle" size="sm">Documentation</Button>
                </div>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium mb-2">CLI Tool</h3>
                <p className="text-sm text-sub mb-3">
                  Command-line interface for quick operations and automation
                </p>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">Download</Button>
                  <Button variant="subtle" size="sm">Documentation</Button>
                </div>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium mb-2">Postman Collection</h3>
                <p className="text-sm text-sub mb-3">
                  Pre-configured API requests for testing and development
                </p>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">Download</Button>
                  <Button variant="subtle" size="sm">Documentation</Button>
                </div>
              </div>
            </div>
          </Card>
          
          <Card title="Examples" id="examples">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Code Examples</h2>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium mb-2">Multi-Agent Consensus</h3>
                               <div className="bg-muted rounded-lg p-4 font-mono text-sm mb-3">
                 <div className="text-sub">{'// Create multiple agents'}</div>
                 <div className="text-text">const agent1 = await client.agents.create({'{'}name: &apos;validator&apos;{'}'});</div>
                 <div className="text-text">const agent2 = await client.agents.create({'{'}name: &apos;executor&apos;{'}'});</div>
                 <div className="text-sub">{'// Establish consensus'}</div>
                 <div className="text-text">const consensus = await client.consensus.create({'{'}</div>
                 <div className="text-text pl-4">agents: [agent1.id, agent2.id],</div>
                 <div className="text-text pl-4">threshold: 0.8</div>
                 <div className="text-text">{'}'});</div>
               </div>
                <Button variant="subtle" size="sm">View Full Example</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
