import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  UseGuards, 
  UsePipes, 
  ValidationPipe, 
  Req, 
  HttpStatus, 
  HttpException 
} from '@nestjs/common';
import { AuthService } from '../services/auth.service.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { 
  RegisterDto, 
  LoginDto, 
  RefreshTokenDto, 
  ChangePasswordDto, 
  UpdateProfileDto 
} from '../dto/auth.dto.js';
import { checkIntent } from '../guards/synthient.guard.js';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() registerDto: RegisterDto, @Req() req: any): Promise<any> {
    if (!checkIntent(registerDto.username + registerDto.email)) {
      throw new HttpException('Zeroth violation: Registration blocked.', HttpStatus.FORBIDDEN);
    }

    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      return await this.authService.register(registerDto, ipAddress, userAgent);
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() loginDto: LoginDto, @Req() req: any): Promise<any> {
    if (!checkIntent(loginDto.username + loginDto.password)) {
      throw new HttpException('Zeroth violation: Login blocked.', HttpStatus.FORBIDDEN);
    }

    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      return await this.authService.login(loginDto, ipAddress, userAgent);
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body() body: { refreshToken: string }, @Req() req: any): Promise<any> {
    if (!checkIntent('logout')) {
      throw new HttpException('Zeroth violation: Logout blocked.', HttpStatus.FORBIDDEN);
    }

    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      return await this.authService.logout(req.user.userId, body.refreshToken, ipAddress);
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('refresh')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: any): Promise<any> {
    if (!checkIntent('refresh-token')) {
      throw new HttpException('Zeroth violation: Token refresh blocked.', HttpStatus.FORBIDDEN);
    }

    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      return await this.authService.refreshToken(refreshTokenDto.refreshToken, ipAddress);
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any): Promise<any> {
    if (!checkIntent('get-profile')) {
      throw new HttpException('Zeroth violation: Profile access blocked.', HttpStatus.FORBIDDEN);
    }

    try {
      return await this.authService.getUserProfile(req.user.userId);
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Req() req: any): Promise<any> {
    if (!checkIntent('update-profile')) {
      throw new HttpException('Zeroth violation: Profile update blocked.', HttpStatus.FORBIDDEN);
    }

    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      return await this.authService.updateProfile(req.user.userId, updateProfileDto, ipAddress);
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: any): Promise<any> {
    if (!checkIntent('change-password')) {
      throw new HttpException('Zeroth violation: Password change blocked.', HttpStatus.FORBIDDEN);
    }

    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      return await this.authService.changePassword(req.user.userId, changePasswordDto, ipAddress);
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getActiveSessions(@Req() req: any): Promise<any> {
    if (!checkIntent('get-sessions')) {
      throw new HttpException('Zeroth violation: Session access blocked.', HttpStatus.FORBIDDEN);
    }

    try {
      return await this.authService.getActiveSessions(req.user.userId);
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('sessions/:sessionId/revoke')
  @UseGuards(JwtAuthGuard)
  async revokeSession(@Req() req: any): Promise<any> {
    if (!checkIntent('revoke-session')) {
      throw new HttpException('Zeroth violation: Session revocation blocked.', HttpStatus.FORBIDDEN);
    }

    try {
      const sessionId = req.params.sessionId;
      const ipAddress = req.ip || req.connection.remoteAddress;
      return await this.authService.revokeSession(req.user.userId, sessionId, ipAddress);
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status')
  async getAuthStatus(): Promise<any> {
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
} 