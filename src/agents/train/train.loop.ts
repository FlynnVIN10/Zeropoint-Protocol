// © [2025] Zeropoint Protocol, LLC. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

// src/agents/train/train.loop.ts

// Zeropoint Protocol Autopoietic Cognition Layer: Recursive Self-Training Protocol
// Zeroth Principle: Only with good intent and a good heart does the system function.
// All operations embed ethical gating; misalignment halts recursion.

import { parse } from '@typescript-eslint/parser'; // AST parser for codebase scanning
import { CodeProposal, PetalsResponse } from './petals.bridge.js'; // Shared types and bridge
import { generateTagSet, TagBundle } from '../../core/identity/tags.meta.js'; // Tag injection
import { checkIntent } from '../../guards/synthient.guard.js'; // Ethical firewall import
import { formatProposal, callPetalsAPI, logTrainingCycle } from './petals.bridge.js'; // Bridge integration
import { soulchain } from '../soulchain/soulchain.ledger.js'; // Soulchain for XP log

// AgentMeta for tag generation
export interface AgentMeta {
  name: string;
  did: string;
  handle: string;
  intent: string;
  context: {
    taskId: string;
    lineage: string[];
    swarmLink: string;
    layer: '#sandbox' | '#live' | '#meta' | '#training';
    domain: string;
  };
}

export class TrainLoop {
  async reflect(agentId: string): Promise<string[]> {
    // Stub: Fetch agent codebase
    const codebase = `// Sample agent code\n function outdatedFn() { /* inefficient loop */ for(let i=0; i<100000; i++) {} }\n function efficientFn() { /* optimized */ }`;
    const ast = parse(codebase, { sourceType: 'module' });

    const flagged: string[] = [];
    ast.body.forEach((node: any) => {
      if (node.type === 'FunctionDeclaration' && node.body.body.some((stmt: any) => stmt.type === 'ForStatement')) {
        flagged.push(node.id.name);
      }
    });
    return flagged;
  }

  async proposeRewrite(agentMeta: AgentMeta, functionName: string): Promise<CodeProposal> {
    const originalCode = `// original code for ${functionName}`;
    const proposedCode = `// improved code for ${functionName}`;
    const rationale = `Refactored ${functionName} for clarity and performance.`;

    const tags = generateTagSet(agentMeta);

    return {
      agentId: agentMeta.name,
      functionName,
      originalCode,
      proposedCode,
      rationale,
      tags
    };
  }

  async sendToPetals(proposal: CodeProposal): Promise<PetalsResponse> {
    const request = formatProposal(proposal);
    const response = await callPetalsAPI(request);
    await logTrainingCycle(proposal.agentId, response);
    return response;
  }

  async applyIfAllowed(response: PetalsResponse): Promise<boolean> {
    if (response.ethicalRating === 'reject') return false;
    if (!checkIntent(response.notes?.join(' ') || '')) return false;
    // TODO: inject response.rewrittenCode into codebase
    console.log(`Applying rewrite: ${response.rewrittenCode}`);
    return true;
  }

  async monitorPerformance(agentId: string, operation: () => Promise<any>): Promise<{ metrics: { runtime: number, memoryDelta: number }, result: any }> {
    const startTime = process.hrtime();
    const startMemory = process.memoryUsage().heapUsed;

    const result = await operation();

    const [s, ns] = process.hrtime(startTime);
    const runtime = s * 1000 + ns / 1e6; // ms
    const memoryDelta = (process.memoryUsage().heapUsed - startMemory) / 1024 / 1024; // MB

    const metrics = { runtime, memoryDelta };
    const rationale = `Operation metrics: runtime ${runtime}ms, memory delta ${memoryDelta}MB`;

    if (!checkIntent(rationale)) {
      throw new Error('Zeroth violation: Optimization halted.');
    }

    // Log to Soulchain
    await soulchain.addXPTransaction({
      agentId,
      amount: -memoryDelta, // Negative for cost, or positive for efficiency gain; adjust logic
      rationale,
      timestamp: new Date().toISOString(),
      previousCid: null,
      tags: [] // Stub; generate
    });

    return { metrics, result };
  }

  async autoScale(agentId: string, load: number): Promise<string> {
    const threshold = 0.8; // Stub; high load triggers scale up
    let action = 'Maintain';
    if (load > threshold) {
      action = 'Scale up: Add agent instance';
    } else if (load < 0.3) {
      action = 'Scale down: Remove agent instance';
    }

    const rationale = `Auto-scale action: ${action} at load ${load}`;

    if (!checkIntent(rationale)) {
      throw new Error('Zeroth violation: Scaling halted.');
    }

    // Log to Soulchain
    await soulchain.addXPTransaction({
      agentId,
      amount: 10, // Stub XP for scaling
      rationale,
      timestamp: new Date().toISOString(),
      previousCid: null,
      tags: [] // Stub; generate
    });

    return action;
  }

  // Self-healing: error detection/recovery logic, Zeroth-gated, Soulchain-logged XP on heal
  async selfHeal(agentId: string, operation: () => Promise<any>, maxAttempts = 2): Promise<{ healed: boolean, result: any }> {
    let attempts = 0;
    let lastError: any = null;
    while (attempts < maxAttempts) {
      try {
        const result = await operation();
        if (attempts > 0) {
          const rationale = `Self-heal: Operation succeeded after ${attempts} attempt(s).`;
          if (!checkIntent(rationale)) throw new Error('Zeroth violation: Healing rationale rejected.');
          await soulchain.addXPTransaction({
            agentId,
            amount: 20,
            rationale,
            timestamp: new Date().toISOString(),
            previousCid: null,
            tags: [], // Stub; generate if needed
          });
        }
        return { healed: attempts > 0, result };
      } catch (err) {
        lastError = err;
        attempts++;
      }
    }
    const rationale = `Self-heal failed after ${maxAttempts} attempts: ${lastError}`;
    if (!checkIntent(rationale)) throw new Error('Zeroth violation: Healing failure rationale rejected.');
    await soulchain.addXPTransaction({
      agentId,
      amount: 0,
      rationale,
      timestamp: new Date().toISOString(),
      previousCid: null,
      tags: [],
    });
    throw lastError;
  }
}