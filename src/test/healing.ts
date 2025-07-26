// src/test/healing.ts

import { TrainLoop } from '../agents/train/train.loop.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';

// Mock soulchain to avoid Helia/IPFS calls
const originalAddXP = soulchain.addXPTransaction;
soulchain.addXPTransaction = async (tx: any) => {
  console.log(`[MOCK SOULCHAIN] XP log: ${tx.rationale}`);
  return 'mocked-cid';
};

async function testHealing() {
  const agentId = 'healerAgent';
  const trainLoop = new TrainLoop();
  let failCount = 0;
  // Operation fails once, then succeeds
  const operation = async () => {
    if (failCount < 1) {
      failCount++;
      throw new Error('Simulated failure');
    }
    return 'healed-result';
  };
  try {
    const result = await trainLoop.selfHeal(agentId, operation, 3);
    console.log('Healing Test:', result);
    if (result.healed) {
      console.log('Self-healing succeeded and XP was logged.');
    } else {
      console.log('No healing was needed.');
    }
  } catch (err) {
    console.error('Healing Test Error:', err);
  } finally {
    soulchain.addXPTransaction = originalAddXP;
  }
}

testHealing(); 