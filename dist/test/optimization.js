import { TrainLoop } from '../agents/train/train.loop.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';
const originalAddXP = soulchain.addXPTransaction;
soulchain.addXPTransaction = async (tx) => {
    console.log(`[MOCK SOULCHAIN] XP log: ${tx.rationale}`);
    return 'mocked-cid';
};
async function testOptimization() {
    const agentMeta = {
        name: 'optimizer',
        did: 'did:lexame:optimizer',
        handle: '@optimizer',
        intent: '#optimize',
        context: {
            taskId: 'optimization-test',
            lineage: [],
            swarmLink: '',
            layer: '#live',
            domain: '#optimization',
        },
    };
    const trainLoop = new TrainLoop();
    try {
        const perf = await trainLoop.monitorPerformance(agentMeta.name, async () => {
            await new Promise(res => setTimeout(res, 50));
            return 'perf-op';
        });
        console.log('MonitorPerformance metrics:', perf.metrics);
        const scaleAction = await trainLoop.autoScale(agentMeta.name, 0.2);
        console.log('AutoScale action:', scaleAction);
        const scaleAction2 = await trainLoop.autoScale(agentMeta.name, 0.9);
        console.log('AutoScale action:', scaleAction2);
        console.log('Optimization Test: Success');
    }
    catch (err) {
        console.error('Optimization Test Error:', err);
    }
    finally {
        soulchain.addXPTransaction = originalAddXP;
    }
}
testOptimization();
//# sourceMappingURL=optimization.js.map