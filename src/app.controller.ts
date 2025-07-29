// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Controller, Get, Post, Body, Param, OnApplicationShutdown, Res, Req, UseGuards, UsePipes, ValidationPipe, UploadedFile, UseInterceptors, HttpStatus, HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service.js';
import { checkIntent } from './guards/synthient.guard.js';
import { soulchain } from './agents/soulchain/soulchain.ledger.js';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { IsString, MinLength, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { EnhancedPetalsService, PetalsRequest, PetalsBatchRequest } from './agents/train/enhanced-petals.service.js';
import { ServiceOrchestrator, OrchestrationRequest } from './agents/orchestration/service-orchestrator.js';
import { Type } from 'class-transformer';

class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

class GenerateTextDto {
  @IsString()
  @MinLength(1)
  text: string;

  @IsOptional()
  @IsObject()
  options?: any;
}

class GenerateImageDto {
  @IsString()
  @MinLength(1)
  prompt: string;

  @IsOptional()
  @IsObject()
  options?: any;
}

class GenerateCodeDto {
  @IsString()
  @MinLength(1)
  prompt: string;

  @IsOptional()
  @IsString()
  language?: string;
}

class PetalsRequestDto {
  @IsString()
  agentId: string;

  @IsString()
  @MinLength(1)
  code: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  tags: any[];
}

class PetalsBatchRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PetalsRequestDto)
  requests: PetalsRequestDto[];

  @IsString()
  batchId: string;

  @IsString()
  priority: 'low' | 'medium' | 'high';

  @IsOptional()
  timeout?: number;
}

class OperationRequestDto {
  @IsString()
  type: 'petals' | 'ai-generation' | 'validation' | 'analysis';

  @IsObject()
  data: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  tags: any[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];
}

class OrchestrationRequestDto {
  @IsString()
  id: string;

  @IsString()
  agentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperationRequestDto)
  operations: OperationRequestDto[];

  @IsString()
  priority: 'low' | 'medium' | 'high';

  @IsOptional()
  timeout?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

@Controller()
export class AppController implements OnApplicationShutdown {
  constructor(
    private readonly appService: AppService, 
    private readonly jwtService: JwtService,
    private readonly petalsService: EnhancedPetalsService,
    private readonly orchestrator: ServiceOrchestrator
  ) {}

  @Get()
  async getHello(): Promise<string> {
    if (!checkIntent('getHello')) throw new Error('Zeroth violation: getHello blocked.');
    return this.appService.getHello();
  }

  @Get('metrics')
  async getMetrics(@Res() res): Promise<void> {
    const metrics = await this.appService.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  }

