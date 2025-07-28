import { TagBundle } from '../../core/identity/tags.meta.js';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
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
    trustScore: number;
    ethicalRating: 'aligned' | 'warn' | 'reject';
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
    priority: 'low' | 'medium' | 'high';
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
export declare class EnhancedPetalsClient {
    private httpService;
    private configService;
    private readonly logger;
    private config;
    constructor(httpService: HttpService, configService: ConfigService);
    private validateIntent;
    private checkCodeSafety;
    private checkForMaliciousPatterns;
    private checkForResourceAbuse;
    private checkForPrivacyViolations;
    private checkAgentPermissions;
    private validateTags;
    private logViolation;
    callPetalsAPI(request: PetalsRequest): Promise<PetalsResponse>;
    callPetalsBatch(batchRequest: PetalsBatchRequest): Promise<PetalsBatchResponse>;
    private makePetalsAPICall;
    private calculateBatchSummary;
    private logSuccessfulOperation;
    private logError;
    private logBatchOperation;
    private logBatchError;
}
export declare function formatProposal(proposal: CodeProposal): PetalsRequest;
export declare function callPetalsAPI(request: PetalsRequest): Promise<PetalsResponse>;
export declare function logTrainingCycle(agentId: string, summary: PetalsResponse): Promise<void>;
