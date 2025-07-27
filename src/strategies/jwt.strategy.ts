// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { checkIntent } from '../guards/synthient.guard.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      algorithms: ['HS256'],
      issuer: 'zeropoint-protocol',
      audience: 'zeropoint-api'
    });
  }

  async validate(payload: JwtPayload) {
    try {
      // Zeroth-gate validation
      if (!checkIntent(`jwt-validate:${payload.username}:${payload.sub}`)) {
        await this.logAuthEvent(payload, 'jwt_validation_failed', 'Zeroth violation: JWT validation blocked');
        throw new UnauthorizedException('Zeroth violation: JWT validation blocked.');
      }

      // Validate payload structure
      if (!payload.sub || !payload.username || !payload.email || !payload.roles) {
        await this.logAuthEvent(payload, 'jwt_validation_failed', 'Invalid JWT payload structure');
        throw new UnauthorizedException('Invalid JWT payload structure');
      }

      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        await this.logAuthEvent(payload, 'jwt_validation_failed', 'JWT token expired');
        throw new UnauthorizedException('JWT token expired');
      }

      // Log successful validation
      await this.logAuthEvent(payload, 'jwt_validation_success', 'JWT validation successful');

      return {
        userId: payload.sub,
        username: payload.username,
        email: payload.email,
        roles: payload.roles
      };
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`, error.stack);
      await this.logAuthEvent(payload, 'jwt_validation_error', error.message);
      throw error;
    }
  }

  private async logAuthEvent(payload: JwtPayload, action: string, reason: string): Promise<void> {
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
    } catch (error) {
      this.logger.error(`Failed to log auth event to Soulchain: ${error.message}`);
    }
  }
} 