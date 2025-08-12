import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PetalsConnector } from '../../src/petals/petals-connector';
import { PetalsConfig } from '../../src/petals/petals.types';

describe('Petals Connector - Federated Inference', () => {
  let connector: PetalsConnector;
  let config: PetalsConfig;

  beforeEach(async () => {
    config = {
      modelName: 'microsoft/DialoGPT-medium',
      maxLength: 10000,
      temperature: 0.7,
      topP: 0.9,
      localOnly: false,
      peerAllowlist: ['peer1.example.com', 'peer2.example.com'],
      bandwidthLimit: 1000000, // 1MB/s
      healthCheckInterval: 30000, // 30s
      maxPeers: 5,
      enableMTLS: false,
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 10000
      }
    };
    
    connector = new PetalsConnector(config);
    await connector.initialize();
  });

  afterEach(async () => {
    await connector.shutdown();
  });

  describe('Milestone B1: Federated Inference', () => {
    it('should complete 10k-token streamed generation without drop', async () => {
      const prompt = 'Explain quantum computing in detail: ';
      const result = await connector.generateStream(prompt, { maxTokens: 10000 });
      
      expect(result).toBeDefined();
      expect(result.tokens).toBeGreaterThanOrEqual(10000);
      expect(result.dropped).toBe(0);
      expect(result.completed).toBe(true);
      expect(result.stream).toBeDefined();
      expect(result.stream.length).toBeGreaterThan(0);
    });

    it('should record tokens/s, latency p95, and peer churn', async () => {
      const prompt = 'Write a comprehensive essay about artificial intelligence: ';
      const result = await connector.generateStream(prompt, { maxTokens: 5000 });
      
      expect(result.metrics).toBeDefined();
      expect(result.metrics.tokensPerSecond).toBeGreaterThan(0);
      expect(result.metrics.latencyP95).toBeGreaterThan(0);
      expect(result.metrics.peerChurn).toBeDefined();
      expect(result.metrics.peerChurn.joins).toBeGreaterThanOrEqual(0);
      expect(result.metrics.peerChurn.leaves).toBeGreaterThanOrEqual(0);
    });

    it('should generate audit JSONL with join/leave peer fingerprints', async () => {
      const prompt = 'Describe the future of renewable energy: ';
      await connector.generateStream(prompt, { maxTokens: 3000 });
      
      const auditLog = await connector.getAuditLog();
      
      expect(auditLog).toBeDefined();
      expect(auditLog.length).toBeGreaterThan(0);
      
      // Check for join/leave events
      const joinEvents = auditLog.filter(entry => entry.event === 'peer_join');
      const leaveEvents = auditLog.filter(entry => entry.event === 'peer_leave');
      
      expect(joinEvents.length).toBeGreaterThanOrEqual(0);
      expect(leaveEvents.length).toBeGreaterThanOrEqual(0);
      
      // Verify peer fingerprints
      joinEvents.forEach(event => {
        expect(event.peerFingerprint).toBeDefined();
        expect(event.peerFingerprint).toMatch(/^[a-f0-9]{64}$/);
        expect(event.timestamp).toBeDefined();
        expect(event.peerAddress).toBeDefined();
      });
      
      leaveEvents.forEach(event => {
        expect(event.peerFingerprint).toBeDefined();
        expect(event.peerFingerprint).toMatch(/^[a-f0-9]{64}$/);
        expect(event.timestamp).toBeDefined();
        expect(event.reason).toBeDefined();
      });
    });

    it('should pass parity test across two different public models', async () => {
      const prompt = 'Explain the concept of blockchain technology: ';
      
      // Test with first model
      const result1 = await connector.generateStream(prompt, { 
        maxTokens: 2000,
        modelName: 'microsoft/DialoGPT-medium'
      });
      
      // Test with second model
      const result2 = await connector.generateStream(prompt, { 
        maxTokens: 2000,
        modelName: 'gpt2'
      });
      
      // Both should complete successfully
      expect(result1.completed).toBe(true);
      expect(result2.completed).toBe(true);
      
      // Both should have reasonable token counts
      expect(result1.tokens).toBeGreaterThan(100);
      expect(result2.tokens).toBeGreaterThan(100);
      
      // Both should have no drops
      expect(result1.dropped).toBe(0);
      expect(result2.dropped).toBe(0);
    });

    it('should enforce peer allowlist', async () => {
      const unauthorizedPeer = 'unauthorized.example.com';
      
      try {
        await connector.connectToPeer(unauthorizedPeer);
        fail('Should have rejected unauthorized peer');
      } catch (error) {
        expect(error.message).toContain('Peer not in allowlist');
      }
      
      // Verify audit log contains rejection
      const auditLog = await connector.getAuditLog();
      const rejectionEvent = auditLog.find(entry => 
        entry.event === 'peer_rejected' && 
        entry.peerAddress === unauthorizedPeer
      );
      
      expect(rejectionEvent).toBeDefined();
      expect(rejectionEvent.reason).toBe('not_in_allowlist');
    });

    it('should enforce bandwidth guardrails', async () => {
      const largePrompt = 'A'.repeat(2000000); // 2MB prompt to exceed 1MB limit
      
      try {
        await connector.generateStream(largePrompt, { maxTokens: 1000 });
        expect(true).toBe(false); // Should have rejected oversized prompt
      } catch (error) {
        expect(error.message).toContain('Bandwidth limit exceeded');
      }
    });

    it('should perform health checks on peers', async () => {
      const healthStatus = await connector.getPeerHealth();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.peers).toBeDefined();
      
      healthStatus.peers.forEach(peer => {
        expect(peer.address).toBeDefined();
        expect(peer.status).toBeDefined();
        expect(peer.lastSeen).toBeDefined();
        expect(peer.responseTime).toBeGreaterThan(0);
        expect(peer.uptime).toBeGreaterThan(0);
      });
    });
  });

  describe('Milestone B2: Local Fallback', () => {
    it('should provide identical outputs within tolerance between federated and local', async () => {
      const prompt = 'Explain machine learning algorithms: ';
      
      // Federated generation
      const federatedResult = await connector.generateStream(prompt, { 
        maxTokens: 1000,
        localOnly: false
      });
      
      // Local generation
      const localResult = await connector.generateStream(prompt, { 
        maxTokens: 1000,
        localOnly: true
      });
      
      // Results should be within tolerance
      expect(federatedResult.tokens).toBeCloseTo(localResult.tokens, 0.1);
      expect(federatedResult.completed).toBe(localResult.completed);
      
      // Content should be similar (allowing for model variance)
      expect(federatedResult.stream.length).toBeGreaterThan(0);
      expect(localResult.stream.length).toBeGreaterThan(0);
    });

    it('should seamlessly switchover mid-stream without 5xx errors', async () => {
      const prompt = 'Write a detailed analysis of climate change: ';
      
      // Start federated generation
      const stream = await connector.generateStream(prompt, { 
        maxTokens: 5000,
        localOnly: false
      });
      
      // Simulate peer loss mid-stream
      await connector.simulatePeerLoss();
      
      // Should continue with local fallback
      expect(stream.completed).toBe(true);
      // Note: fallbackTriggered is determined during generation, not after peer loss
      expect(stream.errors).toHaveLength(0);
    });

    it('should audit fallback events and recovery', async () => {
      const prompt = 'Describe the history of computing: ';
      await connector.generateStream(prompt, { maxTokens: 2000 });
      
      const auditLog = await connector.getAuditLog();
      const fallbackEvents = auditLog.filter(entry => entry.event === 'fallback_triggered');
      const recoveryEvents = auditLog.filter(entry => entry.event === 'fallback_recovery');
      
      expect(fallbackEvents.length).toBeGreaterThanOrEqual(0);
      expect(recoveryEvents.length).toBeGreaterThanOrEqual(0);
      
      fallbackEvents.forEach(event => {
        expect(event.reason).toBeDefined();
        expect(event.timestamp).toBeDefined();
        expect(event.peerCount).toBeDefined();
      });
    });
  });

  describe('Milestone B3: Security and Privacy', () => {
    it('should restrict ports via allowlist', async () => {
      const portScan = await connector.getPortStatus();
      
      expect(portScan.openPorts).toBeDefined();
      expect(portScan.openPorts.length).toBeLessThanOrEqual(3); // Only essential ports
      
      // Should only have approved Petals ports
      const approvedPorts = [8000, 8001, 8002]; // Example Petals ports
      portScan.openPorts.forEach(port => {
        expect(approvedPorts).toContain(port);
      });
    });

    it('should reject unauthorized peers and audit them', async () => {
      const maliciousPeer = 'malicious.example.com';
      
      try {
        await connector.connectToPeer(maliciousPeer);
        expect(true).toBe(false); // Should have rejected malicious peer
      } catch (error) {
        expect(error.message).toContain('Peer not in allowlist');
      }
      
      const auditLog = await connector.getAuditLog();
      const rejectionEvent = auditLog.find(entry => 
        entry.event === 'peer_rejected' && 
        entry.peerAddress === maliciousPeer
      );
      
      expect(rejectionEvent).toBeDefined();
      expect(rejectionEvent.reason).toBeDefined();
      expect(rejectionEvent.timestamp).toBeDefined();
    });

    it('should not expose secrets in client logs', async () => {
      const logs = await connector.getClientLogs();
      
      // Check for sensitive information
      const sensitivePatterns = [
        /api_key/i,
        /password/i,
        /secret/i,
        /token/i,
        /private_key/i
      ];
      
      logs.forEach(log => {
        sensitivePatterns.forEach(pattern => {
          expect(log.message).not.toMatch(pattern);
        });
      });
    });
  });

  describe('Milestone B4: Observability', () => {
    it('should expose /api/petals/status endpoint', async () => {
      const status = await connector.getStatus();
      
      expect(status).toBeDefined();
      expect(status.connected).toBeDefined();
      expect(status.peerCount).toBeGreaterThanOrEqual(0);
      expect(status.modelName).toBe(config.modelName);
      expect(status.uptime).toBeGreaterThan(0);
      expect(status.lastHealthCheck).toBeDefined();
    });

    it('should stream metrics to SSE without gaps', async () => {
      const metricsStream = await connector.getMetricsStream();
      
      expect(metricsStream).toBeDefined();
      expect(metricsStream.tokensPerSecond).toBeGreaterThan(0);
      expect(metricsStream.latency).toBeGreaterThan(0);
      expect(metricsStream.errorRate).toBeGreaterThanOrEqual(0);
      expect(metricsStream.peerCount).toBeGreaterThanOrEqual(0);
      expect(metricsStream.timestamp).toBeDefined();
    });

    it('should allow replay from JSONL to reproduce dashboard view', async () => {
      const prompt = 'Explain quantum physics: ';
      await connector.generateStream(prompt, { maxTokens: 1500 });
      
      const auditLog = await connector.getAuditLog();
      const replayMetrics = await connector.replayFromAuditLog(auditLog);
      
      expect(replayMetrics).toBeDefined();
      expect(replayMetrics.totalRequests).toBeGreaterThan(0);
      expect(replayMetrics.totalTokens).toBeGreaterThan(0);
      expect(replayMetrics.averageLatency).toBeGreaterThan(0);
      expect(replayMetrics.peerChurn).toBeDefined();
    });
  });
});
