import { TrainLoop } from '../agents/train/train.loop.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';
const originalAddXP = soulchain.addXPTransaction;
soulchain.addXPTransaction = async (tx) => {
    console.log(`[MOCK SOULCHAIN] XP log: ${tx.rationale}`);
    return 'mocked-cid';
};
async function testAutonomy() {
    const agentMeta = {
        name: 'autonomousAgent',
        did: 'did:zeropoint:autonomousAgent',
        handle: '@autonomousAgent',
        intent: '#autonomy',
        context: {
            taskId: 'autonomy-test',
            lineage: [],
            swarmLink: '',
            layer: '#live',
            domain: '#autonomy',
        },
    };
    const trainLoop = new TrainLoop();
    try {
        const load = Math.random();
        const perf = await trainLoop.monitorPerformance(agentMeta.name, async () => {
            return await trainLoop.autoScale(agentMeta.name, load);
        });
        console.log('Autonomy Test metrics:', perf.metrics, 'Scaling action:', perf.result);
        console.log('Autonomy Test: Success');
    }
    catch (err) {
        console.error('Autonomy Test Error:', err);
    }
    finally {
        soulchain.addXPTransaction = originalAddXP;
    }
}
testAutonomy();
//# sourceMappingURL=autonomy.js.map