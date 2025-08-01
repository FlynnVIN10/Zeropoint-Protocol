// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { checkIntent } from '../guards/synthient.guard.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      
      if (isPublic) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const { method, url, ip, headers } = request;

      // Zeroth-gate validation for auth attempt
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

      // Check for Authorization header
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

      // Validate JWT token
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

      // Log successful authentication
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
    } catch (error) {
      this.logger.error(`JWT Auth Guard error: ${error.message}`, error.stack);
      await this.logAuthEvent('auth_error', error.message, {
        method: context.switchToHttp().getRequest().method,
        url: context.switchToHttp().getRequest().url,
        ip: context.switchToHttp().getRequest().ip
      });
      throw error;
    }
  }

  private async logAuthEvent(action: string, reason: string, context: any): Promise<void> {
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
    } catch (error) {
      this.logger.error(`Failed to log auth event to Soulchain: ${error.message}`);
    }
  }
} 