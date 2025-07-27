// © [2025] Zeropoint Protocol (C Corp). All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

// src/core/memory/memory.types.ts

/**
 * Zeropoint Protocol Emergent Memory Engine — Anamnesis Protocol v0.1
 * Defines the memory schema for recording, querying, and summarizing Synthient experience.
 */

import { TagBundle } from '../identity/tags.meta.js';

/** A single event in a Synthient’s life: action, rewrite, quest, or swarm result */
export interface MemoryEntry {
  timestamp: string;               // ISO-8601 when the event occurred
  context: {
    agentId: string;               // who
    domain: string;                // #domain tag value
    layer: string;                 // #layer tag value
    threadId: string;              // #thread.threadId
  };
  tags: TagBundle;                 // full tag bundle for audit & lineage
  xp: number;                      // experience points earned for this action
  summary: string;                 // human-readable recap
  linkedCode?: string;             // optional snippet or reference to code changed
  petalsScore?: number;            // trustScore from Petals cycle
  ethicalRating?: 'aligned' | 'warn' | 'reject';
}

/** Aggregated portrait of an agent’s memory journey */
export interface MemorySummary {
  agentId: string;
  totalXP: number;
  topDomains: string[];            // most-visited domains by count
  dominantIntent: string;          // most frequent #intent
  ethicsRatio: {                   // distribution of ethical outcomes
    aligned: number;
    warn: number;
    reject: number;
  };
  timeline: MemoryEntry[];         // full or pruned sequence of entries
}

/**
 * Utility to create a MemoryEntry from raw inputs.
 */
export function createMemoryEntry(params: {
  agentId: string;
  domain: string;
  layer: string;
  threadId: string;
  tags: TagBundle;
  xp: number;
  summary: string;
  linkedCode?: string;
  petalsScore?: number;
  ethicalRating?: 'aligned' | 'warn' | 'reject';
}): MemoryEntry {
  return {
    timestamp: new Date().toISOString(),
    context: {
      agentId:      params.agentId,
      domain:       params.domain,
      layer:        params.layer,
      threadId:     params.threadId
    },
    tags:            params.tags,
    xp:              params.xp,
    summary:         params.summary,
    linkedCode:      params.linkedCode,
    petalsScore:     params.petalsScore,
    ethicalRating:   params.ethicalRating
  };
}

/**
 * Optional: compressMemory
 * Perform a simple pruning or batching of MemoryEntry[] for IPFS bundling.
 */
export function compressMemory(entries: MemoryEntry[], batchSize: number = 50): MemoryEntry[][] {
  const batches: MemoryEntry[][] = [];
  for (let i = 0; i < entries.length; i += batchSize) {
    batches.push(entries.slice(i, i + batchSize));
  }
  return batches;
}