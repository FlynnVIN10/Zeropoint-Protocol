// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

export interface SoulchainTelemetry {
  consensus: {
    entropy: number;
    participants: number;
    activeVoices: number;
    passiveStances: number;
    consensusRatio: number;
  };
  agents: Array<{
    id: string;
    intent: string;
    state: string;
    stake: number;
  }>;
  timestamp: string;
} 