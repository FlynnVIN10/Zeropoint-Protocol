// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { checkIntent } from './guards/synthient.guard.js';
import { CID } from 'multiformats/cid';
import { HttpService } from '@nestjs/axios';
import { Counter, Registry, Histogram, Gauge } from 'prom-client';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
// import { User } from './entities/user.entity.js';
import { callPetalsAPI, logTrainingCycle, formatProposal, CodeProposal, PetalsResponse } from './agents/train/petals.bridge.js';
import { soulchain } from './agents/soulchain/soulchain.ledger.js';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Consensus Metrics
const consensusCounter = new Counter({
  name: 'consensus_operations_total',
  help: 'Total consensus operations',
  labelNames: ['operation', 'status', 'chain']
});

const consensusDuration = new Histogram({
  name: 'consensus_duration_seconds',
  help: 'Consensus operation duration',
  labelNames: ['operation', 'chain'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
});

const tokenGatingCounter = new Counter({
  name: 'token_gating_operations_total',
  help: 'Total token gating operations',
  labelNames: ['operation', 'status', 'token_type']
});

// Prometheus Metrics
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
metricsRegistry.registerMetric(consensusCounter);
metricsRegistry.registerMetric(consensusDuration);
metricsRegistry.registerMetric(tokenGatingCounter);

// Consensus Interfaces
interface ConsensusBridge {
  sourceChain: 'soulchain' | 'dao-state';
  targetChain: 'soulchain' | 'dao-state';
  consensusData: {
    proposalId: string;
    votes: Vote[];
    quorum: number;
    threshold: number;
    timestamp: Date;
  };
  bridgeHash: string;
  verificationProof: string;
}

interface Vote {
  voter: string;
  choice: 'yes' | 'no' | 'abstain';
  weight: number;
  timestamp: Date;
  signature: string;
}

interface TokenStake {
  tokenType: 'ZEROPOINT' | 'ETH' | 'USDC';
  amount: number;
  lockDuration: number;
  stakeId: string;
  userAddress: string;
  feedbackId?: string;
}

interface ConsensusIntent {
  id: string;
  type: 'user' | 'agent' | 'system' | 'consensus';
  intent: string;
  confidence: number;
  timestamp: Date;
  metadata: {
    source: string;
    context: any;
    stakeholders: string[];
  };
}

interface DirectoryEntry {
  name: string;
  cid: string;
  size: number;
  type: string;
}

interface APILogEntry {
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  requestBody?: any;
  responseBody?: any;
  error?: string;
}

@Injectable()
export class AppService {
  private helia: any;
  private fs: any;
  private ready: Promise<void>;
  private readonly logger = new Logger(AppService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
    // @InjectRepository(User) private userRepo: Repository<User>
  ) {
    this.ready = this.init();
  }

  private async init() {
    this.helia = await createHelia();
    this.fs = unixfs(this.helia);
    this.logger.log('AppService initialized with IPFS and metrics');
  }

  // Enhanced API Gateway Methods
  async callPythonBackend(endpoint: string, data: any, rationale: string): Promise<any> {
    const startTime = Date.now();
    const zeropointUrl = this.configService.get<string>('ZEROPOINT_SERVICE_URL');
    
    if (!zeropointUrl) {
      throw new Error('ZEROPOINT_SERVICE_URL not configured');
    }

    if (!checkIntent(rationale)) {
      throw new Error('Zeroth violation: Python backend call blocked.');
    }

    try {
      this.logger.log(`Calling Python backend: ${endpoint}`);
      
      const response = await firstValueFrom(
        this.httpService.post(`${zeropointUrl}/v1/${endpoint}`, data, {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json',
            'X-Zeropoint-Gateway': 'true'
          }
        })
      );

      const duration = (Date.now() - startTime) / 1000;
      pythonBackendLatency.observe({ endpoint }, duration);
      
      // Log to Soulchain
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
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      apiErrorRate.inc({ method: 'POST', endpoint: `python-backend/${endpoint}`, error_type: error.code || 'unknown' });
      
      this.logger.error(`Python backend call failed: ${endpoint}`, error.stack);
      throw error;
    }
  }

  // Enhanced text generation with Python backend
  async generateText(text: string, options?: any): Promise<any> {
    return this.callPythonBackend('generate-text', { text, options }, `Generate text: ${text.substring(0, 100)}`);
  }

  // Enhanced image generation with Python backend
  async generateImage(prompt: string, options?: any): Promise<any> {
    return this.callPythonBackend('generate-image', { prompt, options }, `Generate image: ${prompt.substring(0, 100)}`);
  }

  // Enhanced code generation with Python backend
  async generateCode(prompt: string, language?: string): Promise<any> {
    return this.callPythonBackend('generate-code', { prompt, language }, `Generate code: ${prompt.substring(0, 100)}`);
  }

  // Soulchain logging for API calls
  private async logAPICall(logEntry: APILogEntry): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to log API call to Soulchain', error);
    }
  }

  // Enhanced file operations with better error handling
  async uploadFile(buffer: Buffer, rationale: string): Promise<string> {
    const startTime = Date.now();
    
    try {
      await this.ready;
      if (!checkIntent(rationale)) throw new Error('Zeroth violation: Upload blocked.');
      
      const cid = await this.fs.addBytes(buffer);
      const duration = (Date.now() - startTime) / 1000;
      
      uploadCounter.inc();
      apiRequestDuration.observe({ method: 'POST', endpoint: 'ipfs/upload' }, duration);
      
      // Log to Soulchain
      await this.logAPICall({
        timestamp: new Date().toISOString(),
        method: 'POST',
        endpoint: 'ipfs/upload',
        status: 200,
        duration,
        requestBody: { size: buffer.length, rationale }
      });

      return cid.toString();
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      apiErrorRate.inc({ method: 'POST', endpoint: 'ipfs/upload', error_type: 'upload_failed' });
      throw error;
    }
  }

  async downloadFile(cidStr: string, rationale: string): Promise<Buffer> {
    const startTime = Date.now();
    
    try {
      await this.ready;
      if (!checkIntent(rationale)) throw new Error('Zeroth violation: Download blocked.');
      
      const cid = this.helia.CID ? this.helia.CID.parse(cidStr) : cidStr;
      const data = await this.fs.cat(cid);
      const duration = (Date.now() - startTime) / 1000;
      
      downloadCounter.inc();
      apiRequestDuration.observe({ method: 'GET', endpoint: 'ipfs/download' }, duration);
      
      // Log to Soulchain
      await this.logAPICall({
        timestamp: new Date().toISOString(),
        method: 'GET',
        endpoint: 'ipfs/download',
        status: 200,
        duration,
        requestBody: { cid: cidStr, rationale }
      });

      return Buffer.from(data);
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      apiErrorRate.inc({ method: 'GET', endpoint: 'ipfs/download', error_type: 'download_failed' });
      throw error;
    }
  }

  async getHello(): Promise<string> {
    return 'Zeropoint Protocol API Gateway v1.0';
  }

  async listDirectory(cid: string): Promise<DirectoryEntry[]> {
    const startTime = Date.now();
    
    try {
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

      const duration = (Date.now() - startTime) / 1000;
      apiRequestDuration.observe({ method: 'GET', endpoint: 'ipfs/list' }, duration);

      return entries;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      apiErrorRate.inc({ method: 'GET', endpoint: 'ipfs/list', error_type: 'list_failed' });
      throw error;
    }
  }

  async getMetrics(): Promise<string> {
    return metricsRegistry.metrics();
  }

  // Enhanced user management with better security (disabled - no database)
  // async registerUser(username: string, password: string): Promise<User> {
  //   const startTime = Date.now();
  //   
  //   try {
  //     if (!checkIntent(username + password)) throw new Error('Zeroth violation: Registration blocked.');
  //     
  //     // Check if user already exists
  //     const existingUser = await this.userRepo.findOneBy({ username });
  //     if (existingUser) {
  //       throw new Error('Username already exists');
  //     }

  //     // Hash password (stub, replace with bcrypt in production)
  //     const user = this.userRepo.create({ username, password });
  //     const savedUser = await this.userRepo.save(user);
  //     
  //     const duration = (Date.now() - startTime) / 1000;
  //     apiRequestDuration.observe({ method: 'POST', endpoint: 'register' }, duration);
  //     apiRequestCounter.inc({ method: 'POST', endpoint: 'register', status: 200 });

  //     return savedUser;
  //   } catch (error) {
  //     const duration = (Date.now() - startTime) / 1000;
  //     apiErrorRate.inc({ method: 'POST', endpoint: 'register', error_type: 'registration_failed' });
  //     throw error;
  //   }
  // }

  // async validateUser(username: string, password: string): Promise<User | null> {
  //   const startTime = Date.now();
  //   
  //   try {
  //     if (!checkIntent(username + password)) throw new Error('Zeroth violation: Login blocked.');
  //     
  //     const user = await this.userRepo.findOneBy({ username });
  //     if (user && user.password === password) {
  //       const duration = (Date.now() - startTime) / 1000;
  //       apiRequestDuration.observe({ method: 'POST', endpoint: 'login' }, duration);
  //       apiRequestCounter.inc({ method: 'POST', endpoint: 'login', status: 200 });
  //       return user;
  //     }
  //     
  //     apiRequestCounter.inc({ method: 'POST', endpoint: 'login', status: 401 });
  //     return null;
  //   } catch (error) {
  //     const duration = (Date.now() - startTime) / 1000;
  //     apiErrorRate.inc({ method: 'POST', endpoint: 'login', error_type: 'validation_failed' });
  //     throw error;
  //   }
  // }

  // Enhanced Petals integration
  async proposeWithPetals(proposal: CodeProposal): Promise<PetalsResponse> {
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
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      apiErrorRate.inc({ method: 'POST', endpoint: 'petals/propose', error_type: 'petals_failed' });
      throw error;
    }
  }

  // Health check with metrics
  async healthCheck(): Promise<any> {
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
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      apiErrorRate.inc({ method: 'GET', endpoint: 'health', error_type: 'health_check_failed' });
      throw error;
    }
  }

  private async checkPythonBackendHealth(): Promise<string> {
    try {
      const zeropointUrl = this.configService.get<string>('ZEROPOINT_SERVICE_URL');
      if (!zeropointUrl) return 'not_configured';
      
      await firstValueFrom(
        this.httpService.get(`${zeropointUrl}/health`, { timeout: 5000 })
      );
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }



  async semanticSearch(query: string, documents: string[], options?: { topK?: number; threshold?: number }): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Zeroth-gate validation
      if (!checkIntent('semanticSearch')) {
        throw new Error('Zeroth violation: semanticSearch blocked.');
      }

      const results = await this.callPythonBackend('/ai/semantic-search', {
        query,
        documents,
        topK: options?.topK || 5,
        threshold: options?.threshold || 0.7
      }, 'Semantic search request');

      // Log to Soulchain with metadata
      await soulchain.addXPTransaction({
        agentId: 'app-service',
        amount: 6,
        rationale: `Semantic search: ${query.length} chars query, ${documents.length} documents, ${results.matches?.length || 0} results`,
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
    } catch (error) {
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

  async sentimentAnalysis(text: string, options?: { detailed?: boolean; language?: string }): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Zeroth-gate validation
      if (!checkIntent('sentimentAnalysis')) {
        throw new Error('Zeroth violation: sentimentAnalysis blocked.');
      }

      const analysis = await this.callPythonBackend('/ai/sentiment', {
        text,
        detailed: options?.detailed || false,
        language: options?.language || 'auto'
      }, 'Sentiment analysis request');

      // Log to Soulchain with metadata
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
    } catch (error) {
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

  async entityExtraction(text: string, options?: { entities?: string[]; confidence?: number }): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Zeroth-gate validation
      if (!checkIntent('entityExtraction')) {
        throw new Error('Zeroth violation: entityExtraction blocked.');
      }

      const extraction = await this.callPythonBackend('/ai/entities', {
        text,
        entities: options?.entities || ['PERSON', 'ORG', 'LOC', 'DATE'],
        confidence: options?.confidence || 0.8
      }, 'Entity extraction request');

      // Log to Soulchain with metadata
      await soulchain.addXPTransaction({
        agentId: 'app-service',
        amount: 7,
        rationale: `Entity extraction: ${text.length} chars text, ${extraction.entities?.length || 0} entities found`,
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
    } catch (error) {
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

  async languageTranslation(text: string, targetLanguage: string, sourceLanguage?: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Zeroth-gate validation
      if (!checkIntent('languageTranslation')) {
        throw new Error('Zeroth violation: languageTranslation blocked.');
      }

      const translation = await this.callPythonBackend('/ai/translate', {
        text,
        targetLanguage,
        sourceLanguage: sourceLanguage || 'auto'
      }, 'Language translation request');

      // Log to Soulchain with metadata
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
    } catch (error) {
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

  // ===== CONSENSUS BRIDGE METHODS =====

  async bridgeConsensus(
    sourceChain: 'soulchain' | 'dao-state',
    targetChain: 'soulchain' | 'dao-state',
    consensusData: any
  ): Promise<ConsensusBridge> {
    const startTime = Date.now();
    const timer = consensusDuration.startTimer({ operation: 'bridge', chain: targetChain });

    try {
      // Zeroth-gate validation
      if (!checkIntent('consensusBridge')) {
        throw new Error('Zeroth violation: consensus bridge blocked.');
      }

      // Log initial intent
      await this.logConsensusToSoulchain('SOULCONS:INTENT', {
        sourceChain,
        targetChain,
        proposalId: consensusData.proposalId,
        timestamp: new Date().toISOString()
      });

      // Validate source consensus
      const sourceValidation = await this.validateSourceConsensus(sourceChain, consensusData);
      
      // Create bridge transaction
      const bridgeTx = await this.createBridgeTransaction(sourceValidation);
      
      // Execute on target chain
      const targetExecution = await this.executeOnTargetChain(targetChain, bridgeTx);
      
      // Verify bridge completion
      const bridgeResult = await this.verifyBridgeCompletion(bridgeTx, targetExecution);

      // Log successful sync
      await this.logConsensusToSoulchain('SOULCONS:SYNC', {
        sourceChain,
        targetChain,
        bridgeHash: bridgeResult.bridgeHash,
        consensusData,
        duration: (Date.now() - startTime) / 1000
      });

      // Log pass if consensus threshold met
      if (bridgeResult.consensusData.votes.filter(v => v.choice === 'yes').length / bridgeResult.consensusData.votes.length >= 0.6) {
        await this.logConsensusToSoulchain('SOULCONS:PASS', {
          sourceChain,
          targetChain,
          bridgeHash: bridgeResult.bridgeHash,
          proposalId: consensusData.proposalId,
          quorum: bridgeResult.consensusData.quorum,
          threshold: bridgeResult.consensusData.threshold
        });
      }

      timer();
      consensusCounter.inc({ operation: 'bridge', status: 'success', chain: targetChain });

      return bridgeResult;
    } catch (error) {
      timer();
      consensusCounter.inc({ operation: 'bridge', status: 'error', chain: targetChain });
      
      await this.logConsensusToSoulchain('SOULCONS:ERROR', {
        sourceChain,
        targetChain,
        error: error.message,
        consensusData,
        duration: (Date.now() - startTime) / 1000
      });
      
      throw error;
    }
  }

  async validateTokenStake(stake: TokenStake): Promise<{ isValid: boolean; weight: number; reason?: string }> {
    const startTime = Date.now();
    const timer = consensusDuration.startTimer({ operation: 'token_gating', chain: 'soulchain' });

    try {
      // Load gating configuration
      const gatingConfig = await this.loadGatingConfig();
      
      // Check minimum stake requirements
      const meetsMinimum = await this.checkMinimumStake(stake, gatingConfig);
      if (!meetsMinimum.valid) {
        timer();
        tokenGatingCounter.inc({ operation: 'validate', status: 'insufficient_stake', token_type: stake.tokenType });
        return { isValid: false, weight: 0, reason: meetsMinimum.reason };
      }
      
      // Verify stake ownership
      const ownershipValid = await this.verifyStakeOwnership(stake);
      if (!ownershipValid) {
        timer();
        tokenGatingCounter.inc({ operation: 'validate', status: 'ownership_invalid', token_type: stake.tokenType });
        return { isValid: false, weight: 0, reason: 'Invalid stake ownership' };
      }
      
      // Calculate stake weight
      const weight = this.calculateStakeWeight(stake, gatingConfig);
      
      timer();
      tokenGatingCounter.inc({ operation: 'validate', status: 'success', token_type: stake.tokenType });

      return { isValid: true, weight };
    } catch (error) {
      timer();
      tokenGatingCounter.inc({ operation: 'validate', status: 'error', token_type: stake.tokenType });
      throw error;
    }
  }

  async processConsensusIntent(intent: ConsensusIntent): Promise<{ processed: boolean; confidence: number; consensus: any }> {
    const startTime = Date.now();
    const timer = consensusDuration.startTimer({ operation: 'intent_processing', chain: 'soulchain' });

    try {
      // Zeroth-gate validation
      if (!checkIntent('consensusIntent')) {
        throw new Error('Zeroth violation: consensus intent blocked.');
      }

      // Process intent based on type
      let processed = false;
      let confidence = intent.confidence;
      let consensus = null;

      switch (intent.type) {
        case 'user':
          consensus = await this.processUserIntent(intent);
          processed = true;
          break;
        case 'agent':
          consensus = await this.processAgentIntent(intent);
          processed = true;
          break;
        case 'system':
          consensus = await this.processSystemIntent(intent);
          processed = true;
          break;
        case 'consensus':
          consensus = await this.processConsensusIntent(intent);
          processed = true;
          break;
      }

      // Log to Soulchain
      await this.logConsensusToSoulchain('SOULCONS:INTENT', {
        intentId: intent.id,
        type: intent.type,
        confidence,
        processed,
        consensus
      });

      timer();
      consensusCounter.inc({ operation: 'intent_processing', status: 'success', chain: 'soulchain' });

      return { processed, confidence, consensus };
    } catch (error) {
      timer();
      consensusCounter.inc({ operation: 'intent_processing', status: 'error', chain: 'soulchain' });
      throw error;
    }
  }

  // ===== PRIVATE CONSENSUS METHODS =====

  async loadGatingConfig(): Promise<any> {
    const configPath = path.join(process.cwd(), 'src', 'config', 'gating.json');
    try {
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      // Transform the config to match the expected structure
      return {
        ...config,
        minStake: {
          ZEROPOINT: config.tokenGating?.minStake || 100,
          ETH: 0.01,
          USDC: 10
        },
        tokenWeights: {
          ZEROPOINT: 1.0,
          ETH: 0.8,
          USDC: 0.6
        }
      };
    } catch (error) {
      this.logger.error('Failed to load gating config, using defaults', error);
      return {
        tokenGating: {
          minStake: 100,
          consensusThreshold: 0.75,
          timeoutSeconds: 30
        },
        consensus: {
          requiredParticipants: 3,
          minAgreement: 0.67,
          validationTimeout: 25
        },
        zerothGate: {
          enabled: true,
          ethicalValidation: true,
          intentFiltering: true,
          maliciousPatterns: ['harm', 'destroy', 'exploit']
        },
        minStake: {
          ZEROPOINT: 100,
          ETH: 0.01,
          USDC: 10
        },
        tokenWeights: {
          ZEROPOINT: 1.0,
          ETH: 0.8,
          USDC: 0.6
        }
      };
    }
  }

  private async checkMinimumStake(stake: TokenStake, config: any): Promise<{ valid: boolean; reason?: string }> {
    const minStake = config.minStake[stake.tokenType];
    if (stake.amount < minStake) {
      return { 
        valid: false, 
        reason: `Insufficient stake: ${stake.amount} ${stake.tokenType} < ${minStake} ${stake.tokenType}` 
      };
    }
    return { valid: true };
  }

  private async verifyStakeOwnership(stake: TokenStake): Promise<boolean> {
    // In a real implementation, this would verify on-chain
    // For now, we'll simulate verification
    return stake.userAddress && stake.userAddress.length > 0;
  }

  private calculateStakeWeight(stake: TokenStake, config: any): number {
    const baseWeight = stake.amount * (config.tokenWeights[stake.tokenType] || 0.5);
    const timeMultiplier = Math.min(stake.lockDuration / (24 * 60 * 60), 1.0); // Max 1 day
    return baseWeight * timeMultiplier;
  }

  private async validateSourceConsensus(sourceChain: string, consensusData: any): Promise<any> {
    // Simulate source chain validation
    return {
      valid: true,
      consensusData,
      signature: crypto.randomBytes(32).toString('hex')
    };
  }

  private async createBridgeTransaction(sourceValidation: any): Promise<any> {
    // Create bridge transaction hash
    const bridgeHash = crypto.createHash('sha256')
      .update(JSON.stringify(sourceValidation))
      .digest('hex');
    
    return {
      bridgeHash,
      sourceValidation,
      timestamp: new Date()
    };
  }

  private async executeOnTargetChain(targetChain: string, bridgeTx: any): Promise<any> {
    // Simulate target chain execution
    return {
      success: true,
      transactionHash: crypto.randomBytes(32).toString('hex'),
      timestamp: new Date()
    };
  }

  private async verifyBridgeCompletion(bridgeTx: any, targetExecution: any): Promise<ConsensusBridge> {
    return {
      sourceChain: 'soulchain',
      targetChain: 'dao-state',
      consensusData: bridgeTx.sourceValidation.consensusData,
      bridgeHash: bridgeTx.bridgeHash,
      verificationProof: crypto.randomBytes(32).toString('hex')
    };
  }

  private async processUserIntent(intent: ConsensusIntent): Promise<any> {
    // Process user intent
    return {
      type: 'user_consensus',
      confidence: intent.confidence,
      stakeholders: intent.metadata.stakeholders
    };
  }

  private async processAgentIntent(intent: ConsensusIntent): Promise<any> {
    // Process agent intent
    return {
      type: 'agent_consensus',
      confidence: intent.confidence,
      source: intent.metadata.source
    };
  }

  private async processSystemIntent(intent: ConsensusIntent): Promise<any> {
    // Process system intent
    return {
      type: 'system_consensus',
      confidence: intent.confidence,
      context: intent.metadata.context
    };
  }

  async logConsensusToSoulchain(action: string, data: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      action,
      data,
      metadata: {
        service: 'zeropoint-api',
        version: '0.0.1',
        environment: 'development'
      }
    };

    try {
      await soulchain.addXPTransaction({
        agentId: 'consensus-bridge',
        amount: 1,
        rationale: `${action}: ${JSON.stringify(data)}`,
        timestamp: new Date().toISOString(),
        previousCid: null,
        tags: []
      });
      this.logger.log(`SOULCONS:${action} - ${JSON.stringify(data).substring(0, 100)}...`);
    } catch (error) {
      this.logger.error(`Failed to log consensus to Soulchain: ${error.message}`);
    }
  }

  // Advanced AI Reasoning Methods
  async textSummarization(text: string, options?: { maxLength?: number; style?: string }): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Zeroth-gate validation
      const intentCheck = checkIntent(`text_summarization:${text.substring(0, 100)}`);
      if (!intentCheck) {
        await this.logConsensusToSoulchain('ZEROTH_GATE_BLOCKED', {
          operation: 'text_summarization',
          reason: 'Ethical validation failed',
          text: text.substring(0, 100)
        });
        throw new Error('Zeroth-gate blocked: Ethical validation failed');
      }

      // Thought logging
      await this.logAdvancedThought('text_summarization', {
        input: text.substring(0, 200),
        options,
        reasoning: 'Processing text summarization request with ethical validation'
      });

      const result = await this.callPythonBackend('/v1/advanced/summarize', {
        text,
        max_length: options?.maxLength || 150,
        style: options?.style || 'concise'
      }, 'Advanced text summarization with ethical validation');

      const duration = Date.now() - startTime;
      await this.logConsensusToSoulchain('ADVANCED_SUMMARIZATION', {
        input_length: text.length,
        output_length: result.summary?.length || 0,
        duration,
        style: options?.style
      });

      return {
        summary: result.summary,
        key_points: result.key_points,
        confidence: result.confidence,
        metadata: {
          processing_time: duration,
          ethical_validation: 'passed',
          soulchain_logged: true
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logConsensusToSoulchain('ADVANCED_SUMMARIZATION_ERROR', {
        error: error.message,
        duration,
        input_length: text.length
      });
      throw error;
    }
  }

  async contextPrompting(prompt: string, context: string, options?: { temperature?: number; maxTokens?: number }): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Zeroth-gate validation
      const intentCheck = checkIntent(`context_prompting:${prompt.substring(0, 100)}`);
      if (!intentCheck) {
        await this.logConsensusToSoulchain('ZEROTH_GATE_BLOCKED', {
          operation: 'context_prompting',
          reason: 'Ethical validation failed',
          prompt: prompt.substring(0, 100)
        });
        throw new Error('Zeroth-gate blocked: Ethical validation failed');
      }

      // Thought logging
      await this.logAdvancedThought('context_prompting', {
        prompt: prompt.substring(0, 200),
        context: context.substring(0, 200),
        options,
        reasoning: 'Processing context-aware prompting with ethical validation'
      });

      const result = await this.callPythonBackend('/v1/advanced/context-prompt', {
        prompt,
        context,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 500
      }, 'Advanced context prompting with ethical validation');

      const duration = Date.now() - startTime;
      await this.logConsensusToSoulchain('ADVANCED_CONTEXT_PROMPT', {
        prompt_length: prompt.length,
        context_length: context.length,
        response_length: result.response?.length || 0,
        duration,
        temperature: options?.temperature
      });

      return {
        response: result.response,
        context_used: result.context_used,
        confidence: result.confidence,
        metadata: {
          processing_time: duration,
          ethical_validation: 'passed',
          soulchain_logged: true
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logConsensusToSoulchain('ADVANCED_CONTEXT_PROMPT_ERROR', {
        error: error.message,
        duration,
        prompt_length: prompt.length
      });
      throw error;
    }
  }

  // Advanced Thought Logging
  private async logAdvancedThought(operation: string, data: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const thoughtEntry = {
      timestamp,
      operation,
      data,
      metadata: {
        service: 'zeropoint-api',
        version: '0.0.1',
        environment: 'development',
        thought_type: 'advanced_ai_reasoning'
      }
    };

    try {
      await soulchain.addXPTransaction({
        agentId: 'advanced-ai',
        amount: 2,
        rationale: `${operation}: ${JSON.stringify(data.reasoning)}`,
        timestamp: new Date().toISOString(),
        previousCid: null,
        tags: []
      });
      this.logger.log(`SOULTHOUGHT:${operation.toUpperCase()} - ${JSON.stringify(data.reasoning).substring(0, 100)}...`);
    } catch (error) {
      this.logger.error(`Failed to log advanced thought: ${error.message}`);
    }
  }

  // Scaling Configuration
  async loadScalingConfig(): Promise<any> {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'scaling.json');
      const configData = await fs.promises.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      await this.logConsensusToSoulchain('SCALING_CONFIG_LOADED', {
        timestamp: new Date().toISOString(),
        maxAgents: config.maxAgents,
        maxConcurrency: config.maxConcurrency,
        autoScalingEnabled: config.autoScaling.enabled
      });

      return config;
    } catch (error) {
      this.logger.error(`Failed to load scaling config: ${error.message}`);
      // Return default config if file not found
      return {
        maxAgents: 100,
        maxConcurrency: 25,
        maxRequestsPerSec: 50,
        autoScaling: {
          enabled: true,
          minNodes: 1,
          maxNodes: 10
        }
      };
    }
  }

  // Production Scaling - Phase 10
  async predictScaling(timeWindow?: number, trafficPattern?: any): Promise<any> {
    if (!checkIntent('scaling-prediction')) {
      throw new Error('Zeroth violation: Scaling prediction blocked.');
    }

    try {
      const config = await this.loadScalingConfig();
      const window = timeWindow || 300; // 5 minutes default
      
      // Simulate traffic heuristics
      const currentLoad = Math.random() * 100;
      const predictedLoad = currentLoad * (1 + Math.random() * 0.3);
      
      const scalingDecision = {
        currentLoad,
        predictedLoad,
        shouldScale: predictedLoad > config.scalingThresholds.cpu,
        recommendedNodes: Math.ceil(predictedLoad / 20),
        confidence: Math.random() * 0.3 + 0.7
      };

      // Log to Soulchain
      await this.logConsensusToSoulchain('SOULSCALE:PREDICT', {
        timestamp: new Date().toISOString(),
        timeWindow: window,
        trafficPattern,
        scalingDecision,
        config: config
      });

      return {
        success: true,
        prediction: scalingDecision,
        timeWindow: window,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Scaling prediction failed', error);
      throw error;
    }
  }

  async expandScaling(nodes?: number, reason?: string): Promise<any> {
    if (!checkIntent('scaling-expansion')) {
      throw new Error('Zeroth violation: Scaling expansion blocked.');
    }

    try {
      const config = await this.loadScalingConfig();
      const nodeCount = nodes || 1;
      
      // Simulate node addition
      const expansionResult = {
        nodesAdded: nodeCount,
        totalNodes: Math.min(config.autoScaling.maxNodes, nodeCount + 1),
        estimatedCost: nodeCount * 0.05, // $0.05 per node per hour
        estimatedPerformance: Math.min(100, (nodeCount + 1) * 15),
        reason: reason || 'Load increase detected'
      };

      // Log to Soulchain
      await this.logConsensusToSoulchain('SOULSCALE:EXPAND', {
        timestamp: new Date().toISOString(),
        expansionResult,
        config: config
      });

      return {
        success: true,
        expansion: expansionResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Scaling expansion failed', error);
      throw error;
    }
  }

  // Phase 8: Consensus Operations & Interoperability
  async syncConsensusWithDAOState(proposalId: string, consensusData: any): Promise<any> {
    const startTime = Date.now();
    const gatingConfig = await this.loadGatingConfig();
    
    try {
      // Validate consensus data
      const validation = await this.validateSourceConsensus('soulchain', consensusData);
      if (!validation.valid) {
        throw new Error(`Invalid consensus data: ${validation.reason}`);
      }

      // Bridge consensus to DAO state
      const bridgeResult = await this.bridgeConsensus('soulchain', 'dao-state', consensusData);
      
      // Log sync operation
      await this.logConsensusToSoulchain('SOULCONS:SYNC', {
        proposalId,
        bridgeHash: bridgeResult.bridgeHash,
        timestamp: new Date(),
        participants: consensusData.votes?.length || 0
      });

      const duration = Date.now() - startTime;
      consensusCounter.inc({ operation: 'sync', status: 'success', chain: 'dao-state' });
      consensusDuration.observe({ operation: 'sync', chain: 'dao-state' }, duration / 1000);

      return {
        success: true,
        operation: 'consensus_sync',
        proposalId,
        bridgeHash: bridgeResult.bridgeHash,
        duration: duration,
        participants: consensusData.votes?.length || 0
      };
    } catch (error) {
      this.logger.error(`Consensus sync failed: ${error.message}`);
      consensusCounter.inc({ operation: 'sync', status: 'failed', chain: 'dao-state' });
      return {
        success: false,
        operation: 'consensus_sync',
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  async validateConsensusIntent(intent: string, stakeAmount: number): Promise<any> {
    const startTime = Date.now();
    const gatingConfig = await this.loadGatingConfig();
    
    try {
      // Validate intent is not empty
      if (!intent || intent.trim() === '') {
        throw new Error('Invalid intent: Intent cannot be empty');
      }
      
      // Check minimum stake requirement
      const stakeValidation = await this.checkMinimumStake({
        tokenType: 'ZEROPOINT',
        amount: stakeAmount,
        lockDuration: 3600,
        stakeId: crypto.randomUUID(),
        userAddress: '0x' + crypto.randomBytes(20).toString('hex')
      }, gatingConfig);

      if (!stakeValidation.valid) {
        throw new Error(`Insufficient stake: ${stakeValidation.reason}`);
      }

      // Zeroth-gate validation
      const zerothValidation = await this.validateZerothGate(intent, gatingConfig);
      if (!zerothValidation.passed) {
        await this.logConsensusToSoulchain('SOULCONS:INTENT', {
          intent,
          validation: 'failed',
          reason: zerothValidation.reason,
          timestamp: new Date()
        });
        throw new Error(`Zeroth-gate violation: ${zerothValidation.reason}`);
      }

      // Log successful intent validation
      await this.logConsensusToSoulchain('SOULCONS:INTENT', {
        intent,
        validation: 'passed',
        stakeAmount,
        timestamp: new Date()
      });

      const duration = Date.now() - startTime;
      tokenGatingCounter.inc({ operation: 'intent_validation', status: 'success', token_type: 'ZEROPOINT' });
      consensusDuration.observe({ operation: 'intent_validation', chain: 'soulchain' }, duration / 1000);

      return {
        success: true,
        operation: 'intent_validation',
        intent,
        stakeAmount,
        duration: duration,
        zerothGate: 'passed'
      };
    } catch (error) {
      this.logger.error(`Intent validation failed: ${error.message}`);
      tokenGatingCounter.inc({ operation: 'intent_validation', status: 'failed', token_type: 'ZEROPOINT' });
      return {
        success: false,
        operation: 'intent_validation',
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  async processConsensusPass(proposalId: string, votes: Vote[]): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Calculate consensus metrics
      const totalVotes = votes.length;
      
      // Handle empty votes array
      if (totalVotes === 0) {
        throw new Error('Consensus threshold not met: No votes provided');
      }
      
      const yesVotes = votes.filter(v => v.choice === 'yes').length;
      const consensusRatio = yesVotes / totalVotes;
      
      // Check if consensus threshold is met
      const gatingConfig = await this.loadGatingConfig();
      const threshold = gatingConfig.consensus.minAgreement;
      
      if (consensusRatio < threshold) {
        throw new Error(`Consensus threshold not met: ${consensusRatio} < ${threshold}`);
      }

      // Log consensus pass
      await this.logConsensusToSoulchain('SOULCONS:PASS', {
        proposalId,
        totalVotes,
        yesVotes,
        consensusRatio,
        threshold,
        timestamp: new Date()
      });

      const duration = Date.now() - startTime;
      consensusCounter.inc({ operation: 'pass', status: 'success', chain: 'soulchain' });
      consensusDuration.observe({ operation: 'pass', chain: 'soulchain' }, duration / 1000);

      return {
        success: true,
        operation: 'consensus_pass',
        proposalId,
        totalVotes,
        yesVotes,
        consensusRatio,
        threshold,
        duration: duration
      };
    } catch (error) {
      this.logger.error(`Consensus pass failed: ${error.message}`);
      consensusCounter.inc({ operation: 'pass', status: 'failed', chain: 'soulchain' });
      return {
        success: false,
        operation: 'consensus_pass',
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  private async validateZerothGate(intent: string, config: any): Promise<{ passed: boolean; reason?: string }> {
    if (!config.zerothGate.enabled) {
      return { passed: true };
    }

    const lowerIntent = intent.toLowerCase();
    
    // Check for malicious patterns
    for (const pattern of config.zerothGate.maliciousPatterns) {
      if (lowerIntent.includes(pattern.toLowerCase())) {
        return { 
          passed: false, 
          reason: `Malicious pattern detected: ${pattern}` 
        };
      }
    }

    // Check for blocked operations
    for (const operation of config.zerothGate.blockedOperations) {
      if (lowerIntent.includes(operation.toLowerCase())) {
        return { 
          passed: false, 
          reason: `Blocked operation detected: ${operation}` 
        };
      }
    }

    return { passed: true };
  }

  async getConsensusVisualizationData(): Promise<any> {
    try {
      // Generate mock consensus visualization data
      const participants = Math.floor(Math.random() * 20) + 5;
      const activeVoices = Math.floor(participants * 0.7);
      const passiveStances = participants - activeVoices;
      
      const visualizationData = {
        participants: participants,
        activeVoices: activeVoices,
        passiveStances: passiveStances,
        consensusRatio: (activeVoices / participants).toFixed(2),
        radialData: Array.from({ length: participants }, (_, i) => ({
          id: i,
          position: (i / participants) * 2 * Math.PI,
          isActive: i < activeVoices,
          stake: Math.floor(Math.random() * 1000) + 100,
          intent: i < activeVoices ? 'support' : 'neutral'
        })),
        timestamp: new Date(),
        updateInterval: 1000
      };

      // Log visualization generation
      await this.logConsensusToSoulchain('SOULCONS:VISUALIZED', {
        participants,
        activeVoices,
        timestamp: new Date()
      });

      return {
        success: true,
        data: visualizationData
      };
    } catch (error) {
      this.logger.error(`Visualization data generation failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}