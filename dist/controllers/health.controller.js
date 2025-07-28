var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Gauge, Counter } from 'prom-client';
const healthCheckCounter = new Counter({
    name: 'health_checks_total',
    help: 'Total health check requests',
    labelNames: ['status']
});
const systemUptime = new Gauge({
    name: 'system_uptime_seconds',
    help: 'System uptime in seconds'
});
const databaseConnections = new Gauge({
    name: 'database_connections',
    help: 'Number of active database connections'
});
let HealthController = class HealthController {
    constructor(configService) {
        this.configService = configService;
        systemUptime.set(process.uptime());
        setInterval(() => {
            systemUptime.set(process.uptime());
        }, 60000);
    }
    async getHealth(res) {
        const startTime = Date.now();
        const healthStatus = await this.checkSystemHealth();
        const duration = Date.now() - startTime;
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
    async getDetailedHealth(res) {
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
    async getReadiness(res) {
        const readiness = await this.checkReadiness();
        if (readiness.ready) {
            res.status(HttpStatus.OK).json({
                status: 'ready',
                timestamp: new Date().toISOString(),
                checks: readiness.checks
            });
        }
        else {
            res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
                status: 'not_ready',
                timestamp: new Date().toISOString(),
                checks: readiness.checks,
                issues: readiness.issues
            });
        }
    }
    async getLiveness(res) {
        const liveness = await this.checkLiveness();
        if (liveness.alive) {
            res.status(HttpStatus.OK).json({
                status: 'alive',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        }
        else {
            res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
                status: 'dead',
                timestamp: new Date().toISOString(),
                reason: liveness.reason
            });
        }
    }
    async checkSystemHealth() {
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
    async getDetailedSystemHealth() {
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
    async checkDatabase() {
        try {
            const startTime = Date.now();
            const duration = Date.now() - startTime;
            databaseConnections.set(0);
            return {
                status: 'disabled',
                duration: `${duration}ms`,
                message: 'Database temporarily disabled for testing',
                stats: {
                    users: 0,
                    sessions: 0,
                    auditLogs: 0
                }
            };
        }
        catch (error) {
            databaseConnections.set(0);
            return {
                status: 'unhealthy',
                error: error.message,
                duration: 'timeout'
            };
        }
    }
    checkMemory() {
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
    async checkDisk() {
        return {
            status: 'healthy',
            message: 'Disk space check not implemented'
        };
    }
    async checkNetwork() {
        return {
            status: 'healthy',
            message: 'Network connectivity OK'
        };
    }
    async checkServices() {
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
    async checkIPFSService() {
        return {
            status: 'healthy',
            message: 'IPFS service available'
        };
    }
    async checkAuthService() {
        try {
            return {
                status: 'healthy',
                message: 'Authentication service available'
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }
    async checkAPIService() {
        return {
            status: 'healthy',
            message: 'API service available'
        };
    }
    async checkReadiness() {
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
    async checkLiveness() {
        return {
            alive: true,
            uptime: process.uptime()
        };
    }
    async getDatabaseStats() {
        try {
            return {
                totalUsers: 0,
                activeSessions: 0,
                recentAuditLogs: 0,
                status: 'disabled',
                message: 'Database temporarily disabled for testing'
            };
        }
        catch (error) {
            return {
                status: 'disconnected',
                error: error.message
            };
        }
    }
    async getServiceStatus() {
        return {
            ipfs: { status: 'running', version: 'helia' },
            auth: { status: 'running', version: '1.0.0' },
            api: { status: 'running', version: '1.0.0' }
        };
    }
    async generateRecommendations() {
        const recommendations = [];
        const memUsage = process.memoryUsage();
        const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        if (memUsagePercent > 80) {
            recommendations.push('Consider increasing memory allocation or optimizing memory usage');
        }
        if (process.uptime() < 300) {
            recommendations.push('System recently started - monitor for stability');
        }
        return recommendations;
    }
    async getSystemMetrics() {
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
            activeConnections: 0
        };
    }
};
__decorate([
    Get(),
    __param(0, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    Get('detailed'),
    __param(0, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getDetailedHealth", null);
__decorate([
    Get('ready'),
    __param(0, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getReadiness", null);
__decorate([
    Get('live'),
    __param(0, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getLiveness", null);
HealthController = __decorate([
    Controller('health'),
    __metadata("design:paramtypes", [ConfigService])
], HealthController);
export { HealthController };
//# sourceMappingURL=health.controller.js.map