import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRoleService, UserRole } from './user-role.service';

interface AgentData {
  id: string;
  xp: number;
  level: string;
  trust: number;
  ethical: number;
  status: 'active' | 'idle' | 'training';
  lastSeen: Date;
  pendingTasks: AgentTask[];
  personalTelemetry: TelemetryData;
}

interface AgentTask {
  id: string;
  title: string;
  description: string;
  type: 'code-change' | 'training-job' | 'analysis' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
  estimatedDuration: number; // in minutes
  progress: number; // 0-100
}

interface TelemetryData {
  totalRequests: number;
  successfulRequests: number;
  averageResponseTime: number;
  lastActivity: Date;
  performanceMetrics: {
    cpu: number;
    memory: number;
    network: number;
  };
  learningProgress: {
    skillsLearned: number;
    accuracyImprovement: number;
    efficiencyGain: number;
  };
}

interface AgentRequest {
  type: 'code-change' | 'training-job' | 'resource-allocation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: 'low' | 'medium' | 'high';
  justification: string;
}

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userRoleService: UserRoleService
  ) {}

  async getAgentData(userId: string): Promise<AgentData> {
    try {
      // Validate user has agent role
      const userRole = await this.userRoleService.getUserRole(userId);
      if (userRole !== 'agent-view') {
        throw new HttpException(
          'Only agent users can access agent data',
          HttpStatus.FORBIDDEN
        );
      }

      // Mock agent data - in real implementation, this would come from database
      const agentData: AgentData = {
        id: userId,
        xp: 1250,
        level: 'Advanced',
        trust: 0.85,
        ethical: 0.92,
        status: 'active',
        lastSeen: new Date(),
        pendingTasks: [
          {
            id: 'task-001',
            title: 'Optimize Neural Network Parameters',
            description: 'Fine-tune model parameters for improved accuracy',
            type: 'optimization',
            priority: 'high',
            status: 'in-progress',
            createdAt: new Date(Date.now() - 3600000), // 1 hour ago
            estimatedDuration: 120,
            progress: 65
          },
          {
            id: 'task-002',
            title: 'Analyze Training Data Quality',
            description: 'Review and validate training dataset integrity',
            type: 'analysis',
            priority: 'medium',
            status: 'pending',
            createdAt: new Date(Date.now() - 7200000), // 2 hours ago
            estimatedDuration: 45,
            progress: 0
          }
        ],
        personalTelemetry: {
          totalRequests: 1250,
          successfulRequests: 1180,
          averageResponseTime: 245,
          lastActivity: new Date(),
          performanceMetrics: {
            cpu: 0.65,
            memory: 0.72,
            network: 0.45
          },
          learningProgress: {
            skillsLearned: 15,
            accuracyImprovement: 0.12,
            efficiencyGain: 0.08
          }
        }
      };

      return agentData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve agent data',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async submitAgentRequest(
    userId: string,
    request: AgentRequest
  ): Promise<{ success: boolean; requestId: string; message: string }> {
    try {
      // Validate user has agent role
      const userRole = await this.userRoleService.getUserRole(userId);
      if (userRole !== 'agent-view') {
        throw new HttpException(
          'Only agent users can submit requests',
          HttpStatus.FORBIDDEN
        );
      }

      // Validate request
      if (!request.title || !request.description || !request.justification) {
        throw new HttpException(
          'Missing required request fields',
          HttpStatus.BAD_REQUEST
        );
      }

      // Generate request ID
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Store request (mock implementation)
      await this.storeAgentRequest(userId, requestId, request);

      // Log telemetry
      await this.logAgentRequest(userId, requestId, request);

      return {
        success: true,
        requestId,
        message: 'Agent request submitted successfully'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to submit agent request',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAgentRequests(userId: string): Promise<{
    pending: AgentRequest[];
    approved: AgentRequest[];
    rejected: AgentRequest[];
  }> {
    try {
      // Validate user has agent role
      const userRole = await this.userRoleService.getUserRole(userId);
      if (userRole !== 'agent-view') {
        throw new HttpException(
          'Only agent users can access agent requests',
          HttpStatus.FORBIDDEN
        );
      }

      // Mock requests - in real implementation, these would come from database
      const requests = {
        pending: [
          {
            type: 'code-change' as const,
            title: 'Implement Advanced Caching',
            description: 'Add Redis-based caching for improved performance',
            priority: 'high' as const,
            estimatedImpact: 'high' as const,
            justification: 'Current response times exceed acceptable thresholds'
          }
        ],
        approved: [
          {
            type: 'training-job' as const,
            title: 'Retrain Model with New Data',
            description: 'Update model with latest training dataset',
            priority: 'medium' as const,
            estimatedImpact: 'medium' as const,
            justification: 'Model accuracy has degraded by 5% in recent evaluations'
          }
        ],
        rejected: [
          {
            type: 'resource-allocation' as const,
            title: 'Request Additional GPU Resources',
            description: 'Allocate 2 additional GPUs for parallel processing',
            priority: 'critical' as const,
            estimatedImpact: 'high' as const,
            justification: 'Current resources insufficient for training requirements'
          }
        ]
      };

      return requests;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve agent requests',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAgentPerformanceMetrics(userId: string): Promise<{
    efficiency: number;
    accuracy: number;
    reliability: number;
    learningRate: number;
    trends: {
      efficiency: number[];
      accuracy: number[];
      reliability: number[];
      timestamps: Date[];
    };
  }> {
    try {
      // Validate user has agent role
      const userRole = await this.userRoleService.getUserRole(userId);
      if (userRole !== 'agent-view') {
        throw new HttpException(
          'Only agent users can access performance metrics',
          HttpStatus.FORBIDDEN
        );
      }

      // Mock performance metrics
      const metrics = {
        efficiency: 0.87,
        accuracy: 0.92,
        reliability: 0.95,
        learningRate: 0.15,
        trends: {
          efficiency: [0.82, 0.84, 0.85, 0.86, 0.87],
          accuracy: [0.89, 0.90, 0.91, 0.91, 0.92],
          reliability: [0.93, 0.94, 0.94, 0.95, 0.95],
          timestamps: [
            new Date(Date.now() - 86400000 * 4),
            new Date(Date.now() - 86400000 * 3),
            new Date(Date.now() - 86400000 * 2),
            new Date(Date.now() - 86400000),
            new Date()
          ]
        }
      };

      return metrics;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve performance metrics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Helper methods
  private async storeAgentRequest(
    userId: string,
    requestId: string,
    request: AgentRequest
  ): Promise<void> {
    // Mock implementation - would store in database
    console.log(`Storing agent request ${requestId} for user ${userId}:`, request);
  }

  private async logAgentRequest(
    userId: string,
    requestId: string,
    request: AgentRequest
  ): Promise<void> {
    // Mock telemetry logging
    const telemetryEvent = {
      event: 'agent_request_submitted',
      type: 'agent_interaction',
      userId,
      timestamp: Date.now(),
      data: {
        requestId,
        requestType: request.type,
        priority: request.priority,
        estimatedImpact: request.estimatedImpact
      }
    };

    console.log('Logging telemetry:', telemetryEvent);
  }
} 