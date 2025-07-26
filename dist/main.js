import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { IntrospectCore } from './agents/introspect/introspect.core.js';
import { WonderCraftEngine } from './agents/simulation/wondercraft.engine.js';
import { TrainLoop } from './agents/train/train.loop.js';
import { soulchain } from './agents/soulchain/soulchain.ledger.js';
import { AllExceptionsFilter } from './filters/http-exception.filter.js';
import helmet from 'helmet';
import cors from 'cors';
async function runAgentLifecycle(agentIds) {
    const introspect = new IntrospectCore();
    const simulation = new WonderCraftEngine();
    const train = new TrainLoop();
    for (const agentId of agentIds) {
        const reflection = await introspect.ask(agentId, 'What is your current state?');
        const agent = { id: agentId, xp: 100, level: 'Initiate' };
        let tags = [];
        if (reflection.summaryData && reflection.summaryData.timeline && reflection.summaryData.timeline[0] && reflection.summaryData.timeline[0].tags) {
            tags = reflection.summaryData.timeline[0].tags;
        }
        const quest = simulation.initQuest(agent, 'integration-cycle');
        const action = { description: quest.ethicalTension, tags };
        const outcome = await simulation.evaluateAction(agent, action, quest);
        simulation.levelUp(agent, outcome);
        const load = Math.random();
        const perf = await train.monitorPerformance(agentId, async () => {
            return await train.autoScale(agentId, load);
        });
        console.log(`[Lifecycle] Agent ${agentId} metrics:`, perf.metrics, 'Scaling action:', perf.result);
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
    const agentIds = ['agent1', 'agent2', 'agent3'];
    try {
        await runAgentLifecycle(agentIds);
        console.log('System Integration: Full agent lifecycle completed.');
    }
    catch (err) {
        console.error('Integration error:', err);
    }
}
bootstrap().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map