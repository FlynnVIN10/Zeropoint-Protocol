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

export interface Synthiant {
  id: string;
  position: { x: number; y: number; z: number };
  intent: string;
  state: 'active' | 'passive' | 'neutral';
  stake: number;
  connections: string[]; // IDs of connected agents
}

export interface UE5VisualizerBridge {
  initialize(): Promise<void>;
  renderAgents(agents: Synthiant[]): void;
  updateTelemetry(data: SoulchainTelemetry): void;
  exportAsWebXR(): Promise<Blob>;
  setTimeFlow(direction: 'forward' | 'backward' | 'pause'): void;
  captureSnapshot(): Promise<string>;
  loadSnapshot(snapshotId: string): Promise<void>;
}

// Stub implementation for development/testing
export const ue5Bridge: UE5VisualizerBridge = {
  initialize: async () => { 
    console.log('UE5 Visualizer: Init stub');
    return Promise.resolve();
  },
  
  renderAgents: (agents: Synthiant[]) => { 
    console.log('UE5 Visualizer: Render stub', agents.length, 'agents');
  },
  
  updateTelemetry: (data: SoulchainTelemetry) => { 
    console.log('UE5 Visualizer: Telemetry stub', {
      participants: data.consensus.participants,
      entropy: data.consensus.entropy,
      consensusRatio: data.consensus.consensusRatio
    });
  },
  
  exportAsWebXR: async () => {
    console.log('UE5 Visualizer: WebXR export stub');
    return new Blob(['UE5 WebXR export placeholder'], { type: 'application/octet-stream' });
  },
  
  setTimeFlow: (direction: 'forward' | 'backward' | 'pause') => {
    console.log('UE5 Visualizer: Time flow stub', direction);
  },
  
  captureSnapshot: async () => {
    console.log('UE5 Visualizer: Snapshot capture stub');
    return Promise.resolve('snapshot_' + Date.now());
  },
  
  loadSnapshot: async (snapshotId: string) => {
    console.log('UE5 Visualizer: Snapshot load stub', snapshotId);
    return Promise.resolve();
  }
};

// Factory function for creating UE5 bridge instances
export function createUE5Bridge(): UE5VisualizerBridge {
  // In production, this would return the actual UE5 bridge implementation
  // For now, return the stub implementation
  return ue5Bridge;
}

// Configuration interface for UE5 visualizer
export interface UE5Config {
  maxAgents: number;
  updateInterval: number;
  enableWebXR: boolean;
  telemetryEndpoint: string;
  performanceMode: 'low' | 'medium' | 'high';
}

// Default configuration
export const defaultUE5Config: UE5Config = {
  maxAgents: 100,
  updateInterval: 16, // 60 FPS
  enableWebXR: false,
  telemetryEndpoint: '/v1/soulchain/telemetry',
  performanceMode: 'medium'
}; 