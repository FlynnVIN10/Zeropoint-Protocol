import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export class TrainingJobDto {
  @IsString()
  @IsOptional()
  framework?: 'tinygrad' | 'pytorch';

  @IsObject()
  @IsOptional()
  config?: any;
}

export class TrainingMetricsDto {
  @IsString()
  timestamp: string;

  @IsObject()
  metrics: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    averageTrainingTime: number;
    frameworkUsage: {
      tinygrad: number;
      pytorch: number;
    };
  };
}

export class TrainingStatusDto {
  @IsString()
  status: 'ok' | 'error';

  @IsString()
  timestamp: string;

  @IsObject()
  training: {
    totalJobs: number;
    runningJobs: number;
    completedJobs: number;
    failedJobs: number;
    lastUpdated: string;
  };
}
