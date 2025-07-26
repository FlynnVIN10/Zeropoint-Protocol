import { Controller, Get, Post, Body, Param, OnApplicationShutdown, Res, Req, UseGuards, UsePipes, ValidationPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service.js';
import { checkIntent } from './guards/synthient.guard.js';
import { soulchain } from './agents/soulchain/soulchain.ledger.js';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { IsString, MinLength } from 'class-validator';

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

  @Post('generate-text')
  async generateText(@Body('text') text: string): Promise<any> {
    if (!checkIntent(text)) throw new Error('Zeroth violation: generate-text blocked.');
    return this.appService.callNullvana(text);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() dto: RegisterDto): Promise<any> {
    if (!checkIntent(dto.username + dto.password)) throw new Error('Zeroth violation: Registration blocked.');
    const user = await this.appService.registerUser(dto.username, dto.password);
    return { id: user.id, username: user.username };
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() dto: LoginDto): Promise<any> {
    if (!checkIntent(dto.username + dto.password)) throw new Error('Zeroth violation: Login blocked.');
    const user = await this.appService.validateUser(dto.username, dto.password);
    if (!user) throw new Error('Invalid credentials');
    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });
    return { access_token: token };
  }

  @Get('health')
  async healthCheck(): Promise<any> {
    // Prometheus: could add custom health metrics here
    if (!checkIntent('health-check')) throw new Error('Zeroth violation: Health check blocked.');
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Post('ipfs/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any, @Body('rationale') rationale: string): Promise<any> {
    if (!checkIntent(rationale)) throw new Error('Zeroth violation: File upload blocked.');
    if (!file) throw new Error('No file provided');
    const cid = await this.appService.uploadFile(file.buffer, rationale);
    return { cid, filename: file.originalname, size: file.size };
  }

  @Get('ipfs/download/:cid')
  async downloadFile(@Param('cid') cid: string, @Body('rationale') rationale: string, @Res() res): Promise<void> {
    if (!checkIntent(rationale)) throw new Error('Zeroth violation: File download blocked.');
    const buffer = await this.appService.downloadFile(cid, rationale);
    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="file-${cid}"`);
    res.send(buffer);
  }

  @Get('ipfs/list/:cid')
  async listDirectory(@Param('cid') cid: string): Promise<any> {
    if (!checkIntent('list-directory')) throw new Error('Zeroth violation: Directory listing blocked.');
    const entries = await this.appService.listDirectory(cid);
    return { cid, entries };
  }

  @Post('soulchain/persist')
  async persistSoulchain(): Promise<any> {
    if (!checkIntent('persist-soulchain')) throw new Error('Zeroth violation: Soulchain persist blocked.');
    const cid = await soulchain.persistLedgerToIPFS();
    return { cid, message: 'Soulchain ledger persisted to IPFS' };
  }

  async onApplicationShutdown() {
    // await this.appService.onApplicationShutdown();
  }
}