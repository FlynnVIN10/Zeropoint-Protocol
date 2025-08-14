// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// src/test/autonomy.ts

import { TrainLoop, AgentMeta } from "../agents/train/train.loop.js";
import { soulchain } from "../agents/soulchain/soulchain.ledger.js";

// Mock soulchain to avoid Helia/IPFS calls
const originalAddXP = soulchain.addXPTransaction;
soulchain.addXPTransaction = async (tx: any) => {
  console.log(`[MOCK SOULCHAIN] XP log: ${tx.rationale}`);
  return "mocked-cid";
};

async function testAutonomy() {
  const agentMeta: AgentMeta = {
    name: "autonomousAgent",
    did: "did:zeropoint:autonomousAgent",
    handle: "@autonomousAgent",
    intent: "#autonomy",
    context: {
      taskId: "autonomy-test",
      lineage: [],
      swarmLink: "",
      layer: "#live" as const,
      domain: "#autonomy",
    },
  };
  const trainLoop = new TrainLoop();
  try {
    // Refactored: monitorPerformance wrapped around autoScale
    const load = Math.random();
    const perf = await trainLoop.monitorPerformance(
      agentMeta.name,
      async () => {
        return await trainLoop.autoScale(agentMeta.name, load);
      },
    );
    console.log(
      "Autonomy Test metrics:",
      perf.metrics,
      "Scaling action:",
      perf.result,
    );
    console.log("Autonomy Test: Success");
  } catch (err) {
    console.error("Autonomy Test Error:", err);
  } finally {
    soulchain.addXPTransaction = originalAddXP;
  }
}

testAutonomy();
