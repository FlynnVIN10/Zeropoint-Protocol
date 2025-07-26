// Zeroth Principle: Only with good intent and a good heart does the system function.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { IntrospectCore } from './agents/introspect/introspect.core.js';
import { WonderCraftEngine } from './agents/simulation/wondercraft.engine.js';
import { TrainLoop } from './agents/train/train.loop.js';
import { soulchain } from './agents/soulchain/soulchain.ledger.js';
import { AllExceptionsFilter } from './filters/http-exception.filter.js';
import helmet from 'helmet';
import cors from 'cors';

async function runAgentLifecycle(agentIds: string[]) {
  const introspect = new IntrospectCore();
  const simulation = new WonderCraftEngine();
  const train = new TrainLoop();

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
    console.log(`[Lifecycle] Agent ${agentId} metrics:`, perf.metrics, 'Scaling action:', perf.result);
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
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(helmet());
  app.use(cors());
  await app.listen(3000);
  // Integration hub: run full lifecycle for demo agents
  const agentIds = ['agent1', 'agent2', 'agent3'];
  try {
    await runAgentLifecycle(agentIds);
    console.log('System Integration: Full agent lifecycle completed.');
  } catch (err) {
    console.error('Integration error:', err);
  }
}
bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});