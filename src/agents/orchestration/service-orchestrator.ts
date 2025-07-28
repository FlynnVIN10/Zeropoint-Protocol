// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// src/agents/orchestration/service-orchestrator.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TagBundle } from '../../core/identity/tags.meta.js';
import { checkIntent } from '../../guards/synthient.guard.js';
import { soulchain } from '../soulchain/soulchain.ledger.js';
import { EnhancedPetalsService, PetalsRequest, PetalsResponse, PetalsBatchRequest, PetalsBatchResponse } from '../train/enhanced-petals.service.js';
import { v4 as uuidv4 } from 'uuid';

export interface OrchestrationRequest {
  id: string;
  agentId: string;
  operations: OperationRequest[];
  priority: 'low' | 'medium' | 'high';
  timeout?: number;
  metadata?: {
    timestamp: string;
    version: string;
    environment: string;
    sessionId?: string;
  };
}

export interface OperationRequest {
  type: 'petals' | 'ai-generation' | 'validation' | 'analysis';
  data: any;
  tags: TagBundle;
  dependencies?: string[]; // IDs of operations this depends on
}

export interface OrchestrationResponse {
  id: string;
  agentId: string;
  results: OperationResult[];
  summary: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageTrustScore: number;
    processingTime: number;
  };
  metadata: {
    timestamp: string;
    orchestrationVersion: string;
  };
}

export interface OperationResult {
  operationId: string;
  type: string;
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
  trustScore?: number;
  tags: TagBundle;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: string;
  errors?: string[];
}

@Injectable()
export class ServiceOrchestrator {
  private readonly logger = new Logger(ServiceOrchestrator.name);
  private serviceHealth: Map<string, ServiceHealth> = new Map();

  constructor(
    private configService: ConfigService,
    private petalsService: EnhancedPetalsService
  ) {
    this.initializeServiceHealth();
  }

  /**
   * Initialize service health tracking
   */
  private initializeServiceHealth(): void {
    const services = ['petals', 'ai-generation', 'validation', 'analysis'];
    services.forEach(service => {
      this.serviceHealth.set(service, {
        service,
        status: 'healthy',
        responseTime: 0,
        lastCheck: new Date().toISOString()
      });
    });
  }

  /**
   * Enhanced Zeroth-gate validation for orchestration
   */
  private async validateOrchestrationRequest(request: OrchestrationRequest): Promise<boolean> {
    const intentString = `orchestration:${request.agentId}:${request.operations.length} operations:${JSON.stringify(request.operations.map(op => op.type))}`;
    
    if (!checkIntent(intentString)) {
      await this.logViolation(request, 'Zeroth violation: Orchestration intent validation failed');
      return false;
    }

    // Validate each operation in parallel
    const operationValidations = await Promise.all(
      request.operations.map(operation => this.validateOperation(operation))
    );

    const allOperationsValid = operationValidations.every(valid => valid);
    
    if (!allOperationsValid) {
      await this.logViolation(request, 'Ethical validation failed for one or more operations');
      return false;
    }

    return true;
  }

  /**
   * Validate individual operation
   */
  private async validateOperation(operation: OperationRequest): Promise<boolean> {
    const operationIntent = `${operation.type}:${JSON.stringify(operation.data).substring(0, 100)}:${JSON.stringify(operation.tags)}`;
    
    if (!checkIntent(operationIntent)) {
      return false;
    }

    // Additional validation based on operation type
    switch (operation.type) {
      case 'petals':
        return this.validatePetalsOperation(operation);
      case 'ai-generation':
        return this.validateAIGenerationOperation(operation);
      case 'validation':
        return this.validateValidationOperation(operation);
      case 'analysis':
        return this.validateAnalysisOperation(operation);
      default:
        return false;
    }
  }

  private async validatePetalsOperation(operation: OperationRequest): Promise<boolean> {
    // Validate code safety
    const code = operation.data?.code || '';
    const safetyChecks = await Promise.all([
      this.checkForMaliciousPatterns(code),
      this.checkForResourceAbuse(code),
      this.checkForPrivacyViolations(code)
    ]);

    return safetyChecks.every(check => check);
  }

