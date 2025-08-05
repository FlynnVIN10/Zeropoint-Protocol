import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PetalsService } from '../services/petals.service.js';
import { SandboxService } from '../services/sandbox.service.js';
import { TelemetryService } from '../services/telemetry.service.js';

export interface PetalTrainingRequest {
  agentId: string;
  dataBatch: any[];
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
  trainingConfig: PetalTrainingRequest;
}

export interface TrainingCycleResult {
  cycleId: string;
  agentId: string;
  modelDeltas: any;
  metrics: {
    loss: number;
    accuracy: number;
    duration: number;
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
        trainingConfig: request,
      });

      // Execute training cycle in sandbox
      const trainingResult = await this.petalsService.executeTrainingCycle(
        sandboxId,
        request,
      );

      // Aggregate model deltas
      const aggregatedDeltas = await this.petalsService.aggregateDeltas(
        trainingResult.modelDeltas,
      );

      // Update shared model
      await this.petalsService.updateSharedModel(aggregatedDeltas);

      // Emit telemetry
      await this.telemetryService.emitTrainingTelemetry({
        event: 'training_cycle_completed',
        cycleId: trainingResult.cycleId,
        agentId: request.agentId,
        timestamp: Date.now(),
        deltas: aggregatedDeltas,
        metrics: trainingResult.metrics,
      });

      return {
        status: 'success',
        data: {
          cycleId: trainingResult.cycleId,
          sandboxId,
          aggregatedDeltas,
          metrics: trainingResult.metrics,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      await this.telemetryService.emitTrainingTelemetry({
        event: 'training_cycle_failed',
        agentId: request.agentId,
        timestamp: Date.now(),
        error: error.message,
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
} 