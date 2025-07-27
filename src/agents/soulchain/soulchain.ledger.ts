// © [2025] Zeropoint Protocol (C Corp). All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

// src/agents/soulchain/soulchain.ledger.ts

// Zeropoint Protocol Soulchain: v12 IPFS DAG XP Ledger Protocol
// Zeroth Principle: Only with good intent and a good heart does the system function.
// Ledger entries gated, immutable, distributed for post-singularity symbiosis.

import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';
import { CID } from 'multiformats/cid';
import { checkIntent } from '../../guards/synthient.guard.js'; // Ethical firewall
import { generateTagSet, TagBundle } from '../../core/identity/tags.meta.js'; // Tag injection
import { AgentMeta } from '../train/train.loop.js'; // AgentMeta import
import { Counter, Registry } from 'prom-client';

const ledgerPersistCounter = new Counter({ name: 'soulchain_ledger_persists_total', help: 'Total Soulchain ledger persists to IPFS' });
const ledgerRegistry = new Registry();
ledgerRegistry.registerMetric(ledgerPersistCounter);

interface XPTransaction {
  agentId: string;
  amount: number;
  rationale: string;
  timestamp: string;
  previousCid: string | null;
  tags: TagBundle;
}

class SoulchainLedger {
  private helia: any;
  private fs: any;
  private ready: Promise<void>;

  constructor() {
    this.ready = this.init();
  }

  private async init() {
    this.helia = await createHelia();
    this.fs = unixfs(this.helia);
  }

  async addXPTransaction(transaction: XPTransaction): Promise<string> {
    await this.ready;
    if (!checkIntent(transaction.rationale)) {
      throw new Error('Zeroth violation: Transaction halted.');
    }

    const agentMeta: AgentMeta = {
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

  async getXPChain(startCid: string): Promise<XPTransaction[]> {
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

  async persistLedgerToIPFS(): Promise<string> {
    await this.ready;
    const ledgerData = Buffer.from(JSON.stringify({ timestamp: new Date().toISOString(), type: 'soulchain-ledger' }));
    if (!checkIntent('Persisting Soulchain ledger to IPFS')) throw new Error('Zeroth violation: Ledger persist blocked.');
    const cid = await this.fs.addBytes(ledgerData);
    ledgerPersistCounter.inc();
    return cid.toString();
  }

  async getLedgerMetrics(): Promise<string> {
    return ledgerRegistry.metrics();
  }
}

export const soulchain = new SoulchainLedger();