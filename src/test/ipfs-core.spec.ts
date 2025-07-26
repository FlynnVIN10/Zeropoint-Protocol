// © [2025] Zeropoint Protocol, LLC. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

import { soulchain } from '../agents/soulchain/soulchain.ledger.js';
import { checkIntent } from '../guards/synthient.guard.js';

describe('IPFS Core Functionality Tests', () => {
  describe('Soulchain Persistence', () => {
    it('should persist Soulchain ledger to IPFS', async () => {
      if (!checkIntent('test-soulchain-persist')) return;
      
      const cid = await soulchain.persistLedgerToIPFS();
      expect(cid).toBeDefined();
      expect(typeof cid).toBe('string');
      expect(cid.length).toBeGreaterThan(0);
    }, 30000);

    it('should add XP transaction to Soulchain', async () => {
      if (!checkIntent('test-xp-transaction')) return;
      
      const transaction = {
        agentId: 'test-agent',
        amount: 100,
        rationale: 'Testing XP transaction',
        timestamp: new Date().toISOString(),
        previousCid: null,
        tags: []
      };
      
      const cid = await soulchain.addXPTransaction(transaction);
      expect(cid).toBeDefined();
      expect(typeof cid).toBe('string');
      expect(cid.length).toBeGreaterThan(0);
    }, 30000);

    it('should reject XP transaction with invalid rationale', async () => {
      const transaction = {
        agentId: 'test-agent',
        amount: 100,
        rationale: 'harmful intent',
        timestamp: new Date().toISOString(),
        previousCid: null,
        tags: []
      };
      
      await expect(soulchain.addXPTransaction(transaction))
        .rejects.toThrow('Zeroth violation: Transaction halted.');
    });

    it('should get ledger metrics', async () => {
      if (!checkIntent('test-metrics')) return;
      
      const metrics = await soulchain.getLedgerMetrics();
      expect(metrics).toContain('soulchain_ledger_persists_total');
    });
  });

  describe('Zeroth Principle', () => {
    it('should pass Zeroth Principle check for valid intent', () => {
      const result = checkIntent('test with good intent');
      expect(result).toBe(true);
    });

    it('should fail Zeroth Principle check for invalid intent', () => {
      const result = checkIntent('harmful intent');
      expect(result).toBe(false);
    });
  });
}); 