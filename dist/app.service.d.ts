import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CodeProposal, PetalsResponse } from './agents/train/petals.bridge.js';
interface DirectoryEntry {
    name: string;
    cid: string;
    size: number;
    type: string;
}
export declare class AppService {
    private configService;
    private httpService;
    private helia;
    private fs;
    private ready;
    private readonly logger;
    constructor(configService: ConfigService, httpService: HttpService);
    private init;
    callPythonBackend(endpoint: string, data: any, rationale: string): Promise<any>;
    generateText(text: string, options?: any): Promise<any>;
    generateImage(prompt: string, options?: any): Promise<any>;
    generateCode(prompt: string, language?: string): Promise<any>;
    private logAPICall;
    uploadFile(buffer: Buffer, rationale: string): Promise<string>;
    downloadFile(cidStr: string, rationale: string): Promise<Buffer>;
    getHello(): Promise<string>;
    listDirectory(cid: string): Promise<DirectoryEntry[]>;
    getMetrics(): Promise<string>;
    proposeWithPetals(proposal: CodeProposal): Promise<PetalsResponse>;
    healthCheck(): Promise<any>;
    private checkPythonBackendHealth;
}
export {};