  private async validateAIGenerationOperation(operation: OperationRequest): Promise<boolean> {
    // Validate AI generation parameters
    const prompt = operation.data?.prompt || '';
    const maxTokens = operation.data?.maxTokens || 1000;
    
    return prompt.length > 0 && 
           prompt.length < 10000 && 
           maxTokens > 0 && 
           maxTokens <= 4000;
  }

  private async validateValidationOperation(operation: OperationRequest): Promise<boolean> {
    // Validate validation parameters
    const data = operation.data?.data || '';
    const rules = operation.data?.rules || [];
    
    return data.length > 0 && rules.length > 0;
  }

  private async validateAnalysisOperation(operation: OperationRequest): Promise<boolean> {
    // Validate analysis parameters
    const data = operation.data?.data || '';
    const analysisType = operation.data?.type || '';
    
    return data.length > 0 && 
           ['sentiment', 'entities', 'semantic', 'syntax'].includes(analysisType);
  }

  private async checkForMaliciousPatterns(code: string): Promise<boolean> {
    const maliciousPatterns = [
      /eval\s*\(/,
      /exec\s*\(/,
      /system\s*\(/,
      /shell_exec\s*\(/,
      /passthru\s*\(/,
      /proc_open\s*\(/,
      /popen\s*\(/,
      /curl_exec\s*\(/,
      /file_get_contents\s*\(.*http/,
      /include\s*\(.*http/,
      /require\s*\(.*http/
    ];

    return !maliciousPatterns.some(pattern => pattern.test(code));
  }

  private async checkForResourceAbuse(code: string): Promise<boolean> {
    const resourcePatterns = [
      /while\s*\(\s*true\s*\)/,
      /for\s*\(\s*;\s*;\s*\)/,
      /set_time_limit\s*\(\s*0\s*\)/,
      /memory_limit\s*=\s*['"]-1['"]/,
      /max_execution_time\s*=\s*['"]0['"]/
    ];

    return !resourcePatterns.some(pattern => pattern.test(code));
  }

  private async checkForPrivacyViolations(code: string): Promise<boolean> {
    const privacyPatterns = [
      /password\s*=/,
      /api_key\s*=/,
      /secret\s*=/,
      /token\s*=/,
      /private_key\s*=/,
      /\.env/,
      /config\s*\[.*password/
    ];

    return !privacyPatterns.some(pattern => pattern.test(code));
  }

  /**
   * Main orchestration method with Promise.all
   */
  async orchestrateServices(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const startTime = Date.now();
    
    try {
      // Enhanced Zeroth-gate validation
      const isValid = await this.validateOrchestrationRequest(request);
      if (!isValid) {
        throw new Error('Zeroth violation: Orchestration request blocked by validation.');
      }

      // Add metadata to request
      const enhancedRequest = {
        ...request,
        metadata: {
          ...request.metadata,
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          environment: this.configService.get<string>('NODE_ENV') || 'development',
          sessionId: request.metadata?.sessionId || uuidv4()
        }
      };

      // Execute operations with dependency resolution and parallel processing
      const results = await this.executeOperations(enhancedRequest);
      
      const processingTime = Date.now() - startTime;
      
      // Calculate summary
      const summary = this.calculateOrchestrationSummary(results, processingTime);
      
      // Log successful orchestration
      await this.logSuccessfulOrchestration(enhancedRequest, results, summary);
      
      return {
        id: enhancedRequest.id,
        agentId: enhancedRequest.agentId,
        results,
        summary,
        metadata: {
          timestamp: new Date().toISOString(),
          orchestrationVersion: '2.0.0'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.logOrchestrationError(request, error, processingTime);
      throw error;
    }
  }

  /**
   * Execute operations with dependency resolution and Promise.all
   */
  private async executeOperations(request: OrchestrationRequest): Promise<OperationResult[]> {
    const results: OperationResult[] = [];
    const operationMap = new Map<string, OperationRequest>();
    
    // Create operation map for dependency resolution
    request.operations.forEach((operation, index) => {
      const operationId = `${operation.type}-${index}`;
      operationMap.set(operationId, operation);
    });

    // Group operations by dependency level
    const dependencyGroups = this.groupOperationsByDependencies(request.operations);
    
    // Execute each group in sequence, but operations within groups in parallel
    for (const group of dependencyGroups) {
      const groupStartTime = Date.now();
      
      // Execute operations in current group in parallel
      const groupPromises = group.map(async (operation, index) => {
        const operationId = `${operation.type}-${index}`;
        const operationStartTime = Date.now();
        
        try {
          const result = await this.executeSingleOperation(operation, results);
          const processingTime = Date.now() - operationStartTime;
          
          return {
            operationId,
            type: operation.type,
            success: true,
            data: result,
            processingTime,
            trustScore: result?.trustScore || 0.8,
            tags: operation.tags
          };
        } catch (error) {
          const processingTime = Date.now() - operationStartTime;
          
          return {
            operationId,
            type: operation.type,
            success: false,
            error: error.message,
            processingTime,
            trustScore: 0,
            tags: operation.tags
          };
        }
      });
      
      // Wait for all operations in current group to complete
      const groupResults = await Promise.all(groupPromises);
      results.push(...groupResults);
      
      const groupProcessingTime = Date.now() - groupStartTime;
      this.logger.log(`Group completed in ${groupProcessingTime}ms with ${groupResults.length} operations`);
    }
    
    return results;
  }

  /**
   * Group operations by dependencies for sequential execution
   */
  private groupOperationsByDependencies(operations: OperationRequest[]): OperationRequest[][] {
    const groups: OperationRequest[][] = [];
    const processed = new Set<number>();
    const operationMap = new Map<number, OperationRequest>();
    
    operations.forEach((operation, index) => {
      operationMap.set(index, operation);
    });
    
    while (processed.size < operations.length) {
      const currentGroup: OperationRequest[] = [];
      
      operations.forEach((operation, index) => {
        if (processed.has(index)) return;
        
        const dependencies = operation.dependencies || [];
        const allDependenciesMet = dependencies.every(depIndex => processed.has(parseInt(depIndex)));
        
        if (allDependenciesMet) {
          currentGroup.push(operation);
          processed.add(index);
        }
      });
      
      if (currentGroup.length === 0) {
        // Circular dependency or invalid dependency
        const remaining = operations.filter((_, index) => !processed.has(index));
        currentGroup.push(...remaining);
        remaining.forEach((_, index) => processed.add(index));
      }
      
      groups.push(currentGroup);
    }
    
    return groups;
  }

  /**
   * Execute a single operation
   */
  private async executeSingleOperation(operation: OperationRequest, previousResults: OperationResult[]): Promise<any> {
    switch (operation.type) {
      case 'petals':
        return this.executePetalsOperation(operation);
      case 'ai-generation':
        return this.executeAIGenerationOperation(operation);
      case 'validation':
        return this.executeValidationOperation(operation, previousResults);
      case 'analysis':
        return this.executeAnalysisOperation(operation, previousResults);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private async executePetalsOperation(operation: OperationRequest): Promise<PetalsResponse> {
    const petalsRequest: PetalsRequest = {
      id: uuidv4(),
      agentId: operation.data.agentId,
      code: operation.data.code,
      tags: operation.tags
    };
    
    return this.petalsService.callPetalsAPI(petalsRequest);
  }

  private async executeAIGenerationOperation(operation: OperationRequest): Promise<any> {
    // TODO: Implement AI generation service
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate processing
    
    return {
      generatedText: `Generated content for: ${operation.data.prompt}`,
      trustScore: 0.85,
      metadata: {
        model: 'gpt-4',
        tokens: operation.data.maxTokens || 1000
      }
    };
  }

  private async executeValidationOperation(operation: OperationRequest, previousResults: OperationResult[]): Promise<any> {
    // TODO: Implement validation service
    await new Promise(resolve => setTimeout(resolve, 150)); // Simulate processing
    
    const dataToValidate = operation.data.data;
    const rules = operation.data.rules;
    
    return {
      isValid: true,
      violations: [],
      trustScore: 0.9,
      metadata: {
        rulesChecked: rules.length,
        dataSize: dataToValidate.length
      }
    };
  }

  private async executeAnalysisOperation(operation: OperationRequest, previousResults: OperationResult[]): Promise<any> {
    // TODO: Implement analysis service
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
    
    const dataToAnalyze = operation.data.data;
    const analysisType = operation.data.type;
    
    return {
      analysisType,
      results: `Analysis results for ${analysisType}`,
      trustScore: 0.88,
      metadata: {
        dataSize: dataToAnalyze.length,
        analysisMethod: analysisType
      }
    };
  }

  /**
   * Calculate orchestration summary
   */
  private calculateOrchestrationSummary(results: OperationResult[], processingTime: number): OrchestrationResponse['summary'] {
    const totalOperations = results.length;
    const successfulOperations = results.filter(result => result.success).length;
    const failedOperations = totalOperations - successfulOperations;
    const averageTrustScore = results.reduce((sum, result) => sum + (result.trustScore || 0), 0) / totalOperations;

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageTrustScore,
      processingTime
    };
  }

  /**
   * Log successful orchestration to Soulchain
   */
  private async logSuccessfulOrchestration(
    request: OrchestrationRequest, 
    results: OperationResult[], 
    summary: OrchestrationResponse['summary']
  ): Promise<void> {
    await soulchain.addXPTransaction({
      agentId: request.agentId,
      amount: summary.successfulOperations * 3,
      rationale: `Orchestration successful: ${summary.successfulOperations}/${summary.totalOperations} operations, ${summary.processingTime}ms total time`,
      timestamp: new Date().toISOString(),
      previousCid: null,
      tags: [
        {
          type: '#who',
          name: request.agentId,
          did: `did:zeropoint:${request.agentId}`,
          handle: `@${request.agentId}`
        },
        {
          type: '#intent',
          purpose: '#service-orchestration',
          validation: 'good-heart'
        },
        {
          type: '#thread',
          taskId: request.id,
          lineage: ['orchestration', 'success'],
          swarmLink: 'orchestration-swarm'
        },
        {
          type: '#layer',
          level: '#live'
        },
        {
          type: '#domain',
          field: '#orchestration'
        }
      ]
    });
  }

  /**
   * Log orchestration error to Soulchain
   */
  private async logOrchestrationError(request: OrchestrationRequest, error: Error, processingTime: number): Promise<void> {
    await soulchain.addXPTransaction({
      agentId: request.agentId,
      amount: -10,
      rationale: `Orchestration failed: ${error.message}, ${processingTime}ms processing time`,
      timestamp: new Date().toISOString(),
      previousCid: null,
      tags: [
        {
          type: '#who',
          name: request.agentId,
          did: `did:zeropoint:${request.agentId}`,
          handle: `@${request.agentId}`
        },
        {
          type: '#intent',
          purpose: '#orchestration-error',
          validation: 'halt'
        },
        {
          type: '#thread',
          taskId: request.id,
          lineage: ['orchestration', 'error'],
          swarmLink: 'error-swarm'
        },
        {
          type: '#layer',
          level: '#live'
        },
        {
          type: '#domain',
          field: '#error'
        }
      ]
    });
  }

  /**
   * Log violation to Soulchain
   */
  private async logViolation(request: OrchestrationRequest, reason: string): Promise<void> {
    await soulchain.addXPTransaction({
      agentId: request.agentId,
      amount: -15,
      rationale: `Orchestration violation: ${reason}`,
      timestamp: new Date().toISOString(),
      previousCid: null,
      tags: [
        {
          type: '#who',
          name: request.agentId,
          did: `did:zeropoint:${request.agentId}`,
          handle: `@${request.agentId}`
        },
        {
          type: '#intent',
          purpose: '#security-violation',
          validation: 'halt'
        },
        {
          type: '#thread',
          taskId: request.id,
          lineage: ['orchestration', 'security'],
          swarmLink: 'security-swarm'
        },
        {
          type: '#layer',
          level: '#live'
        },
        {
          type: '#domain',
          field: '#security'
        }
      ]
    });
  }

  /**
   * Get service health status
   */
  getServiceHealth(): ServiceHealth[] {
    return Array.from(this.serviceHealth.values());
  }

  /**
   * Update service health
   */
  updateServiceHealth(service: string, status: ServiceHealth): void {
    this.serviceHealth.set(service, {
      ...status,
      lastCheck: new Date().toISOString()
    });
  }
} 