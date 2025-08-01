import { Injectable, Logger } from '@nestjs/common';

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

@Injectable()
export class ConsensusOptimizer {
  private readonly logger = new Logger(ConsensusOptimizer.name);

  async optimize(telemetry: SoulchainTelemetry): Promise<number> {
    try {
      const entropy = telemetry.consensus.entropy;
      const participants = telemetry.consensus.participants;
      const activeVoices = telemetry.consensus.activeVoices;
      
      // AI-driven consensus weight adjustment
      let optimizedThreshold = 0.67; // Default threshold
      
      // Adjust based on entropy (higher entropy = lower threshold for faster consensus)
      if (entropy > 0.5) {
        optimizedThreshold = 0.67;
      } else if (entropy > 0.3) {
        optimizedThreshold = 0.70;
      } else {
        optimizedThreshold = 0.75;
      }
      
      // Adjust based on participation ratio
      const participationRatio = activeVoices / participants;
      if (participationRatio < 0.5) {
        optimizedThreshold *= 0.9; // Lower threshold for low participation
      } else if (participationRatio > 0.8) {
        optimizedThreshold *= 1.1; // Higher threshold for high participation
      }
      
      // Clamp to reasonable bounds
      optimizedThreshold = Math.max(0.5, Math.min(0.85, optimizedThreshold));
      
      this.logger.log(`SOULCONS:OPTIMIZED - Threshold: ${optimizedThreshold.toFixed(3)}, Entropy: ${entropy.toFixed(3)}, Participants: ${participants}`);
      
      return optimizedThreshold;
    } catch (error) {
      this.logger.error('Consensus optimization failed:', error);
      return 0.67; // Fallback to default
    }
  }

  async analyzeConsensusHealth(telemetry: SoulchainTelemetry): Promise<{
    health: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  }> {
    const entropy = telemetry.consensus.entropy;
    const participationRatio = telemetry.consensus.activeVoices / telemetry.consensus.participants;
    const consensusRatio = telemetry.consensus.consensusRatio;
    
    let health: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    const recommendations: string[] = [];
    
    if (entropy < 0.2 && participationRatio > 0.7 && consensusRatio > 0.8) {
      health = 'excellent';
    } else if (entropy < 0.4 && participationRatio > 0.5 && consensusRatio > 0.6) {
      health = 'good';
    } else if (entropy < 0.6 && participationRatio > 0.3 && consensusRatio > 0.4) {
      health = 'fair';
    } else {
      health = 'poor';
    }
    
    if (participationRatio < 0.5) {
      recommendations.push('Increase participant engagement');
    }
    if (entropy > 0.5) {
      recommendations.push('Reduce consensus entropy through better alignment');
    }
    if (consensusRatio < 0.6) {
      recommendations.push('Improve consensus building mechanisms');
    }
    
    return { health, recommendations };
  }
} 