import { Controller, Get, Post, Body, Param, Put } from "@nestjs/common";
import { PetalsConnector } from "../petals/petals-connector";

@Controller("api/petals")
export class PetalsController {
  constructor(private readonly petalsConnector: PetalsConnector) {}

  @Get("status")
  async getStatus() {
    try {
      return await this.petalsConnector.getStatus();
    } catch (error) {
      return {
        error: "Failed to get Petals status",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("peers")
  async getPeers() {
    try {
      const status = await this.petalsConnector.getStatus();
      return {
        peers: status.peers,
        total: status.peers.length,
        online: status.peers.filter((p) => p.status === "online").length,
        offline: status.peers.filter((p) => p.status === "offline").length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: "Failed to get peers",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("blocks")
  async getBlocks() {
    try {
      const status = await this.petalsConnector.getStatus();
      return {
        blocks: status.blocks,
        total: status.blocks.length,
        local: status.blocks.filter((b) => b.local).length,
        cached: status.blocks.filter((b) => b.cached).length,
        byType: {
          model: status.blocks.filter((b) => b.type === "model").length,
          data: status.blocks.filter((b) => b.type === "data").length,
          checkpoint: status.blocks.filter((b) => b.type === "checkpoint")
            .length,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: "Failed to get blocks",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("cache")
  async getCacheInfo() {
    try {
      const status = await this.petalsConnector.getStatus();
      return {
        localCache: status.localCache,
        configuration: this.petalsConnector.getConfiguration(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: "Failed to get cache info",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("blocks/join")
  async joinBlock(@Body() body: { blockId: string; peerId?: string }) {
    try {
      const { blockId, peerId } = body;

      if (!blockId) {
        return {
          error: "Block ID is required",
          timestamp: new Date().toISOString(),
        };
      }

      const success = await this.petalsConnector.joinBlock(blockId, peerId);

      return {
        success,
        blockId,
        peerId,
        message: success ? "Successfully joined block" : "Failed to join block",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: "Failed to join block",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("blocks/host")
  async hostBlock(
    @Body()
    body: {
      blockId: string;
      data: any;
      type?: "model" | "data" | "checkpoint";
    },
  ) {
    try {
      const { blockId, data, type = "data" } = body;

      if (!blockId || data === undefined) {
        return {
          error: "Block ID and data are required",
          timestamp: new Date().toISOString(),
        };
      }

      const success = await this.petalsConnector.hostBlock(blockId, data, type);

      return {
        success,
        blockId,
        type,
        message: success ? "Successfully hosted block" : "Failed to host block",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: "Failed to host block",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("blocks/:blockId")
  async getBlock(@Param("blockId") blockId: string) {
    try {
      const block = await this.petalsConnector.getBlock(blockId);

      if (block === null) {
        return {
          error: "Block not found",
          blockId,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        blockId,
        data: block,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: "Failed to get block",
        details: error instanceof Error ? error.message : "Unknown error",
        blockId,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put("config")
  async updateConfiguration(@Body() config: any) {
    try {
      await this.petalsConnector.updateConfiguration(config);

      return {
        success: true,
        message: "Configuration updated successfully",
        newConfig: this.petalsConnector.getConfiguration(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: "Failed to update configuration",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("config")
  async getConfiguration() {
    try {
      return {
        configuration: this.petalsConnector.getConfiguration(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: "Failed to get configuration",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("metrics")
  async getMetrics() {
    try {
      const status = await this.petalsConnector.getStatus();

      return {
        network: {
          connected: status.connected,
          peers: status.peers.length,
          uploadSpeed: status.network.uploadSpeed,
          downloadSpeed: status.network.downloadSpeed,
          latency: status.network.latency,
        },
        storage: {
          blocks: status.blocks.length,
          cacheSize: status.localCache.size,
          cacheItems: status.localCache.items,
          cacheHitRate: status.localCache.hitRate,
        },
        performance: {
          totalBlocks: status.blocks.length,
          localBlocks: status.blocks.filter((b) => b.local).length,
          cachedBlocks: status.blocks.filter((b) => b.cached).length,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: "Failed to get metrics",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Type definitions for external use
export interface PetalTrainingRequest {
  id: string;
  agentId: string;
  modelId: string;
  modelType: string;
  trainingData: any[];
  trainingParams: any;
  parameters: {
    learningRate: number;
    epochs: number;
    batchSize: number;
  };
  priority: "low" | "medium" | "high";
  timestamp: Date | number;
}

export interface TrainingCycleResult {
  id: string;
  cycleId: string;
  requestId: string;
  agentId: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  startTime: Date;
  endTime?: Date;
  result?: any;
  error?: string;
  metrics?: any;
  modelDeltas?: any;
  timestamp: Date | number;
}

export interface SandboxCreateRequest {
  name: string;
  agentId: string;
  type: "training" | "inference" | "testing";
  resources: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  resourceCaps: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  environment: Record<string, string>;
  timeout: number;
  image?: string;
  command?: string[];
  ports?: number[];
  volumes?: string[];
}
