var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
import { callPetalsAPI, logTrainingCycle, formatProposal } from './agents/train/petals.bridge.js';
const uploadCounter = new Counter({ name: 'ipfs_uploads_total', help: 'Total IPFS uploads' });
const downloadCounter = new Counter({ name: 'ipfs_downloads_total', help: 'Total IPFS downloads' });
const metricsRegistry = new Registry();
metricsRegistry.registerMetric(uploadCounter);
metricsRegistry.registerMetric(downloadCounter);
let AppService = class AppService {
    constructor(configService, httpService, userRepo) {
        this.configService = configService;
        this.httpService = httpService;
        this.userRepo = userRepo;
        this.ready = this.init();
    }
    async init() {
        this.helia = await createHelia();
        this.fs = unixfs(this.helia);
    }
    async uploadFile(buffer, rationale) {
        await this.ready;
        if (!checkIntent(rationale))
            throw new Error('Zeroth violation: Upload blocked.');
        const cid = await this.fs.addBytes(buffer);
        uploadCounter.inc();
        return cid.toString();
    }
    async downloadFile(cidStr, rationale) {
        await this.ready;
        if (!checkIntent(rationale))
            throw new Error('Zeroth violation: Download blocked.');
        const cid = this.helia.CID ? this.helia.CID.parse(cidStr) : cidStr;
        const data = await this.fs.cat(cid);
        downloadCounter.inc();
        return Buffer.from(data);
    }
    async getHello() {
        return 'Hello World!';
    }
    async listDirectory(cid) {
        const helia = await createHelia();
        const fs = unixfs(helia);
        const entries = [];
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
    async getMetrics() {
        return metricsRegistry.metrics();
    }
    async callNullvana(text) {
        const nullvanaUrl = this.configService.get('NULLVANA_SERVICE_URL');
        if (!nullvanaUrl)
            throw new Error('NULLVANA_SERVICE_URL not set');
        if (!checkIntent(text))
            throw new Error('Zeroth violation: Nullvana call blocked.');
        const response = await this.httpService.post(`${nullvanaUrl}/v1/generate`, { text }).toPromise();
        return response.data;
    }
    async registerUser(username, password) {
        if (!checkIntent(username + password))
            throw new Error('Zeroth violation: Registration blocked.');
        const user = this.userRepo.create({ username, password });
        return this.userRepo.save(user);
    }
    async validateUser(username, password) {
        if (!checkIntent(username + password))
            throw new Error('Zeroth violation: Login blocked.');
        const user = await this.userRepo.findOneBy({ username });
        if (user && user.password === password)
            return user;
        return null;
    }
    async proposeWithPetals(proposal) {
        if (!checkIntent(proposal.rationale + proposal.proposedCode))
            throw new Error('Zeroth violation: Petals proposal blocked.');
        const request = formatProposal(proposal);
        const response = await callPetalsAPI(request);
        await logTrainingCycle(proposal.agentId, response);
        return response;
    }
};
AppService = __decorate([
    Injectable(),
    __param(2, InjectRepository(User)),
    __metadata("design:paramtypes", [ConfigService,
        HttpService,
        Repository])
], AppService);
export { AppService };
//# sourceMappingURL=app.service.js.map