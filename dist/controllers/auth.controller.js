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
import { Controller, Post, Get, Put, Body, UseGuards, UsePipes, ValidationPipe, Req, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from '../services/auth.service.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto, UpdateProfileDto } from '../dto/auth.dto.js';
import { checkIntent } from '../guards/synthient.guard.js';
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto, req) {
        if (!checkIntent(registerDto.username + registerDto.email)) {
            throw new HttpException('Zeroth violation: Registration blocked.', HttpStatus.FORBIDDEN);
        }
        try {
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || 'unknown';
            return await this.authService.register(registerDto, ipAddress, userAgent);
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async login(loginDto, req) {
        if (!checkIntent(loginDto.username + loginDto.password)) {
            throw new HttpException('Zeroth violation: Login blocked.', HttpStatus.FORBIDDEN);
        }
        try {
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || 'unknown';
            return await this.authService.login(loginDto, ipAddress, userAgent);
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async logout(body, req) {
        if (!checkIntent('logout')) {
            throw new HttpException('Zeroth violation: Logout blocked.', HttpStatus.FORBIDDEN);
        }
        try {
            const ipAddress = req.ip || req.connection.remoteAddress;
            return await this.authService.logout(req.user.userId, body.refreshToken, ipAddress);
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async refreshToken(refreshTokenDto, req) {
        if (!checkIntent('refresh-token')) {
            throw new HttpException('Zeroth violation: Token refresh blocked.', HttpStatus.FORBIDDEN);
        }
        try {
            const ipAddress = req.ip || req.connection.remoteAddress;
            return await this.authService.refreshToken(refreshTokenDto.refreshToken, ipAddress);
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getProfile(req) {
        if (!checkIntent('get-profile')) {
            throw new HttpException('Zeroth violation: Profile access blocked.', HttpStatus.FORBIDDEN);
        }
        try {
            return await this.authService.getUserProfile(req.user.userId);
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateProfile(updateProfileDto, req) {
        if (!checkIntent('update-profile')) {
            throw new HttpException('Zeroth violation: Profile update blocked.', HttpStatus.FORBIDDEN);
        }
        try {
            const ipAddress = req.ip || req.connection.remoteAddress;
            return await this.authService.updateProfile(req.user.userId, updateProfileDto, ipAddress);
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async changePassword(changePasswordDto, req) {
        if (!checkIntent('change-password')) {
            throw new HttpException('Zeroth violation: Password change blocked.', HttpStatus.FORBIDDEN);
        }
        try {
            const ipAddress = req.ip || req.connection.remoteAddress;
            return await this.authService.changePassword(req.user.userId, changePasswordDto, ipAddress);
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getActiveSessions(req) {
        if (!checkIntent('get-sessions')) {
            throw new HttpException('Zeroth violation: Session access blocked.', HttpStatus.FORBIDDEN);
        }
        try {
            return await this.authService.getActiveSessions(req.user.userId);
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async revokeSession(req) {
        if (!checkIntent('revoke-session')) {
            throw new HttpException('Zeroth violation: Session revocation blocked.', HttpStatus.FORBIDDEN);
        }
        try {
            const sessionId = req.params.sessionId;
            const ipAddress = req.ip || req.connection.remoteAddress;
            return await this.authService.revokeSession(req.user.userId, sessionId, ipAddress);
        }
        catch (error) {
            throw new HttpException({
                success: false,
                message: error.message
            }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAuthStatus() {
        return {
            success: true,
            service: 'Zeropoint Protocol Authentication',
            version: '1.0.0',
            status: 'operational',
            timestamp: new Date().toISOString(),
            features: {
                registration: 'enabled',
                login: 'enabled',
                jwt: 'enabled',
                refresh_tokens: 'enabled',
                session_management: 'enabled',
                audit_logging: 'enabled',
                zeroth_gate: 'enabled'
            }
        };
    }
};
__decorate([
    Post('register'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    Post('login'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Post('logout'),
    UseGuards(JwtAuthGuard),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    Post('refresh'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    Get('profile'),
    UseGuards(JwtAuthGuard),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    Put('profile'),
    UseGuards(JwtAuthGuard),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateProfileDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    Put('change-password'),
    UseGuards(JwtAuthGuard),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    Get('sessions'),
    UseGuards(JwtAuthGuard),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getActiveSessions", null);
__decorate([
    Post('sessions/:sessionId/revoke'),
    UseGuards(JwtAuthGuard),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeSession", null);
__decorate([
    Get('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAuthStatus", null);
AuthController = __decorate([
    Controller('v1/auth'),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map