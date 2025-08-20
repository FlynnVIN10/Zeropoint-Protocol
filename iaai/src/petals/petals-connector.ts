// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { zpctlDiag } from "../appliance/zpctl.diag";

export interface PetalsPeer {
  id: string;
  address: string;
  port: number;
  lastSeen: Date;
  status: "online" | "offline" | "connecting";
  capabilities: string[];
  allowlisted: boolean;
}

export interface PetalsBlock {
  id: string;
  hash: string;
  timestamp: Date;
  size: number;
  type: "model" | "data" | "checkpoint";
  source: string;
  local: boolean;
  cached: boolean;
}

export interface PetalsStatus {
  connected: boolean;
  peers: PetalsPeer[];
  blocks: PetalsBlock[];
  localCache: {
    size: number;
    items: number;
    hitRate: number;
  };
  network: {
    uploadSpeed: number;
    downloadSpeed: number;
    latency: number;
  };
  timestamp: string;
}

export interface PetalsConfig {
  enableNetworking: boolean;
  peerAllowlist: string[];
  localFallback: boolean;
  hotLayerCache: boolean;
  cacheSize: number; // MB
  maxPeers: number;
}

@Injectable()
export class PetalsConnector {
  private readonly logger = new Logger(PetalsConnector.name);
  private readonly eventEmitter: EventEmitter2;

