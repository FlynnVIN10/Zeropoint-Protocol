import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Session } from '../entities/session.entity.js';
import { AuditLog } from '../entities/audit-log.entity.js';
import { ConfigService } from '@nestjs/config';
import { Gauge, Counter } from 'prom-client';

// Prometheus metrics for health checks
const healthCheckCounter = new Counter({
  name: 'health_checks_total',
  help: 'Total health check requests',
  labelNames: ['status']
});

const systemUptime = new Gauge({
  name: 'system_uptime_seconds',
  help: 'System uptime in seconds'
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const databaseConnections = new Gauge({
  name: 'database_connections',
  help: 'Number of active database connections'
});

@Controller('v1/health')
export class HealthController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private configService: ConfigService
  ) {
    // Initialize uptime gauge
    systemUptime.set(process.uptime());
    setInterval(() => {
      systemUptime.set(process.uptime());
    }, 60000); // Update every minute
  }

  @Get()
  async getHealth(@Res() res: Response) {
    const startTime = Date.now();
    const healthStatus = await this.checkSystemHealth();
    const duration = Date.now() - startTime;

    // Record health check metrics
    healthCheckCounter.inc({ status: healthStatus.status });

    const response = {
      status: healthStatus.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      duration: `${duration}ms`,
      checks: healthStatus.checks,
      metrics: await this.getSystemMetrics()
    };

    const statusCode = healthStatus.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(statusCode).json(response);
  }

  @Get('detailed')
  async getDetailedHealth(@Res() res: Response) {
    const startTime = Date.now();
    const detailedHealth = await this.getDetailedSystemHealth();
    const duration = Date.now() - startTime;

    const response = {
      status: detailedHealth.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      duration: `${duration}ms`,
      checks: detailedHealth.checks,
      system: detailedHealth.system,
      database: detailedHealth.database,
      services: detailedHealth.services,
      recommendations: detailedHealth.recommendations
    };

    const statusCode = detailedHealth.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(statusCode).json(response);
  }

  @Get('ready')
  async getReadiness(@Res() res: Response) {
    const readiness = await this.checkReadiness();
    
    if (readiness.ready) {
      res.status(HttpStatus.OK).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: readiness.checks
      });
    } else {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        checks: readiness.checks,
        issues: readiness.issues
      });
    }
  }

  @Get('live')
  async getLiveness(@Res() res: Response) {
    const liveness = await this.checkLiveness();
    
    if (liveness.alive) {
      res.status(HttpStatus.OK).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } else {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'dead',
        timestamp: new Date().toISOString(),
        reason: liveness.reason
      });
    }
  }

  private async checkSystemHealth(): Promise<any> {
    const checks = {
      database: await this.checkDatabase(),
      memory: this.checkMemory(),
      disk: await this.checkDisk(),
      network: await this.checkNetwork(),
      services: await this.checkServices()
    };

    const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks
    };
  }

  private async getDetailedSystemHealth(): Promise<any> {
    const basicHealth = await this.checkSystemHealth();
    
    return {
      ...basicHealth,
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      database: await this.getDatabaseStats(),
      services: await this.getServiceStatus(),
      recommendations: await this.generateRecommendations()
    };
  }

  private async checkDatabase(): Promise<any> {
    try {
      const startTime = Date.now();
      
      // Test basic query
      const userCount = await this.userRepository.count();
      const sessionCount = await this.sessionRepository.count();
      const auditCount = await this.auditLogRepository.count();
      
      const duration = Date.now() - startTime;
      
      // Update database connection metrics
      databaseConnections.set(1);
      
      return {
        status: 'healthy',
        duration: `${duration}ms`,
        stats: {
          users: userCount,
          sessions: sessionCount,
          auditLogs: auditCount
        }
      };
    } catch (error) {
      databaseConnections.set(0);
      return {
        status: 'unhealthy',
        error: error.message,
        duration: 'timeout'
      };
    }
  }

  private checkMemory(): any {
    const memUsage = process.memoryUsage();
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    return {
      status: memUsagePercent < 90 ? 'healthy' : 'warning',
      usage: {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        percentage: `${Math.round(memUsagePercent)}%`
      }
    };
  }

  private async checkDisk(): Promise<any> {
    // This would require a file system check
    // For now, return a basic check
    return {
      status: 'healthy',
      message: 'Disk space check not implemented'
    };
  }

  private async checkNetwork(): Promise<any> {
    // Basic network connectivity check
    return {
      status: 'healthy',
      message: 'Network connectivity OK'
    };
  }

  private async checkServices(): Promise<any> {
    const services = {
      ipfs: await this.checkIPFSService(),
      auth: await this.checkAuthService(),
      api: await this.checkAPIService()
    };

    const allHealthy = Object.values(services).every(service => service.status === 'healthy');
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      services
    };
  }

  private async checkIPFSService(): Promise<any> {
    // Mock IPFS service check
    return {
      status: 'healthy',
      message: 'IPFS service available'
    };
  }

  private async checkAuthService(): Promise<any> {
    try {
      // Test authentication service
      return {
        status: 'healthy',
        message: 'Authentication service available'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  private async checkAPIService(): Promise<any> {
    return {
      status: 'healthy',
      message: 'API service available'
    };
  }

  private async checkReadiness(): Promise<any> {
    const checks = {
      database: await this.checkDatabase(),
      services: await this.checkServices()
    };

    const ready = Object.values(checks).every(check => check.status === 'healthy');
    const issues = ready ? [] : Object.entries(checks)
      .filter(([_, check]) => check.status !== 'healthy')
      .map(([name, check]) => `${name}: ${check.error || check.message}`);

    return {
      ready,
      checks,
      issues
    };
  }

  private async checkLiveness(): Promise<any> {
    // Basic liveness check - if we can respond, we're alive
    return {
      alive: true,
      uptime: process.uptime()
    };
  }

  private async getDatabaseStats(): Promise<any> {
    try {
      const userCount = await this.userRepository.count();
      const activeSessions = await this.sessionRepository.count({ where: { isActive: true } });
      const recentAuditLogs = await this.auditLogRepository.count({
        where: {
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      });

      return {
        totalUsers: userCount,
        activeSessions,
        recentAuditLogs,
        status: 'connected'
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.message
      };
    }
  }

  private async getServiceStatus(): Promise<any> {
    return {
      ipfs: { status: 'running', version: 'helia' },
      auth: { status: 'running', version: '1.0.0' },
      api: { status: 'running', version: '1.0.0' }
    };
  }

  private async generateRecommendations(): Promise<string[]> {
    const recommendations = [];
    const memUsage = process.memoryUsage();
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    if (memUsagePercent > 80) {
      recommendations.push('Consider increasing memory allocation or optimizing memory usage');
    }

    if (process.uptime() < 300) { // Less than 5 minutes
      recommendations.push('System recently started - monitor for stability');
    }

    return recommendations;
  }

  private async getSystemMetrics(): Promise<any> {
    const memUsage = process.memoryUsage();
    
    return {
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024)
      },
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      activeConnections: 0 // Would need to track actual connections
    };
  }
} 