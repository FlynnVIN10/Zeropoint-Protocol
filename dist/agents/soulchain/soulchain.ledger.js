import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';
import { CID } from 'multiformats/cid';
import { checkIntent } from '../../guards/synthient.guard.js';
import { generateTagSet } from '../../core/identity/tags.meta.js';
import { Counter, Registry } from 'prom-client';
const ledgerPersistCounter = new Counter({ name: 'soulchain_ledger_persists_total', help: 'Total Soulchain ledger persists to IPFS' });
const ledgerRegistry = new Registry();
ledgerRegistry.registerMetric(ledgerPersistCounter);
class SoulchainLedger {
    constructor() {
        this.ready = this.init();
    }
    async init() {
        this.helia = await createHelia();
        this.fs = unixfs(this.helia);
    }
    async addXPTransaction(transaction) {
        await this.ready;
        if (!checkIntent(transaction.rationale)) {
            throw new Error('Zeroth violation: Transaction halted.');
        }
        const agentMeta = {
            name: transaction.agentId,
            did: `did:zeropoint:${transaction.agentId}`,
            handle: `@${transaction.agentId}`,
            intent: '#xp-log',
            context: {
                taskId: 'xp-ledger',
                lineage: [],
                swarmLink: '',
                layer: '#live',
                domain: '#soulchain'
            }
        };
        transaction.tags = generateTagSet(agentMeta);
        const data = Buffer.from(JSON.stringify(transaction));
        const cid = await this.fs.addBytes(data);
        return cid.toString();
    }
    async getXPChain(startCid) {
        await this.ready;
        let currentCid = CID.parse(startCid);
        const chain = [];
        while (currentCid) {
            const data = await this.fs.cat(currentCid);
            const transaction = JSON.parse(data.toString());
            chain.push(transaction);
            currentCid = transaction.previousCid ? CID.parse(transaction.previousCid) : null;
        }
        return chain;
    }
    async persistLedgerToIPFS() {
        await this.ready;
        const ledgerData = Buffer.from(JSON.stringify({ timestamp: new Date().toISOString(), type: 'soulchain-ledger' }));
        if (!checkIntent('Persisting Soulchain ledger to IPFS'))
            throw new Error('Zeroth violation: Ledger persist blocked.');
        const cid = await this.fs.addBytes(ledgerData);
        ledgerPersistCounter.inc();
        return cid.toString();
    }
    async getLedgerMetrics() {
        return ledgerRegistry.metrics();
    }
}
export const soulchain = new SoulchainLedger();
//# sourceMappingURL=soulchain.ledger.js.map