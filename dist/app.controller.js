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
import { Controller, Get, Post, Body, Param, Res, UseGuards, UsePipes, ValidationPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service.js';
import { checkIntent } from './guards/synthient.guard.js';
import { soulchain } from './agents/soulchain/soulchain.ledger.js';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { IsString, MinLength } from 'class-validator';
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
let AppController = class AppController {
    constructor(appService, jwtService) {
        this.appService = appService;
        this.jwtService = jwtService;
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
    async generateText(text) {
        if (!checkIntent(text))
            throw new Error('Zeroth violation: generate-text blocked.');
        return this.appService.callNullvana(text);
    }
    async register(dto) {
        if (!checkIntent(dto.username + dto.password))
            throw new Error('Zeroth violation: Registration blocked.');
        const user = await this.appService.registerUser(dto.username, dto.password);
        return { id: user.id, username: user.username };
    }
    async login(dto) {
        if (!checkIntent(dto.username + dto.password))
            throw new Error('Zeroth violation: Login blocked.');
        const user = await this.appService.validateUser(dto.username, dto.password);
        if (!user)
            throw new Error('Invalid credentials');
        const payload = { sub: user.id, username: user.username };
        const token = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });
        return { access_token: token };
    }
    async healthCheck() {
        if (!checkIntent('health-check'))
            throw new Error('Zeroth violation: Health check blocked.');
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    async uploadFile(file, rationale) {
        if (!checkIntent(rationale))
            throw new Error('Zeroth violation: File upload blocked.');
        if (!file)
            throw new Error('No file provided');
        const cid = await this.appService.uploadFile(file.buffer, rationale);
        return { cid, filename: file.originalname, size: file.size };
    }
    async downloadFile(cid, rationale, res) {
        if (!checkIntent(rationale))
            throw new Error('Zeroth violation: File download blocked.');
        const buffer = await this.appService.downloadFile(cid, rationale);
        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename="file-${cid}"`);
        res.send(buffer);
    }
    async listDirectory(cid) {
        if (!checkIntent('list-directory'))
            throw new Error('Zeroth violation: Directory listing blocked.');
        const entries = await this.appService.listDirectory(cid);
        return { cid, entries };
    }
    async persistSoulchain() {
        if (!checkIntent('persist-soulchain'))
            throw new Error('Zeroth violation: Soulchain persist blocked.');
        const cid = await soulchain.persistLedgerToIPFS();
        return { cid, message: 'Soulchain ledger persisted to IPFS' };
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
    __param(0, Body('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "generateText", null);
__decorate([
    Post('register'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "register", null);
__decorate([
    Post('login'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
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
AppController = __decorate([
    Controller('v1'),
    __metadata("design:paramtypes", [AppService, JwtService])
], AppController);
export { AppController };
//# sourceMappingURL=app.controller.js.map