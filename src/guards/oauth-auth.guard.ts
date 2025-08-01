import { Injectable, Logger, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { OAuthService, OAuthUser } from '../services/oauth.service.js';
import { checkIntent } from './synthient.guard.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';

@Injectable()
export class OAuthAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(OAuthAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private oauthService: OAuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const { method, url, ip, headers } = request;

      // Check for public routes
      const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic) {
        return true;
      }

      // Check intent for zeropoint violations
      const authContext = JSON.stringify({
        method,
        url,
        ip,
        userAgent: headers['user-agent'],
        timestamp: new Date().toISOString()
      });

      if (!checkIntent(authContext)) {
        await this.logAuthEvent('auth_blocked', 'Zeroth violation: Auth blocked', {
          method,
          url,
          ip,
          userAgent: headers['user-agent']
        });
        throw new UnauthorizedException('Zeroth violation: Auth blocked.');
      }

      // Try OAuth 2.0 authentication first
      const oauthUser = await this.tryOAuthAuthentication(headers);
      if (oauthUser) {
        request.user = oauthUser;
        await this.logAuthEvent('auth_success', 'OAuth authentication successful', {
          method,
          url,
          ip,
          userAgent: headers['user-agent'],
          userId: oauthUser.id,
          username: oauthUser.username
        });
        return true;
      }

      // Fallback to JWT authentication
      const jwtResult = await super.canActivate(context);
      if (!jwtResult) {
        await this.logAuthEvent('auth_failed', 'JWT validation failed', {
          method,
          url,
          ip,
          userAgent: headers['user-agent']
        });
        throw new UnauthorizedException('JWT validation failed');
      }

      // Log successful JWT authentication
      const user = request.user;
      if (user) {
        await this.logAuthEvent('auth_success', 'JWT authentication successful', {
          method,
          url,
          ip,
          userAgent: headers['user-agent'],
          userId: user.userId || user.sub,
          username: user.username
        });
      }

      return true;
    } catch (error) {
      this.logger.error(`OAuth Auth Guard error: ${error.message}`, error.stack);
      await this.logAuthEvent('auth_error', error.message, {
        method: context.switchToHttp().getRequest().method,
        url: context.switchToHttp().getRequest().url,
        ip: context.switchToHttp().getRequest().ip
      });
      throw error;
    }
  }

  private async tryOAuthAuthentication(headers: any): Promise<OAuthUser | null> {
    try {
      // Check for Authorization header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return null;
      }

      // Handle different token types
      let token: string;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (authHeader.startsWith('OAuth ')) {
        token = authHeader.substring(6);
      } else {
        // Try to extract token from other formats
        token = authHeader;
      }

      if (!token) {
        return null;
      }

      // Validate OAuth token
      const oauthUser = await this.oauthService.validateToken(token);
      return oauthUser;
    } catch (error) {
      this.logger.debug(`OAuth authentication attempt failed: ${error.message}`);
      return null;
    }
  }

  private async logAuthEvent(action: string, reason: string, context: any): Promise<void> {
    try {
      await soulchain.addXPTransaction({
        agentId: context.userId || 'anonymous',
        amount: action.includes('success') ? 2 : action.includes('blocked') ? -10 : -5,
        rationale: `OAuth Auth Guard: ${action} - ${reason}`,
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
            purpose: '#oauth-auth-guard',
            validation: 'good-heart'
          },
          {
            type: '#thread',
            taskId: action,
            lineage: ['auth', 'guard', 'oauth'],
            swarmLink: 'oauth-auth-guard-swarm'
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