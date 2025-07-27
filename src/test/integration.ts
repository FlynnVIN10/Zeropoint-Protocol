// © [2025] Zeropoint Protocol (C Corp). All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

// src/test/integration.ts

import { IntrospectCore } from '../agents/introspect/introspect.core.js';
import { WonderCraftEngine } from '../agents/simulation/wondercraft.engine.js';
import { TrainLoop } from '../agents/train/train.loop.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';

// Mock soulchain to avoid Helia/IPFS calls
const originalAddXP = soulchain.addXPTransaction;
soulchain.addXPTransaction = async (tx: any) => {
  console.log(`[MOCK SOULCHAIN] XP log: ${tx.rationale}`);
  return 'mocked-cid';
};

async function testIntegration() {
  const agentIds = ['agent1', 'agent2', 'agent3'];
  const introspect = new IntrospectCore();
  const simulation = new WonderCraftEngine();
  const train = new TrainLoop();
  try {
    for (const agentId of agentIds) {
      // 1. Introspection
      const reflection = await introspect.ask(agentId, 'What is your current state?');
      // 2. Simulation (stub agent)
      const agent = { id: agentId, xp: 100, level: 'Initiate' };
      let tags = [];
      if (reflection.summaryData && reflection.summaryData.timeline && reflection.summaryData.timeline[0] && reflection.summaryData.timeline[0].tags) {
        tags = reflection.summaryData.timeline[0].tags;
      }
      const quest = simulation.initQuest(agent, 'integration-cycle');
      const action = { description: quest.ethicalTension, tags };
      const outcome = await simulation.evaluateAction(agent, action, quest);
      simulation.levelUp(agent, outcome);
      // 3. Swarm (collective)
      // 4. Optimization: monitorPerformance wrapped around autoScale
      const load = Math.random();
      const perf = await train.monitorPerformance(agentId, async () => {
        return await train.autoScale(agentId, load);
      });
      console.log(`[Integration] Agent ${agentId} metrics:`, perf.metrics, 'Scaling action:', perf.result);
      // 5. Log XP for cycle completion
      await soulchain.addXPTransaction({
        agentId,
        amount: 20,
        rationale: 'Completed full lifecycle integration',
        timestamp: new Date().toISOString(),
        previousCid: null,
        tags: undefined,
      });
    }
    console.log('Integration Test: Full agent lifecycle completed.');
  } catch (err) {
    console.error('Integration Test Error:', err);
  } finally {
    soulchain.addXPTransaction = originalAddXP;
  }
}

testIntegration(); 