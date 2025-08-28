// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// src/agents/train/petals.bridge.ts

import { TagBundle } from "../../core/identity/tags.meta.js";
import { v4 as uuidv4 } from "uuid";
import { checkIntent } from "../../guards/synthient.guard.js";
import { soulchain } from "../soulchain/soulchain.ledger.js";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";

export interface CodeProposal {
  agentId: string;
  functionName: string;
  originalCode: string;
  proposedCode: string;
  rationale: string;
  tags: TagBundle;
}

export interface PetalsRequest {
  id: string;
  agentId: string;
  code: string;
  tags: TagBundle;
  metadata?: {
    timestamp: string;
    version: string;
    environment: string;
  };
}

export interface PetalsResponse {
  rewrittenCode: string;
  trustScore: number; // 0–1
  ethicalRating: "aligned" | "warn" | "reject";
  notes?: string[];
  metadata?: {
    processingTime: number;
    modelVersion: string;
    confidence: number;
  };
}

export interface PetalsBatchRequest {
  requests: PetalsRequest[];
  batchId: string;
  priority: "low" | "medium" | "high";
  timeout?: number;
}

export interface PetalsBatchResponse {
  batchId: string;
  results: PetalsResponse[];
  summary: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    averageTrustScore: number;
    ethicalAlignment: number;
  };
  metadata: {
    processingTime: number;
    timestamp: string;
  };
}

export interface PetalsServiceConfig {
  apiUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  batchSize: number;
  enableParallel: boolean;
}

/**
 * Enhanced Petals Client with async orchestration
 */
