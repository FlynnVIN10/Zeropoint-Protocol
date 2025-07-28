var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Body, Param, Res, UseGuards, UsePipes, ValidationPipe, UploadedFile, UseInterceptors, HttpStatus, HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service.js';
import { checkIntent } from './guards/synthient.guard.js';
import { soulchain } from './agents/soulchain/soulchain.ledger.js';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { IsString, MinLength, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { EnhancedPetalsService } from './agents/train/enhanced-petals.service.js';
import { ServiceOrchestrator } from './agents/orchestration/service-orchestrator.js';
import { Type } from 'class-transformer';
class RegisterDto {
}
__decorate([
    IsString(),
    MinLength(3),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    IsString(),
    MinLength(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
class LoginDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], LoginDto.prototype, "username", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class GenerateTextDto {
}
__decorate([
    IsString(),
    MinLength(1),
    __metadata("design:type", String)
], GenerateTextDto.prototype, "text", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], GenerateTextDto.prototype, "options", void 0);
class GenerateImageDto {
}
__decorate([
    IsString(),
    MinLength(1),
    __metadata("design:type", String)
], GenerateImageDto.prototype, "prompt", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], GenerateImageDto.prototype, "options", void 0);
class GenerateCodeDto {
}
__decorate([
    IsString(),
    MinLength(1),
    __metadata("design:type", String)
], GenerateCodeDto.prototype, "prompt", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], GenerateCodeDto.prototype, "language", void 0);
class PetalsRequestDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], PetalsRequestDto.prototype, "agentId", void 0);
__decorate([
    IsString(),
    MinLength(1),
    __metadata("design:type", String)
], PetalsRequestDto.prototype, "code", void 0);
__decorate([
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => Object),
    __metadata("design:type", Array)
], PetalsRequestDto.prototype, "tags", void 0);
class PetalsBatchRequestDto {
}
__decorate([
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => PetalsRequestDto),
    __metadata("design:type", Array)
], PetalsBatchRequestDto.prototype, "requests", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], PetalsBatchRequestDto.prototype, "batchId", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], PetalsBatchRequestDto.prototype, "priority", void 0);
__decorate([
    IsOptional(),
    __metadata("design:type", Number)
], PetalsBatchRequestDto.prototype, "timeout", void 0);
class OperationRequestDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], OperationRequestDto.prototype, "type", void 0);
__decorate([
    IsObject(),
    __metadata("design:type", Object)
], OperationRequestDto.prototype, "data", void 0);
__decorate([
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => Object),
    __metadata("design:type", Array)
], OperationRequestDto.prototype, "tags", void 0);
__decorate([
    IsOptional(),
    IsArray(),
    IsString({ each: true }),
    __metadata("design:type", Array)
], OperationRequestDto.prototype, "dependencies", void 0);
class OrchestrationRequestDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], OrchestrationRequestDto.prototype, "id", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], OrchestrationRequestDto.prototype, "agentId", void 0);
__decorate([
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => OperationRequestDto),
    __metadata("design:type", Array)
], OrchestrationRequestDto.prototype, "operations", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], OrchestrationRequestDto.prototype, "priority", void 0);
__decorate([
    IsOptional(),
    __metadata("design:type", Number)
], OrchestrationRequestDto.prototype, "timeout", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], OrchestrationRequestDto.prototype, "metadata", void 0);
let AppController = class AppController {
    constructor(appService, jwtService, petalsService, orchestrator) {
        this.appService = appService;
        this.jwtService = jwtService;
        this.petalsService = petalsService;
        this.orchestrator = orchestrator;
    }
    async getHello() {
        if (!checkIntent('getHello'))
            throw new Error('Zeroth violation: getHello blocked.');
        return this.appService.getHello();
    }
    async getMetrics(res) {
        const metrics = await this.appService.getMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metrics);
    }
    async getLedgerMetrics(res) {
        const metrics = await soulchain.getLedgerMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metrics);
    }
    async protectedRoute() {
        if (!checkIntent('protected'))
            throw new Error('Zeroth violation: Protected route blocked.');
        return { message: 'You have accessed a protected route.' };
    }
    async generateText(dto) {
        if (!checkIntent(dto.text))
            throw new Error('Zeroth violation: generate-text blocked.');
        return this.appService.generateText(dto.text, dto.options);
    }
    async generateImage(dto) {
        if (!checkIntent(dto.prompt))
            throw new Error('Zeroth violation: generate-image blocked.');
        return this.appService.generateImage(dto.prompt, dto.options);
    }
    async generateCode(dto) {
        if (!checkIntent(dto.prompt))
            throw new Error('Zeroth violation: generate-code blocked.');
        return this.appService.generateCode(dto.prompt, dto.language);
    }
    async generateLegacy(text) {
        if (!checkIntent(text))
            throw new Error('Zeroth violation: generate blocked.');
        return this.appService.generateText(text);
    }
    async healthCheck() {
        if (!checkIntent('health-check'))
            throw new Error('Zeroth violation: Health check blocked.');
        return this.appService.healthCheck();
    }
    async uploadFile(file, rationale) {
        if (!checkIntent(rationale))
            throw new Error('Zeroth violation: File upload blocked.');
        if (!file) {
            throw new HttpException({
                success: false,
                message: 'No file provided'
            }, HttpStatus.BAD_REQUEST);
        }
        try {
            const cid = await this.appService.uploadFile(file.buffer, rationale);
            return {
                success: true,
                cid,
                filename: file.originalname,
                size: file.size,
                message: 'File uploaded successfully'
            };
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async downloadFile(cid, rationale, res) {
        if (!checkIntent(rationale))
            throw new Error('Zeroth violation: File download blocked.');
        try {
            const buffer = await this.appService.downloadFile(cid, rationale);
            res.set('Content-Type', 'application/octet-stream');
            res.set('Content-Disposition', `attachment; filename="file-${cid}"`);
            res.send(buffer);
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }
    async listDirectory(cid) {
        if (!checkIntent('list-directory'))
            throw new Error('Zeroth violation: Directory listing blocked.');
        try {
            const entries = await this.appService.listDirectory(cid);
            return {
                success: true,
                cid,
                entries,
                count: entries.length
            };
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async persistSoulchain() {
        if (!checkIntent('persist-soulchain'))
            throw new Error('Zeroth violation: Soulchain persist blocked.');
        try {
            const cid = await soulchain.persistLedgerToIPFS();
            return {
                success: true,
                cid,
                message: 'Soulchain ledger persisted to IPFS successfully'
            };
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStatus() {
        if (!checkIntent('get-status'))
            throw new Error('Zeroth violation: Status check blocked.');
        return {
            service: 'Zeropoint Protocol API Gateway',
            version: '1.0.0',
            status: 'operational',
            timestamp: new Date().toISOString(),
            endpoints: {
                auth: ['/v1/register', '/v1/login', '/v1/protected'],
                generation: ['/v1/generate-text', '/v1/generate-image', '/v1/generate-code'],
                storage: ['/v1/ipfs/upload', '/v1/ipfs/download', '/v1/ipfs/list'],
                monitoring: ['/v1/health', '/v1/metrics', '/v1/ledger-metrics'],
                blockchain: ['/v1/soulchain/persist']
            }
        };
    }
    async proposeWithPetals(proposal) {
        if (!checkIntent(proposal.rationale))
            throw new Error('Zeroth violation: Petals proposal blocked.');
        try {
            const response = await this.appService.proposeWithPetals(proposal);
            return {
                success: true,
                response,
                message: 'Petals proposal processed successfully'
            };
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async textSummarization(body) {
        if (!checkIntent('text-summarization'))
            throw new Error('Zeroth violation: Text summarization blocked.');
        try {
            const result = await this.appService.textSummarization(body.text, body.options);
            return {
                success: true,
                result,
                message: 'Text summarization completed successfully'
            };
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async contextPrompting(body) {
        if (!checkIntent('context-prompting'))
            throw new Error('Zeroth violation: Context prompting blocked.');
        try {
            const result = await this.appService.contextPrompting(body.prompt, body.context, body.options);
            return {
                success: true,
                result,
                message: 'Context-aware prompting completed successfully'
            };
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async semanticSearch(body) {
        if (!checkIntent('semantic-search'))
            throw new Error('Zeroth violation: Semantic search blocked.');
        try {
            const result = await this.appService.semanticSearch(body.query, body.documents, body.options);
            return {
                success: true,
                result,
                message: 'Semantic search completed successfully'
            };
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sentimentAnalysis(body) {
        if (!checkIntent('sentiment-analysis'))
            throw new Error('Zeroth violation: Sentiment analysis blocked.');
        try {
            const result = await this.appService.sentimentAnalysis(body.text, body.options);
            return {
                success: true,
                result,
                message: 'Sentiment analysis completed successfully'
            };
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async entityExtraction(body) {
        if (!checkIntent('entity-extraction'))
            throw new Error('Zeroth violation: Entity extraction blocked.');
        try {
            const result = await this.appService.entityExtraction(body.text, body.options);
            return {
                success: true,
                result,
                message: 'Entity extraction completed successfully'
            };
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async languageTranslation(body) {
        if (!checkIntent('language-translation'))
            throw new Error('Zeroth violation: Language translation blocked.');
        try {
            const result = await this.appService.languageTranslation(body.text, body.targetLanguage, body.sourceLanguage);
            return {
                success: true,
                result,
                message: 'Language translation completed successfully'
            };
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAdvancedStatus() {
        if (!checkIntent('get-advanced-status'))
            throw new Error('Zeroth violation: Advanced status check blocked.');
        return {
            service: 'Zeropoint Protocol Advanced AI Gateway',
            version: '1.0.0',
            status: 'operational',
            timestamp: new Date().toISOString(),
            advancedEndpoints: {
                summarization: '/v1/advanced/summarize',
                contextPrompting: '/v1/advanced/context-prompt',
                semanticSearch: '/v1/advanced/semantic-search',
                sentimentAnalysis: '/v1/advanced/sentiment',
                entityExtraction: '/v1/advanced/entities',
                languageTranslation: '/v1/advanced/translate'
            },
            features: {
                zerothGateValidation: true,
                soulchainLogging: true,
                metadataTracking: true,
                ethicalAlignment: true
            }
        };
    }
    async callPetalsSingle(dto) {
        if (!checkIntent(dto.code + dto.agentId))
            throw new Error('Zeroth violation: Petals single call blocked.');
        const request = {
            id: crypto.randomUUID(),
            agentId: dto.agentId,
            code: dto.code,
            tags: dto.tags
        };
        return this.petalsService.callPetalsAPI(request);
    }
    async callPetalsBatch(dto) {
        if (!checkIntent(JSON.stringify(dto.requests.map(r => r.code))))
            throw new Error('Zeroth violation: Petals batch call blocked.');
        const batchRequest = {
            requests: dto.requests.map(req => ({
                id: crypto.randomUUID(),
                agentId: req.agentId,
                code: req.code,
                tags: req.tags
            })),
            batchId: dto.batchId,
            priority: dto.priority,
            timeout: dto.timeout
        };
        return this.petalsService.callPetalsBatch(batchRequest);
    }
    async getPetalsHealth() {
        if (!checkIntent('getPetalsHealth'))
            throw new Error('Zeroth violation: Petals health check blocked.');
        return {
            service: "Enhanced Petals Service",
            version: "2.0.0",
            status: "operational",
            timestamp: new Date().toISOString(),
            features: {
                singleCalls: true,
                batchProcessing: true,
                enhancedValidation: true,
                retryLogic: true,
                soulchainLogging: true
            }
        };
    }
    async orchestrateServices(dto) {
        if (!checkIntent(dto.agentId + JSON.stringify(dto.operations.map(op => op.type))))
            throw new Error('Zeroth violation: Service orchestration blocked.');
        const request = {
            id: dto.id,
            agentId: dto.agentId,
            operations: dto.operations,
            priority: dto.priority,
            timeout: dto.timeout,
            metadata: dto.metadata
        };
        return this.orchestrator.orchestrateServices(request);
    }
    async getOrchestrationHealth() {
        if (!checkIntent('getOrchestrationHealth'))
            throw new Error('Zeroth violation: Orchestration health check blocked.');
        const serviceHealth = this.orchestrator.getServiceHealth();
        return {
            service: "Service Orchestrator",
            version: "2.0.0",
            status: "operational",
            timestamp: new Date().toISOString(),
            serviceHealth,
            features: {
                parallelProcessing: true,
                dependencyResolution: true,
                enhancedValidation: true,
                comprehensiveLogging: true,
                healthMonitoring: true
            }
        };
    }
    async getAvailableServices() {
        if (!checkIntent('getAvailableServices'))
            throw new Error('Zeroth violation: Available services check blocked.');
        return {
            services: [
                {
                    name: "petals",
                    description: "Enhanced Petals code improvement service",
                    capabilities: ["single-calls", "batch-processing", "code-safety-validation"],
                    status: "available"
                },
                {
                    name: "ai-generation",
                    description: "AI content generation service",
                    capabilities: ["text-generation", "code-generation", "creative-content"],
                    status: "available"
                },
                {
                    name: "validation",
                    description: "Data and content validation service",
                    capabilities: ["data-validation", "content-safety", "rule-checking"],
                    status: "available"
                },
                {
                    name: "analysis",
                    description: "Content analysis service",
                    capabilities: ["sentiment-analysis", "entity-extraction", "semantic-analysis"],
                    status: "available"
                }
            ],
            orchestrationFeatures: {
                parallelExecution: true,
                dependencyManagement: true,
                errorHandling: true,
                performanceOptimization: true
            }
        };
    }
    async onApplicationShutdown() {
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getHello", null);
__decorate([
    Get('metrics'),
    __param(0, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getMetrics", null);
__decorate([
    Get('ledger-metrics'),
    __param(0, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getLedgerMetrics", null);
__decorate([
    Get('protected'),
    UseGuards(JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "protectedRoute", null);
__decorate([
    Post('generate-text'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateTextDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "generateText", null);
__decorate([
    Post('generate-image'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateImageDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "generateImage", null);
__decorate([
    Post('generate-code'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateCodeDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "generateCode", null);
__decorate([
    Post('generate'),
    __param(0, Body('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "generateLegacy", null);
__decorate([
    Get('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "healthCheck", null);
__decorate([
    Post('ipfs/upload'),
    UseInterceptors(FileInterceptor('file')),
    __param(0, UploadedFile()),
    __param(1, Body('rationale')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "uploadFile", null);
__decorate([
    Get('ipfs/download/:cid'),
    __param(0, Param('cid')),
    __param(1, Body('rationale')),
    __param(2, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "downloadFile", null);
__decorate([
    Get('ipfs/list/:cid'),
    __param(0, Param('cid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "listDirectory", null);
__decorate([
    Post('soulchain/persist'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "persistSoulchain", null);
__decorate([
    Get('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getStatus", null);
__decorate([
    Post('petals/propose'),
    UseGuards(JwtAuthGuard),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "proposeWithPetals", null);
__decorate([
    Post('advanced/summarize'),
    UseGuards(JwtAuthGuard),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "textSummarization", null);
__decorate([
    Post('advanced/context-prompt'),
    UseGuards(JwtAuthGuard),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "contextPrompting", null);
__decorate([
    Post('advanced/semantic-search'),
    UseGuards(JwtAuthGuard),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "semanticSearch", null);
__decorate([
    Post('advanced/sentiment'),
    UseGuards(JwtAuthGuard),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "sentimentAnalysis", null);
__decorate([
    Post('advanced/entities'),
    UseGuards(JwtAuthGuard),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "entityExtraction", null);
__decorate([
    Post('advanced/translate'),
    UseGuards(JwtAuthGuard),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "languageTranslation", null);
__decorate([
    Get('advanced/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getAdvancedStatus", null);
__decorate([
    Post('petals/single'),
    UseGuards(JwtAuthGuard),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PetalsRequestDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "callPetalsSingle", null);
__decorate([
    Post('petals/batch'),
    UseGuards(JwtAuthGuard),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PetalsBatchRequestDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "callPetalsBatch", null);
__decorate([
    Get('petals/health'),
    UseGuards(JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getPetalsHealth", null);
__decorate([
    Post('orchestrate'),
    UseGuards(JwtAuthGuard),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [OrchestrationRequestDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "orchestrateServices", null);
__decorate([
    Get('orchestrate/health'),
    UseGuards(JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getOrchestrationHealth", null);
__decorate([
    Get('orchestrate/services'),
    UseGuards(JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getAvailableServices", null);
AppController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [AppService,
        JwtService,
        EnhancedPetalsService,
        ServiceOrchestrator])
], AppController);
export { AppController };
//# sourceMappingURL=app.controller.js.map