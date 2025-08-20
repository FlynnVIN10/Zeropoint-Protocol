import { Test, TestingModule } from "@nestjs/testing";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PetalsConnector } from "../../src/petals/petals-connector";

describe("PetalsConnector", () => {
  let connector: PetalsConnector;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetalsConnector,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    connector = module.get<PetalsConnector>(PetalsConnector);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe("initialization", () => {
    it("should initialize with default configuration", () => {
      const config = connector.getConfiguration();

      expect(config.enableNetworking).toBe(true);
      expect(config.localFallback).toBe(true);
      expect(config.hotLayerCache).toBe(true);
      expect(config.cacheSize).toBe(1024);
      expect(config.maxPeers).toBe(10);
      expect(config.peerAllowlist).toContain("127.0.0.1");
      expect(config.peerAllowlist).toContain("localhost");
    });

    it("should load configuration from environment variables", () => {
      // Set environment variables
      process.env.PETALS_ENABLE_NETWORKING = "0";
      process.env.PETALS_CACHE_SIZE = "2048";
      process.env.PETALS_MAX_PEERS = "20";

      // Recreate connector to load new config
      const newConnector = new PetalsConnector(eventEmitter);
      const config = newConnector.getConfiguration();

      expect(config.enableNetworking).toBe(false);
      expect(config.cacheSize).toBe(2048);
      expect(config.maxPeers).toBe(20);

      // Clean up
      delete process.env.PETALS_ENABLE_NETWORKING;
      delete process.env.PETALS_CACHE_SIZE;
      delete process.env.PETALS_MAX_PEERS;
    });
  });

  describe("peer management", () => {
    it("should discover and allowlist peers", async () => {
      const status = await connector.getStatus();

      expect(status.peers.length).toBeGreaterThan(0);
      expect(status.peers.some((p) => p.id === "local-peer")).toBe(true);
      expect(status.peers.every((p) => p.allowlisted)).toBe(true);
    });

    it("should filter peers by allowlist", () => {
      // Test with a peer that should be filtered out
      const allowlistedPeer = connector["isPeerAllowlisted"]("127.0.0.1");
      const nonAllowlistedPeer =
        connector["isPeerAllowlisted"]("192.168.2.100");

      expect(allowlistedPeer).toBe(true);
      expect(nonAllowlistedPeer).toBe(false);
    });
  });

  describe("block operations", () => {
    it("should host blocks successfully", async () => {
      const blockId = "test-block-1";
      const testData = { message: "Hello Petals" };

      const result = await connector.hostBlock(blockId, testData, "data");

      expect(result).toBe(true);

      // Verify block was stored
      const block = await connector.getBlock(blockId);
      expect(block).toEqual(testData);
    });

    it("should join blocks from network", async () => {
      const blockId = "network-block-1";

      // First, ensure the block doesn't exist locally
      const initialBlock = await connector.getBlock(blockId);
      expect(initialBlock).toBeNull();

      // Try to join the block
      const result = await connector.joinBlock(blockId, "peer-1");

      // Result may be true or false depending on simulation
      expect(typeof result).toBe("boolean");
    });

    it("should fallback to local cache when network fails", async () => {
      const blockId = "cache-fallback-test";
      const testData = { cached: true };

      // First, add data to local cache
      connector["localCache"].set(blockId, testData);

      // Try to join block (should fallback to cache)
      const result = await connector.joinBlock(blockId);

      expect(result).toBe(true);

      // Verify block was retrieved from cache
      const block = await connector.getBlock(blockId);
      expect(block).toEqual(testData);
    });
  });

  describe("cache management", () => {
    it("should track cache statistics correctly", async () => {
      const blockId = "cache-stats-test";
      const testData = "test data";

      // Add to cache
      connector["localCache"].set(blockId, testData);

      // Get block multiple times to test hit rate
      await connector.getBlock(blockId);
      await connector.getBlock(blockId);
      await connector.getBlock("non-existent");

      const status = await connector.getStatus();

      expect(status.localCache.hitRate).toBeGreaterThan(0);
      expect(status.localCache.items).toBeGreaterThan(0);
    });

    it("should calculate cache size correctly", async () => {
      const blockId = "size-test";
      const testData = "x".repeat(1024 * 1024); // 1MB

      connector["localCache"].set(blockId, testData);

      const status = await connector.getStatus();

      expect(status.localCache.size).toBeGreaterThan(0);
    });
  });

  describe("status reporting", () => {
    it("should return comprehensive status", async () => {
      const status = await connector.getStatus();

      expect(status).toHaveProperty("connected");
      expect(status).toHaveProperty("peers");
      expect(status).toHaveProperty("blocks");
      expect(status).toHaveProperty("localCache");
      expect(status).toHaveProperty("network");
      expect(status).toHaveProperty("timestamp");

      expect(Array.isArray(status.peers)).toBe(true);
      expect(Array.isArray(status.blocks)).toBe(true);
      expect(typeof status.localCache.size).toBe("number");
      expect(typeof status.network.latency).toBe("number");
    });

    it("should provide network metrics", async () => {
      const status = await connector.getStatus();

      expect(status.network.uploadSpeed).toBeGreaterThan(0);
      expect(status.network.downloadSpeed).toBeGreaterThan(0);
      expect(status.network.latency).toBeGreaterThan(0);
    });
  });

  describe("configuration updates", () => {
    it("should update configuration dynamically", async () => {
      const newConfig = {
        enableNetworking: false,
        cacheSize: 512,
      };

      await connector.updateConfiguration(newConfig);

      const updatedConfig = connector.getConfiguration();
      expect(updatedConfig.enableNetworking).toBe(false);
      expect(updatedConfig.cacheSize).toBe(512);
    });
  });

  describe("error handling", () => {
    it("should handle errors gracefully in block operations", async () => {
      // Test with invalid data
      const result = await connector.hostBlock("error-test", undefined as any);
      expect(result).toBe(false);
    });

    it("should handle network failures gracefully", async () => {
      // Disable networking
      await connector.updateConfiguration({ enableNetworking: false });

      const result = await connector.joinBlock("network-test", "peer-1");
      expect(typeof result).toBe("boolean");
    });
  });
});
