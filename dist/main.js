import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { IntrospectCore } from './agents/introspect/introspect.core.js';
import { WonderCraftEngine } from './agents/simulation/wondercraft.engine.js';
import { TrainLoop } from './agents/train/train.loop.js';
import { AllExceptionsFilter } from './filters/http-exception.filter.js';
import { ValidationPipe } from './pipes/validation.pipe.js';
import { LoggingInterceptor } from './interceptors/logging.interceptor.js';
import { winstonConfig } from './config/winston.config.js';
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
            return { latency: Math.random() * 100, throughput: Math.random() * 1000 };
        });
        if (load > 0.8) {
            await train.autoScale(agentId, load);
        }
        const agentMeta = {
            name: agentId,
            did: `did:zeropoint:${agentId}`,
            handle: `@${agentId}`,
            intent: 'ethical-alignment',
            context: {
                taskId: 'training-cycle',
                lineage: [],
                swarmLink: '',
                layer: '#training',
                domain: 'ai-ethics'
            }
        };
        const flaggedFunctions = await train.reflect(agentId);
        if (flaggedFunctions.length > 0) {
            const proposal = await train.proposeRewrite(agentMeta, flaggedFunctions[0]);
            const response = await train.sendToPetals(proposal);
            await train.applyIfAllowed(response);
        }
        console.log(`Agent ${agentId} completed lifecycle with ${perf.metrics.runtime}ms runtime`);
    }
}
async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: winstonConfig
    });
    app.use(helmet());
    app.use(cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    }));
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.setGlobalPrefix('v1');
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Zeropoint Protocol running on port ${port}`);
    console.log(`📊 Metrics available at /v1/metrics`);
    console.log(`🏥 Health check at /v1/health`);
    const demoAgentIds = ['agent-alpha', 'agent-beta', 'agent-gamma'];
    await runAgentLifecycle(demoAgentIds);
}
bootstrap();
//# sourceMappingURL=main.js.map