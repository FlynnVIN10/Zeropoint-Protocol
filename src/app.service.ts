// © [2025] Zeropoint Protocol, LLC. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { checkIntent } from './guards/synthient.guard.js';
import { CID } from 'multiformats/cid';
import { HttpService } from '@nestjs/axios';
import { Counter, Registry, Histogram, Gauge } from 'prom-client';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { callPetalsAPI, logTrainingCycle, formatProposal, CodeProposal, PetalsResponse } from './agents/train/petals.bridge.js';
import { soulchain } from './agents/soulchain/soulchain.ledger.js';
import { firstValueFrom } from 'rxjs';

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
    private httpService: HttpService,
    @InjectRepository(User) private userRepo: Repository<User>
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

  // Enhanced user management with better security
  async registerUser(username: string, password: string): Promise<User> {
    const startTime = Date.now();
    
    try {
      if (!checkIntent(username + password)) throw new Error('Zeroth violation: Registration blocked.');
      
      // Check if user already exists
      const existingUser = await this.userRepo.findOneBy({ username });
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Hash password (stub, replace with bcrypt in production)
      const user = this.userRepo.create({ username, password });
      const savedUser = await this.userRepo.save(user);
      
      const duration = (Date.now() - startTime) / 1000;
      apiRequestDuration.observe({ method: 'POST', endpoint: 'register' }, duration);
      apiRequestCounter.inc({ method: 'POST', endpoint: 'register', status: 200 });

      return savedUser;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      apiErrorRate.inc({ method: 'POST', endpoint: 'register', error_type: 'registration_failed' });
      throw error;
    }
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const startTime = Date.now();
    
    try {
      if (!checkIntent(username + password)) throw new Error('Zeroth violation: Login blocked.');
      
      const user = await this.userRepo.findOneBy({ username });
      if (user && user.password === password) {
        const duration = (Date.now() - startTime) / 1000;
        apiRequestDuration.observe({ method: 'POST', endpoint: 'login' }, duration);
        apiRequestCounter.inc({ method: 'POST', endpoint: 'login', status: 200 });
        return user;
      }
      
      apiRequestCounter.inc({ method: 'POST', endpoint: 'login', status: 401 });
      return null;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      apiErrorRate.inc({ method: 'POST', endpoint: 'login', error_type: 'validation_failed' });
      throw error;
    }
  }

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
}