  private config: PetalsConfig;
  private peers: Map<string, PetalsPeer> = new Map();
  private blocks: Map<string, PetalsBlock> = new Map();
  private localCache: Map<string, any> = new Map();
  private cacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
  };

  constructor(eventEmitter: EventEmitter2) {
    this.eventEmitter = eventEmitter;
    this.config = this.getDefaultConfig();
    this.initializeConnector();
  }

  private getDefaultConfig(): PetalsConfig {
    return {
      enableNetworking: true,
      peerAllowlist: ["127.0.0.1", "localhost", "::1"],
      localFallback: true,
      hotLayerCache: true,
      cacheSize: 1024, // 1GB
      maxPeers: 10,
    };
  }

  private async initializeConnector(): Promise<void> {
    this.logger.log("Initializing Petals Connector...");

    // Load configuration from environment
    this.loadConfiguration();

    // Initialize local cache
    if (this.config.hotLayerCache) {
      await this.initializeLocalCache();
    }

    // Start peer discovery if networking is enabled
    if (this.config.enableNetworking) {
      await this.startPeerDiscovery();
    }

    this.logger.log("Petals Connector initialized");
  }

  private loadConfiguration(): void {
    // Load from environment variables
    if (process.env.PETALS_ENABLE_NETWORKING !== undefined) {
      this.config.enableNetworking =
        process.env.PETALS_ENABLE_NETWORKING === "1";
    }

    if (process.env.PETALS_PEER_ALLOWLIST) {
      this.config.peerAllowlist = process.env.PETALS_PEER_ALLOWLIST.split(",");
    }

    if (process.env.PETALS_LOCAL_FALLBACK !== undefined) {
      this.config.localFallback = process.env.PETALS_LOCAL_FALLBACK === "1";
    }

    if (process.env.PETALS_HOT_LAYER_CACHE !== undefined) {
      this.config.hotLayerCache = process.env.PETALS_HOT_LAYER_CACHE === "1";
    }

    if (process.env.PETALS_CACHE_SIZE) {
      this.config.cacheSize = parseInt(process.env.PETALS_CACHE_SIZE, 10);
    }

    if (process.env.PETALS_MAX_PEERS) {
      this.config.maxPeers = parseInt(process.env.PETALS_MAX_PEERS, 10);
    }
  }

  private async initializeLocalCache(): Promise<void> {
    this.logger.log("Initializing local hot-layer cache...");

    // Create cache directory if it doesn't exist
    const fs = await import("fs");
    const path = await import("path");

    const cacheDir = path.join(process.cwd(), "cache", "petals");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    this.logger.log(`Local cache initialized at ${cacheDir}`);
  }

  private async startPeerDiscovery(): Promise<void> {
    this.logger.log("Starting peer discovery...");

    // For Phase B, we'll simulate peer discovery
    // In production, this would use actual network protocols

    // Add local peer
    const localPeer: PetalsPeer = {
      id: "local-peer",
      address: "127.0.0.1",
      port: 8000,
      lastSeen: new Date(),
      status: "online",
      capabilities: ["model-serving", "data-sharing", "checkpoint-storage"],
      allowlisted: true,
    };

    this.peers.set(localPeer.id, localPeer);

    // Simulate discovering some peers
    const simulatedPeers = [
      {
        id: "peer-1",
        address: "192.168.1.100",
        port: 8000,
        capabilities: ["model-serving"],
      },
      {
        id: "peer-2",
        address: "192.168.1.101",
        port: 8000,
        capabilities: ["data-sharing"],
      },
    ];

    for (const peer of simulatedPeers) {
      if (this.isPeerAllowlisted(peer.address)) {
        const fullPeer: PetalsPeer = {
          ...peer,
          lastSeen: new Date(),
          status: "online",
          allowlisted: true,
        };
        this.peers.set(fullPeer.id, fullPeer);
      }
    }

    this.logger.log(`Peer discovery complete. Found ${this.peers.size} peers`);
  }

  private isPeerAllowlisted(address: string): boolean {
    return this.config.peerAllowlist.some(
      (allowed) => address === allowed || address.startsWith(allowed),
    );
  }

  async getStatus(): Promise<PetalsStatus> {
    const status: PetalsStatus = {
      connected: this.config.enableNetworking,
      peers: Array.from(this.peers.values()),
      blocks: Array.from(this.blocks.values()),
      localCache: {
        size: this.getCacheSize(),
        items: this.localCache.size,
        hitRate: this.getCacheHitRate(),
      },
      network: {
        uploadSpeed: this.getNetworkSpeed("upload"),
        downloadSpeed: this.getNetworkSpeed("download"),
        latency: this.getNetworkLatency(),
      },
      timestamp: new Date().toISOString(),
    };

    return status;
  }

  private getCacheSize(): number {
    // Calculate cache size in MB
    let totalSize = 0;
    for (const [key, value] of this.localCache) {
      if (typeof value === "string") {
        totalSize += Buffer.byteLength(value, "utf8");
      } else if (Buffer.isBuffer(value)) {
        totalSize += value.length;
      } else if (value !== null && value !== undefined) {
        totalSize += JSON.stringify(value).length;
      }
    }
    return Math.round(totalSize / (1024 * 1024)); // Convert to MB
  }

  private getCacheHitRate(): number {
    if (this.cacheStats.totalRequests === 0) return 0;
    return (this.cacheStats.hits / this.cacheStats.totalRequests) * 100;
  }

  private getNetworkSpeed(type: "upload" | "download"): number {
    // Simulated network speeds for Phase B
    const baseSpeed = 100; // MB/s
    const variation = Math.random() * 20 - 10; // ±10 MB/s
    return Math.max(0, baseSpeed + variation);
  }

  private getNetworkLatency(): number {
    // Simulated latency for Phase B
    const baseLatency = 5; // ms
    const variation = Math.random() * 10; // 0-10ms
    return Math.round(baseLatency + variation);
  }

  async joinBlock(blockId: string, peerId?: string): Promise<boolean> {
    this.logger.log(`Joining block: ${blockId}`);

    try {
      // Check if block is already local
      if (this.blocks.has(blockId)) {
        this.logger.log(`Block ${blockId} already available locally`);
        return true;
      }

      // Try to get from network if networking is enabled
      if (this.config.enableNetworking && peerId) {
        const peer = this.peers.get(peerId);
        if (peer && peer.status === "online") {
          // Simulate network block retrieval
          const block = await this.retrieveBlockFromPeer(blockId, peer);
          if (block) {
            this.blocks.set(blockId, block);
            this.logger.log(
              `Successfully joined block ${blockId} from peer ${peerId}`,
            );
            return true;
          }
        }
      }

      // Fallback to local cache if available
      if (this.config.localFallback) {
        const cachedBlock = this.localCache.get(blockId);
        if (cachedBlock) {
          const block: PetalsBlock = {
            id: blockId,
            hash: this.generateHash(blockId),
            timestamp: new Date(),
            size: this.getObjectSize(cachedBlock),
            type: "data",
            source: "local-cache",
            local: true,
            cached: true,
          };
          this.blocks.set(blockId, block);
          this.logger.log(`Retrieved block ${blockId} from local cache`);
          return true;
        }
      }

      this.logger.warn(`Failed to join block ${blockId}`);
      return false;
    } catch (error) {
      this.logger.error(`Error joining block ${blockId}:`, error);
      return false;
    }
  }

  async hostBlock(
    blockId: string,
    data: any,
    type: "model" | "data" | "checkpoint" = "data",
  ): Promise<boolean> {
    this.logger.log(`Hosting block: ${blockId} (${type})`);

    try {
      const block: PetalsBlock = {
        id: blockId,
        hash: this.generateHash(JSON.stringify(data)),
        timestamp: new Date(),
        size: this.getObjectSize(data),
        type,
        source: "local",
        local: true,
        cached: false,
      };

      // Store locally
      this.blocks.set(blockId, block);

      // Add to hot-layer cache if enabled
      if (this.config.hotLayerCache) {
        this.localCache.set(blockId, data);
        this.logger.log(`Added block ${blockId} to hot-layer cache`);
      }

      // Emit event for other services
      this.eventEmitter.emit("petals.block.hosted", {
        blockId,
        type,
        timestamp: new Date(),
      });

      this.logger.log(`Successfully hosted block ${blockId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error hosting block ${blockId}:`, error);
      return false;
    }
  }

  private async retrieveBlockFromPeer(
    blockId: string,
    peer: PetalsPeer,
  ): Promise<PetalsBlock | null> {
    // Simulate network retrieval for Phase B
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 200),
    );

    // Simulate success/failure
    if (Math.random() > 0.3) {
      // 70% success rate
      return {
        id: blockId,
        hash: this.generateHash(blockId),
        timestamp: new Date(),
        size: Math.floor(Math.random() * 1000) + 100,
        type: "data",
        source: `peer-${peer.id}`,
        local: false,
        cached: false,
      };
    }

    return null;
  }

  private generateHash(input: string): string {
    // Simple hash generation for Phase B
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private getObjectSize(obj: any): number {
    if (typeof obj === "string") {
      return Buffer.byteLength(obj, "utf8");
    } else if (Buffer.isBuffer(obj)) {
      return obj.length;
    } else {
      return JSON.stringify(obj).length;
    }
  }

  async getBlock(blockId: string): Promise<any | null> {
    this.cacheStats.totalRequests++;

    // Check local blocks first
    if (this.blocks.has(blockId)) {
      const block = this.blocks.get(blockId);
      if (block?.local) {
        this.cacheStats.hits++;
        return this.localCache.get(blockId) || null;
      }
    }

    // Check hot-layer cache
    if (this.localCache.has(blockId)) {
      this.cacheStats.hits++;
      return this.localCache.get(blockId);
    }

    this.cacheStats.misses++;
    return null;
  }

  async updateConfiguration(newConfig: Partial<PetalsConfig>): Promise<void> {
    this.logger.log("Updating Petals configuration...");

    this.config = { ...this.config, ...newConfig };

    // Apply configuration changes
    if (newConfig.enableNetworking !== undefined) {
      if (newConfig.enableNetworking && !this.config.enableNetworking) {
        await this.startPeerDiscovery();
      }
    }

    if (newConfig.hotLayerCache !== undefined) {
      if (newConfig.hotLayerCache && !this.config.hotLayerCache) {
        await this.initializeLocalCache();
      }
    }

    this.logger.log("Configuration updated");
  }

  getConfiguration(): PetalsConfig {
    return { ...this.config };
  }
}
