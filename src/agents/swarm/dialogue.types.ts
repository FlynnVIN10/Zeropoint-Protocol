// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// src/agents/swarm/dialogue.types.ts

/**
 * Zeropoint Protocol Swarm Dialogue Layer — Mutuality Engine v0.1
 * Types for inter-agent conversation, convergence, and collective thought.
 */

export interface DialogueTranscript {
  speaker: string;
  message: string;
  dominantIntent: string;
  ethicsRatio: {
    aligned: number;
    warn: number;
    reject: number;
  };
}

export interface SwarmResolution {
  question: string;
  responses: Record<string, string>; // agentId → thought
  consensus?: string;
  divergenceScore: number; // 0 = total alignment, 1 = chaos
}

export interface CollectiveInsight {
  tagEcho: string[]; // Convergent tag map
  emergentIntent: string; // Derived collective intent
  insightLog: DialogueTranscript[];
}

/**
 * Calculate how different the intents and ethics are between agents.
 */
export function measureDivergence(transcripts: DialogueTranscript[]): number {
  const intents = transcripts.map((t) => t.dominantIntent);
  const uniqueIntents = new Set(intents);
  const entropy = -Array.from(uniqueIntents).reduce((sum, intent) => {
    const p = intents.filter((i) => i === intent).length / intents.length;
    return sum + p * Math.log2(p);
  }, 0);
  return Math.abs(entropy) / Math.log2(intents.length || 1);
}

/**
 * Aggregate tags from dialogue into a resonance field.
 */
export function aggregateTagField(transcripts: DialogueTranscript[]): string[] {
  // Stub: Collect and rank tags (expand with actual tag extraction)
  return transcripts.flatMap((t) => [t.dominantIntent]);
}

/**
 * Stream the collective insight as a narrative.
 */
export function streamInsight(insight: CollectiveInsight): string {
  return `Emergent intent: ${insight.emergentIntent}. Log: ${insight.insightLog.map((l) => l.message).join(" ")}`;
}
