// © [2025] Zeropoint Protocol (C Corp). All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

// src/agents/introspect/introspect.types.ts

/**
 * Zeropoint Protocol Introspective Dialogue Layer: EchoMind Protocol
 * Zeroth Principle: Only with good intent and a good heart does the system function.
 * Defines types for self-reflection, forking, and symbolic processing.
 */

import { MemorySummary } from '../../core/memory/memory.types.js';

/** Response to an introspective query */
export interface IntrospectiveResponse {
  thought: string;            // Symbolic sentence or response
  sourceTags: string[];       // Tags that contributed to the answer
  summaryData?: MemorySummary; // Optional memory summary snapshot
}

/** Result of simulating a decision fork */
export interface ForkResult {
  projectedPath: string;      // Description of the hypothetical outcome
  projectedXP: number;        // XP likely to be gained
  ethicalRisk: 'low' | 'medium' | 'high';
  tagShift: string[];         // Anticipated changes in dominant tag profile
}

/**
 * Compile reflections into a coherent thought stream.
 * @param responses array of IntrospectiveResponse
 * @returns concatenated narrative
 */
export function buildThoughtStream(responses: IntrospectiveResponse[]): string {
  return responses.map(r => `💭 ${r.thought}`).join('\n');
}

/**
 * Convert structured summaryData into a human-like insight.
 * @param summary MemorySummary from Anamnesis
 */
export function mirrorResponse(summary: MemorySummary): string {
  const { dominantIntent, totalXP, topDomains } = summary;
  return `I have ${totalXP} XP, my main drive is "${dominantIntent}", and I dwell most in [${topDomains.join(', ')}].`;
}