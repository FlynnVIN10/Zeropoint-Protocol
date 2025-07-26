import { IntrospectCore } from '../agents/introspect/introspect.core.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';
import { MemoryCore } from '../core/memory/memory.core.js';
soulchain.addXPTransaction = async () => 'mocked-cid';
MemoryCore.prototype.recordExperience = async () => { };
MemoryCore.prototype.summarizeHistory = function () {
    return {
        agentId: 'testAgent',
        totalXP: 100,
        topDomains: ['#memory'],
        dominantIntent: '#reflect',
        ethicsRatio: { aligned: 1, warn: 0, reject: 0 },
        timeline: [
            {
                timestamp: new Date().toISOString(),
                context: {
                    agentId: 'testAgent',
                    domain: '#memory',
                    layer: 'test',
                    threadId: 'thread-1',
                },
                tags: [
                    { type: '#who', name: 'testAgent', did: 'did:zeropoint:testAgent', handle: '@testAgent' },
                    { type: '#intent', purpose: '#reflect', validation: 'good-heart' },
                ],
                xp: 10,
                summary: 'Test memory entry',
                ethicalRating: 'aligned',
            },
        ],
    };
};
async function testSelfDialogue() {
    const introCore = new IntrospectCore();
    const dialogue = await introCore.selfDialogue('testAgent', 'What is my purpose?', 3);
    console.log(dialogue);
}
testSelfDialogue();
//# sourceMappingURL=selfDialogue.js.map