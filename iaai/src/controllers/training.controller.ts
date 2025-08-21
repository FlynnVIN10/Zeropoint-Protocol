import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TrainingService } from '../services/training.service';
import { TrainingJobDto, TrainingMetricsDto } from '../dto/training.dto';

@Controller('api/training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get('status')
  async getTrainingStatus(): Promise<any> {
    try {
      const status = await this.trainingService.getTrainingStatus();
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        training: status
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  @Get('jobs')
  async getTrainingJobs(): Promise<any> {
    try {
      const jobs = await this.trainingService.getTrainingJobs();
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        jobs: jobs
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  @Get('metrics')
  async getTrainingMetrics(): Promise<any> {
    try {
      const metrics = await this.trainingService.getTrainingMetrics();
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        metrics: metrics
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  @Post('start')
  async startTraining(@Body() trainingJob: TrainingJobDto): Promise<any> {
    try {
      const job = await this.trainingService.startTraining(trainingJob);
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        job: job
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  @Post('stop/:jobId')
  async stopTraining(@Param('jobId') jobId: string): Promise<any> {
    try {
      const result = await this.trainingService.stopTraining(jobId);
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        result: result
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}
