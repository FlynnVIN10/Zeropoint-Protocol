// src/test/optimization.ts

import { TrainLoop, AgentMeta } from '../agents/train/train.loop.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';

// Mock soulchain to avoid Helia/IPFS calls
const originalAddXP = soulchain.addXPTransaction;
soulchain.addXPTransaction = async (tx: any) => {
  console.log(`[MOCK SOULCHAIN] XP log: ${tx.rationale}`);
  return 'mocked-cid';
};

async function testOptimization() {
  const agentMeta: AgentMeta = {
    name: 'optimizer',
    did: 'did:lexame:optimizer',
    handle: '@optimizer',
    intent: '#optimize',
    context: {
      taskId: 'optimization-test',
      lineage: [],
      swarmLink: '',
      layer: '#live' as const,
      domain: '#optimization',
    },
  };
  const trainLoop = new TrainLoop();
  try {
    // Test monitorPerformance
    const perf = await trainLoop.monitorPerformance(agentMeta.name, async () => {
      await new Promise(res => setTimeout(res, 50));
      return 'perf-op';
    });
    console.log('MonitorPerformance metrics:', perf.metrics);
    // Test autoScale
    const scaleAction = await trainLoop.autoScale(agentMeta.name, 0.2);
    console.log('AutoScale action:', scaleAction);
    const scaleAction2 = await trainLoop.autoScale(agentMeta.name, 0.9);
    console.log('AutoScale action:', scaleAction2);
    console.log('Optimization Test: Success');
  } catch (err) {
    console.error('Optimization Test Error:', err);
  } finally {
    soulchain.addXPTransaction = originalAddXP;
  }
}

testOptimization(); 