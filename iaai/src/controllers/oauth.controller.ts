import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { OAuthService } from "../services/oauth.service.js";
import { Public } from "../decorators/public.decorator.js";

@Controller("oauth")
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(private readonly oauthService: OAuthService) {}

  @Public()
  @Get("authorize")
  async authorize(
    @Query("response_type") responseType: string,
    @Query("client_id") clientId: string,
    @Query("redirect_uri") redirectUri: string,
    @Query("scope") scope: string,
    @Query("state") state: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(
        `OAuth authorization request: ${clientId} -> ${redirectUri}`,
      );

      // For development, auto-approve and redirect with code
      const authCode = this.generateAuthCode();
      const redirectUrl = `${redirectUri}?code=${authCode}&state=${state}`;

      res.redirect(HttpStatus.FOUND, redirectUrl);
    } catch (error) {
      this.logger.error(`OAuth authorization failed: ${error.message}`);
      res.status(HttpStatus.BAD_REQUEST).json({
        error: "invalid_request",
        error_description: "Authorization failed",
      });
    }
  }

  @Public()
  @Post("token")
  async token(
    @Query("grant_type") grantType: string,
    @Query("code") code: string,
    @Query("redirect_uri") redirectUri: string,
    @Query("client_id") clientId: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(
        `OAuth token request: ${grantType} for client ${clientId}`,
      );

      if (grantType === "authorization_code") {
        const token = await this.oauthService.authenticateWithOAuth(
          "mock",
          code,
          redirectUri,
        );

        res.status(HttpStatus.OK).json({
          access_token: token.access_token,
          token_type: token.token_type,
          expires_in: token.expires_in,
          refresh_token: token.refresh_token,
          scope: token.scope,
        });
      } else if (grantType === "refresh_token") {
        const token = await this.oauthService.refreshToken(code); // code is actually refresh_token here

        res.status(HttpStatus.OK).json({
          access_token: token.access_token,
          token_type: token.token_type,
          expires_in: token.expires_in,
          refresh_token: token.refresh_token,
          scope: token.scope,
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          error: "unsupported_grant_type",
          error_description: "Grant type not supported",
        });
      }
    } catch (error) {
      this.logger.error(`OAuth token request failed: ${error.message}`);
      res.status(HttpStatus.BAD_REQUEST).json({
        error: "invalid_grant",
        error_description: "Token request failed",
      });
    }
  }

  @Public()
  @Post("revoke")
  async revoke(@Query("token") token: string, @Res() res: Response) {
    try {
      this.logger.log(`OAuth token revocation request`);

      await this.oauthService.revokeToken(token);

      res.status(HttpStatus.OK).json({ message: "Token revoked successfully" });
    } catch (error) {
      this.logger.error(`OAuth token revocation failed: ${error.message}`);
      res.status(HttpStatus.BAD_REQUEST).json({
        error: "invalid_request",
        error_description: "Token revocation failed",
      });
    }
  }

  @Get("userinfo")
  async userinfo(@Res() res: Response) {
    try {
      // This would typically get user info from the authenticated request
      // For now, return mock user info
      res.status(HttpStatus.OK).json({
        sub: "mock-user-id",
        name: "Mock User",
        email: "mock@example.com",
        email_verified: true,
        picture: "https://example.com/avatar.jpg",
      });
    } catch (error) {
      this.logger.error(`OAuth userinfo request failed: ${error.message}`);
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: "invalid_token",
        error_description: "Invalid or expired token",
      });
    }
  }

  @Get("health")
  async health(@Res() res: Response) {
    try {
      const healthStatus = await this.oauthService.getHealthStatus();
      res.status(HttpStatus.OK).json(healthStatus);
    } catch (error) {
      this.logger.error(`OAuth health check failed: ${error.message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: "unhealthy",
        error: error.message,
      });
    }
  }

  private generateAuthCode(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
