import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { checkIntent } from './guards/synthient.guard.js';
import { CID } from 'multiformats/cid';
import { HttpService } from '@nestjs/axios';
import { Counter, Registry } from 'prom-client';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { callPetalsAPI, logTrainingCycle, formatProposal, CodeProposal, PetalsResponse } from './agents/train/petals.bridge.js';

const uploadCounter = new Counter({ name: 'ipfs_uploads_total', help: 'Total IPFS uploads' });
const downloadCounter = new Counter({ name: 'ipfs_downloads_total', help: 'Total IPFS downloads' });
const metricsRegistry = new Registry();
metricsRegistry.registerMetric(uploadCounter);
metricsRegistry.registerMetric(downloadCounter);

interface DirectoryEntry {
  name: string;
  cid: string;
  size: number;
  type: string;
}

@Injectable()
export class AppService {
  private helia: any;
  private fs: any;
  private ready: Promise<void>;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(User) private userRepo: Repository<User>
  ) {
    this.ready = this.init();
  }

  private async init() {
    this.helia = await createHelia();
    this.fs = unixfs(this.helia);
  }

  async uploadFile(buffer: Buffer, rationale: string): Promise<string> {
    await this.ready;
    if (!checkIntent(rationale)) throw new Error('Zeroth violation: Upload blocked.');
    const cid = await this.fs.addBytes(buffer);
    uploadCounter.inc();
    return cid.toString();
  }

  async downloadFile(cidStr: string, rationale: string): Promise<Buffer> {
    await this.ready;
    if (!checkIntent(rationale)) throw new Error('Zeroth violation: Download blocked.');
    const cid = this.helia.CID ? this.helia.CID.parse(cidStr) : cidStr;
    const data = await this.fs.cat(cid);
    downloadCounter.inc();
    return Buffer.from(data);
  }

  async getHello(): Promise<string> {
    return 'Hello World!';
  }

  async listDirectory(cid: string): Promise<DirectoryEntry[]> {
    const helia = await createHelia();
    const fs = unixfs(helia);

    const entries: DirectoryEntry[] = [];
    for await (const entry of fs.ls(CID.parse(cid))) {
      entries.push({
        name: entry.name,
        cid: entry.cid.toString(),
        size: Number(entry.size),
        type: entry.type,
      });
    }

    return entries;
  }

  async getMetrics(): Promise<string> {
    return metricsRegistry.metrics();
  }

  // Proxy call to Python backend (Nullvana)
  async callNullvana(text: string): Promise<any> {
    const nullvanaUrl = this.configService.get<string>('NULLVANA_SERVICE_URL');
    if (!nullvanaUrl) throw new Error('NULLVANA_SERVICE_URL not set');
    if (!checkIntent(text)) throw new Error('Zeroth violation: Nullvana call blocked.');
    const response = await this.httpService.post(`${nullvanaUrl}/v1/generate`, { text }).toPromise();
    return response.data;
  }

  // Registration
  async registerUser(username: string, password: string): Promise<User> {
    if (!checkIntent(username + password)) throw new Error('Zeroth violation: Registration blocked.');
    // Hash password (stub, replace with bcrypt in production)
    const user = this.userRepo.create({ username, password });
    return this.userRepo.save(user);
  }

  // Login (stub, add JWT logic in controller/guard)
  async validateUser(username: string, password: string): Promise<User | null> {
    if (!checkIntent(username + password)) throw new Error('Zeroth violation: Login blocked.');
    const user = await this.userRepo.findOneBy({ username });
    if (user && user.password === password) return user;
    return null;
  }

  // Petals integration: propose code rewrite and get response
  async proposeWithPetals(proposal: CodeProposal): Promise<PetalsResponse> {
    if (!checkIntent(proposal.rationale + proposal.proposedCode)) throw new Error('Zeroth violation: Petals proposal blocked.');
    const request = formatProposal(proposal);
    const response = await callPetalsAPI(request);
    await logTrainingCycle(proposal.agentId, response);
    return response;
  }
}