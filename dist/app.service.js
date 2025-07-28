var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AppService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { checkIntent } from './guards/synthient.guard.js';
import { CID } from 'multiformats/cid';
import { HttpService } from '@nestjs/axios';
import { Counter, Registry, Histogram, Gauge } from 'prom-client';
import { callPetalsAPI, logTrainingCycle, formatProposal } from './agents/train/petals.bridge.js';
import { soulchain } from './agents/soulchain/soulchain.ledger.js';
import { firstValueFrom } from 'rxjs';
const apiRequestCounter = new Counter({
    name: 'api_requests_total',
    help: 'Total API requests',
    labelNames: ['method', 'endpoint', 'status']
});
const apiRequestDuration = new Histogram({
    name: 'api_request_duration_seconds',
    help: 'API request duration in seconds',
    labelNames: ['method', 'endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5]
});
const apiErrorRate = new Counter({
    name: 'api_errors_total',
    help: 'Total API errors',
    labelNames: ['method', 'endpoint', 'error_type']
});
const pythonBackendLatency = new Histogram({
    name: 'python_backend_latency_seconds',
    help: 'Python backend request latency',
    labelNames: ['endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5]
});
const activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections'
});
const uploadCounter = new Counter({ name: 'ipfs_uploads_total', help: 'Total IPFS uploads' });
const downloadCounter = new Counter({ name: 'ipfs_downloads_total', help: 'Total IPFS downloads' });
const metricsRegistry = new Registry();
metricsRegistry.registerMetric(apiRequestCounter);
metricsRegistry.registerMetric(apiRequestDuration);
metricsRegistry.registerMetric(apiErrorRate);
metricsRegistry.registerMetric(pythonBackendLatency);
metricsRegistry.registerMetric(activeConnections);
metricsRegistry.registerMetric(uploadCounter);
metricsRegistry.registerMetric(downloadCounter);
let AppService = AppService_1 = class AppService {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new Logger(AppService_1.name);
        this.ready = this.init();
    }
    async init() {
        this.helia = await createHelia();
        this.fs = unixfs(this.helia);
        this.logger.log('AppService initialized with IPFS and metrics');
    }
    async callPythonBackend(endpoint, data, rationale) {
        const startTime = Date.now();
        const zeropointUrl = this.configService.get('ZEROPOINT_SERVICE_URL');
        if (!zeropointUrl) {
            throw new Error('ZEROPOINT_SERVICE_URL not configured');
        }
        if (!checkIntent(rationale)) {
            throw new Error('Zeroth violation: Python backend call blocked.');
        }
        try {
            this.logger.log(`Calling Python backend: ${endpoint}`);
            const response = await firstValueFrom(this.httpService.post(`${zeropointUrl}/v1/${endpoint}`, data, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Zeropoint-Gateway': 'true'
                }
            }));
            const duration = (Date.now() - startTime) / 1000;
            pythonBackendLatency.observe({ endpoint }, duration);
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: `python-backend/${endpoint}`,
                status: response.status,
                duration,
                requestBody: data,
                responseBody: response.data
            });
            return response.data;
        }
        catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            apiErrorRate.inc({ method: 'POST', endpoint: `python-backend/${endpoint}`, error_type: error.code || 'unknown' });
            this.logger.error(`Python backend call failed: ${endpoint}`, error.stack);
            throw error;
        }
    }
    async generateText(text, options) {
        return this.callPythonBackend('generate-text', { text, options }, `Generate text: ${text.substring(0, 100)}`);
    }
    async generateImage(prompt, options) {
        return this.callPythonBackend('generate-image', { prompt, options }, `Generate image: ${prompt.substring(0, 100)}`);
    }
    async generateCode(prompt, language) {
        return this.callPythonBackend('generate-code', { prompt, language }, `Generate code: ${prompt.substring(0, 100)}`);
    }
    async logAPICall(logEntry) {
        try {
            await soulchain.addXPTransaction({
                agentId: 'api-gateway',
                amount: 1,
                rationale: `API Call: ${logEntry.method} ${logEntry.endpoint} - Status: ${logEntry.status}`,
                timestamp: logEntry.timestamp,
                previousCid: null,
                tags: [
                    {
                        type: '#who',
                        name: 'api-gateway',
                        did: 'did:zeropoint:api-gateway',
                        handle: '@api-gateway'
                    },
                    {
                        type: '#intent',
                        purpose: '#api-log',
                        validation: 'good-heart'
                    },
                    {
                        type: '#thread',
                        taskId: 'api-gateway-log',
                        lineage: [],
                        swarmLink: ''
                    },
                    {
                        type: '#layer',
                        level: '#live'
                    },
                    {
                        type: '#domain',
                        field: '#api'
                    }
                ]
            });
        }
        catch (error) {
            this.logger.error('Failed to log API call to Soulchain', error);
        }
    }
    async uploadFile(buffer, rationale) {
        const startTime = Date.now();
        try {
            await this.ready;
            if (!checkIntent(rationale))
                throw new Error('Zeroth violation: Upload blocked.');
            const cid = await this.fs.addBytes(buffer);
            const duration = (Date.now() - startTime) / 1000;
            uploadCounter.inc();
            apiRequestDuration.observe({ method: 'POST', endpoint: 'ipfs/upload' }, duration);
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: 'ipfs/upload',
                status: 200,
                duration,
                requestBody: { size: buffer.length, rationale }
            });
            return cid.toString();
        }
        catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            apiErrorRate.inc({ method: 'POST', endpoint: 'ipfs/upload', error_type: 'upload_failed' });
            throw error;
        }
    }
    async downloadFile(cidStr, rationale) {
        const startTime = Date.now();
        try {
            await this.ready;
            if (!checkIntent(rationale))
                throw new Error('Zeroth violation: Download blocked.');
            const cid = this.helia.CID ? this.helia.CID.parse(cidStr) : cidStr;
            const data = await this.fs.cat(cid);
            const duration = (Date.now() - startTime) / 1000;
            downloadCounter.inc();
            apiRequestDuration.observe({ method: 'GET', endpoint: 'ipfs/download' }, duration);
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'GET',
                endpoint: 'ipfs/download',
                status: 200,
                duration,
                requestBody: { cid: cidStr, rationale }
            });
            return Buffer.from(data);
        }
        catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            apiErrorRate.inc({ method: 'GET', endpoint: 'ipfs/download', error_type: 'download_failed' });
            throw error;
        }
    }
    async getHello() {
        return 'Zeropoint Protocol API Gateway v1.0';
    }
    async listDirectory(cid) {
        const startTime = Date.now();
        try {
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
            const duration = (Date.now() - startTime) / 1000;
            apiRequestDuration.observe({ method: 'GET', endpoint: 'ipfs/list' }, duration);
            return entries;
        }
        catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            apiErrorRate.inc({ method: 'GET', endpoint: 'ipfs/list', error_type: 'list_failed' });
            throw error;
        }
    }
    async getMetrics() {
        return metricsRegistry.metrics();
    }
    async proposeWithPetals(proposal) {
        const startTime = Date.now();
        try {
            if (!checkIntent(proposal.rationale + proposal.proposedCode)) {
                throw new Error('Zeroth violation: Petals proposal blocked.');
            }
            const request = formatProposal(proposal);
            const response = await callPetalsAPI(request);
            await logTrainingCycle(proposal.agentId, response);
            const duration = (Date.now() - startTime) / 1000;
            apiRequestDuration.observe({ method: 'POST', endpoint: 'petals/propose' }, duration);
            return response;
        }
        catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            apiErrorRate.inc({ method: 'POST', endpoint: 'petals/propose', error_type: 'petals_failed' });
            throw error;
        }
    }
    async healthCheck() {
        const startTime = Date.now();
        try {
            const health = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                services: {
                    database: 'connected',
                    ipfs: 'ready',
                    python_backend: await this.checkPythonBackendHealth()
                },
                metrics: {
                    active_connections: activeConnections.get(),
                    uptime: process.uptime()
                }
            };
            const duration = (Date.now() - startTime) / 1000;
            apiRequestDuration.observe({ method: 'GET', endpoint: 'health' }, duration);
            return health;
        }
        catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            apiErrorRate.inc({ method: 'GET', endpoint: 'health', error_type: 'health_check_failed' });
            throw error;
        }
    }
    async checkPythonBackendHealth() {
        try {
            const zeropointUrl = this.configService.get('ZEROPOINT_SERVICE_URL');
            if (!zeropointUrl)
                return 'not_configured';
            await firstValueFrom(this.httpService.get(`${zeropointUrl}/health`, { timeout: 5000 }));
            return 'healthy';
        }
        catch (error) {
            return 'unhealthy';
        }
    }
    async textSummarization(text, options) {
        var _a;
        const startTime = Date.now();
        try {
            if (!checkIntent('textSummarization')) {
                throw new Error('Zeroth violation: textSummarization blocked.');
            }
            const summary = await this.callPythonBackend('/ai/summarize', {
                text,
                maxLength: (options === null || options === void 0 ? void 0 : options.maxLength) || 150,
                style: (options === null || options === void 0 ? void 0 : options.style) || 'concise'
            }, 'Text summarization request');
            await soulchain.addXPTransaction({
                agentId: 'app-service',
                amount: 5,
                rationale: `Text summarization: ${text.length} chars input, ${((_a = summary.summary) === null || _a === void 0 ? void 0 : _a.length) || 0} chars output, style: ${(options === null || options === void 0 ? void 0 : options.style) || 'concise'}`,
                timestamp: new Date().toISOString(),
                previousCid: null,
                tags: [
                    {
                        type: '#who',
                        name: 'app-service',
                        did: 'did:zeropoint:app-service',
                        handle: '@app-service'
                    },
                    {
                        type: '#intent',
                        purpose: '#ai-operation',
                        validation: 'good-heart'
                    },
                    {
                        type: '#thread',
                        taskId: 'text_summarization',
                        lineage: ['ai', 'nlp'],
                        swarmLink: 'text-summarization-swarm'
                    },
                    {
                        type: '#layer',
                        level: '#live'
                    },
                    {
                        type: '#domain',
                        field: '#ai'
                    }
                ]
            });
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/summarize',
                status: 200,
                duration,
                requestBody: { text, options },
                responseBody: summary
            });
            return summary;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/summarize',
                status: 500,
                duration,
                requestBody: { text, options },
                error: error.message
            });
            throw error;
        }
    }
    async contextPrompting(prompt, context, options) {
        var _a;
        const startTime = Date.now();
        try {
            if (!checkIntent('contextPrompting')) {
                throw new Error('Zeroth violation: contextPrompting blocked.');
            }
            const response = await this.callPythonBackend('/ai/context-prompt', {
                prompt,
                context,
                temperature: (options === null || options === void 0 ? void 0 : options.temperature) || 0.7,
                maxTokens: (options === null || options === void 0 ? void 0 : options.maxTokens) || 1000
            }, 'Context-aware prompting request');
            await soulchain.addXPTransaction({
                agentId: 'app-service',
                amount: 8,
                rationale: `Context prompting: ${prompt.length} chars prompt, ${context.length} chars context, ${((_a = response.response) === null || _a === void 0 ? void 0 : _a.length) || 0} chars response`,
                timestamp: new Date().toISOString(),
                previousCid: null,
                tags: [
                    {
                        type: '#who',
                        name: 'app-service',
                        did: 'did:zeropoint:app-service',
                        handle: '@app-service'
                    },
                    {
                        type: '#intent',
                        purpose: '#ai-operation',
                        validation: 'good-heart'
                    },
                    {
                        type: '#thread',
                        taskId: 'context_prompting',
                        lineage: ['ai', 'nlp'],
                        swarmLink: 'context-prompting-swarm'
                    },
                    {
                        type: '#layer',
                        level: '#live'
                    },
                    {
                        type: '#domain',
                        field: '#ai'
                    }
                ]
            });
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/context-prompt',
                status: 200,
                duration,
                requestBody: { prompt, context, options },
                responseBody: response
            });
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/context-prompt',
                status: 500,
                duration,
                requestBody: { prompt, context, options },
                error: error.message
            });
            throw error;
        }
    }
    async semanticSearch(query, documents, options) {
        var _a;
        const startTime = Date.now();
        try {
            if (!checkIntent('semanticSearch')) {
                throw new Error('Zeroth violation: semanticSearch blocked.');
            }
            const results = await this.callPythonBackend('/ai/semantic-search', {
                query,
                documents,
                topK: (options === null || options === void 0 ? void 0 : options.topK) || 5,
                threshold: (options === null || options === void 0 ? void 0 : options.threshold) || 0.7
            }, 'Semantic search request');
            await soulchain.addXPTransaction({
                agentId: 'app-service',
                amount: 6,
                rationale: `Semantic search: ${query.length} chars query, ${documents.length} documents, ${((_a = results.matches) === null || _a === void 0 ? void 0 : _a.length) || 0} results`,
                timestamp: new Date().toISOString(),
                previousCid: null,
                tags: [
                    {
                        type: '#who',
                        name: 'app-service',
                        did: 'did:zeropoint:app-service',
                        handle: '@app-service'
                    },
                    {
                        type: '#intent',
                        purpose: '#ai-operation',
                        validation: 'good-heart'
                    },
                    {
                        type: '#thread',
                        taskId: 'semantic_search',
                        lineage: ['ai', 'search'],
                        swarmLink: 'semantic-search-swarm'
                    },
                    {
                        type: '#layer',
                        level: '#live'
                    },
                    {
                        type: '#domain',
                        field: '#ai'
                    }
                ]
            });
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/semantic-search',
                status: 200,
                duration,
                requestBody: { query, documents, options },
                responseBody: results
            });
            return results;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/semantic-search',
                status: 500,
                duration,
                requestBody: { query, documents, options },
                error: error.message
            });
            throw error;
        }
    }
    async sentimentAnalysis(text, options) {
        const startTime = Date.now();
        try {
            if (!checkIntent('sentimentAnalysis')) {
                throw new Error('Zeroth violation: sentimentAnalysis blocked.');
            }
            const analysis = await this.callPythonBackend('/ai/sentiment', {
                text,
                detailed: (options === null || options === void 0 ? void 0 : options.detailed) || false,
                language: (options === null || options === void 0 ? void 0 : options.language) || 'auto'
            }, 'Sentiment analysis request');
            await soulchain.addXPTransaction({
                agentId: 'app-service',
                amount: 4,
                rationale: `Sentiment analysis: ${text.length} chars text, sentiment: ${analysis.sentiment}, confidence: ${analysis.confidence}`,
                timestamp: new Date().toISOString(),
                previousCid: null,
                tags: [
                    {
                        type: '#who',
                        name: 'app-service',
                        did: 'did:zeropoint:app-service',
                        handle: '@app-service'
                    },
                    {
                        type: '#intent',
                        purpose: '#ai-operation',
                        validation: 'good-heart'
                    },
                    {
                        type: '#thread',
                        taskId: 'sentiment_analysis',
                        lineage: ['ai', 'nlp'],
                        swarmLink: 'sentiment-analysis-swarm'
                    },
                    {
                        type: '#layer',
                        level: '#live'
                    },
                    {
                        type: '#domain',
                        field: '#ai'
                    }
                ]
            });
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/sentiment',
                status: 200,
                duration,
                requestBody: { text, options },
                responseBody: analysis
            });
            return analysis;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/sentiment',
                status: 500,
                duration,
                requestBody: { text, options },
                error: error.message
            });
            throw error;
        }
    }
    async entityExtraction(text, options) {
        var _a;
        const startTime = Date.now();
        try {
            if (!checkIntent('entityExtraction')) {
                throw new Error('Zeroth violation: entityExtraction blocked.');
            }
            const extraction = await this.callPythonBackend('/ai/entities', {
                text,
                entities: (options === null || options === void 0 ? void 0 : options.entities) || ['PERSON', 'ORG', 'LOC', 'DATE'],
                confidence: (options === null || options === void 0 ? void 0 : options.confidence) || 0.8
            }, 'Entity extraction request');
            await soulchain.addXPTransaction({
                agentId: 'app-service',
                amount: 7,
                rationale: `Entity extraction: ${text.length} chars text, ${((_a = extraction.entities) === null || _a === void 0 ? void 0 : _a.length) || 0} entities found`,
                timestamp: new Date().toISOString(),
                previousCid: null,
                tags: [
                    {
                        type: '#who',
                        name: 'app-service',
                        did: 'did:zeropoint:app-service',
                        handle: '@app-service'
                    },
                    {
                        type: '#intent',
                        purpose: '#ai-operation',
                        validation: 'good-heart'
                    },
                    {
                        type: '#thread',
                        taskId: 'entity_extraction',
                        lineage: ['ai', 'nlp'],
                        swarmLink: 'entity-extraction-swarm'
                    },
                    {
                        type: '#layer',
                        level: '#live'
                    },
                    {
                        type: '#domain',
                        field: '#ai'
                    }
                ]
            });
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/entities',
                status: 200,
                duration,
                requestBody: { text, options },
                responseBody: extraction
            });
            return extraction;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/entities',
                status: 500,
                duration,
                requestBody: { text, options },
                error: error.message
            });
            throw error;
        }
    }
    async languageTranslation(text, targetLanguage, sourceLanguage) {
        const startTime = Date.now();
        try {
            if (!checkIntent('languageTranslation')) {
                throw new Error('Zeroth violation: languageTranslation blocked.');
            }
            const translation = await this.callPythonBackend('/ai/translate', {
                text,
                targetLanguage,
                sourceLanguage: sourceLanguage || 'auto'
            }, 'Language translation request');
            await soulchain.addXPTransaction({
                agentId: 'app-service',
                amount: 5,
                rationale: `Language translation: ${text.length} chars from ${translation.detectedLanguage || sourceLanguage || 'auto'} to ${targetLanguage}`,
                timestamp: new Date().toISOString(),
                previousCid: null,
                tags: [
                    {
                        type: '#who',
                        name: 'app-service',
                        did: 'did:zeropoint:app-service',
                        handle: '@app-service'
                    },
                    {
                        type: '#intent',
                        purpose: '#ai-operation',
                        validation: 'good-heart'
                    },
                    {
                        type: '#thread',
                        taskId: 'language_translation',
                        lineage: ['ai', 'nlp'],
                        swarmLink: 'language-translation-swarm'
                    },
                    {
                        type: '#layer',
                        level: '#live'
                    },
                    {
                        type: '#domain',
                        field: '#ai'
                    }
                ]
            });
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/translate',
                status: 200,
                duration,
                requestBody: { text, targetLanguage, sourceLanguage },
                responseBody: translation
            });
            return translation;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await this.logAPICall({
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/v1/advanced/translate',
                status: 500,
                duration,
                requestBody: { text, targetLanguage, sourceLanguage },
                error: error.message
            });
            throw error;
        }
    }
};
AppService = AppService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService,
        HttpService])
], AppService);
export { AppService };
//# sourceMappingURL=app.service.js.map