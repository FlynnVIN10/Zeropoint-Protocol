import { OnApplicationShutdown } from '@nestjs/common';
import { AppService } from './app.service.js';
import { JwtService } from '@nestjs/jwt';
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
export declare class AppController implements OnApplicationShutdown {
    private readonly appService;
    private readonly jwtService;
    constructor(appService: AppService, jwtService: JwtService);
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
    onApplicationShutdown(): Promise<void>;
}
export {};
