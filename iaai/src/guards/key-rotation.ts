import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { KeyRotationService } from "../services/key-rotation.service.js";

@Injectable()
export class KeyRotationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly keyRotationService: KeyRotationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      // Verify token with current key
      const payload = await this.jwtService.verifyAsync(token, {
        secret: await this.keyRotationService.getCurrentKey(),
      });

      // Check if token is using deprecated key
      if (
        payload.keyId &&
        payload.keyId !== (await this.keyRotationService.getCurrentKeyId())
      ) {
        // Token is using old key, but still valid - log for rotation
        await this.keyRotationService.logKeyRotation(
          payload.keyId,
          "deprecated_key_used",
        );

        // In strict mode, reject deprecated keys
        if (process.env.JWT_STRICT_ROTATION === "true") {
          throw new UnauthorizedException("Token uses deprecated key");
        }
      }

      // Attach payload to request
      request["user"] = payload;

      // Log successful authentication
      await this.keyRotationService.logAuthentication(payload, request.ip);

      return true;
    } catch (error) {
      // Log failed authentication attempt
      await this.keyRotationService.logFailedAuthentication(
        token,
        request.ip,
        error.message,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException("Invalid token");
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
