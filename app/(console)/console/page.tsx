import React from 'react';
import { Card } from '@/components/ui/Card';

export default function ConsolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Console</h1>
        <p className="text-sub">AI Agent orchestration and monitoring interface</p>
      </div>
      
      <div className="grid grid-cols-3 gap-6 h-[600px]">
        {/*
        Tree Panel
        */}
        <Card title="Agent Tree" className="h-full">
          <div className="h-full overflow-auto">
            <div className="space-y-2 text-sm">
              <div className="p-2 hover:bg-muted rounded cursor-pointer">
                <span className="text-link">🤖</span> Main Orchestrator
              </div>
              <div className="pl-4 space-y-1">
                <div className="p-2 hover:bg-muted rounded cursor-pointer">
                  <span className="text-ok">🔗</span> Consensus Engine
                </div>
                <div className="p-2 hover:bg-muted rounded cursor-pointer">
                  <span className="text-warn">🌐</span> Storage Manager
                </div>
                <div className="p-2 hover:bg-muted rounded cursor-pointer">
                  <span className="text-err">⚡</span> Inference Engine
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/*
        Editor Panel
        */}
        <Card title="Code Editor" className="h-full">
          <div className="h-full bg-muted rounded p-4 font-mono text-sm">
            <div className="text-sub">{'// Agent configuration'}</div>
            <div className="text-text">const agent = {'{'}</div>
            <div className="text-text pl-4">name: &quot;orchestrator&quot;,</div>
            <div className="text-text pl-4">type: &quot;consensus&quot;,</div>
            <div className="text-text pl-4">status: &quot;active&quot;</div>
            <div className="text-text">{'}'};</div>
          </div>
        </Card>

        {/*
        Run Drawer
        */}
        <Card title="Execution Log" className="h-full">
          <div className="h-full overflow-auto space-y-2">
            <div className="text-xs text-sub">[12:34:56] Starting agent orchestration...</div>
            <div className="text-xs text-ok">[12:34:57] Consensus engine initialized</div>
            <div className="text-xs text-warn">[12:34:58] Storage manager connecting...</div>
            <div className="text-xs text-ok">[12:34:59] All systems operational</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
