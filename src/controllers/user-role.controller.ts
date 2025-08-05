import { Controller, Get, Post, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { UserRoleService } from '../services/user-role.service.js';
import { TelemetryService } from '../services/telemetry.service.js';

interface RoleUpdateDto {
  role: 'human-consensus' | 'sentient-consensus' | 'agent-view';
}

interface RoleResponseDto {
  role: 'human-consensus' | 'sentient-consensus' | 'agent-view';
  updatedAt: Date;
}

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UserRoleController {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly telemetryService: TelemetryService
  ) {}

  @Get('role')
  async getUserRole(@Request() req): Promise<RoleResponseDto> {
    try {
      const userId = req.user.id;
      const userRole = await this.userRoleService.getUserRole(userId);
      
      return {
        role: userRole,
        updatedAt: new Date()
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve user role',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('role')
  async updateUserRole(
    @Request() req,
    @Body() roleUpdateDto: RoleUpdateDto
  ): Promise<RoleResponseDto> {
    try {
      const userId = req.user.id;
      const { role } = roleUpdateDto;

      // Validate role
      if (!['human-consensus', 'sentient-consensus', 'agent-view'].includes(role)) {
        throw new HttpException(
          'Invalid role specified',
          HttpStatus.BAD_REQUEST
        );
      }

      // Update user role
      const updatedRole = await this.userRoleService.updateUserRole(userId, role);

      // Log telemetry
      await this.telemetryService.logEvent('user', 'role_update', {
        userId,
        previousRole: req.user.role || 'unknown',
        newRole: role,
        source: 'api_endpoint',
        timestamp: Date.now(),
      });

      return {
        role: updatedRole,
        updatedAt: new Date()
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to update user role',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 