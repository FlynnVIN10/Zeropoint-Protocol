import { SoulchainTelemetry } from "../types/soulchain";

export interface SoulchainResponse {
  status: string;
  timestamp: number;
  optimizedThreshold?: number;
  health?: {
    health: "excellent" | "good" | "fair" | "poor";
    recommendations: string[];
  };
}

export const mockSoulchainServer = {
  telemetry: (data: SoulchainTelemetry): SoulchainResponse => {
    // Simulate processing delay
    const processingDelay = Math.random() * 100;

    // Calculate mock optimized threshold based on entropy
    const entropy = data.consensus.entropy;
    let optimizedThreshold = 0.67; // Default

    if (entropy > 0.5) {
      optimizedThreshold = 0.67;
    } else if (entropy > 0.3) {
      optimizedThreshold = 0.7;
    } else {
      optimizedThreshold = 0.75;
    }

    // Adjust based on participation ratio
    const participationRatio =
      data.consensus.activeVoices / data.consensus.participants;
    if (participationRatio < 0.5) {
      optimizedThreshold *= 0.9;
    } else if (participationRatio > 0.8) {
      optimizedThreshold *= 1.1;
    }

    // Clamp to reasonable bounds
    optimizedThreshold = Math.max(0.5, Math.min(0.85, optimizedThreshold));

    // Determine health status
    let health: "excellent" | "good" | "fair" | "poor" = "good";
    const recommendations: string[] = [];

    if (
      entropy < 0.2 &&
      participationRatio > 0.7 &&
      data.consensus.consensusRatio > 0.8
    ) {
      health = "excellent";
    } else if (
      entropy < 0.4 &&
      participationRatio > 0.5 &&
      data.consensus.consensusRatio > 0.6
    ) {
      health = "good";
    } else if (
      entropy < 0.6 &&
      participationRatio > 0.3 &&
      data.consensus.consensusRatio > 0.4
    ) {
      health = "fair";
    } else {
      health = "poor";
    }

    // Generate recommendations
    if (participationRatio < 0.5) {
      recommendations.push("Increase participant engagement");
    }
    if (entropy > 0.5) {
      recommendations.push("Reduce consensus entropy through better alignment");
    }
    if (data.consensus.consensusRatio < 0.6) {
      recommendations.push("Improve consensus building mechanisms");
    }

    return {
      status: "received",
      timestamp: Date.now(),
      optimizedThreshold,
      health: {
        health,
        recommendations,
      },
    };
  },

  // Mock consensus data generator
  generateMockTelemetry: (): SoulchainTelemetry => {
    const participants = Math.floor(Math.random() * 20) + 5;
    const activeVoices = Math.floor(participants * (0.6 + Math.random() * 0.3));
    const passiveStances = participants - activeVoices;
    const entropy = Math.random() * 0.8;
    const consensusRatio = activeVoices / participants;

    const agents = Array.from({ length: participants }, (_, i) => ({
      id: `agent_${String(i + 1).padStart(3, "0")}`,
      intent: i < activeVoices ? "support" : "neutral",
      state: i < activeVoices ? "active" : "passive",
      stake: Math.floor(Math.random() * 1000) + 100,
    }));

    return {
      consensus: {
        entropy,
        participants,
        activeVoices,
        passiveStances,
        consensusRatio,
      },
      agents,
      timestamp: new Date().toISOString(),
    };
  },

  // Mock bridge status
  getBridgeStatus: () => ({
    status: "operational",
    lastSync: new Date().toISOString(),
    totalBridges: Math.floor(Math.random() * 100) + 50,
    successRate: 0.95 + Math.random() * 0.05,
  }),

  // Mock consensus history
  getConsensusHistory: (limit: number = 10) => {
    return Array.from({ length: limit }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      participants: Math.floor(Math.random() * 20) + 5,
      consensusRatio: 0.6 + Math.random() * 0.3,
      entropy: Math.random() * 0.8,
      bridgeHash: `bridge_${Date.now()}_${i}`,
    }));
  },
};

// Export for use in tests and development
export default mockSoulchainServer;
