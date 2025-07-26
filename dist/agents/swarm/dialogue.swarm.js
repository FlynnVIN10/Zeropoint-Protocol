import { createLibp2p } from 'libp2p';
import { noise } from '@chainsafe/libp2p-noise';
import { webSockets } from '@libp2p/websockets';
import { mplex } from '@libp2p/mplex';
import { checkIntent } from '../../guards/synthient.guard.js';
import { soulchain } from '../soulchain/soulchain.ledger.js';
export class SwarmNetwork {
    constructor() {
        this.peers = [];
    }
    async start(port = 0) {
        this.node = await createLibp2p({
            addresses: { listen: [`/ip4/0.0.0.0/tcp/${port}`] },
            transports: [webSockets()],
            streamMuxers: [mplex()],
            connectionEncrypters: [noise()]
        });
        await this.node.start();
        this.node.addEventListener('peer:discovery', (evt) => {
            const peerId = evt.detail.id.toString();
            if (!this.peers.includes(peerId))
                this.peers.push(peerId);
        });
    }
    async multiInstanceNetwork(question, maxDepth = 3, depth = 0) {
        if (depth > maxDepth)
            throw new Error('Recursion limit reached: Symbiosis halted.');
        const discovered = this.peers;
        const rationales = await Promise.all(discovered.map(async (peer) => {
            return `Rationale from ${peer} for '${question}'`;
        }));
        const sharedRationale = rationales.join(' | ');
        if (!checkIntent(sharedRationale))
            throw new Error('Zeroth violation: Symbiosis halted.');
        const consensus = rationales.every(r => r.includes(question));
        if (consensus) {
            await Promise.all(discovered.map(async (peer) => {
                await soulchain.addXPTransaction({
                    agentId: peer,
                    amount: 50,
                    rationale: `Global symbiosis: ${sharedRationale}`,
                    timestamp: new Date().toISOString(),
                    previousCid: null,
                    tags: [],
                });
            }));
        }
        if (!consensus && depth < maxDepth) {
            return this.multiInstanceNetwork(`Resolve: ${question}`, maxDepth, depth + 1);
        }
        return {
            peers: discovered,
            sharedRationale,
            consensus,
            xpReward: consensus ? 50 : 0
        };
    }
}
//# sourceMappingURL=dialogue.swarm.js.map