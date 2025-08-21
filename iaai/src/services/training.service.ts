import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface TrainingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  framework: 'tinygrad' | 'pytorch';
  config: any;
  startTime: Date;
  endTime?: Date;
  metrics?: any;
}

export interface TrainingMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageTrainingTime: number;
  frameworkUsage: {
    tinygrad: number;
    pytorch: number;
  };
}

@Injectable()
export class TrainingService {
  private readonly logger = new Logger(TrainingService.name);
  private readonly trainingJobs: Map<string, TrainingJob> = new Map();
  private readonly metricsFile = 'artifacts/train/metrics.json';

  constructor(private readonly configService: ConfigService) {
    this.loadExistingJobs();
  }

  async getTrainingStatus(): Promise<any> {
    const totalJobs = this.trainingJobs.size;
    const runningJobs = Array.from(this.trainingJobs.values()).filter(job => job.status === 'running').length;
    const completedJobs = Array.from(this.trainingJobs.values()).filter(job => job.status === 'completed').length;
    const failedJobs = Array.from(this.trainingJobs.values()).filter(job => job.status === 'failed').length;

    return {
      totalJobs,
      runningJobs,
      completedJobs,
      failedJobs,
      lastUpdated: new Date().toISOString()
    };
  }

  async getTrainingJobs(): Promise<TrainingJob[]> {
    return Array.from(this.trainingJobs.values());
  }

  async getTrainingMetrics(): Promise<TrainingMetrics> {
    const jobs = Array.from(this.trainingJobs.values());
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const failedJobs = jobs.filter(job => job.status === 'failed');
    
    const frameworkUsage = {
      tinygrad: jobs.filter(job => job.framework === 'tinygrad').length,
      pytorch: jobs.filter(job => job.framework === 'pytorch').length
    };

    let averageTrainingTime = 0;
    if (completedJobs.length > 0) {
      const totalTime = completedJobs.reduce((sum, job) => {
        if (job.endTime) {
          return sum + (job.endTime.getTime() - job.startTime.getTime());
        }
        return sum;
      }, 0);
      averageTrainingTime = totalTime / completedJobs.length;
    }

    return {
      totalJobs: jobs.length,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
      averageTrainingTime,
      frameworkUsage
    };
  }

  async startTraining(trainingJobDto: any): Promise<TrainingJob> {
    const jobId = `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: TrainingJob = {
      id: jobId,
      status: 'pending',
      framework: trainingJobDto.framework || 'tinygrad',
      config: trainingJobDto.config || {},
      startTime: new Date()
    };

    this.trainingJobs.set(jobId, job);
    this.logger.log(`Training job ${jobId} created with framework ${job.framework}`);
    
    // Simulate training process
    this.simulateTraining(job);
    
    return job;
  }

  async stopTraining(jobId: string): Promise<any> {
    const job = this.trainingJobs.get(jobId);
    if (!job) {
      throw new Error(`Training job ${jobId} not found`);
    }

    if (job.status === 'running') {
      job.status = 'failed';
      job.endTime = new Date();
      this.logger.log(`Training job ${jobId} stopped`);
    }

    return { message: `Training job ${jobId} stopped`, job };
  }

  private async simulateTraining(job: TrainingJob): Promise<void> {
    // Simulate training process
    setTimeout(() => {
      job.status = 'running';
      this.logger.log(`Training job ${job.id} started`);
      
      // Simulate completion after some time
      setTimeout(() => {
        job.status = 'completed';
        job.endTime = new Date();
        job.metrics = {
          loss: Math.random() * 0.1,
          accuracy: 0.85 + Math.random() * 0.1,
          epochs: 100,
          trainingTime: Date.now() - job.startTime.getTime()
        };
        
        this.logger.log(`Training job ${job.id} completed`);
        this.saveMetrics();
      }, 5000); // Simulate 5 seconds of training
    }, 1000);
  }

  private loadExistingJobs(): void {
    try {
      if (fs.existsSync(this.metricsFile)) {
        const data = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
        // Load existing jobs from metrics file
        this.logger.log('Loaded existing training jobs from metrics file');
      }
    } catch (error) {
      this.logger.warn('Could not load existing training jobs:', error.message);
    }
  }

  private saveMetrics(): void {
    try {
      const metrics = this.getTrainingMetrics();
      const data = {
        timestamp: new Date().toISOString(),
        metrics,
        jobs: Array.from(this.trainingJobs.values())
      };
      
      const dir = path.dirname(this.metricsFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.metricsFile, JSON.stringify(data, null, 2));
      this.logger.log('Training metrics saved');
    } catch (error) {
      this.logger.error('Failed to save training metrics:', error.message);
    }
  }
}
