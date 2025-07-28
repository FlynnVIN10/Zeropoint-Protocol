var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtStrategy_1;
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { checkIntent } from '../guards/synthient.guard.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
            algorithms: ['HS256'],
            issuer: 'zeropoint-protocol',
            audience: 'zeropoint-api'
        });
        this.configService = configService;
        this.logger = new Logger(JwtStrategy_1.name);
    }
    async validate(payload) {
        try {
            if (!checkIntent(`jwt-validate:${payload.username}:${payload.sub}`)) {
                await this.logAuthEvent(payload, 'jwt_validation_failed', 'Zeroth violation: JWT validation blocked');
                throw new UnauthorizedException('Zeroth violation: JWT validation blocked.');
            }
            if (!payload.sub || !payload.username || !payload.email || !payload.roles) {
                await this.logAuthEvent(payload, 'jwt_validation_failed', 'Invalid JWT payload structure');
                throw new UnauthorizedException('Invalid JWT payload structure');
            }
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                await this.logAuthEvent(payload, 'jwt_validation_failed', 'JWT token expired');
                throw new UnauthorizedException('JWT token expired');
            }
            await this.logAuthEvent(payload, 'jwt_validation_success', 'JWT validation successful');
            return {
                userId: payload.sub,
                username: payload.username,
                email: payload.email,
                roles: payload.roles
            };
        }
        catch (error) {
            this.logger.error(`JWT validation error: ${error.message}`, error.stack);
            await this.logAuthEvent(payload, 'jwt_validation_error', error.message);
            throw error;
        }
    }
    async logAuthEvent(payload, action, reason) {
        try {
            await soulchain.addXPTransaction({
                agentId: payload.sub,
                amount: action.includes('success') ? 1 : -5,
                rationale: `JWT Auth: ${action} - ${reason}`,
                timestamp: new Date().toISOString(),
                previousCid: null,
                tags: [
                    {
                        type: '#who',
                        name: payload.username,
                        did: `did:zeropoint:${payload.sub}`,
                        handle: `@${payload.username}`
                    },
                    {
                        type: '#intent',
                        purpose: '#jwt-authentication',
                        validation: 'good-heart'
                    },
                    {
                        type: '#thread',
                        taskId: action,
                        lineage: ['auth', 'jwt'],
                        swarmLink: 'auth-swarm'
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
JwtStrategy = JwtStrategy_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], JwtStrategy);
export { JwtStrategy };
//# sourceMappingURL=jwt.strategy.js.map