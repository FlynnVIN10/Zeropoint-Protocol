import { OnApplicationShutdown } from '@nestjs/common';
import { AppService } from './app.service.js';
import { JwtService } from '@nestjs/jwt';
declare class RegisterDto {
    username: string;
    password: string;
}
declare class LoginDto {
    username: string;
    password: string;
}
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
    register(dto: RegisterDto): Promise<any>;
    login(dto: LoginDto): Promise<any>;
    healthCheck(): Promise<any>;
    uploadFile(file: any, rationale: string): Promise<any>;
    downloadFile(cid: string, rationale: string, res: any): Promise<void>;
    listDirectory(cid: string): Promise<any>;
    persistSoulchain(): Promise<any>;
    getStatus(): Promise<any>;
    proposeWithPetals(proposal: any): Promise<any>;
    onApplicationShutdown(): Promise<void>;
}
export {};
