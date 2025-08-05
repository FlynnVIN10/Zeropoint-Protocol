import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PetalsService } from '../services/petals.service.js';
import { SandboxService } from '../services/sandbox.service.js';
import { TelemetryService } from '../services/telemetry.service.js';

export interface PetalTrainingRequest {
  agentId: string;
  trainingData?: any[];
  modelType: string;
  trainingParams: {
    learningRate: number;
    batchSize: number;
    epochs: number;
  };
}

export interface SandboxCreateRequest {
  agentId: string;
  resourceCaps: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  image?: string;
  command?: string[];
  environment?: Record<string, string>;
  ports?: number[];
  volumes?: string[];
}

export interface TrainingCycleResult {
  cycleId: string;
  agentId: string;
  modelDeltas: any;
  metrics: {
    loss: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    duration: number;
    nodesUsed: number;
  };
  timestamp: number;
}

@Controller('petals')
export class PetalsController {
  constructor(
    private readonly petalsService: PetalsService,
    private readonly sandboxService: SandboxService,
    private readonly telemetryService: TelemetryService,
  ) {}

  @Post('train')
  async trainOnPetals(@Body() request: PetalTrainingRequest): Promise<any> {
    try {
      // Create isolated WonderCraft sandbox
      const sandboxId = await this.sandboxService.createSandbox({
        agentId: request.agentId,
        resourceCaps: {
          cpu: 2,
          memory: 4096,
          gpu: 0,
        },
        image: 'wondercraft/petals-training:latest',
        command: ['python', 'train.py'],
        environment: {
          MODEL_TYPE: request.modelType,
          LEARNING_RATE: request.trainingParams.learningRate.toString(),
          BATCH_SIZE: request.trainingParams.batchSize.toString(),
          EPOCHS: request.trainingParams.epochs.toString(),
        },
      });

      // Execute distributed training cycle
      const trainingResult = await this.petalsService.executeTrainingCycle(
        sandboxId,
        request,
      );

      // Clean up sandbox
      await this.sandboxService.destroySandbox(sandboxId);

      return {
        status: 'success',
        data: {
          cycleId: trainingResult.cycleId,
          sandboxId,
          modelDeltas: trainingResult.modelDeltas,
          metrics: trainingResult.metrics,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      await this.telemetryService.logEvent('training', 'cycle_failed', {
        agentId: request.agentId,
        error: error.message,
        timestamp: Date.now(),
      });

      throw error;
    }
  }

  @Get('status/:cycleId')
  async getTrainingStatus(@Param('cycleId') cycleId: string): Promise<any> {
    const status = await this.petalsService.getTrainingStatus(cycleId);
    return {
      status: 'success',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('model/shared')
  async getSharedModel(): Promise<any> {
    const model = await this.petalsService.getSharedModel();
    return {
      status: 'success',
      data: model,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('network/status')
  async getNetworkStatus(): Promise<any> {
    const networkStatus = await this.petalsService.getNetworkStatus();
    return {
      status: 'success',
      data: networkStatus,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('network/node')
  async addNode(@Body() nodeConfig: {
    id: string;
    url: string;
    capabilities: string[];
    status?: 'available' | 'busy' | 'offline';
  }): Promise<any> {
    await this.petalsService.addNode({
      ...nodeConfig,
      status: nodeConfig.status || 'available',
    });
    return {
      status: 'success',
      message: `Node ${nodeConfig.id} added successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('network/node/:nodeId/remove')
  async removeNode(@Param('nodeId') nodeId: string): Promise<any> {
    await this.petalsService.removeNode(nodeId);
    return {
      status: 'success',
      message: `Node ${nodeId} removed successfully`,
      timestamp: new Date().toISOString(),
    };
  }
} 