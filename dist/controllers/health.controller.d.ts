import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class HealthController {
    private configService;
    constructor(configService: ConfigService);
    getHealth(res: Response): Promise<void>;
    getDetailedHealth(res: Response): Promise<void>;
    getReadiness(res: Response): Promise<void>;
    getLiveness(res: Response): Promise<void>;
    private checkSystemHealth;
    private getDetailedSystemHealth;
    private checkDatabase;
    private checkMemory;
    private checkDisk;
    private checkNetwork;
    private checkServices;
    private checkIPFSService;
    private checkAuthService;
    private checkAPIService;
    private checkReadiness;
    private checkLiveness;
    private getDatabaseStats;
    private getServiceStatus;
    private generateRecommendations;
    private getSystemMetrics;
}
