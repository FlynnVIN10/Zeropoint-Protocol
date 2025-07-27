// © [2025] Zeropoint Protocol (C Corp). All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

// src/test/refactor.ts

import { TrainLoop } from '../agents/train/train.loop.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';

// Mock soulchain to avoid Helia/IPFS calls
const originalAddXP = soulchain.addXPTransaction;
soulchain.addXPTransaction = async (tx: any) => {
  console.log(`[MOCK SOULCHAIN] XP log: ${tx.rationale}`);
  return 'mocked-cid';
};

async function testRefactor() {
  const agentId = 'refactorAgent';
  const trainLoop = new TrainLoop();
  try {
    const load = Math.random();
    const perf = await trainLoop.monitorPerformance(agentId, async () => {
      return await trainLoop.autoScale(agentId, load);
    });
    console.log('Refactor Test metrics:', perf.metrics, 'Scaling action:', perf.result);
    console.log('Refactor Test: Success');
  } catch (err) {
    console.error('Refactor Test Error:', err);
  } finally {
    soulchain.addXPTransaction = originalAddXP;
  }
}

testRefactor(); 