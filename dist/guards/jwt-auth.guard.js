var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JwtAuthGuard_1;
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { checkIntent } from '../guards/synthient.guard.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard extends AuthGuard('jwt') {
    constructor() {
        super(...arguments);
        this.logger = new Logger(JwtAuthGuard_1.name);
    }
    async canActivate(context) {
        try {
            const request = context.switchToHttp().getRequest();
            const { method, url, ip, headers } = request;
            const authContext = `${method}:${url}:${ip}`;
            if (!checkIntent(authContext)) {
                await this.logAuthEvent('auth_blocked', 'Zeroth violation: Auth blocked', {
                    method,
                    url,
                    ip,
                    userAgent: headers['user-agent']
                });
                throw new UnauthorizedException('Zeroth violation: Auth blocked.');
            }
            const authHeader = headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                await this.logAuthEvent('auth_failed', 'Missing or invalid Authorization header', {
                    method,
                    url,
                    ip,
                    userAgent: headers['user-agent']
                });
                throw new UnauthorizedException('Missing or invalid Authorization header');
            }
            const result = await super.canActivate(context);
            if (!result) {
                await this.logAuthEvent('auth_failed', 'JWT validation failed', {
                    method,
                    url,
                    ip,
                    userAgent: headers['user-agent']
                });
                throw new UnauthorizedException('JWT validation failed');
            }
            const user = request.user;
            if (user) {
                await this.logAuthEvent('auth_success', 'Authentication successful', {
                    method,
                    url,
                    ip,
                    userAgent: headers['user-agent'],
                    userId: user.userId,
                    username: user.username
                });
            }
            return true;
        }
        catch (error) {
            this.logger.error(`JWT Auth Guard error: ${error.message}`, error.stack);
            await this.logAuthEvent('auth_error', error.message, {
                method: context.switchToHttp().getRequest().method,
                url: context.switchToHttp().getRequest().url,
                ip: context.switchToHttp().getRequest().ip
            });
            throw error;
        }
    }
    async logAuthEvent(action, reason, context) {
        try {
            await soulchain.addXPTransaction({
                agentId: context.userId || 'anonymous',
                amount: action.includes('success') ? 2 : action.includes('blocked') ? -10 : -5,
                rationale: `JWT Auth Guard: ${action} - ${reason}`,
                timestamp: new Date().toISOString(),
                previousCid: null,
                tags: [
                    {
                        type: '#who',
                        name: context.username || 'anonymous',
                        did: context.userId ? `did:zeropoint:${context.userId}` : 'did:zeropoint:anonymous',
                        handle: context.username ? `@${context.username}` : '@anonymous'
                    },
                    {
                        type: '#intent',
                        purpose: '#jwt-auth-guard',
                        validation: 'good-heart'
                    },
                    {
                        type: '#thread',
                        taskId: action,
                        lineage: ['auth', 'guard', 'jwt'],
                        swarmLink: 'auth-guard-swarm'
                    },
                    {
                        type: '#layer',
                        level: '#live'
                    },
                    {
                        type: '#domain',
                        field: 'security'
                    }
                ]
            });
        }
        catch (error) {
            this.logger.error(`Failed to log auth event to Soulchain: ${error.message}`);
        }
    }
};
JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    Injectable()
], JwtAuthGuard);
export { JwtAuthGuard };
//# sourceMappingURL=jwt-auth.guard.js.map