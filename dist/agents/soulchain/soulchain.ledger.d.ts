import { TagBundle } from '../../core/identity/tags.meta.js';
interface XPTransaction {
    agentId: string;
    amount: number;
    rationale: string;
    timestamp: string;
    previousCid: string | null;
    tags: TagBundle;
}
declare class SoulchainLedger {
    private helia;
    private fs;
    private ready;
    constructor();
    private init;
    addXPTransaction(transaction: XPTransaction): Promise<string>;
    getXPChain(startCid: string): Promise<XPTransaction[]>;
    persistLedgerToIPFS(): Promise<string>;
    getLedgerMetrics(): Promise<string>;
}
export declare const soulchain: SoulchainLedger;
export {};
