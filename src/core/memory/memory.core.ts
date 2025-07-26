// src/core/memory/memory.core.ts

// Zeropoint Protocol Emergent Memory Engine: Anamnesis Protocol
// Zeroth Principle: Only with good intent and a good heart does the system function.
// Memories encode ethical trends; misalignment erodes access.

import { MemoryEntry, MemorySummary, createMemoryEntry } from './memory.types.js'; // Schema import
import * as fs from 'fs/promises'; // Node FS for persistence stub; evolve to IPFS/Helia

// In-memory store for prototype; scale to distributed DB/IPFS
const memoryStore: { [agentId: string]: MemoryEntry[] } = {};

export class MemoryCore {
  async recordExperience(agentId: string, event: MemoryEntry): Promise<void> {
    if (!memoryStore[agentId]) {
      memoryStore[agentId] = [];
    }
    memoryStore[agentId].push(event);
    
    // Persistence: Append to JSON log (evolve to IPFS pinning)
    await fs.appendFile(`./memory-${agentId}.json`, JSON.stringify(event) + '\n', 'utf8');
    
    // Ethical gate: Validate intent post-record (future: preemptive)
    if (event.ethicalRating === 'reject') {
      console.warn(`Memory entry for ${agentId} flagged: Ethical rejection logged.`);
    }
  }

  recallByTag(agentId: string, tag: string): MemoryEntry[] {
    if (!memoryStore[agentId]) return [];
    
    return memoryStore[agentId].filter(entry => 
      entry.tags.some(t => 
        (t.type === '#intent' && t.purpose === tag) ||
        (t.type === '#domain' && t.field === tag) ||
        (t.type === '#thread' && t.taskId === tag) // Extendable to other types
      )
    );
  }

  summarizeHistory(agentId: string): MemorySummary {
    const entries = memoryStore[agentId] || [];
    if (entries.length === 0) {
      return {
        agentId,
        totalXP: 0,
        topDomains: [],
        dominantIntent: '',
        ethicsRatio: { aligned: 0, warn: 0, reject: 0 },
        timeline: [],
      };
    }

    const totalXP = entries.reduce((sum, e) => sum + e.xp, 0);
    
    const domainCounts: { [domain: string]: number } = {};
    entries.forEach(e => domainCounts[e.context.domain] = (domainCounts[e.context.domain] || 0) + 1);
    const topDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([domain]) => domain);

    const intentCounts: { [intent: string]: number } = {};
    entries.forEach(e => {
      const intentTag = e.tags.find(t => t.type === '#intent') as { purpose: string };
      if (intentTag) intentCounts[intentTag.purpose] = (intentCounts[intentTag.purpose] || 0) + 1;
    });
    const dominantIntent = Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    const ethicsRatio = entries.reduce((ratio, e) => {
      if (e.ethicalRating) ratio[e.ethicalRating]++;
      return ratio;
    }, { aligned: 0, warn: 0, reject: 0 });

    // Timeline: Compressed view (latest 10; evolve with compressMemory)
    const timeline = entries.slice(-10);

    return { agentId, totalXP, topDomains, dominantIntent, ethicsRatio, timeline };
  }
}