  @Get('ledger-metrics')
  async getLedgerMetrics(@Res() res): Promise<void> {
    const metrics = await soulchain.getLedgerMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  async protectedRoute(): Promise<any> {
    if (!checkIntent('protected')) throw new Error('Zeroth violation: Protected route blocked.');
    return { message: 'You have accessed a protected route.' };
  }

  // Enhanced API Gateway Endpoints

  @Post('generate-text')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async generateText(@Body() dto: GenerateTextDto): Promise<any> {
    if (!checkIntent(dto.text)) throw new Error('Zeroth violation: generate-text blocked.');
    return this.appService.generateText(dto.text, dto.options);
  }

  @Post('generate-image')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async generateImage(@Body() dto: GenerateImageDto): Promise<any> {
    if (!checkIntent(dto.prompt)) throw new Error('Zeroth violation: generate-image blocked.');
    return this.appService.generateImage(dto.prompt, dto.options);
  }

  @Post('generate-code')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async generateCode(@Body() dto: GenerateCodeDto): Promise<any> {
    if (!checkIntent(dto.prompt)) throw new Error('Zeroth violation: generate-code blocked.');
    return this.appService.generateCode(dto.prompt, dto.language);
  }

  // Legacy endpoint for backward compatibility
  @Post('generate')
  async generateLegacy(@Body('text') text: string): Promise<any> {
    if (!checkIntent(text)) throw new Error('Zeroth violation: generate blocked.');
    return this.appService.generateText(text);
  }

  // @Post('register')
  // @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  // async register(@Body() dto: RegisterDto): Promise<any> {
  //   if (!checkIntent(dto.username + dto.password)) throw new Error('Zeroth violation: Registration blocked.');
  //   try {
  //     const user = await this.appService.registerUser(dto.username, dto.password);
  //     return { 
  //       success: true,
  //       id: user.id, 
  //       username: user.username,
  //       message: 'User registered successfully'
  //     };
  //   } catch (error) {
  //     throw new HttpException({
  //       success: false,
  //       message: error.message
  //     }, HttpStatus.BAD_REQUEST);
  //   }
  // }

  // @Post('login')
  // @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  // async login(@Body() dto: LoginDto): Promise<any> {
  //   if (!checkIntent(dto.username + dto.password)) throw new Error('Zeroth violation: Login blocked.');
  //   try {
  //     const user = await this.appService.validateUser(dto.username, dto.password);
  //     if (!user) {
  //       throw new HttpException({
  //         success: false,
  //         message: 'Invalid credentials'
  //       }, HttpStatus.UNAUTHORIZED);
  //     }
  //     
  //     const payload = { sub: user.id, username: user.username };
  //     const token = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });
  //     
  //     return { 
  //       success: true,
  //       access_token: token,
  //       user: {
  //         id: user.id,
  //         username: user.username
  //       }
  //     };
  //   } catch (error) {
  //     if (error instanceof HttpException) throw error;
  //     throw new HttpException({
  //       success: false,
  //       message: 'Login failed'
  //     }, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  @Get('health')
  async healthCheck(): Promise<any> {
    if (!checkIntent('health-check')) throw new Error('Zeroth violation: Health check blocked.');
    return this.appService.healthCheck();
  }

  // Enhanced IPFS endpoints with better error handling

  @Post('ipfs/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any, @Body('rationale') rationale: string): Promise<any> {
    if (!checkIntent(rationale)) throw new Error('Zeroth violation: File upload blocked.');
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
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('ipfs/download/:cid')
  async downloadFile(@Param('cid') cid: string, @Body('rationale') rationale: string, @Res() res): Promise<void> {
    if (!checkIntent(rationale)) throw new Error('Zeroth violation: File download blocked.');
    try {
      const buffer = await this.appService.downloadFile(cid, rationale);
      res.set('Content-Type', 'application/octet-stream');
      res.set('Content-Disposition', `attachment; filename="file-${cid}"`);
      res.send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  @Get('ipfs/list/:cid')
  async listDirectory(@Param('cid') cid: string): Promise<any> {
    if (!checkIntent('list-directory')) throw new Error('Zeroth violation: Directory listing blocked.');
    try {
      const entries = await this.appService.listDirectory(cid);
      return { 
        success: true,
        cid, 
        entries,
        count: entries.length
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('soulchain/persist')
  async persistSoulchain(): Promise<any> {
    if (!checkIntent('persist-soulchain')) throw new Error('Zeroth violation: Soulchain persist blocked.');
    try {
      const cid = await soulchain.persistLedgerToIPFS();
      return { 
        success: true,
        cid, 
        message: 'Soulchain ledger persisted to IPFS successfully'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // New API Gateway endpoints

  @Get('status')
  async getStatus(): Promise<any> {
    if (!checkIntent('get-status')) throw new Error('Zeroth violation: Status check blocked.');
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

  @Post('petals/propose')
  @UseGuards(JwtAuthGuard)
  async proposeWithPetals(@Body() proposal: any): Promise<any> {
    if (!checkIntent(proposal.rationale)) throw new Error('Zeroth violation: Petals proposal blocked.');
    try {
      const response = await this.appService.proposeWithPetals(proposal);
      return {
        success: true,
        response,
        message: 'Petals proposal processed successfully'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Advanced AI Endpoints

  @Post('advanced/summarize')
  @UseGuards(JwtAuthGuard)
  async textSummarization(@Body() body: { text: string; options?: { maxLength?: number; style?: string } }): Promise<any> {
    if (!checkIntent('text-summarization')) throw new Error('Zeroth violation: Text summarization blocked.');
    try {
      const result = await this.appService.textSummarization(body.text, body.options);
      return {
        success: true,
        result,
        message: 'Text summarization completed successfully'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('advanced/context-prompt')
  @UseGuards(JwtAuthGuard)
  async contextPrompting(@Body() body: { prompt: string; context: string; options?: { temperature?: number; maxTokens?: number } }): Promise<any> {
    if (!checkIntent('context-prompting')) throw new Error('Zeroth violation: Context prompting blocked.');
    try {
      const result = await this.appService.contextPrompting(body.prompt, body.context, body.options);
      return {
        success: true,
        result,
        message: 'Context-aware prompting completed successfully'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('advanced/semantic-search')
  @UseGuards(JwtAuthGuard)
  async semanticSearch(@Body() body: { query: string; documents: string[]; options?: { topK?: number; threshold?: number } }): Promise<any> {
    if (!checkIntent('semantic-search')) throw new Error('Zeroth violation: Semantic search blocked.');
    try {
      const result = await this.appService.semanticSearch(body.query, body.documents, body.options);
      return {
        success: true,
        result,
        message: 'Semantic search completed successfully'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('advanced/sentiment')
  @UseGuards(JwtAuthGuard)
  async sentimentAnalysis(@Body() body: { text: string; options?: { detailed?: boolean; language?: string } }): Promise<any> {
    if (!checkIntent('sentiment-analysis')) throw new Error('Zeroth violation: Sentiment analysis blocked.');
    try {
      const result = await this.appService.sentimentAnalysis(body.text, body.options);
      return {
        success: true,
        result,
        message: 'Sentiment analysis completed successfully'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('advanced/entities')
  @UseGuards(JwtAuthGuard)
  async entityExtraction(@Body() body: { text: string; options?: { entities?: string[]; confidence?: number } }): Promise<any> {
    if (!checkIntent('entity-extraction')) throw new Error('Zeroth violation: Entity extraction blocked.');
    try {
      const result = await this.appService.entityExtraction(body.text, body.options);
      return {
        success: true,
        result,
        message: 'Entity extraction completed successfully'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('advanced/translate')
  @UseGuards(JwtAuthGuard)
  async languageTranslation(@Body() body: { text: string; targetLanguage: string; sourceLanguage?: string }): Promise<any> {
    if (!checkIntent('language-translation')) throw new Error('Zeroth violation: Language translation blocked.');
    try {
      const result = await this.appService.languageTranslation(body.text, body.targetLanguage, body.sourceLanguage);
      return {
        success: true,
        result,
        message: 'Language translation completed successfully'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('advanced/status')
  async getAdvancedStatus(): Promise<any> {
    if (!checkIntent('get-advanced-status')) throw new Error('Zeroth violation: Advanced status check blocked.');
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

  // Enhanced Petals Service Endpoints

  @Post('petals/single')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async callPetalsSingle(@Body() dto: PetalsRequestDto): Promise<any> {
    if (!checkIntent(dto.code + dto.agentId)) throw new Error('Zeroth violation: Petals single call blocked.');
    
    const request: PetalsRequest = {
      id: crypto.randomUUID(),
      agentId: dto.agentId,
      code: dto.code,
      tags: dto.tags
    };
    
    return this.petalsService.callPetalsAPI(request);
  }

  @Post('petals/batch')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async callPetalsBatch(@Body() dto: PetalsBatchRequestDto): Promise<any> {
    if (!checkIntent(JSON.stringify(dto.requests.map(r => r.code)))) throw new Error('Zeroth violation: Petals batch call blocked.');
    
    const batchRequest: PetalsBatchRequest = {
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

  @Get('petals/health')
  @UseGuards(JwtAuthGuard)
  async getPetalsHealth(): Promise<any> {
    if (!checkIntent('getPetalsHealth')) throw new Error('Zeroth violation: Petals health check blocked.');
    
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

  // Service Orchestration Endpoints

  @Post('orchestrate')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async orchestrateServices(@Body() dto: OrchestrationRequestDto): Promise<any> {
    if (!checkIntent(dto.agentId + JSON.stringify(dto.operations.map(op => op.type)))) throw new Error('Zeroth violation: Service orchestration blocked.');
    
    const request: OrchestrationRequest = {
      id: dto.id,
      agentId: dto.agentId,
      operations: dto.operations,
      priority: dto.priority,
      timeout: dto.timeout,
      metadata: dto.metadata
    };
    
    return this.orchestrator.orchestrateServices(request);
  }

  @Get('orchestrate/health')
  @UseGuards(JwtAuthGuard)
  async getOrchestrationHealth(): Promise<any> {
    if (!checkIntent('getOrchestrationHealth')) throw new Error('Zeroth violation: Orchestration health check blocked.');
    
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

  @Get('orchestrate/services')
  @UseGuards(JwtAuthGuard)
  async getAvailableServices(): Promise<any> {
    if (!checkIntent('getAvailableServices')) throw new Error('Zeroth violation: Available services check blocked.');
    
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

  // Consensus Operations Endpoints

  @Post('/v1/consensus/bridge')
  async bridgeConsensus(@Body() consensusData: any): Promise<any> {
    if (!checkIntent('consensusBridge')) {
      throw new HttpException({
        status: 'error',
        message: 'Zeroth violation: Consensus bridge blocked'
      }, HttpStatus.FORBIDDEN);
    }

    try {
      const result = await this.appService.bridgeConsensus(
        consensusData.sourceChain,
        consensusData.targetChain,
        consensusData
      );
      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException({
        status: 'error',
        message: 'Consensus bridge failed',
        error: error.message
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/v1/consensus/stake')
  async validateTokenStake(@Body() stake: any): Promise<any> {
    if (!checkIntent('tokenStakeValidation')) {
      throw new HttpException({
        status: 'error',
        message: 'Zeroth violation: Token stake validation blocked'
      }, HttpStatus.FORBIDDEN);
    }

    try {
      const result = await this.appService.validateTokenStake(stake);
      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException({
        status: 'error',
        message: 'Token stake validation failed',
        error: error.message
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/v1/consensus/intent')
  async processConsensusIntent(@Body() intent: any): Promise<any> {
    if (!checkIntent('consensusIntentProcessing')) {
      throw new HttpException({
        status: 'error',
        message: 'Zeroth violation: Consensus intent processing blocked'
      }, HttpStatus.FORBIDDEN);
    }

    try {
      const result = await this.appService.processConsensusIntent(intent);
      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException({
        status: 'error',
        message: 'Consensus intent processing failed',
        error: error.message
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/v1/consensus/visualizer')
  async getConsensusVisualizer(@Res() res: any): Promise<void> {
    if (!checkIntent('consensusVisualization')) {
      throw new HttpException({
        status: 'error',
        message: 'Zeroth violation: Consensus visualization blocked'
      }, HttpStatus.FORBIDDEN);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial visualization data
    const sendVisualizationData = () => {
      const data = {
        type: 'consensus-visualization',
        timestamp: new Date().toISOString(),
        agents: [
          { id: 'agent1', position: { x: 0, y: 0, z: 0 }, status: 'active', voice: 'proposal' },
          { id: 'agent2', position: { x: 1, y: 1, z: 0 }, status: 'passive', voice: 'abstain' },
          { id: 'agent3', position: { x: -1, y: -1, z: 0 }, status: 'active', voice: 'opposition' }
        ],
        daoState: { position: { x: 0, y: 0, z: 0 }, status: 'processing' },
        consensus: { quorum: 0.6, current: 0.4, threshold: 0.5 }
      };

      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial data
    sendVisualizationData();

    // Update every 2 seconds
    const interval = setInterval(() => {
      sendVisualizationData();
    }, 2000);

    // Clean up on client disconnect
    res.on('close', () => {
      clearInterval(interval);
    });
  }

  async onApplicationShutdown() {
    // Cleanup logic here
  }
}