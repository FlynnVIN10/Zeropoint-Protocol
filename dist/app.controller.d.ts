import { OnApplicationShutdown } from '@nestjs/common';
import { AppService } from './app.service.js';
import { JwtService } from '@nestjs/jwt';
import { EnhancedPetalsService } from './agents/train/enhanced-petals.service.js';
import { ServiceOrchestrator } from './agents/orchestration/service-orchestrator.js';
declare class GenerateTextDto {
    text: string;
    options?: any;
}
declare class GenerateImageDto {
    prompt: string;
    options?: any;
}
declare class GenerateCodeDto {
    prompt: string;
    language?: string;
}
declare class PetalsRequestDto {
    agentId: string;
    code: string;
    tags: any[];
}
declare class PetalsBatchRequestDto {
    requests: PetalsRequestDto[];
    batchId: string;
    priority: 'low' | 'medium' | 'high';
    timeout?: number;
}
declare class OperationRequestDto {
    type: 'petals' | 'ai-generation' | 'validation' | 'analysis';
    data: any;
    tags: any[];
    dependencies?: string[];
}
declare class OrchestrationRequestDto {
    id: string;
    agentId: string;
    operations: OperationRequestDto[];
    priority: 'low' | 'medium' | 'high';
    timeout?: number;
    metadata?: any;
}
export declare class AppController implements OnApplicationShutdown {
    private readonly appService;
    private readonly jwtService;
    private readonly petalsService;
    private readonly orchestrator;
    constructor(appService: AppService, jwtService: JwtService, petalsService: EnhancedPetalsService, orchestrator: ServiceOrchestrator);
    getHello(): Promise<string>;
    getMetrics(res: any): Promise<void>;
    getLedgerMetrics(res: any): Promise<void>;
    protectedRoute(): Promise<any>;
    generateText(dto: GenerateTextDto): Promise<any>;
    generateImage(dto: GenerateImageDto): Promise<any>;
    generateCode(dto: GenerateCodeDto): Promise<any>;
    generateLegacy(text: string): Promise<any>;
    healthCheck(): Promise<any>;
    uploadFile(file: any, rationale: string): Promise<any>;
    downloadFile(cid: string, rationale: string, res: any): Promise<void>;
    listDirectory(cid: string): Promise<any>;
    persistSoulchain(): Promise<any>;
    getStatus(): Promise<any>;
    proposeWithPetals(proposal: any): Promise<any>;
    textSummarization(body: {
        text: string;
        options?: {
            maxLength?: number;
            style?: string;
        };
    }): Promise<any>;
    contextPrompting(body: {
        prompt: string;
        context: string;
        options?: {
            temperature?: number;
            maxTokens?: number;
        };
    }): Promise<any>;
    semanticSearch(body: {
        query: string;
        documents: string[];
        options?: {
            topK?: number;
            threshold?: number;
        };
    }): Promise<any>;
    sentimentAnalysis(body: {
        text: string;
        options?: {
            detailed?: boolean;
            language?: string;
        };
    }): Promise<any>;
    entityExtraction(body: {
        text: string;
        options?: {
            entities?: string[];
            confidence?: number;
        };
    }): Promise<any>;
    languageTranslation(body: {
        text: string;
        targetLanguage: string;
        sourceLanguage?: string;
    }): Promise<any>;
    getAdvancedStatus(): Promise<any>;
    callPetalsSingle(dto: PetalsRequestDto): Promise<any>;
    callPetalsBatch(dto: PetalsBatchRequestDto): Promise<any>;
    getPetalsHealth(): Promise<any>;
    orchestrateServices(dto: OrchestrationRequestDto): Promise<any>;
    getOrchestrationHealth(): Promise<any>;
    getAvailableServices(): Promise<any>;
    onApplicationShutdown(): Promise<void>;
}
export {};
