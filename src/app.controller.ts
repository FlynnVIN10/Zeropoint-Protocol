import { Controller, Get, Post, Body, Param, OnApplicationShutdown, Res, Req, UseGuards, UsePipes, ValidationPipe, UploadedFile, UseInterceptors, HttpStatus, HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service.js';
import { checkIntent } from './guards/synthient.guard.js';
import { soulchain } from './agents/soulchain/soulchain.ledger.js';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { IsString, MinLength, IsOptional, IsObject } from 'class-validator';

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

@Controller('v1')
export class AppController implements OnApplicationShutdown {
  constructor(private readonly appService: AppService, private readonly jwtService: JwtService) {}

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

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() dto: RegisterDto): Promise<any> {
    if (!checkIntent(dto.username + dto.password)) throw new Error('Zeroth violation: Registration blocked.');
    try {
      const user = await this.appService.registerUser(dto.username, dto.password);
      return { 
        success: true,
        id: user.id, 
        username: user.username,
        message: 'User registered successfully'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() dto: LoginDto): Promise<any> {
    if (!checkIntent(dto.username + dto.password)) throw new Error('Zeroth violation: Login blocked.');
    try {
      const user = await this.appService.validateUser(dto.username, dto.password);
      if (!user) {
        throw new HttpException({
          success: false,
          message: 'Invalid credentials'
        }, HttpStatus.UNAUTHORIZED);
      }
      
      const payload = { sub: user.id, username: user.username };
      const token = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });
      
      return { 
        success: true,
        access_token: token,
        user: {
          id: user.id,
          username: user.username
        }
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException({
        success: false,
        message: 'Login failed'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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

  async onApplicationShutdown() {
    // Cleanup logic here
  }
}