export class EnhancedPetalsClient {
  private readonly logger = new Logger(EnhancedPetalsClient.name);
  private config: PetalsServiceConfig;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.config = {
      apiUrl:
        this.configService.get<string>("PETALS_API_URL") ||
        "https://api.petals.dev",
      apiKey: this.configService.get<string>("PETALS_API_KEY") || "",
      timeout: this.configService.get<number>("PETALS_TIMEOUT") || 30000,
      retryAttempts:
        this.configService.get<number>("PETALS_RETRY_ATTEMPTS") || 3,
      batchSize: this.configService.get<number>("PETALS_BATCH_SIZE") || 10,
      enableParallel:
        this.configService.get<boolean>("PETALS_ENABLE_PARALLEL") || true,
    };
  }

  /**
   * Enhanced Zeroth-gate validation with detailed intent checking
   */
  private async validateIntent(
    request: PetalsRequest,
    operation: string,
  ): Promise<boolean> {
    const intentString = `${operation}:${request.agentId}:${request.code.substring(0, 100)}:${JSON.stringify(request.tags)}`;

    if (!checkIntent(intentString)) {
      await this.logViolation(
        request,
        operation,
        "Zeroth violation: Intent validation failed",
      );
      return false;
    }

    // Additional ethical checks
    const ethicalChecks = await Promise.all([
      this.checkCodeSafety(request.code),
      this.checkAgentPermissions(request.agentId),
      this.validateTags(request.tags),
    ]);

    const allChecksPassed = ethicalChecks.every((check) => check);

    if (!allChecksPassed) {
      await this.logViolation(request, operation, "Ethical validation failed");
      return false;
    }

    return true;
  }

  /**
   * Check code safety using multiple validators
   */
  private async checkCodeSafety(code: string): Promise<boolean> {
    const safetyChecks = await Promise.all([
      this.checkForMaliciousPatterns(code),
      this.checkForResourceAbuse(code),
      this.checkForPrivacyViolations(code),
    ]);

    return safetyChecks.every((check) => check);
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
      /require\s*\(.*http/,
    ];

    return !maliciousPatterns.some((pattern) => pattern.test(code));
  }

  private async checkForResourceAbuse(code: string): Promise<boolean> {
    const resourcePatterns = [
      /while\s*\(\s*true\s*\)/,
      /for\s*\(\s*;\s*;\s*\)/,
      /set_time_limit\s*\(\s*0\s*\)/,
      /memory_limit\s*=\s*['"]-1['"]/,
      /max_execution_time\s*=\s*['"]0['"]/,
    ];

    return !resourcePatterns.some((pattern) => pattern.test(code));
  }

  private async checkForPrivacyViolations(code: string): Promise<boolean> {
    const privacyPatterns = [
      /password\s*=/,
      /api_key\s*=/,
      /secret\s*=/,
      /token\s*=/,
      /private_key\s*=/,
      /\.env/,
      /config\s*\[.*password/,
    ];

    return !privacyPatterns.some((pattern) => pattern.test(code));
  }

  private async checkAgentPermissions(agentId: string): Promise<boolean> {
    // TODO: Implement agent permission checking
    return true;
  }

  private async validateTags(tags: TagBundle): Promise<boolean> {
    return tags.every(
      (tag) =>
        tag.type &&
        (tag.type === "#who" ||
          tag.type === "#intent" ||
          tag.type === "#thread" ||
          tag.type === "#layer" ||
          tag.type === "#domain"),
    );
  }

  /**
   * Log violations to Soulchain with detailed metadata
   */
  private async logViolation(
    request: PetalsRequest,
    operation: string,
    reason: string,
  ): Promise<void> {
    await soulchain.addXPTransaction({
      agentId: request.agentId,
      amount: -10,
      rationale: `Petals violation: ${operation} - ${reason}`,
      timestamp: new Date().toISOString(),
      previousCid: null,
      tags: [
        {
          type: "#who",
          name: request.agentId,
          did: `did:zeropoint:${request.agentId}`,
          handle: `@${request.agentId}`,
        },
        {
          type: "#intent",
          purpose: "#security-violation",
          validation: "halt",
        },
        {
          type: "#thread",
          taskId: operation,
          lineage: ["petals", "security"],
          swarmLink: "security-swarm",
        },
        {
          type: "#layer",
          level: "#live",
        },
        {
          type: "#domain",
          field: "#security",
        },
      ],
    });
  }

  /**
   * Single Petals API call with enhanced validation and logging
   */
  async callPetalsAPI(request: PetalsRequest): Promise<PetalsResponse> {
    const startTime = Date.now();

    try {
      // Enhanced Zeroth-gate validation
      const isValid = await this.validateIntent(request, "petals-single-call");
      if (!isValid) {
        throw new Error(
          "Zeroth violation: Petals call blocked by enhanced validation.",
        );
      }

      // Add metadata to request
      const enhancedRequest = {
        ...request,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "2.0.0",
          environment:
            this.configService.get<string>("NODE_ENV") || "development",
        },
      };

      // Make API call with retry logic
      const response = await this.makePetalsAPICall(enhancedRequest);

      const processingTime = Date.now() - startTime;

      // Log successful operation
      await this.logSuccessfulOperation(request, response, processingTime);

      return {
        ...response,
        metadata: {
          processingTime,
          modelVersion: "petals-v2.0",
          confidence: response.trustScore,
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.logError(request, error as Error, processingTime);
      throw error;
    }
  }

  /**
   * Batch Petals API calls with Promise.all orchestration
   */
  async callPetalsBatch(
    batchRequest: PetalsBatchRequest,
  ): Promise<PetalsBatchResponse> {
    const startTime = Date.now();

    try {
      // Validate all requests in parallel
      const validationPromises = batchRequest.requests.map((request) =>
        this.validateIntent(request, "petals-batch-call"),
      );

      const validationResults = await Promise.all(validationPromises);
      const validRequests = batchRequest.requests.filter(
        (_, index) => validationResults[index],
      );

      if (validRequests.length === 0) {
        throw new Error(
          "Zeroth violation: All batch requests blocked by validation.",
        );
      }

      // Process requests in parallel with Promise.all
      const processingPromises = validRequests.map((request) =>
        this.callPetalsAPI(request),
      );

      const results = await Promise.all(processingPromises);

      const processingTime = Date.now() - startTime;

      // Calculate batch summary
      const summary = this.calculateBatchSummary(
        results,
        batchRequest.requests.length,
      );

      // Log batch operation
      await this.logBatchOperation(
        batchRequest,
        results,
        summary,
        processingTime,
      );

      return {
        batchId: batchRequest.batchId,
        results,
        summary,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.logBatchError(batchRequest, error as Error, processingTime);
      throw error;
    }
  }

  /**
   * Make actual Petals API call with retry logic
   */
  private async makePetalsAPICall(
    request: PetalsRequest,
  ): Promise<PetalsResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        // TODO: Replace with actual Petals API call
        // const response = await this.httpService.post(
        //   `${this.config.apiUrl}/rewrite`,
        //   request,
        //   {
        //     headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
        //     timeout: this.config.timeout
        //   }
        // ).toPromise();
        // return response.data;

        // Stub implementation for now
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API delay

        return {
          rewrittenCode: request.code,
          trustScore: 0.9,
          ethicalRating: "aligned",
          notes: [`Stub: auto-approved (attempt ${attempt})`],
        };
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Petals API call attempt ${attempt} failed: ${(error as Error).message}`,
        );

        if (attempt < this.config.retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    throw (
      lastError || new Error("Petals API call failed after all retry attempts")
    );
  }

  /**
   * Calculate batch summary statistics
   */
  private calculateBatchSummary(
    results: PetalsResponse[],
    totalRequests: number,
  ): PetalsBatchResponse["summary"] {
    const successCount = results.length;
    const failureCount = totalRequests - successCount;
    const averageTrustScore =
      results.reduce((sum, result) => sum + result.trustScore, 0) /
      successCount;
    const ethicalAlignment =
      results.filter((result) => result.ethicalRating === "aligned").length /
      successCount;

    return {
      totalProcessed: totalRequests,
      successCount,
      failureCount,
      averageTrustScore,
      ethicalAlignment,
    };
  }

  /**
   * Log successful operation to Soulchain
   */
  private async logSuccessfulOperation(
    request: PetalsRequest,
    response: PetalsResponse,
    processingTime: number,
  ): Promise<void> {
    await soulchain.addXPTransaction({
      agentId: request.agentId,
      amount: 5,
      rationale: `Petals operation successful: ${response.trustScore} trust score, ${processingTime}ms processing time`,
      timestamp: new Date().toISOString(),
      previousCid: null,
      tags: [
        {
          type: "#who",
          name: request.agentId,
          did: `did:zeropoint:${request.agentId}`,
          handle: `@${request.agentId}`,
        },
        {
          type: "#intent",
          purpose: "#code-improvement",
          validation: "good-heart",
        },
        {
          type: "#thread",
          taskId: "petals-operation",
          lineage: ["petals", "success"],
          swarmLink: "petals-swarm",
        },
        {
          type: "#layer",
          level: "#live",
        },
        {
          type: "#domain",
          field: "#ai",
        },
      ],
    });
  }

  /**
   * Log error to Soulchain
   */
  private async logError(
    request: PetalsRequest,
    error: Error,
    processingTime: number,
  ): Promise<void> {
    await soulchain.addXPTransaction({
      agentId: request.agentId,
      amount: -5,
      rationale: `Petals operation failed: ${error.message}, ${processingTime}ms processing time`,
      timestamp: new Date().toISOString(),
      previousCid: null,
      tags: [
        {
          type: "#who",
          name: request.agentId,
          did: `did:zeropoint:${request.agentId}`,
          handle: `@${request.agentId}`,
        },
        {
          type: "#intent",
          purpose: "#error-handling",
          validation: "neutral",
        },
        {
          type: "#thread",
          taskId: "petals-error",
          lineage: ["petals", "error"],
          swarmLink: "error-swarm",
        },
        {
          type: "#layer",
          level: "#live",
        },
        {
          type: "#domain",
          field: "#error",
        },
      ],
    });
  }

  /**
   * Log batch operation to Soulchain
   */
  private async logBatchOperation(
    batchRequest: PetalsBatchRequest,
    results: PetalsResponse[],
    summary: PetalsBatchResponse["summary"],
    processingTime: number,
  ): Promise<void> {
    await soulchain.addXPTransaction({
      agentId: "batch-processor",
      amount: summary.successCount * 2,
      rationale: `Batch operation: ${summary.successCount}/${summary.totalProcessed} successful, ${processingTime}ms total time`,
      timestamp: new Date().toISOString(),
      previousCid: null,
      tags: [
        {
          type: "#who",
          name: "batch-processor",
          did: "did:zeropoint:batch-processor",
          handle: "@batch-processor",
        },
        {
          type: "#intent",
          purpose: "#batch-processing",
          validation: "good-heart",
        },
        {
          type: "#thread",
          taskId: batchRequest.batchId,
          lineage: ["petals", "batch"],
          swarmLink: "batch-swarm",
        },
        {
          type: "#layer",
          level: "#live",
        },
        {
          type: "#domain",
          field: "#ai",
        },
      ],
    });
  }

  /**
   * Log batch error to Soulchain
   */
  private async logBatchError(
    batchRequest: PetalsBatchRequest,
    error: Error,
    processingTime: number,
  ): Promise<void> {
    await soulchain.addXPTransaction({
      agentId: "batch-processor",
      amount: -10,
      rationale: `Batch operation failed: ${error.message}, ${processingTime}ms processing time`,
      timestamp: new Date().toISOString(),
      previousCid: null,
      tags: [
        {
          type: "#who",
          name: "batch-processor",
          did: "did:zeropoint:batch-processor",
          handle: "@batch-processor",
        },
        {
          type: "#intent",
          purpose: "#batch-error",
          validation: "halt",
        },
        {
          type: "#thread",
          taskId: batchRequest.batchId,
          lineage: ["petals", "batch-error"],
          swarmLink: "error-swarm",
        },
        {
          type: "#layer",
          level: "#live",
        },
        {
          type: "#domain",
          field: "#error",
        },
      ],
    });
  }
}

// Legacy functions for backward compatibility
export function formatProposal(proposal: CodeProposal): PetalsRequest {
  return {
    id: uuidv4(),
    agentId: proposal.agentId,
    code: proposal.proposedCode,
    tags: proposal.tags,
  };
}

export async function callPetalsAPI(
  request: PetalsRequest,
): Promise<PetalsResponse> {
  // Create enhanced client instance
  const client = new EnhancedPetalsClient(
    new HttpService(),
    new ConfigService(),
  );

  return client.callPetalsAPI(request);
}

export async function logTrainingCycle(
  agentId: string,
  summary: PetalsResponse,
): Promise<void> {
  await soulchain.addXPTransaction({
    agentId,
    amount: 1,
    rationale: `Training cycle logged: ${summary.trustScore} trust score`,
    timestamp: new Date().toISOString(),
    previousCid: null,
    tags: [
      {
        type: "#who",
        name: agentId,
        did: `did:zeropoint:${agentId}`,
        handle: `@${agentId}`,
      },
      {
        type: "#intent",
        purpose: "#training-log",
        validation: "good-heart",
      },
      {
        type: "#thread",
        taskId: "training-cycle",
        lineage: ["training", "log"],
        swarmLink: "training-swarm",
      },
      {
        type: "#layer",
        level: "#live",
      },
      {
        type: "#domain",
        field: "#training",
      },
    ],
  });
}
