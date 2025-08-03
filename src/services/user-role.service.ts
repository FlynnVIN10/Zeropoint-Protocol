import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export type UserRole = 'human-consensus' | 'sentient-consensus' | 'agent-view';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async getUserRole(userId: string): Promise<UserRole> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['userRole']
      });

      if (!user) {
        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND
        );
      }

      return user.userRole as UserRole;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve user role',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserRole> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND
        );
      }

      // Validate role transition rules
      await this.validateRoleTransition(user.userRole as UserRole, role);

      // Update user role
      user.userRole = role;
      await this.userRepository.save(user);

      return role;
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

  private async validateRoleTransition(
    currentRole: UserRole,
    newRole: UserRole
  ): Promise<void> {
    // Define role transition rules
    const allowedTransitions: Record<UserRole, UserRole[]> = {
      'human-consensus': ['sentient-consensus', 'agent-view'],
      'sentient-consensus': ['human-consensus', 'agent-view'],
      'agent-view': ['human-consensus', 'sentient-consensus']
    };

    const allowedRoles = allowedTransitions[currentRole];
    
    if (!allowedRoles.includes(newRole)) {
      throw new HttpException(
        `Invalid role transition from ${currentRole} to ${newRole}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getUserRoleStats(): Promise<{
    humanConsensus: number;
    sentientConsensus: number;
    agentView: number;
    total: number;
  }> {
    try {
      const stats = await this.userRepository
        .createQueryBuilder('user')
        .select('user.userRole', 'role')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.userRole')
        .getRawMany();

      const result = {
        humanConsensus: 0,
        sentientConsensus: 0,
        agentView: 0,
        total: 0
      };

      stats.forEach(stat => {
        const count = parseInt(stat.count);
        result.total += count;
        
        switch (stat.role) {
          case 'human-consensus':
            result.humanConsensus = count;
            break;
          case 'sentient-consensus':
            result.sentientConsensus = count;
            break;
          case 'agent-view':
            result.agentView = count;
            break;
        }
      });

      return result;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve role statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      return await this.userRepository.find({
        where: { userRole: role },
        select: ['id', 'username', 'email', 'userRole', 'createdAt', 'lastLoginAt']
      });
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve users by role',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 